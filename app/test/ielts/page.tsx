"use client";

import React from "react";
import { apiCall } from "@/app/utils/apiClient";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Recorder: any;
  }
  
}

interface IELTSQuestionSet {
  part1: string[];
  part2: {
    topic: string;
    bullets: string[];
    followUp: string;
  };
  part3: {
    reading: string;
    questions: string[];
  };
}

export default function IELTSPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  const [recordingPart, setRecordingPart] = useState<number | null>(null);
  const [recordedParts, setRecordedParts] = useState<number[]>([]); // ✅ Ghi nhớ part đã ghi xong
  const [timer, setTimer] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<Record<number, string>>(
    {}
  );
  const [blobURL, setBlobURL] = useState<Record<number, string>>({});

  const DRIVE_FOLDER_ID = "1nqCGsxqg5agELKqJM-_fEBrSAAWTlxif";
  const recorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("🔑 Google accessToken:", session?.accessToken);
  }, [session]);

  /** 🎯 Bộ đề thi IELTS (Level 4.0 → 5.0) */
  const questions: IELTSQuestionSet = {
    part1: [
      "Do you prefer studying alone or with other people? Why?",
      "What kind of music do you like to listen to when you’re relaxing?",
      "How often do you use your phone to learn English?",
    ],
    part2: {
      topic: "Describe a memorable trip you have taken.",
      bullets: [
        "Where you went",
        "Who you went with",
        "What you did there",
        "And explain why it was memorable",
      ],
      followUp: "Did this trip change your way of thinking about travel?",
    },
    part3: {
      reading:
        "Many people believe that travelling helps us understand different cultures and become more open-minded. However, travelling can also create pollution and harm local communities if not done responsibly.",
      questions: [
        "Do you think young people should travel abroad more often? Why or why not?",
        "What can we do to make tourism more environmentally friendly?",
      ],
    },
  };

  /** ✅ Load Recorder.js */
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/mattdiamond/Recorderjs@master/dist/recorder.js";
    script.async = true;
    script.onload = () => console.log("✅ Recorder.js loaded");
    document.body.appendChild(script);
  }, []);

  /** ✅ Session check */
  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Đang tải thông tin...
      </div>
    );

  if (!session)
    return (
      <div className="h-screen flex items-center justify-center">
        <a href="/login" className="text-blue-600 underline">
          Vui lòng đăng nhập trước khi thi
        </a>
      </div>
    );

  /** 🎤 Start recording */
  const startRecording = async (part: number) => {
    if (recordedParts.includes(part))
      return alert("❌ Bạn đã ghi âm phần này rồi. Chỉ được 1 lần thôi!");

    try {
      if (!accessToken)
        return alert("Không có token Google. Vui lòng đăng nhập lại!");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.AudioContext)();
      const input = audioContext.createMediaStreamSource(stream);
      const recorder = new window.Recorder(input, { numChannels: 1 });
      recorderRef.current = recorder;

      recorder.record();
      setRecordingPart(part);
      setTimer(300); // 5 phút = 300 giây
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            stopRecording(part); // ⏹️ tự dừng khi hết giờ
            return 0;
          }
          return t - 1; // đếm ngược
        });
      }, 1000);
    } catch (err) {
      console.error("🚫 Lỗi micro:", err);
      alert("❌ Không thể truy cập micro. Hãy cho phép quyền micro!");
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
    setUploadMessage((prev) => ({ ...prev, [part]: "📦 Đang xử lý file..." }));

    recorder.exportWAV(async (blob: Blob) => {
      if (blob.size === 0)
        return setUploadMessage((prev) => ({
          ...prev,
          [part]: "⚠️ Không ghi được âm thanh.",
        }));
      const url = URL.createObjectURL(blob);
      setBlobURL((prev) => ({ ...prev, [part]: url }));
      await uploadToDrive(blob, part);
      setRecordedParts((prev) => [...prev, part]); // ✅ Ghi nhớ part đã hoàn thành

      if (stream) stream.getTracks().forEach((t) => t.stop());
    });
  };

  /** 🧩 Upload file lên Google Drive */
  const uploadToDrive = async (blob: Blob, part: number) => {
    try {
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("accessToken", accessToken!);
      formData.append("folderId", DRIVE_FOLDER_ID);

      await apiCall<{ data: any }>("/api/upload", {
        method: "POST",
        formData,
      });

      // 🧹 Không hiển thị thông báo gì sau khi upload
      setUploadMessage((prev) => ({ ...prev, [part]: "" }));
    } catch (err: any) {
      setUploadMessage((prev) => ({
        ...prev,
        [part]: "❌ Upload thất bại: " + err.message,
      }));
    }
  };

  const timerDisplay = `${String(Math.floor(timer / 60)).padStart(
    2,
    "0"
  )}:${String(timer % 60).padStart(2, "0")}`;

  /** 🎛️ Component ghi âm */
  const RecordButton = ({ part }: { part: number }) => {
    const isRecording = recordingPart === part;
    const isRecorded = recordedParts.includes(part); // ✅ Kiểm tra đã ghi chưa

    return (
      <div className="flex flex-col items-center mt-6 space-y-3">
        {/* 🔘 Nút Mic */}
        <button
          onClick={() =>
            isRecording ? stopRecording(part) : startRecording(part)
          }
          disabled={isRecorded} // ✅ Khóa nếu part đã ghi
          className={`relative flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
            isRecorded
              ? "bg-gray-400 cursor-not-allowed w-14 h-14"
              : isRecording
              ? "bg-red-500 hover:bg-red-600 w-16 h-16"
              : "bg-gradient-to-r from-[#0E4BA9] to-[#00A6FB] hover:opacity-90 w-14 h-14"
          }`}
        >
          {isRecording ? (
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

        {/* ⏱️ Timer */}
        {isRecording && (
          <p className="text-gray-700 text-lg font-medium">{timerDisplay}</p>
        )}

        {/* 🔴 Trạng thái ghi âm */}
        {isRecording ? (
          <div className="text-center leading-tight">
            <p className="text-red-600 text-sm font-semibold flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Đang ghi âm...
            </p>
            
            <p className="text-gray-500 text-sm mt-1">
              🎧 Nói rõ ràng & tự nhiên nhé!
            </p>

          </div>
          
        ) : isRecorded ? (
          <p className="text-green-600 text-sm font-medium">
            ✅ Bạn đã hoàn thành phần này
          </p>
        ) : (
          <p className="text-gray-500 text-sm">Nhấn để bắt đầu</p>
        )}

        {/* 📦 Upload result */}
        {uploadMessage[part] && (
          <div
            className="mt-2 text-gray-700 text-sm"
            dangerouslySetInnerHTML={{ __html: uploadMessage[part] }}
          />
        )}

        {/* 🎧 Audio */}
        {blobURL[part] && (
          <div className="mt-3 w-full">
            <audio
              controls
              src={blobURL[part]}
              className="w-full rounded-xl"
            ></audio>
          </div>
        )}
      </div>
    );
  };

  /** 🧠 UI chính */
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#EAF4FF] to-[#F9FAFB] text-center font-[Lexend] px-4 py-10"
      style={{ fontFamily: "Lexend, sans-serif" }}
    >
      <h1 className="text-4xl font-bold text-[#0E4BA9] mb-3">
        🎙️ IELTS Speaking Test
      </h1>

      {/* === PART 1 === */}
      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-12 mt-8 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4 flex items-center justify-center gap-2">
          🗣️ Part 1 – Introduction
        </h2>
        <ul className="text-gray-700 text-left list-disc ml-8 space-y-2 mb-6">
          {questions.part1.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
        <RecordButton part={1} />
      </section>

      {/* === PART 2 === */}
      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-12 border-l-8 border-[#00A6FB]">
        <h2 className="text-2xl font-semibold text-[#00A6FB] mb-4 flex items-center justify-center gap-2">
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

      {/* === PART 3 === */}
      <section className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8 mb-10 border-l-8 border-[#0E4BA9]">
        <h2 className="text-2xl font-semibold text-[#0E4BA9] mb-4 flex items-center justify-center gap-2">
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
