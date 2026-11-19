// Inventory: text colors, line spacing, content margins, arrow usage, table counts.
import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const data = new Uint8Array(fs.readFileSync(process.argv[2]));
const doc = await pdfjs.getDocument({ data, verbosity: 0, useSystemFonts: false }).promise;

const colors = new Map();
const perPage = [];
let arrowCount = 0;
const arrowChars = new Set(['←', '↑', '→', '↓', '➔', '➡', '➤', '▶', '◀']);

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const ol = await page.getOperatorList();
  let fill = [0, 0, 0];
  const texts = [];
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i], args = ol.argsArray[i];
    if (fn === pdfjs.OPS.setFillRGBColor) {
      const key = 'rgb(' + args.map((v) => Math.round(v * 255)).join(',') + ')';
      colors.set(key, (colors.get(key) || 0) + 1);
    } else if (fn === pdfjs.OPS.showText) {
      // args: [glyphs]
    }
  }
  const tc = await page.getTextContent();
  const items = tc.items.filter((it) => it.str && it.str.trim());
  const ys = items.filter((it) => Math.abs(it.transform[1]) < 0.01).map((it) => vp.height - it.transform[5]);
  const xs = items.map((it) => it.transform[4]);
  const rightEdges = items.map((it) => it.transform[4] + (it.width || 0));
  for (const it of items) for (const ch of it.str) if (arrowChars.has(ch)) arrowCount++;
  // line spacing estimate
  const uniqY = [...new Set(ys.map((y) => Math.round(y)))].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < uniqY.length; i++) { const d = uniqY[i] - uniqY[i - 1]; if (d > 6 && d < 40) gaps.push(d); }
  gaps.sort((a, b) => a - b);
  const median = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;
  perPage.push({
    page: p,
    chars: items.reduce((s, it) => s + it.str.length, 0),
    minX: Math.round(Math.min(...xs)),
    maxX: Math.round(Math.max(...rightEdges)),
    minY: Math.round(Math.min(...ys)),
    maxY: Math.round(Math.max(...ys)),
    lineGap: median,
  });
  page.cleanup();
}

console.log('=== text fill colors (setFillRGBColor calls) ===');
console.log([...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => `${v}\t${k}`).join('\n'));
console.log('\n=== arrow glyphs total ===', arrowCount);
const marg = perPage.map((p) => [p.minX, p.maxX, p.minY, p.maxY]);
console.log('\n=== content bbox (min of minX, max of maxX, min of minY, max of maxY) ===');
console.log(Math.min(...marg.map((m) => m[0])), Math.max(...marg.map((m) => m[1])), Math.min(...marg.map((m) => m[2])), Math.max(...marg.map((m) => m[3])));
const total = perPage.reduce((s, p) => s + p.chars, 0);
console.log('\nchars total:', total, 'avg per page:', Math.round(total / perPage.length));
console.log('pages by char count (lowest 8):', perPage.slice().sort((a, b) => a.chars - b.chars).slice(0, 8).map((p) => `${p.page}:${p.chars}`).join(' '));
console.log('pages by char count (highest 5):', perPage.slice().sort((a, b) => b.chars - a.chars).slice(0, 5).map((p) => `${p.page}:${p.chars}`).join(' '));
const lgs = perPage.map((p) => p.lineGap).filter(Boolean);
const counts = {};
for (const g of lgs) counts[g] = (counts[g] || 0) + 1;
console.log('\nline gap distribution:', Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8));
fs.writeFileSync(process.argv[3], JSON.stringify(perPage));
