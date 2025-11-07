"use client";

import { useState, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { InputField } from "@/app/components/input";
import ReadingSection from "./components/ReadingSection";
import WritingSection from "./components/WritingSection";
import SpeakingSection from "./components/SpeakingSection";

interface UserInfo {
  fullName: string;
  birthDate: string;
  location: string;
  phone: string;
  email: string;
  consultant: string;
  ieltsNeed: string;
  ieltsOther?: string;
  selfScore: string;
  studyTime: string;
}

type Stage = "form" | "reading" | "writing" | "speaking" | "done";

export default function IELTSPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    fullName: "",
    birthDate: "",
    location: "",
    phone: "",
    email: "",
    consultant: "",
    ieltsNeed: "",
    ieltsOther: "",
    selfScore: "",
    studyTime: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = Object.entries(userInfo).every(([key, val]) => {
    if (key === "ieltsOther" && userInfo.ieltsNeed !== "Khác") return true;
    return String(val).trim() !== "";
  });

  const handleStart = () => {
    if (!isFormValid)
      return alert(
        "❗ Vui lòng điền đầy đủ thông tin trước khi bắt đầu bài thi!"
      );
    localStorage.setItem("ielts_userInfo", JSON.stringify(userInfo));
    setStage("reading");
  };

  const handleNext = (next: Stage) => setStage(next);

  /* =========================
     🧩 Flow các phần thi
  ========================== */

  if (stage === "reading")
    return (
      <ReadingSection
        // ✅ Lưu dữ liệu và chuyển sang Writing
        onNext={() => {
          alert("✅ Đã lưu bài Reading! Chuyển sang phần Writing...");
          handleNext("writing");
        }}
      />
    );

  if (stage === "writing")
    return (
      <WritingSection
        // ✅ Lưu dữ liệu và chuyển sang Speaking
        onNext={() => {
          alert("✅ Đã lưu bài Writing! Chuyển sang phần Speaking...");
          handleNext("speaking");
        }}
      />
    );

  if (stage === "speaking")
    return <SpeakingSection onFinish={() => handleNext("done")} />;

  if (stage === "done")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-[#0E4BA9] mb-4"
        >
          🎉 Hoàn tất bài thi IELTS!
        </motion.h1>
        <p className="text-gray-600">
          Cảm ơn bạn <b>{userInfo.fullName}</b> đã hoàn thành bài thi thử của
          WeWIN HTO.
        </p>
      </div>
    );

  /* =========================
     🧾 Form trước khi thi
  ========================== */
  return (
    <div className="min-h-screen bg-linear-to-b from-[#EAF4FF] to-[#F9FAFB] font-[Lexend] flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl w-full bg-white/95 backdrop-blur-xl border border-[#B8D7F9]/70 rounded-3xl shadow-[0_8px_30px_rgba(14,75,169,0.1)] p-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-[#e0f0fd] to-[#EAF4FF] opacity-90 rounded-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <img
              src="/logo.png"
              alt="WeWIN Logo"
              className="w-52 drop-shadow-md"
            />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0E4BA9] mb-3 text-center">
            IELTS Test — <span className="text-[#007BCE]">WeWIN HTO</span>
          </h1>

          {/* Lưu ý */}
          <div className="text-left bg-linear-to-r from-[#EAF4FF] to-[#F7FAFF] border border-[#B8D7F9]/60 rounded-2xl p-5 mb-8 shadow-inner">
            <p className="font-semibold text-[#0E4BA9] mb-2">
              📋 Lưu ý trước khi bắt đầu:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>
                Bài kiểm tra gồm 3 phần: <b>Reading</b>, <b>Writing</b>,{" "}
                <b>Speaking</b>.
              </li>
              <li>
                Đảm bảo <b>micro </b> hoạt động tốt.
              </li>
              <li>
                Khi bấm <b>"Bắt đầu kiểm tra"</b>, hệ thống sẽ ghi nhận thông tin.
              </li>
              <li>
                Không <b>reload trang</b> trong khi làm bài.
              </li>
            </ul>
          </div>

          {/* Form */}
          <form className="text-left grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Họ & tên của Anh/Chị"
              name="fullName"
              value={userInfo.fullName}
              onChange={handleChange}
              required
            />
            <InputField
              label="Ngày sinh"
              name="birthDate"
              type="date"
              value={userInfo.birthDate}
              onChange={handleChange}
              required
              onFocus={(e) => e.target.showPicker && e.target.showPicker()}
            />
            <InputField
              label="Khu vực bạn đang học tập/làm việc"
              name="location"
              value={userInfo.location}
              onChange={handleChange}
              required
              placeholder="VD: TP.HCM, Quận Bình Thạnh..."
              fullWidth
            />
            <InputField
              label="Số điện thoại của Anh/Chị"
              name="phone"
              type="tel"
              value={userInfo.phone}
              onChange={handleChange}
              required
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={userInfo.email}
              onChange={handleChange}
              required
            />
            <InputField
              label="Tên nhân viên tư vấn cho Anh/Chị"
              name="consultant"
              value={userInfo.consultant}
              onChange={handleChange}
              required
              fullWidth
            />

            {/* Nhu cầu IELTS */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#0E4BA9] mb-3">
                Nhu cầu IELTS của Anh/Chị{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {["Đi học", "Đi định cư", "Đi làm", "Khác"].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 bg-[#F7FAFF] border border-[#B8D7F9]/50 rounded-xl px-4 py-2 cursor-pointer hover:border-[#0E4BA9] transition-all"
                  >
                    <input
                      required
                      type="radio"
                      name="ieltsNeed"
                      value={option}
                      checked={userInfo.ieltsNeed === option}
                      onChange={handleChange}
                      className="accent-[#0E4BA9] w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">{option}</span>
                  </label>
                ))}
              </div>

              {/* Nếu chọn Khác thì hiện ô nhập */}
              {userInfo.ieltsNeed === "Khác" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    name="ieltsOther"
                    value={userInfo.ieltsOther}
                    onChange={handleChange}
                    placeholder="Vui lòng ghi rõ nhu cầu của bạn..."
                    className="w-full px-4 py-3 border border-[#B8D7F9] rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0E4BA9] transition-all"
                    required
                  />
                </motion.div>
              )}
            </div>

            <InputField
              label="Theo Anh/Chị tự nhận xét, điểm IELTS của mình đang ở mấy chấm?"
              name="selfScore"
              value={userInfo.selfScore}
              onChange={handleChange}
              required
              placeholder="VD: 5.0, 6.5, 7.0..."
            />
            <InputField
              label="Một tuần, Anh/Chị bỏ ra bao nhiêu thời gian để học tiếng Anh?"
              name="studyTime"
              value={userInfo.studyTime}
              onChange={handleChange}
              required
              placeholder="VD: 10 giờ/tuần, 2 giờ/ngày..."
            />
          </form>

          {/* Nút bắt đầu thi */}
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                isFormValid
                  ? "bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] hover:shadow-xl"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              🚀 BẮT ĐẦU THI
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
