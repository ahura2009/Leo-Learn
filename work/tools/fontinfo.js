// Reads TTF metadata (name, OS/2, cmap, head) without external deps.
const fs = require('fs');
const path = require('path');

function u16(b, o) { return b.readUInt16BE(o); }
function u32(b, o) { return b.readUInt32BE(o); }

function parse(file) {
  const b = fs.readFileSync(file);
  const sfnt = u32(b, 0);
  const numTables = u16(b, 4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    const tag = b.toString('ascii', o, o + 4);
    tables[tag] = { off: u32(b, o + 8), len: u32(b, o + 12) };
  }
  const out = { file: path.basename(file), sfnt: sfnt.toString(16) };

  // head
  if (tables.head) {
    const h = tables.head.off;
    out.unitsPerEm = u16(b, h + 18);
    out.macStyle = u16(b, h + 44);
  }
  // OS/2
  if (tables['OS/2']) {
    const o = tables['OS/2'].off;
    out.version = u16(b, o);
    out.usWeightClass = u16(b, o + 4);
    out.fsType = u16(b, o + 8);
    out.fsSelection = u16(b, o + 62);
    // PostScript-codepage ranges: first 42 bits indicate Unicode ranges at offset 78 (v>=2)
  }
  // name table
  if (tables.name) {
    const o = tables.name.off;
    const count = u16(b, o + 2);
    const strOff = o + u16(b, o + 4);
    const names = {};
    for (let i = 0; i < count; i++) {
      const r = o + 6 + i * 12;
      const pid = u16(b, r), eid = u16(b, r + 2), lid = u16(b, r + 4);
      const nid = u16(b, r + 6), len = u16(b, r + 8), off = u16(b, r + 10);
      if (pid !== 3 || eid !== 1) continue; // Windows/BMP/Unicode
      const s = b.slice(strOff + off, strOff + off + len).swap16().toString('utf16le');
      if (!(nid in names)) names[nid] = s;
    }
    out.family = names[1];
    out.subfamily = names[2];
    out.fullName = names[4];
    out.psName = names[6];
    out.typographicFamily = names[16];
    out.typographicSubfamily = names[17];
    out.versionStr = names[5];
  }
  // cmap: count codepoints in Unicode BMP+ format 4 / format 12
  let cps = new Set();
  if (tables.cmap) {
    const o = tables.cmap.off;
    const n = u16(b, o + 2);
    const subs = [];
    for (let i = 0; i < n; i++) {
      const r = o + 4 + i * 8;
      subs.push({ pid: u16(b, r), eid: u16(b, r + 2), off: o + u32(b, r + 4) });
    }
    const pick = subs.find(s => s.pid === 3 && s.eid === 10) ||
                 subs.find(s => s.pid === 3 && s.eid === 1) ||
                 subs.find(s => s.pid === 0);
    if (pick) {
      const so = pick.off;
      const fmt = u16(b, so);
      out.cmapFormat = fmt;
      if (fmt === 4) {
        const segX2 = u16(b, so + 6);
        const ends = so + 14;
        const starts = ends + segX2 + 2;
        const deltas = starts + segX2;
        const ranges = deltas + segX2;
        for (let s = 0; s < segX2 / 2; s++) {
          const end = u16(b, ends + s * 2), start = u16(b, starts + s * 2);
          const delta = u16(b, deltas + s * 2), ro = u16(b, ranges + s * 2);
          for (let c = start; c <= end && c !== 0xffff; c++) {
            if (ro === 0) { if ((c + delta) & 0xffff) cps.add(c); }
            else {
              const gi = u16(b, ranges + s * 2 + ro + (c - start) * 2);
              if (gi !== 0) cps.add(c);
            }
          }
        }
      } else if (fmt === 12) {
        const ng = u32(b, so + 12);
        for (let g = 0; g < ng; g++) {
          const r = so + 16 + g * 12;
          const sc = u32(b, r), ec = u32(b, r + 4);
          for (let c = sc; c <= ec; c++) cps.add(c);
        }
      }
    }
  }
  out.codepoints = cps.size;
  const has = (ch) => cps.has(ch.codePointAt(0));
  // Persian-specific glyphs (Persian-only forms, not Arabic)
  const persianOnly = { 'پ': 0x067E, 'چ': 0x0686, 'ژ': 0x0698, 'گ': 0x06AF, 'ک': 0x06A9, 'ی': 0x06CC };
  out.persianOnly = Object.entries(persianOnly).map(([ch, cp]) => `${ch}:${has(ch) ? 'Y' : 'N'}`).join(' ');
  const arabicForms = [0x0621, 0x0627, 0x0628, 0x0644, 0x0645, 0x0646];
  out.arabicBase = arabicForms.every(c => cps.has(c)) ? 'Y' : 'N';
  // Latin + digits
  out.latin = has('A') && has('a') ? 'Y' : 'N';
  out.latinDigits = has('0') ? 'Y' : 'N';
  out.persianDigits = '۰۱۲۳۴۵۶۷۸۹'.split('').every(has) ? 'Y' : 'N';
  // ZWNJ, Persian punctuation, guillemets, Arabic-Indic
  out.zwnj = has('‌') ? 'Y' : 'N';
  out.arabicIndic = has('٠') || has('۰') ? 'Y' : 'N';
  return out;
}

const files = fs.readdirSync(process.argv[2]).filter(f => /\.ttf$/i.test(f)).sort();
const rows = files.map(f => parse(path.join(process.argv[2], f)));
console.log(JSON.stringify(rows, null, 1));
