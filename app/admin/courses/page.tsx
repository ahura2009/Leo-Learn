import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function CoursesPage() {
  return (
    <AdminPlaceholder
      eyebrow="Curriculum management"
      title="Courses"
      description="A planned workspace for organizing courses and shaping the learning curriculum."
      features={[
        "Organize courses by learning level and curriculum goals.",
        "Arrange course units and their lesson sequence.",
        "Review draft and published curriculum before making changes.",
      ]}
    />
  );
}
