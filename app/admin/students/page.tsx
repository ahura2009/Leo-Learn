import { AdminBrowser } from "@/components/admin/AdminBrowser";
import { browseDatasets } from "@/lib/admin/browse-data";

export default function StudentsPage() {
  return <AdminBrowser key="students" dataset={browseDatasets.students} />;
}
