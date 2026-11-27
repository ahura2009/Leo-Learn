import type { ToolSlug } from "../lib/tools";

/* آیکون چهار ابزار — یک‌جا، تا فهرست و صفحهٔ هر ابزار همان شکل را ببینند. */
export function ToolIcon({
  name,
  size = 20,
}: {
  name: ToolSlug;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "text") {
    return (
      <svg {...common}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </svg>
    );
  }

  if (name === "dictionary") {
    return (
      <svg {...common}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
        <path d="M9 8h6" />
      </svg>
    );
  }

  if (name === "cards") {
    return (
      <svg {...common}>
        <rect x="3.5" y="6.5" width="17" height="13" rx="2.5" />
        <path d="M6.5 3.5h11" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
