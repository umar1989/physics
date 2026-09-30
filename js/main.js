/* ============================================================
   Physics Notes — shared script
   Builds header, search, table of contents, prev/next links,
   dark mode and print button on every page.
   ============================================================ */

const SITE_TITLE = "Physics Notes";

const CHAPTERS = [
  {
    id: "class-9/motion", cls: 9, num: 7, title: "Motion",
    topics: ["distance", "displacement", "speed", "velocity", "acceleration", "uniform motion",
      "non-uniform motion", "distance-time graph", "velocity-time graph", "equations of motion",
      "uniform circular motion", "v = u + at", "s = ut + ½at²", "v² − u² = 2as"]
  },
  {
    id: "class-9/force-and-laws-of-motion", cls: 9, num: 8, title: "Force and Laws of Motion",
    topics: ["force", "balanced forces", "unbalanced forces", "inertia", "mass", "Newton's first law",
      "Newton's second law", "F = ma", "momentum", "p = mv", "Newton's third law",
      "action and reaction", "conservation of momentum", "recoil of gun", "newton (unit)"]
  },
  {
    id: "class-9/gravitation", cls: 9, num: 9, title: "Gravitation",
    topics: ["universal law of gravitation", "gravitational constant G", "F = Gm₁m₂/r²",
      "free fall", "acceleration due to gravity g", "g = GM/R²", "mass", "weight", "W = mg",
      "weight on the moon", "thrust", "pressure", "P = F/A", "buoyancy", "upthrust",
      "Archimedes' principle", "relative density", "density", "floating and sinking"]
  },
  {
    id: "class-9/work-and-energy", cls: 9, num: 10, title: "Work and Energy",
    topics: ["work", "W = Fs", "joule", "positive work", "negative work", "zero work", "energy",
      "kinetic energy", "½mv²", "potential energy", "mgh", "mechanical energy",
      "law of conservation of energy", "power", "P = W/t", "watt", "kilowatt hour", "kWh", "commercial unit"]
  },
  {
    id: "class-9/sound", cls: 9, num: 11, title: "Sound",
    topics: ["production of sound", "vibration", "longitudinal wave", "compression", "rarefaction",
      "wavelength", "frequency", "time period", "amplitude", "speed of sound", "v = fλ", "pitch",
      "loudness", "quality (timbre)", "reflection of sound", "echo", "17.2 m", "reverberation",
      "range of hearing", "infrasound", "ultrasound", "SONAR", "human ear"]
  },
  {
    id: "class-10/light-reflection-refraction", cls: 10, num: 9, title: "Light – Reflection and Refraction",
    topics: ["reflection", "laws of reflection", "plane mirror", "spherical mirrors", "concave mirror",
      "convex mirror", "pole", "centre of curvature", "focus", "focal length", "R = 2f",
      "mirror formula", "1/v + 1/u = 1/f", "magnification", "sign convention", "ray diagrams",
      "refraction", "laws of refraction", "Snell's law", "refractive index", "glass slab",
      "lateral displacement", "convex lens", "concave lens", "lens formula", "1/v − 1/u = 1/f",
      "power of a lens", "dioptre", "P = 1/f"]
  },
  {
    id: "class-10/human-eye", cls: 10, num: 10, title: "The Human Eye and the Colourful World",
    topics: ["human eye", "cornea", "iris", "pupil", "eye lens", "retina", "ciliary muscles",
      "power of accommodation", "near point 25 cm", "far point", "myopia", "near-sightedness",
      "hypermetropia", "far-sightedness", "presbyopia", "correction of defects", "prism",
      "refraction through prism", "angle of deviation", "dispersion", "spectrum", "VIBGYOR",
      "rainbow", "atmospheric refraction", "twinkling of stars", "advance sunrise",
      "scattering of light", "Tyndall effect", "blue sky", "red sunset"]
  },
  {
    id: "class-10/electricity", cls: 10, num: 11, title: "Electricity",
    topics: ["electric charge", "coulomb", "electric current", "I = Q/t", "ampere", "potential difference",
      "V = W/Q", "volt", "circuit diagram symbols", "Ohm's law", "V = IR", "resistance", "ohm",
      "resistivity", "R = ρl/A", "resistors in series", "resistors in parallel",
      "heating effect of current", "Joule's law", "H = I²Rt", "electric power", "P = VI",
      "P = I²R", "P = V²/R", "kilowatt hour", "fuse", "ammeter", "voltmeter"]
  },
  {
    id: "class-10/magnetic-effects", cls: 10, num: 12, title: "Magnetic Effects of Electric Current",
    topics: ["magnetic field", "magnetic field lines", "compass", "Oersted", "straight conductor",
      "right-hand thumb rule", "circular loop", "solenoid", "electromagnet",
      "force on a current-carrying conductor", "Fleming's left-hand rule",
      "domestic electric circuits", "live wire", "neutral wire", "earth wire", "earthing",
      "short circuit", "overloading", "fuse", "MCB"]
  }
];

/* ---------- Theme (dark mode) ---------- */
function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}
function saveTheme(t) {
  try { localStorage.setItem("theme", t); } catch (e) { /* ignore */ }
}
function currentTheme() {
  const set = document.documentElement.getAttribute("data-theme");
  if (set) return set;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function toggleTheme() {
  const next = currentTheme() === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  saveTheme(next);
  updateThemeIcon();
}
function updateThemeIcon() {
  const btn = document.getElementById("theme-btn");
  if (!btn) return;
  const dark = currentTheme() === "dark";
  btn.textContent = dark ? "☀" : "☾";
  btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  btn.title = btn.getAttribute("aria-label");
}

/* ---------- Helpers ---------- */
const ROOT = document.body.getAttribute("data-root") || "./";
const CURRENT = document.body.getAttribute("data-chapter") || "";

function url(id) { return ROOT + id + ".html"; }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Header ---------- */
function buildHeader() {
  const current = CHAPTERS.find(c => c.id === CURRENT);
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="${ROOT}index.html" aria-label="${SITE_TITLE} home">
        <span class="brand-mark">φ</span><span class="brand-text">${SITE_TITLE}</span>
      </a>
      <nav class="header-nav" aria-label="Classes">
        <a href="${ROOT}index.html#class-9" class="${current && current.cls === 9 ? "active" : ""}">Class 9</a>
        <a href="${ROOT}index.html#class-10" class="${current && current.cls === 10 ? "active" : ""}">Class 10</a>
      </nav>
      <div class="search-wrap">
        <input id="search" type="search" placeholder="Search topics or formulas…" autocomplete="off" aria-label="Search">
        <div id="search-results" class="search-results" role="listbox"></div>
      </div>
      <button id="theme-btn" class="icon-btn" type="button"></button>
    </div>`;
  document.body.prepend(header);
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  updateThemeIcon();
}

/* ---------- Search ---------- */
function normalise(s) {
  return s.toLowerCase().replace(/[’']/g, "'").replace(/[–—−]/g, "-");
}

function buildIndex() {
  const index = [];
  CHAPTERS.forEach(c => {
    index.push({ label: c.title, meta: `Class ${c.cls} · Chapter ${c.num}`, href: url(c.id), text: normalise(c.title), weight: 3 });
    c.topics.forEach(t => {
      index.push({ label: t, meta: `${c.title} · Class ${c.cls}`, href: url(c.id), text: normalise(t), weight: 1 });
    });
  });
  // Headings on the current page link straight to that section
  document.querySelectorAll(".page h2[id], .page h3[id]").forEach(h => {
    index.push({ label: h.textContent.trim(), meta: "On this page", href: "#" + h.id, text: normalise(h.textContent), weight: 2 });
  });
  return index;
}

function setupSearch() {
  const input = document.getElementById("search");
  const box = document.getElementById("search-results");
  const index = buildIndex();
  let focused = -1;

  function render(q) {
    const query = normalise(q.trim());
    if (!query) { box.classList.remove("open"); box.innerHTML = ""; return; }
    const words = query.split(/\s+/);
    const seen = new Set();
    const hits = index
      .filter(e => words.every(w => e.text.includes(w)))
      .sort((a, b) => (b.weight - a.weight) || (a.text.indexOf(words[0]) - b.text.indexOf(words[0])))
      .filter(e => { const k = e.label + e.href; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 12);
    focused = -1;
    box.innerHTML = hits.length
      ? hits.map(h => `<a href="${h.href}" role="option"><span class="r-title">${escapeHtml(h.label)}</span><span class="r-meta">${escapeHtml(h.meta)}</span></a>`).join("")
      : `<div class="empty">No results for “${escapeHtml(q.trim())}”</div>`;
    box.classList.add("open");
  }

  input.addEventListener("input", () => render(input.value));
  input.addEventListener("focus", () => { if (input.value) render(input.value); });
  input.addEventListener("keydown", e => {
    const links = [...box.querySelectorAll("a")];
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!links.length) return;
      e.preventDefault();
      focused = (focused + (e.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle("focused", i === focused));
      links[focused].scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      const target = links[focused >= 0 ? focused : 0];
      if (target) { e.preventDefault(); target.click(); box.classList.remove("open"); }
    } else if (e.key === "Escape") {
      box.classList.remove("open");
      input.blur();
    }
  });
  box.addEventListener("click", () => box.classList.remove("open"));
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) box.classList.remove("open");
  });
}

/* ---------- Chapter page extras ---------- */
function buildToc() {
  const slot = document.getElementById("toc");
  if (!slot) return;
  const heads = [...document.querySelectorAll(".page h2[id]")];
  if (!heads.length) { slot.remove(); return; }
  slot.className = "toc";
  slot.innerHTML = `<strong>In this chapter</strong><ol>${heads.map(h => `<li><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join("")}</ol>`;
}

function buildPager() {
  const i = CHAPTERS.findIndex(c => c.id === CURRENT);
  if (i < 0) return;
  const prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1];
  const nav = document.createElement("nav");
  nav.className = "pager";
  nav.setAttribute("aria-label", "Chapter navigation");
  nav.innerHTML =
    (prev ? `<a class="prev" href="${url(prev.id)}"><span class="p-label">← Previous</span><span class="p-title">${escapeHtml(prev.title)}</span></a>` : "") +
    (next ? `<a class="next" href="${url(next.id)}"><span class="p-label">Next →</span><span class="p-title">${escapeHtml(next.title)}</span></a>` : "");
  document.querySelector(".page").appendChild(nav);
}

function setupPrint() {
  document.querySelectorAll("[data-print]").forEach(b => b.addEventListener("click", () => window.print()));
}

/* ---------- Home page cards ---------- */
function buildHome() {
  [9, 10].forEach(cls => {
    const slot = document.getElementById("cards-" + cls);
    if (!slot) return;
    slot.innerHTML = CHAPTERS.filter(c => c.cls === cls).map(c => `
      <a class="chapter-card" href="${url(c.id)}">
        <span class="c-num">Chapter ${c.num}</span>
        <span class="c-title">${escapeHtml(c.title)}</span>
        <p class="c-topics">${escapeHtml(c.topics.slice(0, 6).join(" · "))}</p>
      </a>`).join("");
  });
}

/* ---------- Footer ---------- */
function buildFooter() {
  const f = document.createElement("footer");
  f.className = "site-footer";
  f.innerHTML = `${SITE_TITLE} · CBSE Class 9 &amp; 10 · Prepared by Umar Mukthar, M.Sc., B.Ed.`;
  document.body.appendChild(f);
}

buildHeader();
buildHome();
buildToc();
buildPager();
buildFooter();
setupSearch();
setupPrint();
