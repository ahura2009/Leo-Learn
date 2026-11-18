const fs = require('fs');
const b = fs.readFileSync(process.argv[2]);
const n = b.readUInt16BE(4);
let cmapOff = 0;
for (let i = 0; i < n; i++) { const o = 12 + i * 16; if (b.toString('ascii', o, o + 4) === 'cmap') cmapOff = b.readUInt32BE(o + 8); }
const ns = b.readUInt16BE(cmapOff + 2);
let sub = 0;
for (let i = 0; i < ns; i++) { const r = cmapOff + 4 + i * 8; if (b.readUInt16BE(r) === 3 && b.readUInt16BE(r + 2) === 1) sub = cmapOff + b.readUInt32BE(r + 4); }
const segX2 = b.readUInt16BE(sub + 6);
const ends = sub + 14, starts = ends + segX2 + 2, deltas = starts + segX2, roBase = deltas + segX2;
const cps = new Set();
for (let s = 0; s < segX2 / 2; s++) {
  const end = b.readUInt16BE(ends + s * 2), start = b.readUInt16BE(starts + s * 2);
  const delta = b.readUInt16BE(deltas + s * 2), ro = b.readUInt16BE(roBase + s * 2);
  for (let c = start; c <= end && c !== 0xffff; c++) {
    if (ro === 0) { if (((c + delta) & 0xffff)) cps.add(c); }
    else { const gi = b.readUInt16BE(roBase + s * 2 + ro + (c - start) * 2); if (gi) cps.add(c); }
  }
}
const arr = [...cps].sort((a, b) => a - b);
const blocks = [];
let s0 = arr[0], p = arr[0];
for (const c of arr.slice(1)) { if (c === p + 1) { p = c; continue; } blocks.push([s0, p]); s0 = p = c; }
blocks.push([s0, p]);
const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0');
console.log('Unicode blocks covered:');
console.log(blocks.map(([a, z]) => `  U+${hex(a)}-U+${hex(z)}  (${z - a + 1})`).join('\n'));
console.log('\nkey chars:');
const test = ['-', '‐', '–', '—', '،', '؛', '؟', '«', '»', '(', ')', '[', ']', '/', '%', '٪', '٫', '٬', 'ـ', '‌', '‎', '‏', 'ؐ', 'ّ', 'ْ', 'ً', '←', '◌', ' ', '•', '·', ''];
console.log(test.map(ch => `${hex(ch.codePointAt(0))} ${JSON.stringify(ch)}=${cps.has(ch.codePointAt(0)) ? 'Y' : 'n'}`).join('  '));
console.log('\ntotal codepoints:', cps.size);
