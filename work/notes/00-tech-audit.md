# Stage 1 — verified technical findings (my own direct inspection)

## Source files
- `project/حقوق ثبت.pdf` — 2,433,427 bytes, unmodified. md5 not yet recorded.
- `project/IRANSansX.zip` — 358,622 bytes, md5 `dadbe68654813348f62ccb5fe67004bc`, unmodified.
- Fonts extracted to `assets/fonts/` (9 TTF). Original ZIP preserved in `project/`.

## PDF internals
- PDF 1.5, linearized, 113 pages, MediaBox 612×792 pt (US Letter), CropBox same, Rotate 0.
- Producer: `Acrobat Distiller 15.0 (Windows)`; Creator: `PScript5.dll Version 5.2.2`;
  Title metadata: `Microsoft Word - حقوق ثبت - جاويدانه - 20 04 04`; Author: `Ali`;
  Created/Modified: 2025-07-11 15:27 (+04:30).
  ⇒ authored in Word, printed to PostScript, distilled to PDF.
- 19 embedded font programs. Embedded families: **BMitraBold, BMitra, BTitr-Bold, SymbolMT,
  TimesNewRoman, Cambria, Calibri, ArialMT, Wingdings-Regular, CourierNewPSMT**.
  No IRANSansX anywhere in the source.
- Text is stored as **Arabic presentation forms** (U+FB50–FEFC) in visual order, with explicit
  bidi control chars (U+202A/B/C) — must be NFKC-normalised before any content work.
- 6 pages (79–84) carry a duplicate glyph layer filled pure yellow (255,255,0) → full-page
  "highlighter" blocks. Only 4 fill colours exist in the whole file: black, white, yellow, red(2 calls).
- **Correction to a first visual impression**: emphasised words that *look* teal in the rendered PNG
  are not coloured. Verified by walking the operator list of p23: the only fill colours on that page
  are black and the grey bar. The teal fringing is LCD/subpixel antialiasing in the rasteriser.
  ⇒ the original is effectively **monochrome**: black on white + grey bars + one yellow block.
  It therefore has *no colour system at all*, which is an opportunity, not a constraint to preserve.

## Original typographic system (measured)
| role | font | size |
|---|---|---|
| body | BMitraBold | 11.3 pt (86.5 % of all characters) |
| section titles / notes | BMitra (regular) | 11.3 pt |
| sub-notes, source tags `(مشايخ)` | BMitra / BMitraBold | 7.5 pt |
| cover / big labels | BTitr-Bold | 8–13.2 pt; 26.4 pt numerals in diagrams |
| numerals, symbols | Times New Roman / Symbol / Courier | various |

Findings:
- **No real hierarchy**: the section title "اقسام اموال" is set in the *same* font and *same* size
  as body text; the body is Bold while titles are Regular — the emphasis logic is inverted.
- Line spacing ≈ 16 pt on 11.3 pt type (≈1.42). 89 of 113 pages use exactly 16 pt.
- Content box: x 53–578 pt, y 45–756 pt. Right margin ≈34 pt, left ≈53 pt, top ≈45, bottom ≈36.
- Every page carries a footer: `تاریخ آخرین تغییرات: 1404/04/20` + a phone number / social-media line.
- Only 11 arrow glyphs in the entire document → no flowcharts as glyph arrows; diagrams are
  drawn as bordered boxes.
- Bullets: 271 Wingdings bullets (U+F0B7), 61 (U+F0A7), 13 (U+F0AC), 191 Latin "o" sub-bullets,
  477 lines starting with a dash. Bullet symbology is inconsistent.
- 51 pages contain grey (211,211,211) title/citation bars, 66 bars total.
  The bars mostly name a **statute**, not a topic.
- 35 pages have a real table grid; 49 pages have ≥6 horizontal or ≥8 vertical rules.
- Only 4 pages use rotated (90°) side labels.

## Size of the work
- ~68,000 Persian words; 315,052 visible characters; mean 2,788 chars/page.
- 484 occurrences of «ماده», 133 distinct article numbers, 324 «تبصره».
- 484/324 citation density confirms: this is a **citation-dense** document, not prose.

## Source attribution inside the text (evidence of a multi-teacher compilation)
| tag | count |
|---|---|
| (مشايخ) | 85 |
| (شكوهي) | 73 |
| (تفكريان) | 27 |
| (دادآفرين) | 26 |
| (ملاكريمي) | 23 |
| (حقيقت) | 12 |
| (كريمي منفرد) | present (e.g. p90) |
⇒ ~246 inline attributions. Same rule is often restated two or three times from different teachers.

## Integrity / completeness problems found
- **Blank pages**: 16, 111, 112, 113 contain nothing but the footer.
- p90 and p107 are half-empty (669 and 954 chars) — topic breaks, not layout choice.
- **p107 ends with a student's own note: «فصل چهارم به بعد را نخواندم»**
  ⇒ the notes stop mid-way through the اجرای اسناد رسمی regulation. The document is unfinished.
- p79–p84 are whole pages of verbatim statute highlighted in yellow (no added explanation).
- Numbers are frequently separated from their nouns by spacing artefacts (`ماده  19قانون`), and
  some dates appear as `31ˏ03ˏ1390` with a stray U+02CF → needs normalisation in production.
- U+0124 (Ĥ) appears 10× as a broken glyph, U+25CC twice — extraction artefacts to repair.

## Font audit (IRANSansX.zip)
9 genuine static TTFs, version 2.400, unitsPerEm 1000, fsType 8 (editable embedding — OK):

| file | usWeightClass | family (nameID 1) | PS name | GSUB/GPOS |
|---|---|---|---|---|
| IRANSansX-Thin.ttf | 100 | IRANSansX Thin | IRANSansX-Thin | yes |
| IRANSansX-UltraLight.ttf | 200 | IRANSansX UltraLight | IRANSansX-UltraLight | yes |
| IRANSansX-Light.ttf | 300 | IRANSansX Light | IRANSansX-Light | yes |
| IRANSansX-Regular.ttf | 400 | IRANSansX | IRANSansX-Regular | yes |
| IRANSansX-Medium.ttf | 500 | IRANSansX Medium | IRANSansX-Medium | yes |
| IRANSansX-DemiBold.ttf | 600 | IRANSansX DemiBold | IRANSansX-DemiBold | yes |
| IRANSansX-Bold.ttf | 700 | IRANSansX Bold | IRANSansX-Bold | yes |
| IRANSansX-ExtraBold.ttf | 800 | IRANSansX ExtraBold | IRANSansX-ExtraBold | yes |
| IRANSansX-Black.ttf | 900 | IRANSansX Black | IRANSansX-Black | yes |

- **No UltraBold weight exists** — the brief mentions "ExtraBold / UltraBold"; only ExtraBold (800)
  is present. Flagged, not substituted.
- Each weight is its own *family* (nameID 1 includes the weight; nameID 2 = "Regular").
  ⇒ in CSS/PDF you must reference each file separately or via @font-face weight mapping;
  a simple `font-weight: bold` will NOT select IRANSansX-Bold.
- All 9 have GSUB+GPOS+GDEF ⇒ real Arabic shaping (init/medi/fina) will work.
- Coverage: only **462 codepoints**. Persian letters کامل (پ چ ژ گ ک ی), ZWNJ, Persian
  punctuation (، ؛ ؟ « » ٪ ٫ ٬), Persian + Latin digits, Latin Basic, some maths, Arabic
  presentation forms.
- **Missing for this project**: U+2010, U+2013 (en dash), U+2014, U+2190 (←), U+25CC, U+00B7.
  The document uses «←» and «–» in places and the arrows «→ ←» in diagrams ⇒ need a decision
  in Stage 2 (glyph substitution / drawing arrows as vector shapes / a second font for symbols).
