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

A teaching page for the projector that follows the four Class 10 physics chapters of the NCERT textbook (rationalised edition) section by section: 43 sections and 22 simulations.

| Chapter | Sections and simulations |
|---|---|
| 9. Light | 16 sections. Plane mirror; spherical mirrors and lenses with ray diagrams for every object position in Tables 9.1, 9.2, 9.4 and 9.5, including an object at infinity; the four ray rules for mirrors and three for lenses; sign convention; mirror and lens formulas with magnification; refraction, the glass slab and the coin in water; refractive index (Table 9.3); power of a lens |
| 10. Human Eye | 8 sections. Parts of the eye; accommodation; myopia, hypermetropia and presbyopia with correcting lenses (and bifocals); refraction through a prism (Activity 10.1); dispersion, Newton's two prisms and the rainbow; atmospheric refraction (twinkling stars, advance sunrise and delayed sunset); Tyndall effect, the blue sky and red danger signals |
| 11. Electricity | 9 sections. Current and charge; potential difference; circuit symbols with a quiz; Ohm's law (Activities 11.1 and 11.2) with a V–I graph; resistivity (Activity 11.3, Table 11.2); resistors and bulbs in series and parallel; heating effect (Joule's law, fuse, bulb); electric power and the energy bill |
| 12. Magnetic Effects | 10 sections. Oersted's experiment (Activities 12.1 and 12.4); iron filings and field lines, with a compass you can move or use to trace a field line (12.2, 12.3); straight wire, right-hand thumb rule, circular loop and solenoid (12.5, 12.6); force on a rod between the poles of a horse-shoe magnet (12.7); Fleming's left-hand rule; domestic circuits with fuses, overloading, short circuit, earthing and the AC supply |

Each section has the NCERT activities (steps and what students observe), worked examples, in-text questions and points to explain, with formulas and the NCERT tables. Each chapter ends with all its NCERT exercise questions and the "What you have learnt" summary. Answers stay hidden until you show them, and most activities, examples and questions have a **Show in simulation** button that sets up that exact case.

Labels in the diagrams are placed so that they never cover one another, the object or the image, on a projector or on a phone.

Teaching tools: a pen that draws over the page (the drawing scrolls with the page), a separate blank board, an activity timer, a random roll-number picker that never repeats a student until everyone has had a turn, larger text for the projector, light/dark theme and full screen. Keyboard: ← → topics, 1–4 chapters, P pen, B board, T timer, R pick, F full screen, Esc close.

Notes on accuracy:
- Sign convention and formulas follow NCERT (mirror 1/v + 1/u = 1/f, m = −v/u; lens 1/v − 1/u = 1/f, m = v/u). Ray diagrams use the usual thin-mirror and thin-lens construction.
- The colour of the Sun at sunrise and sunset is excluded from the CBSE syllabus; the page shows it only as "extra".
- NCERT Table 11.2 prints alloy resistivities as × 10⁻⁶ Ω m. Measured values are about 100 times smaller, and those are used (with a note on the page).
- The eye, prism and sky pictures are schematic; the prism spreads the colours more than real glass so they are easy to see.

Files: `class-10/classroom/index.html`, `classroom.css` and `js/` (core helpers, one simulation file per chapter, one NCERT content file per chapter, and `app.js` for the page). Plain JavaScript, no libraries.

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
