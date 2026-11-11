import type { AdminIconName } from "@/lib/admin/navigation";

const paths: Record<AdminIconName, string> = {
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  students: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87",
  courses: "M12 5v16 M3 3h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z",
  lessons: "M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6",
  enrollments: "M9 5H4v16h16V5h-5 M9 3h6v4H9z M8 14l3 3 5-6",
  analytics: "M4 3v17h17 M8 16v-4 M13 16V8 M18 16V5",
  feedback: "M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z M7 7h10 M7 12h7",
  settings: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
};

export function AdminIcon({ name, className = "" }: { name: AdminIconName; className?: string }) {
  return <svg className={className} aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
