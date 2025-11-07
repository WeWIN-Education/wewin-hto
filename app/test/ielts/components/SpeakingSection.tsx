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

export default function SpeakingSection({
  onFinish,
}: {
  onFinish?: () => void;
}) {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  const [questions, setQuestions] = useState<IELTSQuestionSet | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [recordingPart, setRecordingPart] = useState<number | null>(null);
  const [recordedParts, setRecordedParts] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [blobURL, setBlobURL] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const DRIVE_FOLDER_ID = "1UkpgUNL9JAIQgT8Ph_fiKJZWDOztI0ai";
  const SHEET_ID = "1Jh_KKBMmUzE7cltx6ZdGeeJIvm2q6PbDlgn_INKNQAY";

  // 🔹 Kiểm tra nếu đã kết thúc bài thi
  useEffect(() => {
    const finished = localStorage.getItem("ielts_finished");
    if (finished === "true") setIsFinished(true);
  }, []);

  /** 🔹 Fetch IELTS questions — persist across F5 until logout */
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const savedQuestions = localStorage.getItem("ielts_questions");
        if (savedQuestions) {
          setQuestions(JSON.parse(savedQuestions));
          setLoadingQuestions(false);
          return;
        }

        const res = await fetch("/api/generate-ielts");
        if (!res.ok) throw new Error("Failed to load questions");
        const data = await res.json();
        setQuestions(data);
        localStorage.setItem("ielts_questions", JSON.stringify(data));
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
    }
  }, []);

  /** 🔹 Load Recorder.js */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/mattdiamond/Recorderjs@master/dist/recorder.js";
    script.async = true;
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

  /** ✅ Kết thúc bài thi */
  const handleFinishTest = () => {
    if (confirm("Bạn có chắc muốn kết thúc bài thi không?")) {
      localStorage.setItem("ielts_finished", "true");
      setIsFinished(true);
      alert("🎉 Bạn đã hoàn thành bài thi! Bạn sẽ không thể thi lại.");
      if (onFinish) onFinish(); // 🔹 Gọi callback để chuyển stage sang "done"
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
      setUploading((prev) => ({ ...prev, [part]: true }));

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
      setUploading((prev) => ({ ...prev, [part]: false }));
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
              : "bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] hover:opacity-90 w-14 h-14"
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

  // ✅ Nếu đã hoàn thành bài thi
  if (isFinished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] text-center">
        <motion.img
          src="/logo.png"
          alt="WeWIN Logo"
          className="w-40 mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <h1 className="text-3xl font-bold text-[#0E4BA9] mb-3">
          🎉 Bạn đã hoàn thành bài thi IELTS!
        </h1>
        <p className="text-gray-600 mb-6">
          Hệ thống đã lưu kết quả, bạn không thể bắt đầu lại bài thi này.
        </p>
        <a
          href="/"
          className="px-8 py-3 bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
        >
          ⬅️ Quay lại trang chủ
        </a>
      </div>
    );
  }

  // Giữ nguyên logic còn lại của bạn
  return (
    <div className="min-h-screen bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] text-center font-[Lexend] px-4 py-10">
      <h1 className="text-4xl font-bold text-[#0E4BA9] mb-3">
        🎙️ IELTS Speaking Test
      </h1>

      {/* Parts */}
      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-12 mt-8 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4">
          🗣️ Part 1 – Introduction
        </h2>
        <ul className="text-gray-700 text-left list-disc ml-8 space-y-2 mb-6">
          {questions?.part1.map((q, i) => (
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
          {questions?.part2.topic}
        </p>
        <ul className="text-gray-700 list-disc ml-8 mb-3 space-y-1 text-left">
          {questions?.part2.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        <p className="italic text-gray-600 mb-6">
          Follow-up: {questions?.part2.followUp}
        </p>
        <RecordButton part={2} />
      </section>

      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-10 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4">
          📖 Part 3 – Discussion
        </h2>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mb-4 text-sm leading-relaxed">
          {questions?.part3.reading}
        </p>
        <ul className="text-gray-700 list-disc ml-8 space-y-2 text-left">
          {questions?.part3.questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <RecordButton part={3} />
      </section>

      {/* ✅ Nút kết thúc bài thi */}
      <div className="mt-12 mb-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinishTest}
          className="px-10 py-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
        >
          🎯 KẾT THÚC BÀI THI
        </motion.button>
        <p className="text-gray-500 text-sm mt-3">
          Sau khi kết thúc, bạn sẽ không thể thi lại hoặc ghi âm lại nữa.
        </p>
      </div>
    </div>
  );
}
