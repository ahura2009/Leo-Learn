import { AdminBrowser } from "@/components/admin/AdminBrowser";
import { browseDatasets } from "@/lib/admin/browse-data";

export default function LessonsPage() {
  return <AdminBrowser key="lessons" dataset={browseDatasets.lessons} />;
}
