import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { assetPath } from "@/lib/asset-path";
import "./admin.css";
import "./browse.css";

export const metadata: Metadata = {
  title: { default: "Admin preview | Leo Learn", template: "%s | Leo Learn Admin" },
  description: "Leo Learn admin UI preview. Synthetic data only; no authentication or backend connection.",
  robots: { index: false, follow: false },
  icons: {
    icon: { url: assetPath("/images/leo-app-icon.png"), type: "image/png" },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
