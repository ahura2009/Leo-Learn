import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function SettingsPage() {
  return (
    <AdminPlaceholder
      eyebrow="Workspace configuration"
      title="Settings"
      description="A planned configuration area for administrative access and learning workspace preferences."
      features={[
        "Review workspace preferences and learning configuration.",
        "Manage authorized administrator roles and access permissions.",
        "Review data connection and integration configuration.",
      ]}
    />
  );
}
