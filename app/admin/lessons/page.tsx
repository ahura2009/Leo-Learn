import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function LessonsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Learning content"
      title="Lessons"
      description="A planned lesson editor for preparing learning content and reviewing exercises."
      features={[
        "Draft lesson instructions, exercises, and learning objectives.",
        "Organize lesson content within course units.",
        "Preview and review content before publishing approved lessons.",
      ]}
    />
  );
}
