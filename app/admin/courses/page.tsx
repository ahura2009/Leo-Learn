import { AdminBrowser } from "@/components/admin/AdminBrowser";
import { browseDatasets } from "@/lib/admin/browse-data";

export default function CoursesPage() {
  return <AdminBrowser key="courses" dataset={browseDatasets.courses} />;
}
