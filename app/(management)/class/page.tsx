"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit, Eye, Plus, Users, Clock, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/app/components/status";
import { Class, colorClasses, initialData } from "@/app/constants/class";
import MobileMenu from "@/app/components/mobileClassMenu";
import Notification from "@/app/components/notification";
import EditClassForm from "@/app/components/classForm";
import { useRouter } from "next/navigation";
import { Pagination, RowsPerPage } from "@/app/components/pagination";
import { calculateAge } from "@/app/utils/date";

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
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [notify, setNotify] = useState({
    message: "",
    type: "success" as "info" | "success" | "error",
    visible: false,
  });

  const [classPage, setClassPage] = useState(1);
  const [classRows, setClassRows] = useState<RowsPerPage>(5);

  // ✅ added: pagination riêng cho từng class student list
  const [studentPagination, setStudentPagination] = useState<{
    [classId: string]: { page: number; rows: RowsPerPage };
  }>({});

  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        // ✅ added: khởi tạo mặc định pagination khi mở card
        setStudentPagination((p) => ({
          ...p,
          [id]: p[id] || { page: 1, rows: 5 },
        }));
      }
      return next;
    });

  const handleViewClass = (cls: Class) => router.push(`/class/${cls.id}`);
  const handleAddClass = () => {
    setIsAddMode(true);
    setEditingClass({
      id: "",
      name: "",
      category: "",
      teacher1: "",
      teacher2: "",
      ta1: "",
      ta2: "",
      schedule: "",
      students: [],
    });
  };
  const handleEditClass = (cls: Class) => {
    setIsAddMode(false);
    setEditingClass(cls);
  };
  const handleSaveForm = (updated: Class) => {
    if (isAddMode) {
      const newClass = { ...updated, id: `CLS-${data.length + 1}` };
      setData((prev) => [...prev, newClass]);
      setNotify({
        message: `✅ Class “${newClass.name}” added successfully!`,
        type: "success",
        visible: true,
      });
    } else {
      setData((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setNotify({
        message: `✅ Class “${updated.name}” updated successfully!`,
        type: "success",
        visible: true,
      });
    }
    setEditingClass(null);
    setIsAddMode(false);
  };
  const handleCancelClass = (cls: Class) => {
    if (confirm(`⚠️ Cancel class "${cls.name}"?`)) {
      setData((prev) =>
        prev.map((c) => (c.id === cls.id ? { ...c, status: "Cancelled" } : c))
      );
      setNotify({
        message: `⚠️ Class "${cls.name}" has been cancelled!`,
        type: "info",
        visible: true,
      });
    }
  };

  const totalClasses = data.length;
  const totalClassPages =
    classRows === "all" ? 1 : Math.ceil(totalClasses / Number(classRows));
  const startClassIndex = (classPage - 1) * Number(classRows);
  const endClassIndex =
    classRows === "all" ? totalClasses : startClassIndex + Number(classRows);
  const displayedClasses =
    classRows === "all" ? data : data.slice(startClassIndex, endClassIndex);

  return (
    <div className="min-h-[calc(80vh-60px)] bg-linear-to-br from-blue-50 via-cyan-50 to-white p-4 sm:p-8 font-[Lexend]">
      <Notification
        message={notify.message}
        type={notify.type}
        visible={notify.visible}
        onClose={() => setNotify((p) => ({ ...p, visible: false }))}
      />

      {/* Header giữ nguyên */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0E4BA9] drop-shadow-sm">
          📚 Class Management
        </h1>
        <button
          onClick={handleAddClass}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-linear-to-r from-[#0E4BA9] to-[#00A6FB] text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> Add New Class
        </button>
      </header>

      {/* Desktop Table giữ nguyên logic, chỉ sửa pagination */}
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
            {displayedClasses.map((cls) => {
              const { page = 1, rows = 5 } = studentPagination[cls.id] || {};
              const totalPages =
                rows === "all"
                  ? 1
                  : Math.ceil(cls.students.length / Number(rows));
              const start = (page - 1) * Number(rows);
              const end =
                rows === "all" ? cls.students.length : start + Number(rows);
              const students =
                rows === "all" ? cls.students : cls.students.slice(start, end);

              return (
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
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-2">
                        {[
                          { icon: Eye, color: "blue", fn: handleViewClass },
                          { icon: Edit, color: "yellow", fn: handleEditClass },
                          { icon: Ban, color: "orange", fn: handleCancelClass },
                        ].map(({ icon: Icon, color, fn }) => (
                          <button
                            key={color}
                            onClick={() => fn(cls)}
                            className={`p-2 rounded-lg text-white shadow-sm transition ${colorClasses[color]}`}
                          >
                            <Icon size={18} />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={10} className="p-0">
                      <AnimatePresence initial={false}>
                        {expanded.has(cls.id) && (
                          <motion.div
                            key="student-list-desktop"
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden origin-top bg-blue-50"
                          >
                            <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                              <h3 className="text-lg font-semibold text-[#0E4BA9] mb-4">
                                👥 Student List ({cls.students.length})
                              </h3>
                              <motion.div
                                key={`${cls.id}-${page}-${rows}`}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.3 }}
                              >
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
                                    {students.map((stu, i) => (
                                      <motion.tr
                                        key={stu.id}
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.2,
                                          delay: i * 0.03,
                                        }}
                                        className="border-b border-blue-100 hover:bg-blue-50 transition"
                                      >
                                        <td className="px-5 py-3 text-[#0E4BA9] font-semibold">
                                          {stu.id}
                                        </td>
                                        <td className="px-5 py-3">
                                          {stu.name}
                                        </td>
                                        <td className="px-5 py-3">{calculateAge(new Date(stu.dob))}</td>
                                        <td className="px-5 py-3">
                                          {stu.gender}
                                        </td>
                                        <td className="px-5 py-3">
                                          <StatusBadge status={stu.status} />
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                          <div className="flex justify-left gap-2">
                                            <button className="p-2 rounded-md bg-blue-500 text-white">
                                              <Eye size={16} />
                                            </button>
                                            <button className="p-2 rounded-md bg-yellow-500 text-white">
                                              <Edit size={16} />
                                            </button>
                                            <button className="p-2 rounded-md bg-orange-500 text-white">
                                              <Ban size={16} />
                                            </button>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    ))}
                                  </tbody>
                                </table>
                              </motion.div>
                              <div className="mt-4">
                                <Pagination
                                  currentPage={page}
                                  totalPages={totalPages}
                                  startIndex={start}
                                  endIndex={end}
                                  totalStudents={cls.students.length}
                                  selectedRows={rows}
                                  onPrev={() =>
                                    setStudentPagination((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        page: Math.max(1, page - 1),
                                      },
                                    }))
                                  }
                                  onNext={() =>
                                    setStudentPagination((p) => ({
                                      ...p,
                                      [cls.id]: {
                                        ...p[cls.id],
                                        page:
                                          page < totalPages
                                            ? page + 1
                                            : totalPages,
                                      },
                                    }))
                                  }
                                  onRowsChange={(e) => {
                                    const val =
                                      e.target.value === "all"
                                        ? "all"
                                        : Number(e.target.value);
                                    setStudentPagination((p) => ({
                                      ...p,
                                      [cls.id]: { page: 1, rows: val },
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile section tương tự */}
      <div className="md:hidden space-y-4">
        {displayedClasses.map((cls) => {
          const { page = 1, rows = 5 } = studentPagination[cls.id] || {};
          const totalPages =
            rows === "all" ? 1 : Math.ceil(cls.students.length / Number(rows));
          const start = (page - 1) * Number(rows);
          const end =
            rows === "all" ? cls.students.length : start + Number(rows);
          const students =
            rows === "all" ? cls.students : cls.students.slice(start, end);

          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => toggleExpand(cls.id)}
              className={`bg-white rounded-2xl shadow-md border border-blue-100 p-4 cursor-pointer transition-all ${
                expanded.has(cls.id)
                  ? "ring-2 ring-[#0E4BA9]/40"
                  : "hover:shadow-lg"
              }`}
            >
              {/* Header giữ nguyên */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#0E4BA9]">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500">{cls.category}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    👩‍🏫 {cls.teacher1} {cls.teacher2 && `& ${cls.teacher2}`}
                  </p>
                  <p className="text-sm text-gray-700">
                    🧑‍💼 {cls.ta1} {cls.ta2 && `& ${cls.ta2}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Clock size={14} className="text-[#0E4BA9]" />
                    {Array.isArray(cls.schedule)
                      ? cls.schedule.join(", ")
                      : cls.schedule}
                  </p>
                  <p className="text-sm text-[#0E4BA9] mt-1 font-medium">
                    👥 {cls.students.length} Students
                  </p>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <MobileMenu
                    cls={cls}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    handleViewClass={handleViewClass}
                    handleEditClass={handleEditClass}
                    handleCancelClass={handleCancelClass}
                  />
                </div>
              </div>

              {/* Student list mobile */}
              <AnimatePresence initial={false}>
                {expanded.has(cls.id) && (
                  <motion.div
                    key="students"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="mt-1 overflow-hidden"
                  >
                    <div className="border-t border-blue-100 pt-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${cls.id}-${page}-${rows}`}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          {students.map((stu) => (
                            <motion.div
                              key={stu.id}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              transition={{ duration: 0.25 }}
                              className="flex justify-between bg-blue-50 px-3 py-2 rounded-lg text-sm shadow-sm"
                            >
                              <span className="font-medium text-[#0E4BA9]">
                                {stu.name}
                              </span>
                              <StatusBadge status={stu.status} />
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>

                      <div
                        className="mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          startIndex={start}
                          endIndex={end}
                          totalStudents={cls.students.length}
                          selectedRows={rows}
                          onPrev={() =>
                            setStudentPagination((p) => ({
                              ...p,
                              [cls.id]: {
                                ...p[cls.id],
                                page: Math.max(1, page - 1),
                              },
                            }))
                          }
                          onNext={() =>
                            setStudentPagination((p) => ({
                              ...p,
                              [cls.id]: {
                                ...p[cls.id],
                                page: page < totalPages ? page + 1 : totalPages,
                              },
                            }))
                          }
                          onRowsChange={(e) => {
                            e.stopPropagation();
                            const val =
                              e.target.value === "all"
                                ? "all"
                                : Number(e.target.value);
                            setStudentPagination((p) => ({
                              ...p,
                              [cls.id]: { page: 1, rows: val },
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Pagination class list giữ nguyên */}
        <div className="mt-6">
          <Pagination
            currentPage={classPage}
            totalPages={totalClassPages}
            startIndex={startClassIndex}
            endIndex={endClassIndex}
            totalStudents={totalClasses}
            selectedRows={classRows}
            onPrev={() => setClassPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              setClassPage((p) => (p < totalClassPages ? p + 1 : p))
            }
            onRowsChange={(e) => {
              const val =
                e.target.value === "all" ? "all" : Number(e.target.value);
              setClassRows(val);
              setClassPage(1);
            }}
          />
        </div>
      </div>

      {/* Form giữ nguyên */}
      <AnimatePresence>
        {editingClass && (
          <EditClassForm
            cls={editingClass}
            isAddMode={isAddMode}
            onSave={handleSaveForm}
            onCancel={() => {
              setEditingClass(null);
              setIsAddMode(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
