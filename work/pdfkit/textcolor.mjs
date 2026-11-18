import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const data = new Uint8Array(fs.readFileSync(process.argv[2]));
const doc = await pdfjs.getDocument({ data, verbosity: 0, useSystemFonts: false }).promise;
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const ol = await page.getOperatorList();
  let fill = null;
  const hits = [];
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i], args = ol.argsArray[i];
    if (fn === pdfjs.OPS.setFillRGBColor) fill = args.map(v => Math.round(v * 255)).join(',');
    else if (fn === pdfjs.OPS.showText && fill === '255,255,0') {
      const s = args[0].map(g => (typeof g === 'object' && g.unicode) ? g.unicode : '').join('');
      if (s.trim()) hits.push(s);
    }
  }
  if (hits.length) console.log(`p${p}: YELLOW TEXT (${hits.length} runs): ` + hits.join(' ').normalize('NFKC').slice(0, 300));
  page.cleanup();
}
