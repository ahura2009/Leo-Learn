import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const data = new Uint8Array(fs.readFileSync(process.argv[2]));
const doc = await pdfjs.getDocument({ data, verbosity: 0, useSystemFonts: false }).promise;
console.log('metadata:', JSON.stringify(await doc.getMetadata().then(m => m.info)));
const seen = new Map();
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const ops = await page.getOperatorList();
  const names = page._pageInfo; // may be undefined
  for (const [k, v] of Object.entries(page.commonObjs?._objs || {})) {}
  const fonts = await (async () => { try { return await page.getOperatorList().then(() => null); } catch { return null; } })();
  page.cleanup();
}
