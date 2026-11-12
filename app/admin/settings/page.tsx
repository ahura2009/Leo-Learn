import AdminPlaceholder from "@/components/admin/AdminPlaceholder";

export default function SettingsPage() {
  return (
    <AdminPlaceholder
      eyebrow="پیکربندی فضای کاری"
      title="تنظیمات"
      description="بخش برنامه‌ریزی‌شده تنظیمات دسترسی مدیریت و ترجیحات فضای یادگیری."
      features={[
        "بررسی ترجیحات فضا و پیکربندی یادگیری.",
        "مدیریت نقش‌های مدیران مجاز و سطح دسترسی آن‌ها.",
        "بررسی پیکربندی اتصال داده و یکپارچه‌سازی‌ها.",
      ]}
    />
  );
}
