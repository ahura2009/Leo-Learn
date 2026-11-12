import { AdminBrowser } from "@/components/admin/AdminBrowser";
import { browseDatasets } from "@/lib/admin/browse-data";

export default function EnrollmentsPage() {
  return <AdminBrowser key="enrollments" dataset={browseDatasets.enrollments} />;
}
