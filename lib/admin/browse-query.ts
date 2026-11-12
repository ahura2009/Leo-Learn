export type BrowseValue = string | number;
export type BrowseRecord = {
  id: string;
  values: Record<string, BrowseValue>;
  details: { label: string; value: string }[];
  sections?: { title: string; items: string[] }[];
};
export type BrowseColumn = { key: string; label: string; badge?: boolean };
export type BrowseFilter = { key: string; label: string; options: string[] };
export type BrowseDataset = {
  id: string;
  title: string;
  singular: string;
  eyebrow: string;
  description: string;
  primaryKey: string;
  columns: BrowseColumn[];
  filters: BrowseFilter[];
  records: BrowseRecord[];
};
export type BrowseQuery = {
  search: string;
  filters: Record<string, string>;
  sortKey: string;
  direction: "asc" | "desc";
  page: number;
  pageSize: number;
};

function normalize(value: BrowseValue) {
  return String(value).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Pure local browsing only: never mutates the supplied fixtures.
export function queryRecords(records: BrowseRecord[], query: BrowseQuery) {
  const words = normalize(query.search).trim().split(/\s+/).filter(Boolean);
  const filtered = records.filter((record) => {
    if (!Object.entries(query.filters).every(([key, value]) => !value || String(record.values[key] ?? "") === value)) return false;
    const text = normalize([
      record.id,
      ...Object.values(record.values),
      ...record.details.map((detail) => detail.value),
      ...(record.sections ?? []).flatMap((section) => section.items),
    ].join(" "));
    return words.every((word) => text.includes(word));
  });
  const sorted = [...filtered].sort((a, b) => {
    const left = a.values[query.sortKey] ?? "";
    const right = b.values[query.sortKey] ?? "";
    const comparison = typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right), "en", { numeric: true, sensitivity: "base" });
    return (comparison || a.id.localeCompare(b.id, "en", { numeric: true })) * (query.direction === "desc" ? -1 : 1);
  });
  const pageSize = Number.isFinite(query.pageSize) ? Math.max(1, Math.floor(query.pageSize)) : 5;
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const requestedPage = Number.isFinite(query.page) ? Math.floor(query.page) : 1;
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const offset = (page - 1) * pageSize;
  return {
    records: sorted.slice(offset, offset + pageSize),
    total: sorted.length,
    totalPages,
    page,
    start: sorted.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, sorted.length),
  };
}
