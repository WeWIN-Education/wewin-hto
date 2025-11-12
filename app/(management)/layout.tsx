import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { allowedEmails } from "@/app/constants/email";
import { authOptions } from "../api/auth/authOptions";

export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔐 Kiểm tra session
  const session = await getServerSession(authOptions);

  // ❌ Nếu chưa login → quay lại login
  if (!session) redirect("/login");

  // ❌ Nếu không phải admin → cũng quay lại login
  const isAdmin = allowedEmails.includes(session.user?.email || "");
  if (!isAdmin) redirect("/login");

  // ✅ Nếu là admin → hiển thị nội dung
  return <>{children}</>;
}
