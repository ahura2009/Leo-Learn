import { AdminBrowser } from "@/components/admin/AdminBrowser";
import { browseDatasets } from "@/lib/admin/browse-data";

export default function FeedbackPage() {
  return <AdminBrowser key="feedback" dataset={browseDatasets.feedback} />;
}
