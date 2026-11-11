import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function StudentsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Learner management"
      title="Students"
      description="A planned directory for managing learners and reviewing their learning context."
      features={[
        "Search and filter the student directory.",
        "Review learner profiles and learning goals with authorized access.",
        "View each student's course assignments and learning history.",
      ]}
    />
  );
}
