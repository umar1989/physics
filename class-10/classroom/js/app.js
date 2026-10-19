/* ============================================================
   Class 10 Physics Classroom — page: navigation, teaching panels, tools
   ============================================================ */
"use strict";
(function () {
const { $, h, clamp, store, isDark } = CR;
const CHAPTERS = CR.chapters.slice().sort((a, b) => a.num - b.num);
const pagesOf = ch => [...ch.topics.map(t => t.id), ...(ch.exercises && ch.exercises.length ? ["exercises"] : []), ...(ch.summary && ch.summary.length ? ["summary"] : [])];
const FLAT = [];
CHAPTERS.forEach((ch, ci) => pagesOf(ch).forEach(pid => FLAT.push([ci, pid])));

const chapNav = $("#chapters"), topicNav = $("#topics"), stageEl = $("#stage"), layout = $("#layout");
const sideTabs = $("#sideTabs"), sideBody = $("#sideBody");
let cur = { c: 0, p: CHAPTERS[0].topics[0].id };
let simApi = {};
let sideTab = "explain";

/* ---------- small renderers ---------- */
function answerToggle(card, label = "Show answer") {
  const btn = h("button", { type: "button", class: "chip small" }, label);
  btn.addEventListener("click", () => {
    card.classList.toggle("open");
    btn.textContent = card.classList.contains("open") ? label.replace("Show", "Hide") : label;
  });
  return btn;
}
function simButton(setup, topicId) {
  const b = h("button", { type: "button", class: "chip small sim-btn" }, topicId && topicId !== cur.p ? "▶ Open in simulation" : "▶ Show in simulation");
  b.addEventListener("click", () => {
    const leaving = topicId && topicId !== cur.p;
    if (leaving) show(cur.c, topicId);
    if (simApi.set) simApi.set(setup);
    if (leaving) window.scrollTo({ top: 0, behavior: "smooth" });
    else stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return b;
}
const para = txt => (Array.isArray(txt) ? txt.map(t => h("p", {}, t)) : h("p", {}, txt));

function renderExplain(t) {
  const out = [];
  out.push(h("h2", {}, "What to explain"));
  out.push(h("ol", { class: "points" }, t.explain.map(x => h("li", {}, x))));
  if (t.formulas && t.formulas.length) {
    out.push(h("h2", {}, "Formulas"));
    out.push(h("div", { class: "formulas" }, t.formulas.map(([n, e]) => h("div", { class: "formula" }, h("div", { class: "f-n" }, n), h("div", { class: "f-e" }, e)))));
  }
  (t.boxes || []).forEach(b => {
    out.push(h("div", { class: "box" }, h("h3", {}, b.title), b.items ? h("ul", {}, b.items.map(x => h("li", {}, x))) : null, b.text ? para(b.text) : null));
  });
  return out;
}
function renderActivities(t) {
  return t.activities.map(a => {
    const card = h("div", { class: "act" });
    card.append(h("h3", {}, `Activity ${a.n}`, a.title ? h("span", { class: "act-title" }, ` · ${a.title}`) : null));
    if (a.caution) card.append(h("p", { class: "caution" }, "Caution: ", a.caution));
    card.append(h("ol", { class: "steps" }, a.steps.map(s => h("li", {}, s))));
    card.append(h("div", { class: "ans" }, h("strong", {}, "What students find: "), a.observe));
    const row = h("div", { class: "btn-row" }, answerToggle(card, "Show what students find"));
    if (a.setup && (simApi.set || a.topic)) row.append(simButton(a.setup, a.topic));
    card.append(row);
    return card;
  });
}
function renderExamples(t) {
  return t.examples.map(ex => {
    const card = h("div", { class: "q ex" });
    card.append(h("p", {}, h("strong", {}, `Example ${ex.n}. `), ex.q));
    card.append(h("div", { class: "ans" }, h("ol", { class: "steps" }, ex.solution.map(s => h("li", {}, s))), ex.answer ? h("p", { class: "final" }, h("strong", {}, "Answer: "), ex.answer) : null));
    const row = h("div", { class: "btn-row" }, answerToggle(card, "Show solution"));
    if (ex.setup && (simApi.set || ex.topic)) row.append(simButton(ex.setup, ex.topic));
    card.append(row);
    return card;
  });
}
function renderQuestions(t) {
  const all = h("button", { type: "button", class: "chip small" }, "Show all answers");
  const list = t.questions.map((qq, i) => {
    const card = h("div", { class: "q" });
    card.append(h("p", {}, h("strong", {}, `Q${i + 1}. `), qq.tag ? h("span", { class: "tag" }, qq.tag) : null, qq.q));
    if (qq.options) card.append(h("ol", { class: "opts", type: "a" }, qq.options.map(o => h("li", {}, o))));
    card.append(h("div", { class: "ans" }, para(qq.a)));
    const row = h("div", { class: "btn-row" }, answerToggle(card));
    if (qq.setup && (simApi.set || qq.topic)) row.append(simButton(qq.setup, qq.topic));
    card.append(row);
    return card;
  });
  let open = false;
  all.addEventListener("click", () => {
    open = !open;
    list.forEach(c => { c.classList.toggle("open", open); const b = c.querySelector(".btn-row .chip"); if (b) b.textContent = open ? "Hide answer" : "Show answer"; });
    all.textContent = open ? "Hide all answers" : "Show all answers";
  });
  return [h("div", { class: "side-head" }, h("span", {}, "Questions from NCERT"), all), ...list];
}

function renderSide(t) {
  const tabs = [["explain", "Explain", 0]];
  if (t.activities && t.activities.length) tabs.push(["activities", "Activities", t.activities.length]);
  if (t.examples && t.examples.length) tabs.push(["examples", "Examples", t.examples.length]);
  if (t.questions && t.questions.length) tabs.push(["questions", "Questions", t.questions.length]);
  if (!tabs.some(x => x[0] === sideTab)) sideTab = "explain";
  sideTabs.replaceChildren(...tabs.map(([id, name, n]) => {
    const b = h("button", { type: "button", role: "tab", "aria-selected": String(id === sideTab) }, name, n ? h("span", { class: "count" }, String(n)) : null);
    b.addEventListener("click", () => { sideTab = id; renderSide(t); });
    return b;
  }));
  const body = sideTab === "explain" ? renderExplain(t) : sideTab === "activities" ? renderActivities(t) : sideTab === "examples" ? renderExamples(t) : renderQuestions(t);
  sideBody.replaceChildren(...body);
  sideBody.scrollTop = 0;
}

function renderExercises(ch) {
  const all = h("button", { type: "button", class: "chip small" }, "Show all answers");
  const cards = ch.exercises.map(ex => {
    const card = h("div", { class: "q exq" });
    card.append(h("p", {}, h("strong", {}, `${ex.n}. `), ex.q));
    if (ex.options) card.append(h("ol", { class: "opts", type: "a" }, ex.options.map(o => h("li", {}, o))));
    card.append(h("div", { class: "ans" }, para(ex.a)));
    const row = h("div", { class: "btn-row" }, answerToggle(card));
    if (ex.go) {
      const b = h("button", { type: "button", class: "chip small sim-btn" }, "▶ Open in simulation");
      b.addEventListener("click", () => { show(cur.c, ex.go.topic); if (ex.go.setup && simApi.set) simApi.set(ex.go.setup); window.scrollTo({ top: 0, behavior: "smooth" }); });
      row.append(b);
    }
    card.append(row);
    return card;
  });
  let open = false;
  all.addEventListener("click", () => {
    open = !open;
    cards.forEach(c => { c.classList.toggle("open", open); const b = c.querySelector(".btn-row .chip"); if (b) b.textContent = open ? "Hide answer" : "Show answer"; });
    all.textContent = open ? "Hide all answers" : "Show all answers";
  });
  stageEl.append(h("div", { class: "side-head" }, h("span", {}, `${ch.exercises.length} questions from the end of NCERT Chapter ${ch.num}`), all), ...cards);
}
function renderSummary(ch) {
  stageEl.append(h("h2", { class: "sum-h" }, "What you have learnt (NCERT)"));
  stageEl.append(h("ul", { class: "summary" }, ch.summary.map(s => h("li", {}, s))));
  const seen = new Set(), fl = [];
  ch.topics.forEach(t => (t.formulas || []).forEach(([n, e]) => { if (!seen.has(e)) { seen.add(e); fl.push([n, e, t.num]); } }));
  if (fl.length) {
    stageEl.append(h("h2", { class: "sum-h" }, "All formulas of this chapter"));
    stageEl.append(h("div", { class: "formulas grid2" }, fl.map(([n, e, num]) => h("div", { class: "formula" }, h("div", { class: "f-n" }, `${n} (${num})`), h("div", { class: "f-e" }, e)))));
  }
}

/* ---------- navigation ---------- */
function show(ci, pid) {
  CR.resetLifecycle();
  clearPageInk();
  const ch = CHAPTERS[ci];
  if (!pagesOf(ch).includes(pid)) pid = ch.topics[0].id;
  cur = { c: ci, p: pid };
  chapNav.replaceChildren(...CHAPTERS.map((c, k) => h("button", {
    type: "button", role: "tab", "aria-selected": String(k === ci), onclick: () => show(k, c.topics[0].id)
  }, h("span", { class: "chap-num" }, `Ch ${c.num}`), c.short)));
  const navBtns = ch.topics.map(t => h("button", { type: "button", "aria-current": String(t.id === pid), onclick: () => show(ci, t.id) },
    h("span", { class: "t-num" }, t.num), " ", t.chip || t.title));
  if (pagesOf(ch).includes("exercises")) navBtns.push(h("button", { type: "button", class: "extra", "aria-current": String(pid === "exercises"), onclick: () => show(ci, "exercises") }, "Exercises"));
  if (pagesOf(ch).includes("summary")) navBtns.push(h("button", { type: "button", class: "extra", "aria-current": String(pid === "summary"), onclick: () => show(ci, "summary") }, "Summary"));
  topicNav.replaceChildren(...navBtns);
  $("#chapLabel").textContent = `Chapter ${ch.num} · ${ch.title}`;
  $("#notesLink").href = ch.notes;
  stageEl.replaceChildren();
  simApi = {};
  if (pid === "exercises" || pid === "summary") {
    layout.classList.add("wide");
    stageEl.classList.add("doc");
    stageEl.style.display = "";
    $("#topicTitle").textContent = pid === "exercises" ? `Chapter ${ch.num} Exercises` : `Chapter ${ch.num} Summary`;
    $("#topicLead").textContent = pid === "exercises"
      ? "Every end-of-chapter question from the NCERT textbook, with a full answer. Use “Open in simulation” to show a question live."
      : "The NCERT “What you have learnt” points for this chapter, and every formula in one place.";
    if (pid === "exercises") renderExercises(ch); else renderSummary(ch);
    document.title = `${ch.short}: ${pid === "exercises" ? "Exercises" : "Summary"} – Class 10 Physics Classroom`;
  } else {
    layout.classList.remove("wide");
    stageEl.classList.remove("doc");
    const t = ch.topics.find(x => x.id === pid);
    $("#topicTitle").textContent = `${t.num}  ${t.title}`;
    $("#topicLead").textContent = t.lead || "";
    if (t.sim) {
      stageEl.style.display = "";
      const [name, o] = t.sim;
      simApi = CR.sims[name](stageEl, Object.assign({}, o || {})) || {};
    } else stageEl.style.display = "none";
    renderSide(t);
    document.title = `${t.num} ${t.title} – Class 10 Physics Classroom`;
  }
  const idx = FLAT.findIndex(([a, b]) => a === ci && b === pid);
  $("#pos").textContent = `${idx + 1} of ${FLAT.length}`;
  $("#prev").disabled = idx === 0;
  $("#next").disabled = idx === FLAT.length - 1;
  try { history.replaceState(null, "", `#${ch.id}/${pid}`); } catch (e) { /* file:// */ }
  const active = topicNav.querySelector('[aria-current="true"]');
  if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center" });
}
function step(dlt) {
  const idx = FLAT.findIndex(([a, b]) => a === cur.c && b === cur.p);
  const n = clamp(idx + dlt, 0, FLAT.length - 1);
  if (n !== idx) { show(...FLAT[n]); window.scrollTo({ top: 0, behavior: "smooth" }); }
}
$("#prev").addEventListener("click", () => step(-1));
$("#next").addEventListener("click", () => step(1));

function redrawAll() { requestAnimationFrame(() => CR.redrawers.forEach(f => f())); }

/* ---------- theme and text size ---------- */
CR.fontScale = clamp(+store.get("cls-fs", 1) || 1, 0.8, 1.6);
$("#tTheme").addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  store.set("theme", next);
  redrawAll();
});
if (window.matchMedia) {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  if (mq.addEventListener) mq.addEventListener("change", redrawAll);
}
function setFont(v) {
  CR.fontScale = clamp(Math.round(v * 10) / 10, 0.8, 1.6);
  document.documentElement.style.setProperty("--fs", CR.fontScale);
  store.set("cls-fs", String(CR.fontScale));
  redrawAll();
}
$("#tBigger").addEventListener("click", () => setFont(CR.fontScale + 0.1));
$("#tSmaller").addEventListener("click", () => setFont(CR.fontScale - 0.1));
$("#tFull").addEventListener("click", toggleFull);
function toggleFull() {
  const d = document;
  if (!d.fullscreenElement) { if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => {}); }
  else if (d.exitFullscreen) d.exitFullscreen();
}

/* ---------- pen and whiteboard ----------
   Pen strokes on the page are kept in page coordinates, so they move with the page
   when it scrolls; board strokes belong to the board. */
const ink = $("#ink"), ictx = ink.getContext("2d"), inkbar = $("#inkbar");
const COLORS = ["#e53935", "#1e66f5", "#2e9d4f", "#f2b705", "#ffffff", "#111111"];
let penOn = false, penColor = COLORS[0], penW = 6, erasing = false, curStroke = null;
const strokes = { page: [], board: [] };
const onBoard = () => ink.classList.contains("board");
const inkOffset = () => (onBoard() ? [0, 0] : [window.scrollX, window.scrollY]);
function sizeInk() {
  const dpr = window.devicePixelRatio || 1;
  ink.width = Math.round(window.innerWidth * dpr);
  ink.height = Math.round(window.innerHeight * dpr);
  ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redrawInk();
}
function strokeStyle(s) {
  ictx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
  ictx.strokeStyle = s.color; ictx.lineWidth = s.width; ictx.lineCap = "round"; ictx.lineJoin = "round";
}
function redrawInk() {
  ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, ink.width, ink.height); ictx.restore();
  const [ox, oy] = inkOffset();
  for (const s of strokes[onBoard() ? "board" : "page"]) {
    ictx.save(); strokeStyle(s); ictx.beginPath();
    s.pts.forEach(([x, y], j) => (j ? ictx.lineTo(x - ox, y - oy) : ictx.moveTo(x - ox, y - oy)));
    if (s.pts.length === 1) ictx.lineTo(s.pts[0][0] - ox + 0.01, s.pts[0][1] - oy + 0.01);
    ictx.stroke(); ictx.restore();
  }
}
function clearPageInk() { strokes.page = []; if (!onBoard()) redrawInk(); }
sizeInk();
window.addEventListener("resize", sizeInk);
let inkQueued = false;
window.addEventListener("scroll", () => {
  if (onBoard() || !strokes.page.length || inkQueued) return;
  inkQueued = true;
  requestAnimationFrame(() => { inkQueued = false; redrawInk(); });
}, { passive: true });
const sw = $("#swatches");
COLORS.forEach(c => {
  const b = h("button", { type: "button", class: "swatch", style: `background:${c}`, "aria-label": `pen colour ${c}`, "aria-pressed": String(c === penColor) });
  b.addEventListener("click", () => { penColor = c; erasing = false; $("#inkErase").setAttribute("aria-pressed", "false"); sw.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });
  sw.append(b);
});
$("#penSize").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
  penW = +b.dataset.s;
  $("#penSize").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
}));
$("#inkErase").addEventListener("click", e => { erasing = !erasing; e.currentTarget.setAttribute("aria-pressed", String(erasing)); });
$("#inkClear").addEventListener("click", () => { strokes[onBoard() ? "board" : "page"] = []; redrawInk(); });
$("#inkBoard").addEventListener("click", () => setBoard(!onBoard()));
$("#inkDone").addEventListener("click", () => { setBoard(false); setPen(false); });
function setPen(on) {
  penOn = on;
  ink.classList.toggle("active", on);
  inkbar.classList.toggle("show", on);
  $("#tPen").setAttribute("aria-pressed", String(on));
}
function setBoard(on) {
  ink.classList.toggle("board", on);
  $("#tBoard").setAttribute("aria-pressed", String(on));
  $("#inkBoard").setAttribute("aria-pressed", String(on));
  if (on) { setPen(true); if (penColor === "#111111") sw.querySelector(".swatch").click(); }
  redrawInk();
}
$("#tPen").addEventListener("click", () => { if (penOn) { setBoard(false); setPen(false); } else setPen(true); });
$("#tBoard").addEventListener("click", () => setBoard(!onBoard()));
ink.addEventListener("pointerdown", e => {
  if (!penOn) return;
  const [ox, oy] = inkOffset();
  curStroke = { erase: erasing, color: penColor, width: erasing ? penW * 5 : penW, pts: [[e.clientX + ox, e.clientY + oy]] };
  strokes[onBoard() ? "board" : "page"].push(curStroke);
  ink.setPointerCapture(e.pointerId);
  ictx.save(); strokeStyle(curStroke); ictx.beginPath(); ictx.moveTo(e.clientX, e.clientY); ictx.lineTo(e.clientX + 0.01, e.clientY + 0.01); ictx.stroke(); ictx.restore();
});
ink.addEventListener("pointermove", e => {
  if (!curStroke) return;
  const [ox, oy] = inkOffset();
  const last = curStroke.pts[curStroke.pts.length - 1];
  curStroke.pts.push([e.clientX + ox, e.clientY + oy]);
  ictx.save(); strokeStyle(curStroke); ictx.beginPath(); ictx.moveTo(last[0] - ox, last[1] - oy); ictx.lineTo(e.clientX, e.clientY); ictx.stroke(); ictx.restore();
});
["pointerup", "pointercancel"].forEach(t => ink.addEventListener(t, () => { curStroke = null; }));

/* ---------- timer ---------- */
const tp = $("#timerPanel"), tDisp = $("#timerDisplay"), tGo = $("#timerGo");
let tTotal = 120, tLeft = 120, tRun = false, tLast = 0, tTimer = null;
const mmss = s => { s = Math.max(0, Math.ceil(s - 1e-6)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const tRender = () => { tDisp.textContent = mmss(tLeft); };
[["1 min", 60], ["2 min", 120], ["3 min", 180], ["5 min", 300], ["+30 s", 30]].forEach(([t, s]) => {
  const b = h("button", { type: "button", class: "chip" }, t);
  b.addEventListener("click", () => { if (t[0] === "+") { tLeft += s; tTotal += s; } else { tTotal = s; tLeft = s; } tDisp.classList.remove("done"); tRender(); });
  $("#timerPresets").append(b);
});
function tTick() {
  if (!tRun) return;
  const now = performance.now();
  tLeft -= (now - tLast) / 1000; tLast = now;
  if (tLeft <= 0) { tLeft = 0; tRun = false; tGo.textContent = "Start"; tDisp.classList.add("done"); beep(); }
  tRender();
  if (tRun) tTimer = setTimeout(tTick, 200);
}
tGo.addEventListener("click", () => {
  if (tRun) { tRun = false; clearTimeout(tTimer); tGo.textContent = "Resume"; return; }
  if (tLeft <= 0) tLeft = tTotal;
  tDisp.classList.remove("done");
  tRun = true; tLast = performance.now(); tGo.textContent = "Pause";
  tTick();
});
$("#timerReset").addEventListener("click", () => { tRun = false; clearTimeout(tTimer); tLeft = tTotal; tGo.textContent = "Start"; tDisp.classList.remove("done"); tRender(); });
function beep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext, ac = new AC();
    [0, 0.35, 0.7].forEach(t0 => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, ac.currentTime + t0);
      g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + 0.25);
      o.start(ac.currentTime + t0); o.stop(ac.currentTime + t0 + 0.3);
    });
  } catch (e) { /* no audio */ }
}

/* ---------- student picker ---------- */
const pp = $("#pickPanel"), pN = $("#pickN"), pDisp = $("#pickDisplay"), pNote = $("#pickNote");
pN.value = store.get("cls-size", "40");
const picked = new Set();
let picking = false;
pN.addEventListener("change", () => { pN.value = clamp(Math.round(+pN.value || 40), 2, 200); store.set("cls-size", pN.value); picked.clear(); pNote.textContent = "Nobody picked yet."; pDisp.textContent = "?"; });
$("#pickGo").addEventListener("click", () => {
  if (picking) return;
  const N = clamp(Math.round(+pN.value || 40), 2, 200);
  let pool = [];
  for (let k = 1; k <= N; k++) if (!picked.has(k)) pool.push(k);
  if (!pool.length) { picked.clear(); pool = Array.from({ length: N }, (_, k) => k + 1); }
  const choice = pool[Math.floor(Math.random() * pool.length)];
  picking = true;
  let n = 0;
  const spin = setInterval(() => {
    pDisp.textContent = String(1 + Math.floor(Math.random() * N));
    if (++n >= 12) {
      clearInterval(spin);
      pDisp.textContent = String(choice);
      picked.add(choice);
      pNote.textContent = picked.size === N ? `Everyone (${N}) has been picked. The next pick starts a new round.` : `Picked ${picked.size} of ${N}. Nobody is picked twice until everyone has had a turn.`;
      picking = false;
    }
  }, 60);
});
$("#pickReset").addEventListener("click", () => { picked.clear(); pDisp.textContent = "?"; pNote.textContent = "Nobody picked yet."; });
function togglePanel(panel, btn, force) {
  const on = force !== undefined ? force : !panel.classList.contains("show");
  panel.classList.toggle("show", on);
  btn.setAttribute("aria-pressed", String(on));
}
$("#tTimer").addEventListener("click", () => togglePanel(tp, $("#tTimer")));
$("#tPick").addEventListener("click", () => togglePanel(pp, $("#tPick")));
tp.querySelector("[data-close]").addEventListener("click", () => togglePanel(tp, $("#tTimer"), false));
pp.querySelector("[data-close]").addEventListener("click", () => togglePanel(pp, $("#tPick"), false));

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input, select, textarea")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (k === "ArrowRight") { step(1); e.preventDefault(); }
  else if (k === "ArrowLeft") { step(-1); e.preventDefault(); }
  else if (k >= "1" && k <= "4" && CHAPTERS[+k - 1]) show(+k - 1, CHAPTERS[+k - 1].topics[0].id);
  else if (k === "p" || k === "P") $("#tPen").click();
  else if (k === "b" || k === "B") $("#tBoard").click();
  else if (k === "t" || k === "T") $("#tTimer").click();
  else if (k === "r" || k === "R") $("#tPick").click();
  else if (k === "f" || k === "F") toggleFull();
  else if (k === "+" || k === "=") setFont(CR.fontScale + 0.1);
  else if (k === "-" || k === "_") setFont(CR.fontScale - 0.1);
  else if (k === "Escape") {
    if (penOn) { setBoard(false); setPen(false); }
    togglePanel(tp, $("#tTimer"), false);
    togglePanel(pp, $("#tPick"), false);
  }
});

/* ---------- start ---------- */
function fromHash() {
  const [c, p] = decodeURIComponent(location.hash.slice(1)).split("/");
  const ci = CHAPTERS.findIndex(ch => ch.id === c);
  if (ci < 0) return [0, CHAPTERS[0].topics[0].id];
  return [ci, p && pagesOf(CHAPTERS[ci]).includes(p) ? p : CHAPTERS[ci].topics[0].id];
}
show(...fromHash());
window.addEventListener("hashchange", () => { const [a, b] = fromHash(); if (a !== cur.c || b !== cur.p) show(a, b); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(redrawAll);
CR.app = { show, get current() { return cur; }, get sim() { return simApi; } };
})();
