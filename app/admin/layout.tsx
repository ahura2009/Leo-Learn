import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { assetPath } from "@/lib/asset-path";
import "./admin.css";
import "./browse.css";

export const metadata: Metadata = {
  title: { default: "پیش‌نمایش مدیریت | Leo Learn", template: "%s | مدیریت Leo Learn" },
  description: "پیش‌نمایش پنل مدیریت Leo Learn؛ داده‌ها ساختگی‌اند و اتصال احراز هویت یا backend وجود ندارد.",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: assetPath("/images/leo-app-icon.png"), type: "image/png" },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
