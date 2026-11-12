import type { ReactNode } from "react";
import type { AdminIconName } from "@/lib/admin/navigation";
import { AdminIcon } from "./AdminIcon";

export function StatCard({ label, value, icon, detail }: { label: string; value: number; icon: AdminIconName; detail: string }) {
  return <article className="admin-stat-card"><div className="admin-stat-top"><span>{label}</span><span className="admin-stat-icon"><AdminIcon name={icon} /></span></div><p className="admin-stat-value">{String(value).padStart(2, "0")}</p><p className="admin-stat-detail">{detail}</p></article>;
}

export function StatusBadge({ children }: { children: ReactNode }) {
  const status = String(children);
  const tone = status === "Published" || status === "Completed" ? "positive" : status === "In progress" ? "active" : "neutral";
  return <span className={`admin-status admin-status-${tone}`}><span aria-hidden="true">{tone === "positive" ? "✓" : tone === "active" ? "◐" : "−"}</span>{children}</span>;
}

export function SectionCard({ title, eyebrow, action, children, className = "" }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`admin-panel ${className}`}><div className="admin-panel-heading"><div>{eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}<h2 className="admin-section-title">{title}</h2></div>{action}</div>{children}</section>;
}
