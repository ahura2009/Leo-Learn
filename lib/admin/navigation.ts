export type AdminIconName = "overview" | "students" | "courses" | "lessons" | "enrollments" | "analytics" | "feedback" | "settings";

export const adminNavigation = [
  { href: "/admin", label: "Overview", icon: "overview", group: "Workspace" },
  { href: "/admin/students", label: "Students", icon: "students", group: "Manage learning" },
  { href: "/admin/courses", label: "Courses", icon: "courses", group: "Manage learning" },
  { href: "/admin/lessons", label: "Lessons", icon: "lessons", group: "Manage learning" },
  { href: "/admin/enrollments", label: "Enrollments", icon: "enrollments", group: "Manage learning" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics", group: "Insights" },
  { href: "/admin/feedback", label: "Feedback", icon: "feedback", group: "Insights" },
  { href: "/admin/settings", label: "Settings", icon: "settings", group: "Workspace settings" },
] as const;

export function isAdminRouteActive(pathname: string, href: string) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return href === "/admin" ? normalized === href : normalized === href || normalized.startsWith(`${href}/`);
}
