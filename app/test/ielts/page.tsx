"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { apiCall } from "@/app/utils/apiClient";
import { motion } from "framer-motion";

declare global {
  interface Window {
    Recorder: any;
  }
}

interface IELTSQuestionSet {
  part1: string[];
  part2: { topic: string; bullets: string[]; followUp: string };
  part3: { reading: string; questions: string[] };
}

interface IeltsLogData {
  name?: string;
  email?: string;
  part1?: string;
  link1?: string;
  part2?: string;
  link2?: string;
  part3?: string;
  link3?: string;
  linkPdf?: string;
}

export default function IELTSPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  const [questions, setQuestions] = useState<IELTSQuestionSet | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [recordingPart, setRecordingPart] = useState<number | null>(null);
  const [recordedParts, setRecordedParts] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [blobURL, setBlobURL] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const DRIVE_FOLDER_ID = "1UkpgUNL9JAIQgT8Ph_fiKJZWDOztI0ai";
  const SHEET_ID = "1Jh_KKBMmUzE7cltx6ZdGeeJIvm2q6PbDlgn_INKNQAY";

  /** 🔹 Fetch IELTS questions — persist across F5 until logout */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        // ⚙️ 1. Check localStorage
        const savedQuestions = localStorage.getItem("ielts_questions");
        if (savedQuestions) {
          console.log("✅ Loaded saved IELTS questions");
          setQuestions(JSON.parse(savedQuestions));
          setLoadingQuestions(false);
          return;
        }

        // ⚙️ 2. If not found, fetch new set
        const res = await fetch("/api/generate-ielts");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();
        setQuestions(data);

        // ⚙️ 3. Save to localStorage for persistence
        localStorage.setItem("ielts_questions", JSON.stringify(data));
        console.log("💾 New IELTS questions saved");
      } catch (err) {
        console.error("❌ Error loading questions:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, []);

  // 🔄 Load lại file ghi âm nếu có
  useEffect(() => {
    const savedAudio = localStorage.getItem("ielts_recordedFiles");
    if (savedAudio) {
      setBlobURL(JSON.parse(savedAudio));
      const parts = Object.keys(JSON.parse(savedAudio)).map((p) => Number(p));
      setRecordedParts(parts);
      console.log("🎧 Restored recorded parts:", parts);
    }
  }, []);

  /** 🔹 Load Recorder.js */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/mattdiamond/Recorderjs@master/dist/recorder.js";
    script.async = true;
    script.onload = () => console.log("✅ Recorder.js loaded");
    document.body.appendChild(script);
  }, []);

  /** 🎤 Start recording */
  const startRecording = async (part: number) => {
    if (recordedParts.includes(part))
      return alert("❌ This part is already recorded!");
    try {
      if (!accessToken)
        return alert("Missing Google access token. Please log in again!");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.AudioContext)();
      const input = audioContext.createMediaStreamSource(stream);
      const recorder = new window.Recorder(input, { numChannels: 1 });
      recorderRef.current = recorder;

      recorder.record();
      setRecordingPart(part);
      setTimer(300);

      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            stopRecording(part);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("🚫 Microphone error:", err);
      alert("❌ Cannot access the microphone. Please allow permission!");
    }
  };

  /** ⏹ Stop recording & upload */
  const stopRecording = (part: number) => {
    const recorder = recorderRef.current;
    const stream = streamRef.current;
    if (!recorder) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    recorder.stop();
    setRecordingPart(null);

    recorder.exportWAV(async (blob: Blob) => {
      if (blob.size === 0) return alert("⚠️ No audio detected.");
      const url = URL.createObjectURL(blob);
      setBlobURL((prev) => ({ ...prev, [part]: url }));

      // 🧠 Lưu lại blobURL để bảo toàn khi reload
      const stored = JSON.parse(
        localStorage.getItem("ielts_recordedFiles") || "{}"
      );
      stored[part] = url;
      localStorage.setItem("ielts_recordedFiles", JSON.stringify(stored));

      await handleUploadAndLog(blob, part);
      setRecordedParts((prev) => [...prev, part]);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    });
  };

  /** ☁️ Upload to Drive + Log to Sheet (update same row via UUID) */
  const handleUploadAndLog = async (blob: Blob, part: number) => {
    try {
      setUploading((prev) => ({ ...prev, [part]: true })); // 🔹 Đang upload

      // Upload audio to Google Drive
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("accessToken", accessToken!);
      formData.append("folderId", DRIVE_FOLDER_ID);

      const uploadRes = await apiCall<{ data: any }>("/api/upload", {
        method: "POST",
        formData,
      });
      const file = uploadRes.data;
      const fileLink = `https://drive.google.com/file/d/${file.id}/view`;

      // 🧩 Log to Google Sheet
      const logData: IeltsLogData = {
        name: session?.user?.name!,
        email: session?.user?.email!,
        part1:
          part === 1
            ? questions?.part1.map((q, i) => `${i + 1}. ${q}`).join("\n")
            : "",
        link1: part === 1 ? fileLink : "",
        part2:
          part === 2
            ? `${questions?.part2.topic}\n${questions?.part2.bullets
                .map((b) => `- ${b}`)
                .join("\n")}\nFollow-up: ${questions?.part2.followUp}`
            : "",
        link2: part === 2 ? fileLink : "",
        part3:
          part === 3
            ? `${questions?.part3.reading}\n\n${questions?.part3.questions
                .map((q, i) => `${i + 1}. ${q}`)
                .join("\n")}`
            : "",
        link3: part === 3 ? fileLink : "",
      };

      const uuid = localStorage.getItem("ielts_uuid");

      const logRes = await fetch("/api/log-to-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          sheetId: SHEET_ID,
          data: logData,
          uuid,
        }),
      });
      const result = await logRes.json();

      if (result?.uuid) localStorage.setItem("ielts_uuid", result.uuid);
    } catch (err: any) {
      console.error("❌ Upload or log error:", err);
    } finally {
      setUploading((prev) => ({ ...prev, [part]: false })); // ✅ Upload xong
    }
  };

  const formatTimer = (time: number) =>
    `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(
      time % 60
    ).padStart(2, "0")}`;

  const RecordButton = ({ part }: { part: number }) => {
    const isRecording = recordingPart === part;
    const isRecorded = recordedParts.includes(part);
    const isUploading = uploading[part];

    const isDisabled =
      isRecorded || isUploading || !accessToken || loadingQuestions;

    return (
      <div className="flex flex-col items-center mt-6 space-y-3">
        <button
          onClick={() =>
            isRecording ? stopRecording(part) : startRecording(part)
          }
          disabled={isDisabled}
          className={`relative flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed w-14 h-14"
              : isRecording
              ? "bg-red-500 hover:bg-red-600 w-16 h-16"
              : "bg-gradient-to-r from-[#0E4BA9] to-[#00A6FB] hover:opacity-90 w-14 h-14"
          }`}
        >
          {isUploading ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : isRecording ? (
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 1v10m0 0a3 3 0 01-3-3V5a3 3 0 016 0v3a3 3 0 01-3 3zm0 0v10m-6-4h12"
              />
            </svg>
          )}
          {isRecording && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-40"></span>
          )}
        </button>

        {isRecording && (
          <p className="text-gray-700 text-lg font-medium">
            {formatTimer(timer)}
          </p>
        )}
        {isUploading ? (
          <p className="text-blue-500 text-sm font-semibold">☁️ Uploading...</p>
        ) : isRecording ? (
          <p className="text-red-600 text-sm font-semibold">Recording...</p>
        ) : isRecorded ? (
          <p className="text-green-600 text-sm font-medium">✅ Completed</p>
        ) : (
          <p className="text-gray-500 text-sm">Click to start</p>
        )}

        {blobURL[part] && (
          <div className="mt-3 w-full">
            <audio controls src={blobURL[part]} className="w-full rounded-xl" />
          </div>
        )}
      </div>
    );
  };

  // 🌊 1️⃣ Đang tải đề thi với logo xoay tròn
  if (status === "loading" || loadingQuestions)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(90vh-80px)] bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] text-center">
        <motion.img
          src="/logo.png"
          alt="WeWIN Logo"
          className="w-50 mb-6 drop-shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl text-[#0E4BA9] font-semibold"
        >
          ⏳ Loading your IELTS test...
        </motion.h2>
        <p className="text-gray-500 text-sm mt-3 animate-pulse">
          Please wait a moment ✨
        </p>
      </div>
    );

  // 🔐 2️⃣ Chưa đăng nhập
  if (!session)
    return (
      <div className="min-h-[calc(90vh-80px)] flex items-center justify-center bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-3xl px-8 py-10 text-center"
        >
          <motion.img
            src="/logo.png"
            alt="WeWIN Logo"
            className="mx-auto mb-5 w-32"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          />
          <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4">
            Welcome to WeWIN IELTS
          </h2>
          <p className="text-gray-600 mb-6">Please log in to begin your test</p>
          <a
            href="/login"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-medium shadow hover:opacity-90 transition"
          >
            🔑 Log In Now
          </a>
        </motion.div>
      </div>
    );

  // ❌ 3️⃣ Lỗi tải đề thi
  if (!questions)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#FCE8E8] to-[#FFF5F5] font-[Lexend] text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-red-500 mb-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"
            />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          ❌ Unable to load question set
        </h2>
        <p className="text-gray-700 mb-4">
          There was a problem fetching your IELTS questions.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-400 text-white rounded-full shadow hover:opacity-90 transition"
        >
          🔁 Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB] text-center font-[Lexend] px-4 py-10">
      <h1 className="text-4xl font-bold text-[#0E4BA9] mb-3">
        🎙️ IELTS Speaking Test
      </h1>

      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-12 mt-8 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4">
          🗣️ Part 1 – Introduction
        </h2>
        <ul className="text-gray-700 text-left list-disc ml-8 space-y-2 mb-6">
          {questions.part1.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <RecordButton part={1} />
      </section>

      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-12 border-l-8 border-[#00A6FB]">
        <h2 className="text-2xl font-semibold text-[#00A6FB] mb-4">
          💬 Part 2 – Cue Card
        </h2>
        <p className="text-gray-800 font-medium mb-3">
          {questions.part2.topic}
        </p>
        <ul className="text-gray-700 list-disc ml-8 mb-3 space-y-1 text-left">
          {questions.part2.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="italic text-gray-600 mb-6">
          Follow-up: {questions.part2.followUp}
        </p>
        <RecordButton part={2} />
      </section>

      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-10 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4">
          📖 Part 3 – Discussion
        </h2>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mb-4 text-sm leading-relaxed">
          {questions.part3.reading}
        </p>
        <ul className="text-gray-700 list-disc ml-8 space-y-2 text-left">
          {questions.part3.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <RecordButton part={3} />
      </section>
    </div>
  );
}

