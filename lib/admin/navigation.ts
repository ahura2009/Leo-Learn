export type AdminIconName = "overview" | "students" | "courses" | "lessons" | "enrollments" | "analytics" | "feedback" | "settings";

export const adminNavigation = [
  { href: "/admin", label: "نمای کلی", icon: "overview", group: "فضای کاری" },
  { href: "/admin/students", label: "یادگیرندگان", icon: "students", group: "مدیریت یادگیری" },
  { href: "/admin/courses", label: "دوره‌ها", icon: "courses", group: "مدیریت یادگیری" },
  { href: "/admin/lessons", label: "درس‌ها", icon: "lessons", group: "مدیریت یادگیری" },
  { href: "/admin/enrollments", label: "ثبت‌نام‌ها", icon: "enrollments", group: "مدیریت یادگیری" },
  { href: "/admin/analytics", label: "تحلیل‌ها", icon: "analytics", group: "بینش‌ها" },
  { href: "/admin/feedback", label: "بازخورد", icon: "feedback", group: "بینش‌ها" },
  { href: "/admin/settings", label: "تنظیمات", icon: "settings", group: "تنظیمات فضا" },
] as const;

export function isAdminRouteActive(pathname: string, href: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return href === "/admin" ? normalized === href : normalized === href || normalized.startsWith(`${href}/`);
}
