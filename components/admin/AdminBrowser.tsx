"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { BrowseDataset, BrowseRecord } from "@/lib/admin/browse-query";
import { queryRecords } from "@/lib/admin/browse-query";
import { StatusBadge } from "./AdminUI";

function DetailDialog({ record, dataset, dialogRef, onClose }: {
  record: BrowseRecord | undefined;
  dataset: BrowseDataset;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  onClose: () => void;
}) {
  const headingId = useId();
  const noticeId = useId();
  const containFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')).filter((element) => element.getClientRects().length > 0);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return (
    <dialog ref={dialogRef} className="admin-detail-dialog" aria-labelledby={headingId} aria-describedby={noticeId}
      onClose={onClose} onKeyDown={containFocus}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialogRef.current?.close();
      }}>
      <div className="admin-detail-header">
        <div><span className="admin-eyebrow">SAMPLE {dataset.singular.toUpperCase()} · READ ONLY</span><h2 id={headingId}>{record ? record.values[dataset.primaryKey] : "Sample details"}</h2></div>
        <button type="button" className="admin-detail-close" aria-label="Close details" autoFocus onClick={() => dialogRef.current?.close()}>×</button>
      </div>
      <p id={noticeId} className="admin-detail-notice">Synthetic preview record. No real data is connected, and nothing can be edited or saved.</p>
      {record && <div className="admin-detail-content">
        <dl className="admin-detail-fields">{record.details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>)}</dl>
        {record.sections?.map((section) => <section className="admin-detail-section" key={section.title}><h3>{section.title}</h3>{section.items.length ? <ul>{section.items.map((item, index) => <li key={`${record.id}-${index}`}>{item}</li>)}</ul> : <p>No items in this sample record.</p>}</section>)}
      </div>}
      <div className="admin-detail-footer"><button type="button" className="admin-button admin-button-secondary" onClick={() => dialogRef.current?.close()}>Close details</button></div>
    </dialog>
  );
}

export function AdminBrowser({ dataset }: { dataset: BrowseDataset }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState(dataset.primaryKey);
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedId, setSelectedId] = useState<string>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  const result = queryRecords(dataset.records, { search, filters, sortKey, direction, page, pageSize });
  const selected = dataset.records.find((record) => record.id === selectedId);
  const activeFilters = Boolean(search || Object.values(filters).some(Boolean));
  const clearFilters = () => { setSearch(""); setFilters({}); setPage(1); };

  // Native modal makes the rest of the page inert; lock background scrolling too.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedId || !dialog?.open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selectedId]);

  const changeSort = (key: string) => {
    setDirection(sortKey === key && direction === "asc" ? "desc" : "asc");
    setSortKey(key);
    setPage(1);
  };

  return <>
    <div className="admin-page-heading admin-overview-heading"><div><span className="admin-eyebrow">{dataset.eyebrow}</span><h1>{dataset.title}</h1><p>{dataset.description}</p></div><span className="admin-badge">Read-only browsing</span></div>
    <section className="admin-panel admin-browse-panel" aria-label={`Sample ${dataset.title.toLowerCase()} directory`}>
      <div className="admin-browse-intro"><div><h2 className="admin-section-title">Sample {dataset.title.toLowerCase()}</h2><p>Explore {dataset.records.length} synthetic records. Search, filter, or open a record to inspect its details.</p></div><span className="admin-browse-label">NOT CONNECTED</span></div>
      <form className="admin-browse-toolbar" role="search" aria-label={`Search sample ${dataset.title.toLowerCase()}`} onSubmit={(event) => event.preventDefault()}>
        <div className="admin-browse-control admin-browse-search"><label htmlFor={`${id}-search`}>Search {dataset.title.toLowerCase()}</label><input id={`${id}-search`} type="search" value={search} placeholder="Search sample records…" onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></div>
        {dataset.filters.map((filter) => <div className="admin-browse-control" key={filter.key}><label htmlFor={`${id}-${filter.key}`}>{filter.label}</label><select id={`${id}-${filter.key}`} value={filters[filter.key] ?? ""} onChange={(event) => { setFilters({ ...filters, [filter.key]: event.target.value }); setPage(1); }}><option value="">All</option>{filter.options.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>)}
        <button type="button" className="admin-browse-clear" disabled={!activeFilters} onClick={clearFilters}>Clear filters</button>
      </form>
      <div className="admin-browse-summary"><p role="status" aria-live="polite" aria-atomic="true">{result.total ? `Showing ${result.start}–${result.end} of ${result.total} sample records` : "No matching sample records"}{activeFilters ? ` · ${dataset.records.length} total` : ""}</p><span>Column headings sort the results</span></div>
      {result.total > 0 ? <div className="admin-table-scroll admin-browse-scroll" role="region" aria-label={`${dataset.title} table, horizontally scrollable`} tabIndex={0}><table className="admin-table admin-browse-table">
        <caption className="admin-sr-only">Sample {dataset.title.toLowerCase()}. Synthetic records only. Sort with column buttons; use View details to inspect a record.</caption>
        <thead><tr>{dataset.columns.map((column) => <th key={column.key} scope="col" aria-sort={sortKey === column.key ? (direction === "asc" ? "ascending" : "descending") : "none"}><button type="button" onClick={() => changeSort(column.key)} aria-label={`Sort by ${column.label.toLowerCase()}`}><span>{column.label}</span><span aria-hidden="true">{sortKey !== column.key ? "↕" : direction === "asc" ? "↑" : "↓"}</span></button></th>)}<th scope="col"><span className="admin-sr-only">Details</span></th></tr></thead>
        <tbody>{result.records.map((record) => <tr key={record.id}>{dataset.columns.map((column) => <td key={column.key}>{column.key === dataset.primaryKey ? <div className="admin-browse-primary"><strong>{record.values[column.key]}</strong><small>{record.id}</small></div> : column.badge ? <StatusBadge>{record.values[column.key]}</StatusBadge> : record.values[column.key]}</td>)}<td><button type="button" className="admin-row-details" aria-label={`View ${dataset.singular} details: ${record.values[dataset.primaryKey]}, ${record.id}`} onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedId(record.id); dialogRef.current?.showModal(); }}>View details <span aria-hidden="true">↗</span></button></td></tr>)}</tbody>
      </table></div> : <div className="admin-browse-empty"><span aria-hidden="true">⌕</span><h3>No sample records match.</h3><p>Try a different search or clear the filters to see the sample directory again.</p><button type="button" className="admin-button admin-button-secondary" onClick={clearFilters}>Show all sample records</button></div>}
      <div className="admin-browse-pagination"><div className="admin-browse-control admin-page-size"><label htmlFor={`${id}-size`}>Rows per page</label><select id={`${id}-size`} value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>{[5, 10, 20].map((size) => <option value={size} key={size}>{size}</option>)}</select></div><nav aria-label="Table pagination"><button type="button" disabled={result.page === 1 || !result.total} onClick={() => setPage(result.page - 1)}>Previous</button><span>Page {result.page} of {result.totalPages}</span><button type="button" disabled={result.page === result.totalPages || !result.total} onClick={() => setPage(result.page + 1)}>Next</button></nav></div>
      <p className="admin-panel-footnote">Read-only UI preview. Filters are local and reset on reload. Sample statuses do not represent real publication, progress, or review activity.</p>
    </section>
    <DetailDialog record={selected} dataset={dataset} dialogRef={dialogRef} onClose={() => { setSelectedId(undefined); triggerRef.current?.focus(); }} />
  </>;
}
