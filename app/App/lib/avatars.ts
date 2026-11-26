/* آواتارهای آمادهٔ پروفایل — هیچ آپلودی لازم نیست.
   شناسهٔ انتخاب‌شده در حساب کاربر ذخیره می‌شود. */

export const AVATARS = [
  { id: "leo", label: "لئو", from: "#f4bd0d", to: "#d99f04" },
  { id: "sun", label: "آفتاب", from: "#f7c948", to: "#e08600" },
  { id: "sky", label: "آسمان", from: "#5b93ff", to: "#1e40af" },
  { id: "mint", label: "نعنایی", from: "#45d39a", to: "#0f7a5a" },
  { id: "rose", label: "گل‌بهی", from: "#fb7185", to: "#be185d" },
  { id: "violet", label: "بنفش", from: "#a78bfa", to: "#6d28d9" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function avatarById(id: string | null | undefined) {
  return AVATARS.find((item) => item.id === id) ?? AVATARS[0];
}
