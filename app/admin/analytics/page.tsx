import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function AnalyticsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Learning reports"
      title="Analytics"
      description="A planned reporting area for understanding learning activity once verified data is connected."
      features={[
        "Review reports on course participation and lesson completion.",
        "Filter learning reports by course and reporting period.",
        "Identify content that may need review using verified learning outcomes.",
      ]}
    />
  );
}
