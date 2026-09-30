import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { ProgressProvider } from "@/lib/progress-store";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Leo Learn",
  description: "AI-powered English learning companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
