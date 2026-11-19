// Scan all Flate-compressed streams in the PDF and look for font descriptors.
import fs from 'fs';
import zlib from 'zlib';

const buf = fs.readFileSync(process.argv[2]);
const found = new Map();
const re = /stream\r?\n/g;
let m;
while ((m = re.exec(buf.toString('latin1'))) !== null) {
  const start = m.index + m[0].length;
  const endIdx = buf.indexOf('endstream', start, 'latin1');
  if (endIdx < 0) continue;
  const chunk = buf.subarray(start, endIdx);
  let data;
  try { data = zlib.inflateSync(chunk); } catch { continue; }
  const s = data.toString('latin1');
  const bre = /\/(BaseFont|FontName)\s*\/([^\s\/\[\]<>()]+)/g;
  let b;
  while ((b = bre.exec(s)) !== null) found.set(b[2], (found.get(b[2]) || 0) + 1);
  const fre = /\/FontFile2|\/FontFile3|\/FontFile\b/g;
  while ((b = fre.exec(s)) !== null) found.set('EMBEDDED_GLYPH_FILE', (found.get('EMBEDDED_GLYPH_FILE') || 0) + 1);
}
for (const [k, v] of [...found.entries()].sort((a, b) => b[1] - a[1])) console.log(v, k);
