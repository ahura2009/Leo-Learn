const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const filename = path.join(__dirname, name + ".ts");
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, require: (request) => {
    assert.ok(request.startsWith("./"), "Only local modules in browsing tests");
    return load(request.slice(2));
  } };
  vm.runInNewContext(code, context, { filename });
  cache.set(name, context.exports);
  return context.exports;
}
const { queryRecords } = load("browse-query");
const { browseDatasets } = load("browse-data");
const base = { search: "", filters: {}, sortKey: "name", direction: "asc", page: 1, pageSize: 5 };
const records = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-${i + 1}`,
  values: { name: `Demo ${i + 1}`, count: i + 1, status: i % 2 ? "Draft" : "Published" },
  details: [{ label: "Objective", value: i === 0 ? "Café conversation" : "Daily practice" }],
  sections: [{ title: "Goals", items: [i === 0 ? "Polite requests" : "Listening"] }],
}));
const ids = (result) => Array.from(result.records, record => record.id);

test("browsing defaults to five records and sorts numbers naturally", () => {
  const result = queryRecords(records, base);
  assert.deepEqual(ids(result), ["demo-1", "demo-2", "demo-3", "demo-4", "demo-5"]);
  assert.equal(result.total, 12);
  assert.equal(result.totalPages, 3);
  assert.equal(result.start, 1);
  assert.equal(result.end, 5);
});
test("search trims whitespace, ignores case/accents, and searches details and sections", () => {
  assert.deepEqual(ids(queryRecords(records, { ...base, search: "  CAFE   polite " })), ["demo-1"]);
  assert.equal(queryRecords(records, { ...base, search: "DAILY" }).total, 11);
});
test("all search words and all selected filters must match", () => {
  assert.equal(queryRecords(records, { ...base, search: "Demo", filters: { status: "Draft" } }).total, 6);
  assert.equal(queryRecords(records, { ...base, filters: { status: "Draft", count: "2" } }).total, 1);
  assert.equal(queryRecords(records, { ...base, search: "CAFE", filters: { status: "Draft" } }).total, 0);
  assert.equal(queryRecords(records, { ...base, filters: { status: "" } }).total, 12);
});
test("numeric sorting descends correctly without sorting source fixtures in place", () => {
  const before = JSON.stringify(records);
  const result = queryRecords(records, { ...base, sortKey: "count", direction: "desc" });
  assert.deepEqual(ids(result), ["demo-12", "demo-11", "demo-10", "demo-9", "demo-8"]);
  assert.equal(JSON.stringify(records), before);
});
test("pagination clamps out-of-range pages and reports accurate final ranges", () => {
  const result = queryRecords(records, { ...base, page: 500 });
  assert.equal(result.page, 3);
  assert.equal(result.start, 11);
  assert.equal(result.end, 12);
  assert.deepEqual(ids(result), ["demo-11", "demo-12"]);
  assert.equal(queryRecords(records, { ...base, page: -1 }).page, 1);
});
test("empty results remain a valid first page with zero range", () => {
  const result = queryRecords(records, { ...base, search: "no-such-record", page: 2 });
  assert.equal(result.total, 0);
  assert.equal(result.totalPages, 1);
  assert.equal(result.page, 1);
  assert.equal(result.start, 0);
  assert.equal(result.end, 0);
  assert.equal(result.records.length, 0);
});
test("page-size changes and non-finite pagination values are handled", () => {
  assert.equal(queryRecords(records, { ...base, pageSize: 10 }).records.length, 10);
  assert.equal(queryRecords(records, { ...base, pageSize: 0 }).records.length, 1);
  assert.equal(queryRecords(records, { ...base, pageSize: NaN, page: Infinity }).page, 1);
});
test("five datasets have consistent columns, unique IDs and exact filter options", () => {
  assert.equal(Object.keys(browseDatasets).length, 5);
  for (const dataset of Object.values(browseDatasets)) {
    assert.ok(dataset.records.length >= 4);
    assert.equal(new Set(dataset.records.map(record => record.id)).size, dataset.records.length);
    assert.ok(dataset.columns.some(column => column.key === dataset.primaryKey));
    for (const record of dataset.records) {
      for (const column of dataset.columns) assert.notEqual(record.values[column.key], undefined);
      for (const detail of record.details) assert.ok(detail.value && !detail.value.includes("Unknown sample"));
    }
    for (const filter of dataset.filters) {
      const values = new Set(dataset.records.map(record => String(record.values[filter.key])));
      assert.equal(values.size, filter.options.length);
      for (const option of filter.options) {
        assert.ok(values.has(option));
        assert.ok(queryRecords(dataset.records, { ...base, sortKey: dataset.primaryKey, filters: { [filter.key]: option } }).total > 0);
      }
    }
  }
});
