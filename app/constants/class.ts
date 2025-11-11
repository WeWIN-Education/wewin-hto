// =======================
// 🔹 Interfaces
// =======================
export interface Student {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: string;
}

export interface Class {
  id: string;
  name: string;
  category: string;
  teacher1: string | null;
  teacher2?: string | null;
  ta1?: string | null;
  ta2?: string | null;
  schedule: Array<string> | string;
  students: Student[];
}

export const colorClasses: Record<string, string> = {
  blue: "bg-blue-500 hover:bg-blue-600",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  orange: "bg-orange-500 hover:bg-orange-600",
};

// 🔹 Danh sách Category mẫu
export const categoryOptions = [
  "Phonics 1",
  "Phonics 2",
  "Phonics 3",
  "Movers",
  "Flyers",
  "Pre-IELTS",
  "IELTS Foundation",
  "IELTS Advanced",
];

export const initialData = [
  {
    id: "CLS-001",
    name: "IELTS Foundation A",
    category: "IELTS",
    teacher1: "Ms. Vy",
    teacher2: "Mr. Quang",
    ta1: "Ms. Hanh",
    ta2: null,
    schedule: ["Mon 17:30–19:00", "Thu 17:30–19:00"],
    students: Array.from({ length: 25 }, (_, i) => ({
      id: `STU-${i + 1}`,
      name: [
        "Linh",
        "Nam",
        "Minh",
        "Tram Anh",
        "Hoa",
        "Tuan",
        "Vy",
        "Nhi",
        "Thao",
        "Phuc",
        "Duy",
        "Long",
        "An",
        "Trang",
        "Bao",
        "Khang",
        "Lana",
        "Tuan Anh",
        "My",
        "Ken",
        "Hana",
        "Tin",
        "Mai",
        "Phuong",
        "Hieu",
      ][i % 25],
      age: 17 + (i % 4),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: i % 5 === 0 ? "Inactive" : "Active",
    })),
    resources: [
      {
        id: "RES-001",
        title: "IELTS Foundation - Vocabulary Set 1",
        type: "Google Drive",
        link: "https://drive.google.com/...",
        description: "Essential vocabulary for IELTS Foundation students.",
      },
      {
        id: "RES-002",
        title: "IELTS Listening Practice A1",
        type: "Quizizz",
        link: "https://quizizz.com/...",
        description: "Interactive listening practice quizzes.",
      },
      {
        id: "RES-003",
        title: "Writing Task 1 Samples",
        type: "Google Docs",
        link: "https://docs.google.com/...",
        description: "Model essays for Writing Task 1 with feedback.",
      },
    ],
  },
  {
    id: "CLS-002",
    name: "Movers 2",
    category: "Cambridge",
    teacher1: "Mr. Hung",
    teacher2: "Ms. Mai",
    ta1: "Ms. Linh",
    ta2: null,
    schedule: ["Tue 17:00–18:30", "Fri 17:00–18:30"],
    students: Array.from({ length: 20 }, (_, i) => ({
      id: `STU-M${i + 1}`,
      name: [
        "An",
        "Tram",
        "Bao",
        "Lan",
        "Minh",
        "Kiet",
        "Nga",
        "Tam",
        "Phuoc",
        "Linh",
        "Huy",
        "Phat",
        "Khang",
        "My",
        "Ken",
        "Nhi",
        "Tien",
        "Vy",
        "Trang",
        "Thao",
      ][i],
      age: 9 + (i % 3),
      gender: i % 2 === 0 ? "Male" : "Female",
      status: i % 4 === 0 ? "Inactive" : "Active",
    })),
    resources: [
      {
        id: "RES-010",
        title: "Cambridge Movers Flashcards",
        type: "PDF",
        link: "https://drive.google.com/...",
        description: "Printable vocabulary flashcards for Movers 2.",
      },
      {
        id: "RES-011",
        title: "Listening Practice Set 2",
        type: "YouTube",
        link: "https://youtube.com/...",
        description: "Fun listening lessons for young learners.",
      },
    ],
  },
  {
    id: "CLS-003",
    name: "Pre-IELTS B",
    category: "IELTS",
    teacher1: "Mr. John",
    teacher2: null,
    ta1: "Ms. Hoa",
    ta2: "Mr. Nam",
    schedule: ["Wed 18:00–19:30", "Sat 09:00–10:30"],
    students: Array.from({ length: 28 }, (_, i) => ({
      id: `STU-P${i + 1}`,
      name: `Student ${i + 1}`,
      age: 16 + (i % 3),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: i % 6 === 0 ? "Inactive" : "Active",
    })),
    resources: [
      {
        id: "RES-020",
        title: "Grammar Essentials for IELTS",
        type: "PDF",
        link: "https://drive.google.com/...",
        description: "Core grammar lessons with examples and exercises.",
      },
      {
        id: "RES-021",
        title: "Speaking Practice - Common Topics",
        type: "Padlet",
        link: "https://padlet.com/...",
        description: "A wall of sample answers and topic vocabulary.",
      },
      {
        id: "RES-022",
        title: "IELTS Reading Practice",
        type: "Google Drive",
        link: "https://drive.google.com/...",
        description: "Reading passages and comprehension questions.",
      },
    ],
  },
  {
    id: "CLS-004",
    name: "Flyers 1",
    category: "Cambridge",
    teacher1: "Ms. Phuong",
    teacher2: null,
    ta1: "Mr. Long",
    ta2: null,
    schedule: ["Mon 16:30–18:00", "Thu 16:30–18:00"],
    students: Array.from({ length: 18 }, (_, i) => ({
      id: `STU-F${i + 1}`,
      name: `Flyer ${i + 1}`,
      age: 10 + (i % 2),
      gender: i % 2 === 0 ? "Male" : "Female",
      status: i % 5 === 0 ? "Inactive" : "Active",
    })),
    resources: [
      {
        id: "RES-030",
        title: "Flyers Storytelling Cards",
        type: "PDF",
        link: "https://drive.google.com/...",
        description:
          "Colorful storytelling picture cards for class activities.",
      },
      {
        id: "RES-031",
        title: "Flyers Listening Playlist",
        type: "YouTube",
        link: "https://youtube.com/...",
        description: "Listening exercises and songs for Flyers learners.",
      },
    ],
  },
  {
    id: "CLS-005",
    name: "Phonics 3",
    category: "Phonics",
    teacher1: "Ms. Daisy",
    teacher2: null,
    ta1: "Ms. Thao",
    ta2: "Mr. Duy",
    schedule: ["Sat 08:00–09:30", "Sun 08:00–09:30"],
    students: Array.from({ length: 30 }, (_, i) => ({
      id: `STU-PH${i + 1}`,
      name: [
        "My",
        "Ken",
        "Hana",
        "Tin",
        "Mai",
        "Hieu",
        "An",
        "Trang",
        "Linh",
        "Bao",
        "Nhi",
        "Vy",
        "Thao",
        "Tuan",
        "Phuc",
        "Khang",
        "Long",
        "Nga",
        "Tam",
        "Duy",
        "Phat",
        "Lan",
        "Hung",
        "Quang",
        "Hoa",
        "Thanh",
        "Nam",
        "Vy Anh",
        "My Anh",
        "Tien",
      ][i],
      age: 6 + (i % 3),
      gender: i % 2 === 0 ? "Female" : "Male",
      status: i % 7 === 0 ? "Inactive" : "Active",
    })),
    resources: [
      {
        id: "RES-040",
        title: "Phonics Flashcards A–Z",
        type: "PDF",
        link: "https://drive.google.com/...",
        description: "A–Z printable phonics cards with pictures.",
      },
      {
        id: "RES-041",
        title: "Alphabet Song",
        type: "YouTube",
        link: "https://youtube.com/...",
        description: "Sing-along video to teach letter sounds.",
      },
      {
        id: "RES-042",
        title: "Phonics Games Collection",
        type: "Google Drive",
        link: "https://drive.google.com/...",
        description: "Fun mini-games and phonics worksheets for classroom use.",
      },
    ],
  },
];

// 🔹 Headers
export const CLASS_HEADERS = [
  "ID",
  "Class Name",
  "Category",
  "Teachers",
  "TA",
  "Schedule",
  "Students",
  "Actions",
];
export const STUDENT_HEADERS = ["ID", "Name", "Age", "Gender", "Status", "Actions"];