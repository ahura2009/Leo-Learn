import fs from 'fs';
const pages = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const norm = (s) => s.normalize('NFKC');
const out = [];
for (const p of pages) {
  // horizontal lines grouped by y
  const lines = new Map();
  for (const r of p.runs.filter((r) => r.rot === 0)) {
    const k = Math.round(r.y / 3);
    if (!lines.has(k)) lines.set(k, []);
    lines.get(k).push(r);
  }
  const ordered = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([k, rs]) => {
    rs.sort((a, b) => b.x - a.x);
    return { y: rs[0].y, fs: rs[0].fs, x0: rs[0].x, t: norm(rs.map((r) => r.t).join('')) };
  });
  // top region (above main body region start ~ y 210) = header / title zone
  const top = ordered.filter((l) => l.y < 215 && l.y > 100);
  // rotated labels: group by x, merge same y
  const rotRuns = p.runs.filter((r) => r.rot !== 0);
  const cols = new Map();
  for (const r of rotRuns) {
    const k = Math.round(r.x / 2);
    if (!cols.has(k)) cols.set(k, []);
    cols.get(k).push(r);
  }
  const labels = [];
  for (const [, rs] of cols) {
    rs.sort((a, b) => a.y - b.y);
    let cur = null;
    for (const r of rs) {
      if (cur && Math.abs(cur.y - r.y) < 3) cur.parts.push(r.t);
      else { if (cur) labels.push(cur); cur = { x: r.x, y: r.y, fs: r.fs, parts: [r.t] }; }
    }
    if (cur) labels.push(cur);
  }
  const sideText = labels
    .map((l) => ({ x: l.x, y: l.y, fs: l.fs, t: norm(l.parts.join('')).trim() }))
    .filter((l) => l.t && !/تاريخ\s*آخرين|اصلاحات\s*پيشنهادي|^\d{1,2}$/.test(l.t));
  out.push({
    page: p.page,
    top: top.map((l) => `${Math.round(l.y)}|${l.fs}|${l.t.trim()}`),
    side: sideText.map((l) => `${Math.round(l.x)}x${Math.round(l.y)}|${l.fs}|${l.t}`),
  });
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
for (const o of out) {
  console.log(`\n### p${String(o.page).padStart(3, '0')}`);
  if (o.top.length) console.log('  TOP: ' + o.top.join('  //  ').slice(0, 300));
  if (o.side.length) console.log('  SIDE: ' + o.side.join('  ;  '));
}
