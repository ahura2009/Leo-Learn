import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function EnrollmentsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Course assignments"
      title="Enrollments"
      description="A planned workspace for connecting learners with courses and managing assignments."
      features={[
        "Review student course enrollments and assignment status.",
        "Assign appropriate courses to individual learners.",
        "Manage enrollment changes with a clear assignment history.",
      ]}
    />
  );
}
