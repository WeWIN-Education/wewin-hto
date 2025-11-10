"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Eye, Plus, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/app/components/status";
import { Class, initialData } from "@/app/constants/class";
import MobileMenu from "@/app/components/mobileClassMenu";

// 🔹 Headers
const CLASS_HEADERS = [
  "ID",
  "Class Name",
  "Category",
  "Teachers",
  "TA",
  "Schedule",
  "Students",
  "Actions",
];
const STUDENT_HEADERS = ["ID", "Name", "Age", "Gender", "Status", "Actions"];

export default function ClassPage() {
  const [data, setData] = useState<Class[]>(initialData);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Toggle student list
  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // 🔹 CRUD Handlers
  const handleViewClass = (cls: Class) => {
    alert(
      `📘 ${cls.name}\nCategory: ${cls.category}\nTeacher: ${cls.teacher1}${
        cls.teacher2 ? ` & ${cls.teacher2}` : ""
      }\nTA: ${cls.ta1 || "-"}${cls.ta2 ? ` & ${cls.ta2}` : ""}\nSchedule: ${
        cls.schedule
      }\nStudents: ${cls.students.length}`
    );
  };

  const handleEditClass = (cls: Class) => {
    const newName = prompt("✏️ Edit class name:", cls.name);
    if (newName?.trim()) {
      setData((prev) =>
        prev.map((c) => (c.id === cls.id ? { ...c, name: newName.trim() } : c))
      );
    }
  };

  const handleDeleteClass = (cls: Class) => {
    if (confirm(`🗑 Delete class "${cls.name}"?`)) {
      setData((prev) => prev.filter((c) => c.id !== cls.id));
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(cls.id);
        return next;
      });
    }
  };

  // ---------------------------
  // ✨ RENDER SECTION
  // ---------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-white p-4 sm:p-8 font-[Lexend]">
      {/* 🔹 Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E4BA9] drop-shadow-sm">
          📚 Class Management
        </h1>
        <button
          onClick={() => alert("🚧 Add class feature coming soon!")}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 
                     rounded-xl bg-linear-to-r from-[#0E4BA9] to-[#00A6FB]
                     text-white font-semibold shadow-md hover:shadow-lg 
                     hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> Add New Class
        </button>
      </header>

      {/* 🔹 Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-blue-100 overflow-x-auto">
        <table className="w-full border-collapse text-gray-800">
          <thead className="bg-linear-to-r from-[#0E4BA9] to-[#007BCE] text-white text-sm uppercase">
            <tr>
              {CLASS_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-center whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-100">
            {data.map((cls) => (
              <React.Fragment key={cls.id}>
                <tr
                  onClick={() => toggleExpand(cls.id)}
                  className={`cursor-pointer transition-all ${
                    expanded.has(cls.id) ? "bg-blue-50" : "hover:bg-blue-50"
                  }`}
                >
                  <td className="px-6 py-4 text-center">{cls.id}</td>
                  <td className="px-6 py-8 font-semibold flex justify-center items-center gap-2 text-center">
                    <Users className="w-5 h-5 text-[#0E4BA9]" />
                    <span>{cls.name}</span>
                  </td>
                  <td className="px-6 py-4 text-center">{cls.category}</td>
                  {/* 🔹 Gộp Teachers */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-[#0E4BA9]">
                        {cls.teacher1 || "-"}
                      </span>
                      {cls.teacher2 && (
                        <span className="font-medium text-[#0E4BA9]">
                          {cls.teacher2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 🔹 Gộp TAs */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-[#0E4BA9]">
                        {cls.ta1 || "-"}
                      </span>
                      {cls.ta2 && (
                        <span className="font-medium text-[#0E4BA9]">
                          {cls.ta2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-gray-700 align-top text-center">
                    <div className="inline-flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#0E4BA9] mt-0.5" />
                      <div className="flex flex-col leading-tight">
                        {/* Nếu schedule là string => tách bằng dấu chấm phẩy */}
                        {Array.isArray(cls.schedule)
                          ? cls.schedule.map((slot, idx) => (
                              <span key={idx} className="text-sm font-medium">
                                {slot.trim()}
                              </span>
                            ))
                          : cls.schedule.split(";").map((slot, idx) => (
                              <span key={idx} className="text-sm font-medium">
                                {slot.trim()}
                              </span>
                            ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-[#0E4BA9] font-semibold">
                    {cls.students.length}
                  </td>

                  {/* 🔹 Actions */}
                  <td
                    className="px-6 py-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">
                      {[
                        { icon: Eye, color: "blue", fn: handleViewClass },
                        { icon: Edit, color: "yellow", fn: handleEditClass },
                        { icon: Trash2, color: "red", fn: handleDeleteClass },
                      ].map(({ icon: Icon, color, fn }) => (
                        <button
                          key={color}
                          onClick={() => fn(cls)}
                          className={`p-2 rounded-lg text-white shadow-sm 
                                      bg-${color}-500 hover:bg-${color}-600 transition`}
                        >
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>

                {/* 🔹 Expanded Student List */}
                <AnimatePresence>
                  {expanded.has(cls.id) && (
                    <motion.tr
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="bg-linear-to-r from-blue-50 via-cyan-50 to-blue-50"
                    >
                      <td colSpan={10}>
                        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                          <h3 className="text-lg font-semibold text-[#0E4BA9] mb-4">
                            👥 Student List ({cls.students.length})
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse text-gray-800">
                              <thead className="bg-linear-to-r from-[#007BCE] to-[#0E4BA9] text-white">
                                <tr>
                                  {STUDENT_HEADERS.map((h) => (
                                    <th
                                      key={h}
                                      className="px-5 py-3 text-left font-semibold"
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {cls.students.map((stu, i) => (
                                  <tr
                                    key={stu.id}
                                    className="border-b border-blue-100 hover:bg-blue-50 transition"
                                  >
                                    <td className="px-5 py-3 text-[#0E4BA9] font-semibold">
                                      {stu.id}
                                    </td>
                                    <td className="px-5 py-3">{stu.name}</td>
                                    <td className="px-5 py-3">{stu.age}</td>
                                    <td className="px-5 py-3">{stu.gender}</td>
                                    <td className="px-5 py-3">
                                      <StatusBadge status={stu.status} />
                                    </td>
                                    {/* 🧠 Actions */}
                                    <td className="px-5 py-3 text-left">
                                      <div className="flex gap-2">
                                        {[
                                          {
                                            icon: Eye,
                                            color: "blue",
                                            action: "View",
                                          },
                                          {
                                            icon: Edit,
                                            color: "yellow",
                                            action: "Edit",
                                          },
                                          {
                                            icon: Trash2,
                                            color: "red",
                                            action: "Delete",
                                          },
                                        ].map(
                                          ({ icon: Icon, color, action }) => (
                                            <button
                                              key={action}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                alert(
                                                  `${action} student: ${stu.name}`
                                                );
                                              }}
                                              className={`p-1.5 rounded-md text-white bg-${color}-500 hover:bg-${color}-600 transition shadow-sm`}
                                            >
                                              <Icon size={15} />
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔹 Mobile View */}
      <div className="block md:hidden space-y-4">
        {data.map((cls) => (
          <motion.div
            key={cls.id}
            onClick={() => toggleExpand(cls.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-linear-to-br from-white via-blue-50 to-cyan-100 rounded-xl 
                       border border-blue-200 shadow-lg p-4"
          >
            {/* 🔸 Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-[#0E4BA9]">{cls.name}</h3>
                <p className="text-sm font-semibold text-[#007BCE]">
                  {cls.category}
                </p>
              </div>

              <MobileMenu
                cls={cls}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                handleViewClass={handleViewClass}
                handleEditClass={handleEditClass}
                handleDeleteClass={handleDeleteClass}
              />
            </div>

            {/* 🔸 Info */}
            <div className="mt-2 text-sm text-gray-700 space-y-1">
              <p>
                👨‍🏫 {cls.teacher1}
                {cls.teacher2 && ` & ${cls.teacher2}`}
              </p>
              <p>
                🧑‍💼 {cls.ta1 || "-"}
                {cls.ta2 && ` & ${cls.ta2}`}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} /> {cls.schedule}
              </p>
              <p className="text-[#0E4BA9] font-semibold mt-2">
                👥 {cls.students.length} students
              </p>
            </div>

            {/* 🔸 Student List */}
            <AnimatePresence>
              {expanded.has(cls.id) && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25 }}
                  className="mt-3 bg-white border border-blue-100 rounded-lg shadow-inner p-3"
                >
                  {cls.students.map((stu, i) => (
                    <div
                      key={stu.id}
                      className="flex justify-between items-center py-1 border-b border-blue-50 text-sm"
                    >
                      <span className="text-[#0E4BA9] font-semibold">
                        {i + 1}. {stu.name}
                      </span>
                      <StatusBadge status={stu.status} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
