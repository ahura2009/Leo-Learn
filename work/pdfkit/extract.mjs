// Extract per-page text items with font name, size, and coordinates using pdfjs.
import path from 'path';
import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

(async () => {
  const file = process.argv[2];
  const outDir = process.argv[3];
  const data = new Uint8Array(fs.readFileSync(file));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: false, verbosity: 0 }).promise;
  fs.mkdirSync(outDir, { recursive: true });

  const summary = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    const items = tc.items
      .filter(it => it.str && it.str.trim())
      .map(it => ({
        x: Math.round(it.transform[4]),
        y: Math.round(vp.height - it.transform[5]),
        w: Math.round(it.width),
        h: Math.round(Math.abs(it.transform[3])),
        f: it.fontName,
        s: it.str,
      }));
    fs.writeFileSync(path.join(outDir, `p${String(p).padStart(3, '0')}.json`), JSON.stringify(items));
    // font usage map
    const fonts = {};
    for (const it of items) fonts[it.f] = (fonts[it.f] || 0) + 1;
    summary.push({ page: p, size: [vp.width, vp.height], fonts, count: items.length });
    page.cleanup();
  }
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log('pages', doc.numPages);
})();
