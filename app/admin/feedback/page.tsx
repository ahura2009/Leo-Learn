import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function FeedbackPage() {
  return (
    <AdminPlaceholder
      eyebrow="Learner feedback"
      title="Feedback"
      description="A planned review space for learner feedback and reported content issues."
      features={[
        "Review submitted feedback and lesson issue reports.",
        "Organize feedback by topic, course, and review status.",
        "Track follow-up decisions and resolution notes.",
      ]}
    />
  );
}
