import type { Metadata } from "next";
import { AppProvider } from "./components/AppProvider";
import { AppShell } from "./components/AppShell";
import "./app.css";

export const metadata: Metadata = {
  title: "Leo Learn — تمرین",
  description: "اپ تمرین انگلیسی لئو لرن",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
