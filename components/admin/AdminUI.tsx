import type { ReactNode } from "react";
import type { AdminIconName } from "@/lib/admin/navigation";
import { faNumber, faStatus } from "@/lib/admin/i18n";
import { AdminIcon } from "./AdminIcon";

export function StatCard({ label, value, icon, detail }: { label: string; value: number; icon: AdminIconName; detail: string }) { return <article className="admin-stat-card"><div className="admin-stat-top"><span>{label}</span><span className="admin-stat-icon"><AdminIcon name={icon} /></span></div><p className="admin-stat-value">{faNumber(String(value).padStart(2, "0"))}</p><p className="admin-stat-detail">{detail}</p></article>; }
export function StatusBadge({ children }: { children: ReactNode }) { const raw = String(children); const tone = ["Published", "Completed", "منتشرشده", "تکمیل‌شده", "Strong", "On track"].includes(raw) ? "positive" : ["In progress", "در حال یادگیری"].includes(raw) ? "active" : "neutral"; return <span className={`admin-status admin-status-${tone}`}><span aria-hidden="true">{tone === "positive" ? "✓" : tone === "active" ? "◐" : "−"}</span>{faStatus(raw)}</span>; }
export function SectionCard({ title, eyebrow, action, children, className = "" }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) { return <section className={`admin-panel ${className}`}><div className="admin-panel-heading"><div>{eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}<h2 className="admin-section-title">{title}</h2></div>{action}</div>{children}</section>; }
