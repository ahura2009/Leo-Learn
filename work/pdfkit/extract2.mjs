// Extract text runs with font, size, rotation, and position; classify into title / side-label / body.
import path from 'path';
import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const file = process.argv[2];
const outDir = process.argv[3];
const data = new Uint8Array(fs.readFileSync(file));
const doc = await pdfjs.getDocument({ data, verbosity: 0, useSystemFonts: false }).promise;
fs.mkdirSync(outDir, { recursive: true });

const allPages = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const runs = [];
  for (const it of tc.items) {
    if (!it.str || !it.str.trim()) continue;
    const [a, b, c, d, e, f] = it.transform;
    const size = Math.hypot(c, d) || Math.abs(d) || 1;
    const rot = Math.round((Math.atan2(b, a) * 180) / Math.PI);
    runs.push({
      t: it.str,
      x: +e.toFixed(1),
      y: +(vp.height - f).toFixed(1),
      w: +(it.width || 0).toFixed(1),
      fs: +size.toFixed(1),
      rot,
      f: it.fontName,
    });
  }
  allPages.push({ page: p, w: vp.width, h: vp.height, runs });
  fs.writeFileSync(path.join(outDir, `p${String(p).padStart(3, '0')}.json`), JSON.stringify(runs));
  page.cleanup();
}
fs.writeFileSync(path.join(outDir, 'all.json'), JSON.stringify(allPages));
console.log('pages', doc.numPages, 'runs', allPages.reduce((s, p) => s + p.runs.length, 0));
