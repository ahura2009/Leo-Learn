import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/* فونت‌ها با next/font/local بارگذاری می‌شوند تا Next خودش
   مسیرها را با basePath بسازد. اگر آدرس فونت را در CSS خام
   بگذاریم، روی GitHub Pages (زیر /Leo-Learn/) ۴۰۴ می‌شود. */

const dana = localFont({
  src: [
    { path: "./fonts/Dana-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Dana-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Dana-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Dana-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/Dana-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-dana",
  display: "swap",
});

const iranYekan = localFont({
  src: [
    { path: "./fonts/IRANYekanLight.ttf", weight: "300", style: "normal" },
    { path: "./fonts/IRANYekanRegular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/IRANYekanMedium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/IRANYekanBold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-iran-yekan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leo Learn",
  description: "همراه هوشمند یادگیری زبان انگلیسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${dana.variable} ${iranYekan.variable}`}>
        {children}
      </body>
    </html>
  );
}
