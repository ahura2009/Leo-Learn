// Extract drawn rectangles (borders + filled bars) to recover the box/table structure.
import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const data = new Uint8Array(fs.readFileSync(process.argv[2]));
const doc = await pdfjs.getDocument({ data, verbosity: 0, useSystemFonts: false }).promise;
const all = [];
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const vp = page.getViewport({ scale: 1 });
  const ol = await page.getOperatorList();
  const rects = [];
  let fillColor = [0, 0, 0];
  let stroke = null;
  const stack = [];
  for (let i = 0; i < ol.fnArray.length; i++) {
    const fn = ol.fnArray[i];
    const args = ol.argsArray[i];
    if (fn === pdfjs.OPS.setFillRGBColor) fillColor = args;
    else if (fn === pdfjs.OPS.setFillGray) fillColor = ['g', args[0]];
    else if (fn === pdfjs.OPS.constructPath) {
      const [ops, coords] = args;
      // ops is a flat array of opcodes with coords following
      let ci = 0;
      let cur = null;
      for (let k = 0; k < ops.length; k++) {
        const op = ops[k];
        if (op === pdfjs.OPS.rectangle) {
          const x = coords[ci], y = coords[ci + 1], w = coords[ci + 2], h = coords[ci + 3];
          ci += 4;
          rects.push({ x: Math.round(x), y: Math.round(vp.height - (y + h)), w: Math.round(w), h: Math.round(h), fill: Array.isArray(fillColor) ? fillColor.join(',') : String(fillColor) });
        } else if (op === pdfjs.OPS.moveTo) { ci += 2; }
        else if (op === pdfjs.OPS.lineTo) { ci += 2; }
        else if (op === pdfjs.OPS.curveTo) { ci += 6; }
        else if (op === pdfjs.OPS.curveTo2 || op === pdfjs.OPS.curveTo3) { ci += 4; }
        else if (op === pdfjs.OPS.closePath) { /* none */ }
      }
    }
  }
  all.push({ page: p, rects });
  page.cleanup();
}
fs.writeFileSync(process.argv[3], JSON.stringify(all));
console.log('pages', doc.numPages, 'rects', all.reduce((s, p) => s + p.rects.length, 0));
