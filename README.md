# Physics Notes – CBSE Class 9 & 10

Chapter-wise physics notes for CBSE (NCERT) Class 9 and Class 10 students, prepared by Umar Mukthar.

**Live site:** https://umar1989.github.io/physics/

## Chapters

| Class 9 | Class 10 |
|---|---|
| 7. Motion | 9. Light – Reflection and Refraction |
| 8. Force and Laws of Motion | 10. The Human Eye and the Colourful World |
| 9. Gravitation | 11. Electricity |
| 10. Work and Energy | 12. Magnetic Effects of Electric Current |
| 11. Sound | |

Each chapter has key concepts, formulas with SI units, solved numericals and a quick-revision list.

## Class 10 interactive classroom

**Live:** https://umar1989.github.io/physics/class-10/classroom/

A teaching page for the projector, covering the four Class 10 physics chapters (NCERT, rationalised edition) with 13 simulations:

| Chapter | Simulations |
|---|---|
| 9. Light | Spherical mirrors and lenses (ray diagrams, u, v, m, R, power), refraction and the rectangular slab |
| 10. Human Eye | Myopia and hypermetropia with correcting lenses, prism dispersion and Newton's experiment, scattering (why the sky is blue) |
| 11. Electricity | Ohm's law (Activity 11.1) with a V–I graph, series and parallel bulbs, resistivity, energy bill and H = I²Rt |
| 12. Magnetic Effects | Field lines with a movable compass (wire, loop, solenoid, bar magnet), Fleming's left-hand rule (based on Activity 12.7), domestic circuit with fuse |

Each topic also has points to explain, formulas, and questions with hidden answers, mostly NCERT's own in-text and exercise questions. Many questions have a **Show in simulation** button that sets up that exact case.

Teaching tools: a pen that draws over the page (the drawing scrolls with the page), a separate blank board, an activity timer, a random roll-number picker that never repeats a student until everyone has had a turn, larger text for the projector, light/dark theme and full screen. Keyboard: ← → topics, 1–4 chapters, P pen, B board, T timer, R pick, F full screen, Esc close.

Notes on accuracy:
- Sign convention and formulas follow NCERT (mirror 1/v + 1/u = 1/f, m = −v/u; lens 1/v − 1/u = 1/f, m = v/u). Ray diagrams use the usual thin-mirror and thin-lens construction.
- The colour of the Sun at sunrise and sunset is excluded from the CBSE syllabus; the page shows it only as "extra".
- NCERT Table 11.2 prints alloy resistivities as × 10⁻⁶ Ω m. Measured values are about 100 times smaller, and those are used (with a note on the page).
- The eye, prism and sky pictures are schematic; the prism spreads the colours more than real glass so they are easy to see.

Files: `class-10/classroom/index.html`, `classroom.css`, `classroom.js` (plain JavaScript, no libraries).

## Features

- Search box for topics and formulas
- Dark mode
- Works on phones
- Print-friendly (A4)
- Formulas typeset with MathJax

## Structure

```
index.html          Home page (chapter cards are generated from js/main.js)
class-9/*.html      Class 9 chapters
class-10/*.html     Class 10 chapters
css/style.css       Shared design
js/main.js          Chapter list, header, search, dark mode, prev/next links
```

To add a chapter: create its HTML page (copy an existing one), then add an entry to the `CHAPTERS` list at the top of `js/main.js`. It will then appear on the home page, in search and in the previous/next links.
