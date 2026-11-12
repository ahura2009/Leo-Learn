import Link from "next/link";

type AdminPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
};

export default function AdminPlaceholder({
  eyebrow,
  title,
  description,
  features,
}: AdminPlaceholderProps) {
  return (
    <>
      <header className="admin-page-heading">
        <span className="admin-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <section className="admin-panel" aria-label={`${title} connection status`}>
        <div className="admin-empty-state">
          <span className="admin-empty-icon" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h4" />
            </svg>
          </span>
          <span className="admin-badge">Planned</span>
          <h2 className="admin-section-title">Not connected</h2>
          <p className="admin-muted">
            This section is a planned placeholder. No real records are loaded,
            and no changes can be saved here.
          </p>
          <Link href="/admin" className="admin-button admin-button-secondary">
            Back to overview
          </Link>
        </div>

        <div className="admin-planned-features">
          <h3 className="admin-section-title">Planned functionality</h3>
          <ul className="admin-feature-list">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <p className="admin-muted">
            These capabilities are not available yet. They require an authenticated
            admin connection and a real data source.
          </p>
        </div>
      </section>
    </>
  );
}
