import type { Metadata } from "next";
import { AuthProvider } from "./components/AuthProvider";
import { AppProvider } from "./components/AppProvider";
import { AppShell } from "./components/AppShell";
import "./app.css";

export const metadata: Metadata = {
  title: "Leo Learn — تمرین",
  description: "اپ تمرین انگلیسی لئو لرن",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <AppShell>{children}</AppShell>
      </AppProvider>
    </AuthProvider>
  );
}
