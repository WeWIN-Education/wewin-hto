export { default } from "next-auth/middleware";

// 🔒 Cấu hình đường dẫn cần bảo vệ
export const config = {
  matcher: [
    "/resources/:path*",  // bảo vệ trang tài nguyên
    "/tests/:path*",      // bảo vệ trang test
    "/class/:path*",      // bảo vệ quản lý lớp
    "/student/:path*",    // bảo vệ quản lý học sinh
    "/management/:path*", // bảo vệ toàn bộ phần quản lý
    "/test/:path*", // bảo vệ toàn bộ phần quản lý
  ],
};
