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
  teacher1: string;
  teacher2?: string;
  ta1?: string;
  ta2?: string;
  schedule: Array<string> | string;
  students: Student[];
}


export const initialData: Class[] = [
  {
    id: "C01",
    name: "IELTS Foundation A",
    category: "IELTS Foundation",
    teacher1: "Mr. John",
    teacher2: "Ms. Anna",
    ta1: "TA Linh",
    schedule: ["T3 19:00 - 20:30", "T5 19:00 - 20:30"],
    students: [
      { id: "S001", name: "Alice Nguyen", age: 16, gender: "Female", status: "Active" },
      { id: "S002", name: "Bob Tran", age: 17, gender: "Male", status: "Active" },
      { id: "S003", name: "Cathy Pham", age: 16, gender: "Female", status: "Inactive" },
      { id: "S004", name: "David Le", age: 17, gender: "Male", status: "Active" },
      { id: "S005", name: "Emma Vo", age: 16, gender: "Female", status: "Active" },
    ],
  },
  {
    id: "C02",
    name: "IELTS Intermediate B",
    category: "IELTS Intermediate",
    teacher1: "Ms. Vy",
    teacher2: "Mr. Quang",
    ta1: "TA Phong",
    ta2: "TA Hien",
    schedule: ["T3 19:00 - 20:30", "T5 19:00 - 20:30"],
    students: [
      { id: "S006", name: "Chris Nguyen", age: 18, gender: "Male", status: "Active" },
      { id: "S007", name: "Daisy Do", age: 17, gender: "Female", status: "Active" },
      { id: "S008", name: "Eric Phan", age: 16, gender: "Male", status: "Inactive" },
      { id: "S009", name: "Fiona Bui", age: 18, gender: "Female", status: "Active" },
      { id: "S010", name: "George Tran", age: 17, gender: "Male", status: "Active" },
      { id: "S011", name: "Hannah Le", age: 17, gender: "Female", status: "Active" },
    ],
  },
];