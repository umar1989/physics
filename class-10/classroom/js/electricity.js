/* ============================================================
   Chapter 11 — Electricity (simulations)
   Ideal cells and meters are assumed unless stated.
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, fmt, sci, nice, pal, line, head, label, textWidth, roundRect, circle, shade,
  pathInfo, drawFlow, onFrame, makeCanvas, controls, slider, seg, select, numInput, chipRow, chip, readouts, ncertTable } = CR;
const E_CH = 1.6e-19;

/* ---------- circuit symbols ---------- */
function zigzag(ctx, x1, y1, x2, y2, color, width = 2.4, amp = 8, n = 8) {
  const L = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  const lead = Math.min(8, L * 0.12), L2 = L - 2 * lead;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + ux * lead, y1 + uy * lead);
  for (let k = 0; k < n; k++) { const t = lead + L2 * (k + 0.5) / n, s = k % 2 ? -amp : amp; ctx.lineTo(x1 + ux * t + nx * s, y1 + uy * t + ny * s); }
  ctx.lineTo(x2 - ux * lead, y2 - uy * lead); ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
}
/* a battery of n cells drawn on a vertical wire; the long thin plate is + */
function battery(ctx, x, ym, n, color, p, showSigns = true) {
  const step = 16, h0 = (n - 1) * step + 9, top = ym - h0 / 2;
  for (let j = 0; j < n; j++) {
    const yy = top + j * step;
    line(ctx, x - 16, yy, x + 16, yy, color, 2.5);
    line(ctx, x - 8, yy + 9, x + 8, yy + 9, color, 5);
    if (j < n - 1) line(ctx, x, yy + 9, x, yy + step, color, 2);
  }
  if (showSigns) {
    label(ctx, "+", x - 24, top, { color: p.r1, size: 15, weight: 700 });
    label(ctx, "−", x - 24, top + h0, { color: p.r3, size: 15, weight: 700 });
  }
  return { top, bot: top + h0 };
}
function meter(ctx, x, y, r, letter, p) {
  circle(ctx, x, y, r, p.surface, p.text, 2);
  label(ctx, letter, x, y + 1, { color: p.text, size: r > 12 ? 15 : 12, weight: 700 });
}
/* NCERT-style plug key: two brass blocks; a dot (the plug) joins them when the key is closed */
function plugKey(ctx, x, y, closed, p, ang = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = p.text; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(-3, 0, 9, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke();
  ctx.beginPath(); ctx.arc(3, 0, 9, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
  if (closed) { ctx.fillStyle = p.text; ctx.beginPath(); ctx.arc(0, 0, 3.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
/* a bulb; brightness 0…1 */
function bulbGlyph(ctx, x, y, rb, br, p, broken = false) {
  if (broken) {
    circle(ctx, x, y, rb, p.surface2, p.soft, 1.5);
    line(ctx, x - rb * 0.55, y - rb * 0.55, x + rb * 0.55, y + rb * 0.55, p.warn, 2.5);
    line(ctx, x - rb * 0.55, y + rb * 0.55, x + rb * 0.55, y - rb * 0.55, p.warn, 2.5);
    return;
  }
  if (br > 0.01) {
    const g = ctx.createRadialGradient(x, y, rb * 0.3, x, y, rb * (1.6 + 2.6 * br));
    g.addColorStop(0, `rgba(255,205,70,${(0.85 * br).toFixed(3)})`); g.addColorStop(1, "rgba(255,205,70,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rb * (1.6 + 2.6 * br), 0, Math.PI * 2); ctx.fill();
  }
  circle(ctx, x, y, rb, br > 0 ? `rgba(255,${Math.round(235 - 40 * br)},${Math.round(160 - 110 * br)},${(0.35 + 0.6 * br).toFixed(3)})` : p.surface, p.text, 2);
  ctx.save(); ctx.strokeStyle = br > 0.05 ? "#b85c00" : p.soft; ctx.lineWidth = 1.6; ctx.beginPath();
  ctx.moveTo(x - rb * 0.6, y + rb * 0.3);
  for (let k = 0; k <= 6; k++) ctx.lineTo(x - rb * 0.6 + (k * rb * 1.2) / 6, y + (k % 2 ? -rb * 0.3 : rb * 0.1));
  ctx.stroke(); ctx.restore();
}
const brightness = P => (P > 0 ? clamp(Math.pow(P / 30, 0.4), 0.06, 1) : 0);
const unitI = I => (I === 0 ? "0 A" : Math.abs(I) < 0.1 ? `${nice(I * 1000)} mA` : `${nice(I)} A`);

/* =================================================================
   11.1–11.2 Electric current (I = Q/t) and potential difference (V = W/Q)
   ================================================================= */
CR.sims.current = function (stage, opt = {}) {
  let mode = opt.mode || "current", closed = opt.closed ?? true, show = opt.show || "current";
  let I = opt.I ?? 0.5, t = opt.t ?? 600, V = opt.V ?? 12, Q = opt.Q ?? 2;
  const cv = makeCanvas(stage, { ratio: 0.42, mratio: 0.8, alt: "An electric circuit with a cell, a bulb, an ammeter and a plug key" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["current", "Current: I = Q/t"], ["pd", "Potential difference: V = W/Q"]] }, v => { mode = v; sync(); draw(); });
  const kSeg = seg(ctl, { label: "Plug key", value: closed ? "on" : "off", options: [["on", "Closed"], ["off", "Open"]] }, v => { closed = v === "on"; draw(); });
  const fSeg = seg(ctl, { label: "Moving", value: show, options: [["current", "Conventional current"], ["e", "Electrons"]] }, v => { show = v; draw(); });
  const calc = controls(stage);
  const nI = numInput(calc, { label: "Current I", value: I, min: 0.0001, max: 1000, step: 0.1, unit: "A" }, v => { I = v; draw(); });
  const nt = numInput(calc, { label: "Time t", value: t, min: 0.001, max: 1e7, step: 1, unit: "s" }, v => { t = v; draw(); });
  const nV = numInput(calc, { label: "Potential difference V", value: V, min: 0.01, max: 100000, step: 0.5, unit: "V" }, v => { V = v; draw(); });
  const nQ = numInput(calc, { label: "Charge moved Q", value: Q, min: 0.0001, max: 1e7, step: 0.5, unit: "C" }, v => { Q = v; draw(); });
  const ro = readouts(stage);
  function sync() {
    nI.el.style.display = nt.el.style.display = mode === "current" ? "" : "none";
    nV.el.style.display = nQ.el.style.display = mode === "pd" ? "" : "none";
  }
  sync();
  let phase = 0;
  onFrame(dt => {
    const speed = closed ? (mode === "current" ? clamp(14 + 22 * Math.log10(1 + 10 * I), 6, 80) : 34) : 0;
    phase += dt * speed * (show === "e" ? -1 : 1);
    draw();
  });
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const x1 = w * 0.14, x2 = w * 0.86, y1 = H * 0.34, y2 = H * 0.82, ym = (y1 + y2) / 2, xm = (x1 + x2) / 2, wc = p.text;
    const bat = battery(ctx, x1, ym, 1, wc, p);
    const rb = clamp(H * 0.065, 13, 21);
    line(ctx, x1, bat.top, x1, y1, wc, 2.5); line(ctx, x1, y1, x2, y1, wc, 2.5);
    line(ctx, x2, y1, x2, ym - 12, wc, 2.5); line(ctx, x2, ym + 12, x2, y2, wc, 2.5);
    line(ctx, x2, y2, x1, y2, wc, 2.5); line(ctx, x1, y2, x1, bat.bot, wc, 2.5);
    const info = pathInfo([[x1, bat.top], [x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, bat.bot]]);
    if (closed) drawFlow(ctx, info, phase, 30, show === "e" ? "e" : "c", show === "e" ? p.r3 : p.r1);
    const on = closed;
    bulbGlyph(ctx, xm, y1, rb, on ? 0.75 : 0, p);
    label(ctx, "Bulb", xm, y1 + rb + 14, { color: p.soft, size: 12 });
    plugKey(ctx, x2, ym, closed, p, Math.PI / 2);
    label(ctx, "Plug key", x2 + 16, ym, { color: p.soft, size: 12, align: "left" });
    meter(ctx, xm, y2, 17, "A", p);
    if (mode === "current") label(ctx, unitI(on ? I : 0), xm, y2 - 30, { color: p.accent, size: 14, weight: 700, bg: p.surface2 });
    label(ctx, "Ammeter (in series)", xm + 24, y2 + 22, { color: p.soft, size: 12, align: "left" });
    label(ctx, "Cell", x1 + 22, ym, { color: p.soft, size: 12, align: "left" });
    if (mode === "pd") {
      const yv = y1 - H * 0.2, xa = xm - rb - 26, xb = xm + rb + 26;
      line(ctx, xa, y1, xa, yv, p.soft, 1.8); line(ctx, xb, y1, xb, yv, p.soft, 1.8);
      line(ctx, xa, yv, xm - 16, yv, p.soft, 1.8); line(ctx, xm + 16, yv, xb, yv, p.soft, 1.8);
      circle(ctx, xa, y1, 3.5, p.text); circle(ctx, xb, y1, 3.5, p.text);
      meter(ctx, xm, yv, 16, "V", p);
      label(ctx, on ? `${nice(V)} V` : "0 V", xm, yv - 28, { color: p.accent, size: 14, weight: 700, bg: p.surface2 });
      label(ctx, "Voltmeter (in parallel)", xa - 8, yv, { color: p.soft, size: 12, align: "right" });
    }
    label(ctx, show === "e" ? "Electrons move from − to + through the circuit outside the cell" : "Conventional current flows from + to − through the circuit outside the cell",
      w / 2, H - 10, { color: p.soft, size: 12 });

    if (!closed) {
      ro([
        { k: "Current", v: "None: the circuit is broken", tone: "bad" },
        { k: "Electric circuit", v: "A continuous and closed path of an electric current is called an electric circuit. With the key open the path is broken, so no current flows and the bulb does not glow.", wide: true }
      ]);
      return;
    }
    if (mode === "current") {
      const q = I * t;
      ro([
        { k: "Current I", v: unitI(I) },
        { k: "Time t", v: `${nice(t)} s` },
        { k: "Charge Q = I × t", v: `${nice(q)} C` },
        { k: "Electrons n = Q / e", v: sci(q / E_CH, 2) },
        { k: "Current", v: "Electric current is the rate of flow of charge: I = Q/t. 1 ampere is one coulomb of charge flowing per second (1 A = 1 C/s). 1 mA = 10⁻³ A, 1 µA = 10⁻⁶ A.", wide: true },
        { k: "Charge", v: "An electron has a charge of 1.6 × 10⁻¹⁹ C, so 1 coulomb is the charge of nearly 6 × 10¹⁸ electrons (1/1.6 × 10⁻¹⁹ = 6.25 × 10¹⁸).", wide: true },
        { k: "Direction and measurement", v: "Conventionally, current flows opposite to the flow of electrons. An ammeter measures current and is always connected in series.", wide: true }
      ]);
    } else {
      ro([
        { k: "Potential difference V", v: `${nice(V)} V` },
        { k: "Charge moved Q", v: `${nice(Q)} C` },
        { k: "Work done W = V × Q", v: `${nice(V * Q)} J` },
        { k: "Energy given to each coulomb", v: `${nice(V)} J` },
        { k: "Potential difference", v: "The work done to move a unit charge from one point to the other: V = W/Q. 1 volt is the potential difference when 1 joule of work is done to move 1 coulomb of charge (1 V = 1 J C⁻¹).", wide: true },
        { k: "The cell", v: "The chemical action in the cell maintains the potential difference across its terminals and sets the charges moving. To keep the current flowing, the cell spends its stored chemical energy.", wide: true },
        { k: "Measurement", v: "A voltmeter is always connected in parallel across the points between which the potential difference is measured.", wide: true }
      ]);
    }
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.closed != null) { closed = !!o.closed; kSeg.set(closed ? "on" : "off"); }
      if (o.show) { show = o.show; fSeg.set(show); }
      if (o.I != null) { I = o.I; nI.set(I); }
      if (o.t != null) { t = o.t; nt.set(t); }
      if (o.V != null) { V = o.V; nV.set(V); }
      if (o.Q != null) { Q = o.Q; nQ.set(Q); }
      draw();
    }
  };
};

/* =================================================================
   11.3 Circuit diagram: symbols of NCERT Table 11.1, with a quiz
   ================================================================= */
CR.sims.symbols = function (stage, opt = {}) {
  let mode = opt.mode || "learn", pick = -1, shown = false;
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 1.75, max: 780, alt: "Symbols of some commonly used components in circuit diagrams (NCERT Table 11.1)" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["learn", "Symbols with names"], ["quiz", "Quiz: name the symbol"]] }, v => { mode = v; pick = -1; shown = false; sync(); draw(); });
  const qRow = chipRow(stage, "Quiz");
  chip(qRow, "Next symbol", () => { let k; do { k = Math.floor(Math.random() * ITEMS.length); } while (k === pick); pick = k; shown = false; draw(); });
  chip(qRow, "Show the name", () => { shown = true; draw(); });
  const ro = readouts(stage);
  function sync() { qRow.style.display = mode === "quiz" ? "" : "none"; }
  sync();
  const W2 = (ctx, x1, y, x2, p) => line(ctx, x1, y, x2, y, p.text, 2.2);
  const ITEMS = [
    ["An electric cell", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 5, p); W2(ctx, x + 5, y, x + s, p); line(ctx, x - 5, y - 15, x - 5, y + 15, p.text, 2.4); line(ctx, x + 5, y - 8, x + 5, y + 8, p.text, 5); label(ctx, "+", x - 14, y - 18, { color: p.r1, size: 13, weight: 700 }); label(ctx, "−", x + 14, y - 18, { color: p.r3, size: 13, weight: 700 }); }],
    ["A battery or a combination of cells", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 25, p); W2(ctx, x + 25, y, x + s, p); [-20, 0, 20].forEach(d => { line(ctx, x + d - 5, y - 15, x + d - 5, y + 15, p.text, 2.4); line(ctx, x + d + 5, y - 8, x + d + 5, y + 8, p.text, 5); }); line(ctx, x - 15, y, x - 5, y, p.text, 1.5, [2, 2]); line(ctx, x + 5, y, x + 15, y, p.text, 1.5, [2, 2]); }],
    ["Plug key or switch (open)", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 12, p); W2(ctx, x + 12, y, x + s, p); plugKey(ctx, x, y, false, p); }],
    ["Plug key or switch (closed)", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 12, p); W2(ctx, x + 12, y, x + s, p); plugKey(ctx, x, y, true, p); }],
    ["A wire joint", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x + s, p); line(ctx, x, y, x, y + 24, p.text, 2.2); circle(ctx, x, y, 4.5, p.text); }],
    ["Wires crossing without joining", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x + s, p); line(ctx, x, y - 24, x, y + 24, p.text, 2.2); }],
    ["Electric bulb", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 14, p); W2(ctx, x + 14, y, x + s, p); circle(ctx, x, y, 14, null, p.text, 2.2); line(ctx, x - 9.9, y - 9.9, x + 9.9, y + 9.9, p.text, 2); line(ctx, x - 9.9, y + 9.9, x + 9.9, y - 9.9, p.text, 2); }],
    ["A resistor of resistance R", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 26, p); W2(ctx, x + 26, y, x + s, p); zigzag(ctx, x - 26, y, x + 26, y, p.text, 2.2, 8, 7); label(ctx, "R", x, y - 20, { color: p.soft, size: 12 }); }],
    ["Variable resistance or rheostat", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 26, p); W2(ctx, x + 26, y, x + s, p); zigzag(ctx, x - 26, y, x + 26, y, p.text, 2.2, 8, 7); line(ctx, x - 22, y + 16, x + 20, y - 15, p.text, 2); head(ctx, x + 23, y - 17, Math.atan2(-31, 42), 9, p.text); }],
    ["Ammeter", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 15, p); W2(ctx, x + 15, y, x + s, p); meter(ctx, x, y, 15, "A", p); label(ctx, "+", x - 22, y - 14, { color: p.r1, size: 12, weight: 700 }); label(ctx, "−", x + 22, y - 14, { color: p.r3, size: 12, weight: 700 }); }],
    ["Voltmeter", (ctx, x, y, s, p) => { W2(ctx, x - s, y, x - 15, p); W2(ctx, x + 15, y, x + s, p); meter(ctx, x, y, 15, "V", p); label(ctx, "+", x - 22, y - 14, { color: p.r1, size: 12, weight: 700 }); label(ctx, "−", x + 22, y - 14, { color: p.r3, size: 12, weight: 700 }); }]
  ];
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const cols = w >= 640 ? 4 : 2, rows = Math.ceil(ITEMS.length / cols);
    const cw = w / cols, ch = H / rows;
    ITEMS.forEach(([name, fn], k) => {
      const c = k % cols, r = Math.floor(k / cols);
      const x = c * cw + cw / 2, y = r * ch + ch * 0.42;
      const hl = mode === "quiz" && k === pick;
      ctx.save(); roundRect(ctx, c * cw + 6, r * ch + 6, cw - 12, ch - 12, 8);
      ctx.fillStyle = hl ? p.surface : "rgba(0,0,0,0)"; ctx.fill();
      ctx.strokeStyle = hl ? p.accent : p.border; ctx.lineWidth = hl ? 3 : 1; ctx.stroke(); ctx.restore();
      label(ctx, String(k + 1), c * cw + 18, r * ch + 20, { color: p.soft, size: 11 });
      fn(ctx, x, y, Math.min(cw * 0.36, 70), p);
      const showName = mode === "learn" || (hl && shown);
      const words = showName ? name : mode === "quiz" && hl ? "?" : "";
      if (words) {
        const maxW = cw - 20, size = 12;
        const parts = []; let cur = "";
        words.split(" ").forEach(wd => { const tst = cur ? cur + " " + wd : wd; if (textWidth(ctx, tst, size, 700) > maxW && cur) { parts.push(cur); cur = wd; } else cur = tst; });
        if (cur) parts.push(cur);
        parts.forEach((t, j) => label(ctx, t, x, r * ch + ch * 0.74 + j * 15, { color: hl ? p.accent : p.text, size, weight: 700 }));
      }
    });
    ro(mode === "learn" ? [
      { k: "Table 11.1", v: "Symbols of some commonly used components in circuit diagrams", wide: true },
      { k: "Remember", v: "In a cell the longer line is the positive terminal and the shorter, thicker line is the negative terminal. An ammeter is connected in series and a voltmeter in parallel.", wide: true }
    ] : [
      { k: "Quiz", v: pick < 0 ? "Press “Next symbol”. The class names the highlighted symbol, then press “Show the name”." : shown ? `It is: ${ITEMS[pick][0].toLowerCase()}.` : "Which component does the highlighted symbol stand for?", wide: true }
    ]);
  }
  return { set(o) { if (o.mode) { mode = o.mode; mSeg.set(mode); pick = -1; shown = false; sync(); } draw(); } };
};

/* =================================================================
   11.4 Ohm's law: Activity 11.1 (V–I graph), Activity 11.2 (different
   components in the gap XY), and the data of Exercise 7.
   ================================================================= */
CR.sims.ohm = function (stage, opt = {}) {
  let mode = opt.mode || "act1", cells = opt.cells ?? 2, R = opt.R ?? 4, closed = true, show = "current", comp = opt.comp || "nichrome";
  let phase = 0;
  const readings = [];
  const COMPS = [
    { id: "nichrome", name: "Nichrome wire", R: 2 }, { id: "torch", name: "Torch bulb", R: 12 },
    { id: "bulb10", name: "10 W bulb (made for 220 V)", R: 400 }, { id: "glass", name: "Glass rod", R: Infinity }
  ];
  const EX7 = [[0.5, 1.6], [1.0, 3.4], [2.0, 6.7], [3.0, 10.2], [4.0, 13.2]];
  const twin = h("div", { class: "twin" });
  stage.append(twin);
  const left = h("div"), right = h("div");
  twin.append(left, right);
  const cv = makeCanvas(left, { ratio: 0.62, mratio: 0.78, alt: "Circuit for Ohm's law" });
  const gv = makeCanvas(right, { ratio: 0.85, mratio: 0.8, max: 460, alt: "V–I graph" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["act1", "Activity 11.1: V–I graph"], ["act2", "Activity 11.2: different components"], ["ex7", "Exercise 7 data"]] }, v => { mode = v; sync(); drawAll(); });
  const sC = slider(ctl, { label: "Cells (1.5 V each)", min: 1, max: 4, step: 1, value: cells, fmt: v => `${v} → ${fmt(v * 1.5, 1)} V` }, v => { cells = v; drawAll(); });
  const sR = slider(ctl, { label: "Resistance of the nichrome wire XY", min: 1, max: 10, step: 0.5, value: R, unit: "Ω", fmt: v => fmt(v, 1) }, v => { R = v; drawAll(); });
  const kSeg = seg(ctl, { label: "Plug key", value: "on", options: [["on", "Closed"], ["off", "Open"]] }, v => { closed = v === "on"; drawAll(); });
  const fSeg = seg(ctl, { label: "Show moving", value: show, options: [["current", "Conventional current"], ["e", "Electrons"]] }, v => { show = v; });
  const cSeg = seg(ctl, { label: "In the gap XY", value: comp, options: COMPS.map(c => [c.id, c.name]) }, v => { comp = v; drawAll(); });
  const recRow = chipRow(stage, "Lab record");
  const recBtn = chip(recRow, "Record this reading", () => {
    if (!closed) return;
    const V = cells * 1.5, I = V / R;
    const ix = readings.findIndex(r => r.R === R && r.V === V);
    if (ix >= 0) readings.splice(ix, 1);
    readings.push({ R, V, I });
    drawAll();
  });
  chip(recRow, "Record all four", () => { for (let c = 1; c <= 4; c++) { const V = c * 1.5; const ix = readings.findIndex(r => r.R === R && r.V === V); if (ix >= 0) readings.splice(ix, 1); readings.push({ R, V, I: V / R }); } drawAll(); });
  chip(recRow, "Clear graph", () => { readings.length = 0; drawAll(); });
  const tbl = h("div");
  stage.append(tbl);
  const ro = readouts(stage);
  function sync() {
    const a1 = mode === "act1", a2 = mode === "act2", e7 = mode === "ex7";
    sC.el.style.display = sR.el.style.display = recRow.style.display = a1 ? "" : "none";
    kSeg.el.style.display = fSeg.el.style.display = e7 ? "none" : "";
    cSeg.el.style.display = a2 ? "" : "none";
    right.style.display = a2 ? "none" : "";
    twin.style.gridTemplateColumns = a2 ? "minmax(0,1fr)" : "";
    tbl.style.display = e7 ? "" : "none";
  }
  if (!tbl.childNodes.length) {
    ncertTable(tbl, { caption: "Exercise 7: current I through a resistor for each potential difference V", head: ["I (ampere)", "V (volt)", "V / I (ohm)"], rows: EX7.map(([i, v]) => [fmt(i, 1), fmt(v, 1), fmt(v / i, 2)]) });
  }
  sync();
  const values = () => {
    if (mode === "act2") { const c = COMPS.find(x => x.id === comp); const V = 6; return { V, I: closed && isFinite(c.R) ? V / c.R : 0, Rc: c.R, VR: V }; }
    const V = cells * 1.5, I = closed ? V / R : 0;
    return { V, I, VR: I * R };
  };
  onFrame(dt => { if (mode === "ex7") return; const { I } = values(); phase += dt * clamp(30 * Math.sqrt(I), 0, 60) * (show === "e" ? -1 : 1); drawCircuit(); });
  cv.draw = drawCircuit; gv.draw = drawGraph;
  function drawAll() { drawCircuit(); drawGraph(); }

  function drawCircuit() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "ex7") return drawEx7Note(ctx, w, H, p);
    const x1 = w * 0.12, x2 = w * 0.88, y1 = H * 0.2, y2 = H * 0.84, ym = (y1 + y2) / 2, cxm = (x1 + x2) / 2, wc = p.text;
    const { V, I, VR } = values();
    const nc = mode === "act2" ? 4 : cells;
    const bat = battery(ctx, x1, ym, nc, wc, p);
    const xa = cxm - w * 0.13, xb = cxm + w * 0.13;
    line(ctx, x1, bat.top, x1, y1, wc, 2.5); line(ctx, x1, y1, xa, y1, wc, 2.5); line(ctx, xb, y1, x2, y1, wc, 2.5);
    line(ctx, x2, y1, x2, ym - 12, wc, 2.5); line(ctx, x2, ym + 12, x2, y2, wc, 2.5);
    line(ctx, x2, y2, cxm + 17, y2, wc, 2.5); line(ctx, cxm - 17, y2, x1, y2, wc, 2.5); line(ctx, x1, y2, x1, bat.bot, wc, 2.5);
    label(ctx, `${fmt(V, 1)} V`, x1 + 22, ym, { color: p.text, size: 13, align: "left" });
    const info = pathInfo([[x1, bat.top], [x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, bat.bot]]);
    if (I > 0) drawFlow(ctx, info, phase, 26, show === "e" ? "e" : "c", show === "e" ? p.r3 : p.r1);
    ctx.fillStyle = p.surface2; ctx.fillRect(xa + 2, y1 - 16, xb - xa - 4, 32);
    circle(ctx, xa, y1, 3.5, wc); circle(ctx, xb, y1, 3.5, wc);
    label(ctx, "X", xa, y1 - 16, { color: p.soft, size: 12 });
    label(ctx, "Y", xb, y1 - 16, { color: p.soft, size: 12 });
    if (mode === "act1") {
      zigzag(ctx, xa, y1, xb, y1, p.img, 2.5, 9, 8);
      label(ctx, `Nichrome wire, R = ${fmt(R, 1)} Ω`, cxm, y1 - 26, { color: p.img, size: 13, weight: 700 });
    } else {
      const c = COMPS.find(x => x.id === comp);
      if (c.id === "nichrome") { ctx.save(); ctx.strokeStyle = p.img; ctx.lineWidth = 2.5; ctx.beginPath(); for (let k = 0; k <= 60; k++) { const t = k / 60, x = lerp(xa, xb, t); const y = y1 + 7 * Math.sin(t * Math.PI * 14); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
      else if (c.id === "glass") { ctx.save(); ctx.fillStyle = p.dark ? "rgba(170,210,255,0.35)" : "rgba(120,170,220,0.35)"; roundRect(ctx, xa + 4, y1 - 6, xb - xa - 8, 12, 6); ctx.fill(); ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
      else {
        line(ctx, xa, y1, cxm - 14, y1, wc, 2.5); line(ctx, cxm + 14, y1, xb, y1, wc, 2.5);
        bulbGlyph(ctx, cxm, y1, c.id === "torch" ? 13 : 17, closed ? brightness(I * I * c.R * (c.id === "torch" ? 4 : 1)) : 0, p);
      }
      label(ctx, c.name, cxm, y1 - 30, { color: p.img, size: 13, weight: 700 });
    }
    plugKey(ctx, x2, ym, closed, p, Math.PI / 2);
    label(ctx, "Key", x2 + 14, ym + 22, { color: p.soft, size: 12, align: "left" });
    if (mode === "act1") {
      const yv = y1 + (y2 - y1) * 0.38;
      line(ctx, xa, y1, xa, yv, p.soft, 1.8); line(ctx, xb, y1, xb, yv, p.soft, 1.8);
      line(ctx, xa, yv, cxm - 17, yv, p.soft, 1.8); line(ctx, cxm + 17, yv, xb, yv, p.soft, 1.8);
      meter(ctx, cxm, yv, 17, "V", p);
      label(ctx, `${fmt(VR, 2)} V`, cxm, yv + 30, { color: p.accent, size: 14, weight: 700 });
    }
    meter(ctx, cxm, y2, 17, "A", p);
    label(ctx, `${fmt(I, mode === "act2" && I > 0 && I < 0.1 ? 3 : 2)} A`, cxm, y2 - 30, { color: p.accent, size: 14, weight: 700 });
    label(ctx, show === "e" ? "Electrons flow from − to + outside the cells" : "Conventional current flows from + to − outside the cells", w / 2, H - 10, { color: p.soft, size: 12 });

    if (mode === "act1") {
      recBtn.disabled = !closed;
      ro([
        { k: "Voltmeter V", v: `${fmt(VR, 2)} V` },
        { k: "Ammeter I", v: `${fmt(I, 2)} A` },
        { k: "V ÷ I", v: I > 0 ? `${fmt(VR / I, 2)} Ω` : "—" },
        { k: "Readings recorded", v: String(readings.length) },
        { k: "Ohm's law", v: "The potential difference V across the ends of a metallic wire is directly proportional to the current I through it, provided its temperature remains the same: V ∝ I, V/I = R, V = IR. The V–I graph is a straight line through the origin.", wide: true },
        { k: "Unit", v: "If the potential difference across a conductor is 1 V and the current through it is 1 A, its resistance is 1 Ω (1 ohm = 1 volt / 1 ampere). I = V/R: doubling the resistance halves the current.", wide: true }
      ]);
    } else {
      const c = COMPS.find(x => x.id === comp);
      ro([
        { k: "In the gap XY", v: c.name },
        { k: "Ammeter reading", v: closed ? `${fmt(I, I > 0 && I < 0.1 ? 3 : 2)} A` : "0 A (key open)" },
        { k: "Its resistance (about)", v: isFinite(c.R) ? `${c.R} Ω` : "Very large: an insulator" },
        { k: "What it shows", v: "The current is different for different components. Some offer an easy path for the current while others resist it. Electrons are not completely free to move in a conductor: they are held back by the attraction of the atoms among which they move. This is resistance.", wide: true },
        { k: "Names", v: "A component of a given size that offers low resistance is a good conductor. A conductor with appreciable resistance is a resistor. One of the same size with higher resistance is a poor conductor, and an insulator offers even higher resistance. (Values here are typical; always take the key out after reading the ammeter.)", wide: true }
      ]);
    }
  }
  function drawEx7Note(ctx, w, H, p) {
    label(ctx, "Exercise 7", 14, 22, { color: p.text, size: 15, weight: 700, align: "left" });
    const lines = ["Plot V on the y-axis and I on the x-axis.", "The points lie close to a straight line", "through the origin, so V ∝ I (Ohm's law).", "", "Resistance = slope of the line = V / I."];
    lines.forEach((t, j) => label(ctx, t, 14, 56 + j * 22, { color: p.soft, size: 13, align: "left" }));
    const s = EX7.reduce((a, [i, v]) => a + i * v, 0) / EX7.reduce((a, [i]) => a + i * i, 0);
    label(ctx, `Best straight line: R ≈ ${fmt(s, 2)} Ω`, 14, 56 + lines.length * 22 + 14, { color: p.accent, size: 15, weight: 700, align: "left" });
    ro([
      { k: "Slope of the best line through the origin", v: `${fmt(s, 2)} Ω` },
      { k: "Answer", v: "The resistance is about 3.3–3.4 Ω. (Each V/I is between 3.2 and 3.4 Ω; the slope of the best straight line gives 3.34 Ω.)", wide: true }
    ]);
  }
  function drawGraph() {
    const { ctx, w, h: H } = gv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const ml = 46, mb = 40, mt = 30, mr = 14, pw = w - ml - mr, ph = H - mt - mb;
    const ex7 = mode === "ex7";
    const { I: Inow, VR: Vnow } = values();
    let Imax, Vmax;
    if (ex7) { Imax = 4.5; Vmax = 15; }
    else {
      const steps = [0.5, 1, 1.5, 2, 3, 4, 5, 6];
      const need = Math.max(0.5, Inow, ...readings.map(r => r.I));
      Imax = steps.find(s => s >= need - 1e-9) || 6; Vmax = 6;
    }
    const X = i => ml + (i / Imax) * pw, Y = v => mt + ph - (v / Vmax) * ph;
    label(ctx, "V–I graph (slope = R)", ml, 14, { color: p.text, size: 13, align: "left", weight: 700 });
    const vstep = ex7 ? 3 : 1;
    for (let v = 0; v <= Vmax + 1e-9; v += vstep) { line(ctx, ml, Y(v), ml + pw, Y(v), p.border, 1); label(ctx, String(v), ml - 8, Y(v), { color: p.soft, size: 11, align: "right" }); }
    const istep = Imax <= 1 ? 0.25 : Imax <= 2 ? 0.5 : 1;
    for (let i = 0; i <= Imax + 1e-9; i += istep) { line(ctx, X(i), mt, X(i), mt + ph, p.border, 1); label(ctx, String(+i.toFixed(2)), X(i), mt + ph + 13, { color: p.soft, size: 11 }); }
    line(ctx, ml, mt + ph, ml + pw, mt + ph, p.text, 2); line(ctx, ml, mt, ml, mt + ph, p.text, 2);
    label(ctx, "Current I (ampere) →", ml + pw, H - 6, { color: p.soft, size: 12, align: "right", base: "bottom" });
    ctx.save(); ctx.translate(12, mt + ph / 2); ctx.rotate(-Math.PI / 2); label(ctx, "Potential difference V (volt) →", 0, 0, { color: p.soft, size: 12 }); ctx.restore();
    if (ex7) {
      const s = EX7.reduce((a, [i, v]) => a + i * v, 0) / EX7.reduce((a, [i]) => a + i * i, 0);
      line(ctx, X(0), Y(0), X(Imax), Y(s * Imax), p.r1, 2);
      EX7.forEach(([i, v]) => circle(ctx, X(i), Y(v), 5, p.r3, p.surface, 1.5));
      label(ctx, `slope ≈ ${fmt(s, 2)} Ω`, X(Imax * 0.55) - 8, Y(s * Imax * 0.55) - 14, { color: p.r1, size: 12, align: "right", weight: 700, bg: p.surface });
      return;
    }
    const COL = ["r1", "r3", "r2", "beam", "accent", "img"];
    [...new Set(readings.map(r => r.R))].forEach((Rg, gi) => {
      const col = p[COL[gi % COL.length]], pts = readings.filter(r => r.R === Rg);
      if (pts.length >= 2) {
        const iEnd = Math.min(Imax, Vmax / Rg);
        line(ctx, X(0), Y(0), X(iEnd), Y(Rg * iEnd), col, 2);
        label(ctx, `R = ${fmt(Rg, 1)} Ω`, X(iEnd * 0.62) - 8, Y(Rg * iEnd * 0.62) - 12, { color: col, size: 12, align: "right", weight: 700, bg: p.surface });
      }
      pts.forEach(r => circle(ctx, X(r.I), Y(r.V), 5, col, p.surface, 1.5));
    });
    if (Inow > 0) circle(ctx, X(Inow), Y(Vnow), 7, null, p.text, 2);
    if (!readings.length) label(ctx, "Press “Record this reading”", ml + pw / 2, mt + 16, { color: p.soft, size: 13, bg: p.surface2 });
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.cells != null) { cells = o.cells; sC.value = cells; }
      if (o.R != null) { R = o.R; sR.value = R; }
      if (o.comp) { comp = o.comp; cSeg.set(comp); }
      if (o.record) { readings.length = 0; for (let c = 1; c <= 4; c++) readings.push({ R, V: c * 1.5, I: c * 1.5 / R }); }
      closed = true; kSeg.set("on");
      drawAll();
    }
  };
};

/* =================================================================
   11.5 Resistance of a conductor: Activity 11.3 and R = ρl/A
   Resistivity at 20 °C. Metals: as in NCERT Table 11.2. The table
   prints the alloys as 49, 44 and 100 × 10⁻⁶ Ω m; measured values are
   about 100 times smaller, and those are used in the calculation.
   ================================================================= */
const MATS = [
  { id: "ag", name: "Silver", rho: 1.60e-8, col: "#c9ced6" }, { id: "cu", name: "Copper", rho: 1.62e-8, col: "#c8743c" },
  { id: "al", name: "Aluminium", rho: 2.63e-8, col: "#a9b2bc" }, { id: "w", name: "Tungsten", rho: 5.20e-8, col: "#80889a" },
  { id: "ni", name: "Nickel", rho: 6.84e-8, col: "#9a9486" }, { id: "fe", name: "Iron", rho: 10.0e-8, col: "#77706a" },
  { id: "cr", name: "Chromium", rho: 12.9e-8, col: "#b9c0c8" }, { id: "hg", name: "Mercury", rho: 94.0e-8, col: "#c7ccd2" },
  { id: "mn", name: "Manganese", rho: 1.84e-6, col: "#8d8f93" },
  { id: "con", name: "Constantan", rho: 4.9e-7, col: "#b8935a", ncert: "49 × 10⁻⁶" },
  { id: "man", name: "Manganin", rho: 4.4e-7, col: "#a8865a", ncert: "44 × 10⁻⁶" },
  { id: "nic", name: "Nichrome", rho: 1.0e-6, col: "#938d82", ncert: "100 × 10⁻⁶" },
  { id: "custom", name: "Your value of ρ", rho: 1.6e-8, col: "#c8743c" }
];
const T112 = {
  caption: "Table 11.2  Electrical resistivity of some substances at 20 °C",
  head: ["", "Material", "Resistivity (Ω m)"],
  rows: [
    ["Conductors", "Silver", "1.60 × 10⁻⁸"], ["", "Copper", "1.62 × 10⁻⁸"], ["", "Aluminium", "2.63 × 10⁻⁸"], ["", "Tungsten", "5.20 × 10⁻⁸"],
    ["", "Nickel", "6.84 × 10⁻⁸"], ["", "Iron", "10.0 × 10⁻⁸"], ["", "Chromium", "12.9 × 10⁻⁸"], ["", "Mercury", "94.0 × 10⁻⁸"], ["", "Manganese", "1.84 × 10⁻⁶"],
    ["Alloys", "Constantan (alloy of Cu and Ni)", "49 × 10⁻⁶"], ["", "Manganin (alloy of Cu, Mn and Ni)", "44 × 10⁻⁶"], ["", "Nichrome (alloy of Ni, Cr, Mn and Fe)", "100 × 10⁻⁶"],
    ["Insulators", "Glass", "10¹⁰ – 10¹⁴"], ["", "Hard rubber", "10¹³ – 10¹⁶"], ["", "Ebonite", "10¹⁵ – 10¹⁷"], ["", "Diamond", "10¹² – 10¹³"], ["", "Paper (dry)", "10¹²"]
  ],
  note: "As printed in NCERT. The printed alloy values look 100 times too large: measured values are about 0.49, 0.44 and 1.0 × 10⁻⁶ Ω m, and this page calculates with those. Use the textbook values in exam answers."
};
CR.sims.resistivity = function (stage, opt = {}) {
  let mode = opt.mode || "act", wire = opt.wire ?? 1, mat = opt.mat || "nic", L = opt.L ?? 1, d = opt.d ?? 0.5, rhoC = opt.rho ?? 1.6;
  // Activity 11.3: wires (1) to (4), with one cell of 1.5 V
  const WIRES = [null, { mat: "nic", L: 1, d: 0.2, name: "(1) nichrome, length l" }, { mat: "nic", L: 2, d: 0.2, name: "(2) nichrome, length 2l" },
    { mat: "nic", L: 1, d: 0.4, name: "(3) thicker nichrome, length l" }, { mat: "cu", L: 1, d: 0.2, name: "(4) copper, same size as (1)" }];
  const cv = makeCanvas(stage, { ratio: 0.36, mratio: 0.75, min: 200, alt: "A wire in a circuit with a cell and an ammeter" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["act", "Activity 11.3"], ["free", "Any wire: R = ρl/A"]] }, v => { mode = v; sync(); draw(); });
  const wSeg = seg(ctl, { label: "Wire in the circuit", value: String(wire), options: [["1", "(1) Nichrome, l"], ["2", "(2) Nichrome, 2l"], ["3", "(3) Thicker nichrome"], ["4", "(4) Copper"]] }, v => { wire = +v; draw(); });
  const mSel = select(ctl, { label: "Material", options: MATS.map(m => [m.id, m.name]), value: mat }, v => { mat = v; syncC(); draw(); });
  const nRho = numInput(ctl, { label: "ρ (× 10⁻⁸ Ω m)", value: rhoC, min: 0.01, max: 1e6, step: 0.01 }, v => { rhoC = v; draw(); });
  const nL = numInput(ctl, { label: "Length l", value: L, min: 0.01, max: 1000, step: 0.1, unit: "m" }, v => { L = v; draw(); });
  const nD = numInput(ctl, { label: "Diameter d", value: d, min: 0.01, max: 20, step: 0.05, unit: "mm" }, v => { d = v; draw(); });
  const ro = readouts(stage);
  const tbl = ncertTable(h("div"), T112);
  stage.append(tbl.el);
  function syncC() { nRho.el.style.display = mode === "free" && mat === "custom" ? "" : "none"; }
  function sync() {
    wSeg.el.style.display = mode === "act" ? "" : "none";
    mSel.el.style.display = nL.el.style.display = nD.el.style.display = mode === "free" ? "" : "none";
    syncC();
  }
  sync();
  const rhoOf = id => (id === "custom" ? rhoC * 1e-8 : MATS.find(m => m.id === id).rho);
  const area = dd => Math.PI * Math.pow(dd * 1e-3, 2) / 4;
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const cur = mode === "act" ? WIRES[wire] : { mat, L, d };
    const m = MATS.find(x => x.id === cur.mat), rho = rhoOf(cur.mat), A = area(cur.d), R = rho * cur.L / A;
    const rowIx = T112.rows.findIndex(r => r[1].startsWith(m.name));
    tbl.highlight(rowIx);
    // circuit (Activity 11.3) or the wire alone
    const x1 = w * 0.07, x2 = w * 0.93, yW = H * 0.34, yB = H * 0.84, ym = (yW + yB) / 2, wc = p.text;
    const maxLen = x2 - x1 - 80;
    const len = mode === "act" ? maxLen * (cur.L / 2) : clamp(maxLen * (0.25 + 0.75 * Math.min(1, Math.log10(1 + cur.L) / Math.log10(201))), 40, maxLen);
    const xs = (x1 + x2) / 2 - len / 2, xe = xs + len, th = clamp(4 + cur.d * (mode === "act" ? 34 : 22), 4, 30);
    if (mode === "act") {
      const bat = battery(ctx, x1, ym, 1, wc, p);
      line(ctx, x1, bat.top, x1, yW, wc, 2.5); line(ctx, x1, yW, xs, yW, wc, 2.5); line(ctx, xe, yW, x2, yW, wc, 2.5);
      line(ctx, x2, yW, x2, ym - 12, wc, 2.5); line(ctx, x2, ym + 12, x2, yB, wc, 2.5);
      line(ctx, x2, yB, (x1 + x2) / 2 + 17, yB, wc, 2.5); line(ctx, (x1 + x2) / 2 - 17, yB, x1, yB, wc, 2.5); line(ctx, x1, yB, x1, bat.bot, wc, 2.5);
      plugKey(ctx, x2, ym, true, p, Math.PI / 2);
      meter(ctx, (x1 + x2) / 2, yB, 17, "A", p);
      const I = 1.5 / R;
      label(ctx, unitI(I), (x1 + x2) / 2, yB - 30, { color: p.accent, size: 15, weight: 700, bg: p.surface2 });
      label(ctx, "1.5 V", x1 + 22, ym, { color: p.text, size: 12, align: "left" });
    }
    const g = ctx.createLinearGradient(0, yW - th / 2, 0, yW + th / 2);
    g.addColorStop(0, shade(m.col, -0.35)); g.addColorStop(0.35, shade(m.col, 0.45)); g.addColorStop(0.6, m.col); g.addColorStop(1, shade(m.col, -0.45));
    ctx.fillStyle = g; ctx.fillRect(xs, yW - th / 2, len, th);
    ctx.fillStyle = p.text; ctx.fillRect(xs - 8, yW - 9, 8, 18); ctx.fillRect(xe, yW - 9, 8, 18);
    line(ctx, xs, yW - th / 2 - 14, xe, yW - th / 2 - 14, p.soft, 1.3);
    head(ctx, xe, yW - th / 2 - 14, 0, 7, p.soft); head(ctx, xs, yW - th / 2 - 14, Math.PI, 7, p.soft);
    label(ctx, mode === "act" ? (cur.L === 2 ? "2l" : "l") : `l = ${nice(cur.L)} m`, (xs + xe) / 2, yW - th / 2 - 26, { color: p.text, size: 13, weight: 700, bg: p.surface2 });
    label(ctx, mode === "act" ? cur.name : `${m.name} wire, d = ${nice(cur.d)} mm`, (xs + xe) / 2, yW + th / 2 + 16, { color: p.soft, size: 12 });
    label(ctx, `R = ${nice(R)} Ω`, w - 12, 18, { color: p.accent, size: 17, weight: 700, align: "right" });
    label(ctx, "Thickness not to scale", 10, H - 10, { color: p.soft, size: 11, align: "left" });

    const rhoTxt = cur.mat === "custom" ? `${nice(rhoC)} × 10⁻⁸ Ω m` : m.ncert ? `${sci(rho, 2)} Ω m (NCERT prints ${m.ncert})` : `${sci(rho, 2)} Ω m`;
    if (mode === "act") {
      const R1 = rhoOf("nic") * 1 / area(0.2);
      ro([
        { k: "Wire", v: cur.name },
        { k: "Ammeter (one cell, 1.5 V)", v: unitI(1.5 / R) },
        { k: "Resistance R = ρl/A", v: `${nice(R)} Ω` },
        { k: "Compared with wire (1)", v: wire === 1 ? "—" : `current is ${nice(R1 / R)} times` },
        { k: "What is observed", v: "Doubling the length halves the ammeter reading. A thicker wire of the same material and length gives a larger current. A wire of a different material of the same size gives a different current. So the resistance depends on the length, the area of cross-section and the material.", wide: true },
        { k: "Result", v: "R ∝ l and R ∝ 1/A, so R = ρ l/A. ρ (rho), the electrical resistivity, is a characteristic property of the material; its SI unit is Ω m.", wide: true }
      ]);
    } else {
      ro([
        { k: "Resistivity ρ (20 °C)", v: rhoTxt, wide: !!m.ncert },
        { k: "Area A = πd²/4", v: `${sci(A, 3)} m²` },
        { k: "R = ρl / A", v: `${nice(R)} Ω` },
        { k: "Working", v: `R = ρl/A = (${sci(rho, 3)} Ω m × ${nice(cur.L)} m) ÷ ${sci(A, 3)} m² = ${nice(R)} Ω`, wide: true },
        { k: "Remember", v: "Resistance and resistivity both vary with temperature. Metals and alloys have very low resistivity (10⁻⁸ to 10⁻⁶ Ω m); insulators such as rubber and glass have 10¹² to 10¹⁷ Ω m. The resistivity of an alloy is generally higher than that of its constituent metals.", wide: true }
      ]);
    }
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.wire != null) { wire = o.wire; wSeg.set(String(wire)); }
      if (o.mat) { mat = o.mat; mSel.set(mat); syncC(); }
      if (o.rho != null) { rhoC = o.rho; nRho.set(rhoC); }
      if (o.L != null) { L = o.L; nL.set(L); }
      if (o.d != null) { d = o.d; nD.set(d); }
      draw();
    }
  };
};

/* =================================================================
   11.6 Resistors in series, in parallel, and two parallel groups in
   series (Example 11.9). Drawn as resistors or as bulbs.
   ================================================================= */
CR.sims.circuits = function (stage, opt = {}) {
  let mode = opt.mode || "series", n = opt.n ?? 3, nA = opt.nA ?? 2, nB = opt.nB ?? 3, V = opt.V ?? 6, view = opt.view || "R";
  let amm = opt.amm ?? 0, vm = opt.vm ?? "all";
  const R = [1, 2, 3, 4, 5].map((x, k) => (opt.R && opt.R[k] != null ? opt.R[k] : [1, 2, 3, 4, 5][k]));
  const out = [false, false, false, false, false, false];
  const phases = [];
  const cv = makeCanvas(stage, { ratio: 0.44, mratio: 0.9, alt: "Resistors connected in series or in parallel" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Connection", value: mode, options: [["series", "Series"], ["parallel", "Parallel"], ["combo", "Two groups in series"]] }, v => { mode = v; resetOut(); syncAll(); });
  const nSeg = seg(ctl, { label: "Resistors", value: String(n), options: [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]] }, v => { n = +v; if (mode === "parallel" && n > 4) n = 4; resetOut(); syncAll(); });
  const aSeg = seg(ctl, { label: "First group (parallel)", value: String(nA), options: [["1", "1"], ["2", "2"], ["3", "3"]] }, v => { nA = +v; resetOut(); syncAll(); });
  const bSeg = seg(ctl, { label: "Second group (parallel)", value: String(nB), options: [["1", "1"], ["2", "2"], ["3", "3"]] }, v => { nB = +v; resetOut(); syncAll(); });
  const vSeg = seg(ctl, { label: "Show as", value: view, options: [["R", "Resistors"], ["bulb", "Bulbs"]] }, v => { view = v; syncAll(); });
  const vals = controls(stage);
  const nV = numInput(vals, { label: "Battery V", value: V, min: 0.1, max: 1000, step: 0.5, unit: "V" }, v => { V = v; update(); });
  const nR = R.map((r, k) => numInput(vals, { label: `R${k + 1}`, value: r, min: 0.01, max: 1e7, step: 1, unit: "Ω" }, v => { R[k] = v; update(); }));
  const meters = controls(stage);
  const ammSeg = seg(meters, { label: "Move the ammeter (Activity 11.4)", value: String(amm), options: [] }, v => { amm = +v; update(); });
  const vmSeg = seg(meters, { label: "Voltmeter across (Activity 11.5)", value: vm, options: [] }, v => { vm = v; update(); });
  const outRow = chipRow(stage, "Take out");
  let outBtns = [];
  const ro = readouts(stage);
  function count() { return mode === "combo" ? nA + nB : mode === "parallel" ? Math.min(n, 4) : n; }
  function resetOut() { out.fill(false); }
  function rebuildSeg(segObj, options, value) {
    const g = segObj.el.querySelector(".seg");
    g.replaceChildren();
    segObj.btns.length = 0;
    options.forEach(([v, t]) => {
      const b = h("button", { type: "button", "aria-pressed": String(String(v) === String(value)) }, t);
      b.dataset.v = String(v);
      b.addEventListener("click", () => { segObj.set(v); if (segObj === ammSeg) { amm = +v; } else { vm = String(v); } update(); });
      g.append(b); segObj.btns.push(b);
    });
  }
  function syncAll() {
    const N = count();
    mSeg.set(mode);
    nSeg.el.style.display = mode === "combo" ? "none" : "";
    nSeg.btns.forEach(b => (b.style.display = mode === "parallel" && b.dataset.v === "5" ? "none" : ""));
    nSeg.set(String(Math.min(n, mode === "parallel" ? 4 : 5)));
    aSeg.el.style.display = bSeg.el.style.display = mode === "combo" ? "" : "none";
    nR.forEach((x, k) => (x.el.style.display = k < N ? "" : "none"));
    meters.style.display = mode === "series" ? "" : "none";
    if (mode === "series") {
      if (amm > N) amm = 0;
      const ao = [["0", "Start"]];
      for (let k = 1; k < N; k++) ao.push([String(k), `R${k}–R${k + 1}`]);
      ao.push([String(N), "End"]);
      rebuildSeg(ammSeg, ao, amm);
      const vo = [["all", "All the resistors"], ["bat", "The battery"]];
      for (let k = 0; k < N; k++) vo.push([String(k), `R${k + 1}`]);
      if (vm !== "all" && vm !== "bat" && +vm >= N) vm = "all";
      rebuildSeg(vmSeg, vo, vm);
    }
    outRow.replaceChildren(h("span", { class: "presets-label" }, "Take out"));
    outBtns = [];
    for (let k = 0; k < N; k++) {
      const b = chip(outRow, view === "bulb" ? `Bulb ${k + 1}` : `R${k + 1}`, () => { out[k] = !out[k]; b.setAttribute("aria-pressed", String(out[k])); update(); }, out[k]);
      outBtns.push(b);
    }
    phases.length = 0;
    update();
  }
  function solve() {
    const N = count(), act = k => !out[k];
    const el = Array.from({ length: N }, (_, k) => ({ R: R[k], on: act(k), I: 0, V: 0, P: 0 }));
    let Req, I, groups = null;
    if (mode === "series") {
      Req = el.reduce((a, e) => a + e.R, 0);
      I = el.some(e => !e.on) ? 0 : V / Req;
      el.forEach(e => { e.I = I; e.V = I * e.R; e.P = I * I * e.R; });
      if (I === 0) el.forEach(e => { e.V = 0; });
    } else if (mode === "parallel") {
      const on = el.filter(e => e.on);
      Req = on.length ? 1 / on.reduce((a, e) => a + 1 / e.R, 0) : Infinity;
      el.forEach(e => { if (e.on) { e.V = V; e.I = V / e.R; e.P = V * V / e.R; } });
      I = el.reduce((a, e) => a + e.I, 0);
    } else {
      const gA = el.slice(0, nA), gB = el.slice(nA);
      const par = g => { const on = g.filter(e => e.on); return on.length ? 1 / on.reduce((a, e) => a + 1 / e.R, 0) : Infinity; };
      const RA = par(gA), RB = par(gB);
      Req = RA + RB;
      I = isFinite(Req) ? V / Req : 0;
      const VA = I * (isFinite(RA) ? RA : 0), VB = I * (isFinite(RB) ? RB : 0);
      gA.forEach(e => { if (e.on && I > 0) { e.V = VA; e.I = VA / e.R; e.P = e.V * e.I; } });
      gB.forEach(e => { if (e.on && I > 0) { e.V = VB; e.I = VB / e.R; e.P = e.V * e.I; } });
      groups = { RA, RB, VA, VB };
    }
    return { N, el, Req, I, groups };
  }

  // geometry: wires (with the current each carries), elements and meters
  function layout(w, H, s) {
    const bx = w * 0.08, xR = w * 0.94, G = { wires: [], elems: [], meters: [], extra: [] };
    if (mode === "series") {
      const yT = H * 0.34, yB = H * 0.86, ym = (yT + yB) / 2, N = s.N;
      const x0 = bx + w * 0.13, x1 = xR - w * 0.09;
      const sp = N > 1 ? (x1 - x0) / (N - 1) : 0, hw = clamp(Math.min(sp * 0.32, (x1 - x0) / (2 * N)), 14, 36);
      const xs = Array.from({ length: N }, (_, k) => (N === 1 ? (x0 + x1) / 2 : x0 + sp * k));
      Object.assign(G, { bx, xR, yT, yB, ym, xs, hw, orient: "h" });
      xs.forEach((x, k) => G.elems.push({ k, x, y: yT, h: true, hw }));
      const gx = gIdx => (gIdx === 0 ? (bx + xs[0] - hw) / 2 : gIdx === N ? (xs[N - 1] + hw + xR) / 2 : (xs[gIdx - 1] + xs[gIdx]) / 2);
      const gapW = gIdx => (gIdx === 0 ? xs[0] - hw - bx : gIdx === N ? xR - xs[N - 1] - hw : sp - 2 * hw);
      G.meters.push({ t: "A", x: gx(amm), y: yT, r: clamp(gapW(amm) / 2 - 4, 8, 15), val: s.I });
      G.key = { x: xR, y: ym, ang: Math.PI / 2 };
      G.wires.push({ pts: [[bx, 0], [bx, yT], [xR, yT], [xR, yB], [bx, yB], [bx, 1]], I: s.I, battery: true });
    } else if (mode === "parallel") {
      const yT = H * 0.17, yB = H * 0.86, ym = (yT + yB) / 2, N = s.N;
      const x0 = bx + w * 0.24, x1 = xR - w * 0.16;
      const xs = Array.from({ length: N }, (_, k) => (N === 1 ? (x0 + x1) / 2 : lerp(x0, x1, k / (N - 1))));
      const hw = clamp((yB - yT) * 0.2, 18, 46);
      Object.assign(G, { bx, xR, yT, yB, ym, xs, hw });
      xs.forEach((x, k) => G.elems.push({ k, x, y: ym + 6, h: false, hw }));
      G.meters.push({ t: "A", x: (bx + xs[0]) / 2, y: yB, r: 15, val: s.I });
      xs.forEach((x, k) => G.meters.push({ t: "A", x, y: (yT + ym + 6 - hw) / 2, r: 11, val: s.el[k].I, small: true }));
      G.key = { x: (bx + xs[0]) / 2, y: yT, ang: 0 };
      const xv = Math.min(xR - 18, xs[N - 1] + Math.max(40, (xR - xs[N - 1]) * 0.6));
      G.meters.push({ t: "V", x: xv, y: ym, r: 15, val: s.I > 0 || s.el.some(e => e.on) ? V : V, lead: [xs[N - 1], yT, yB] });
      const suffix = k => s.el.slice(k).reduce((a, e) => a + e.I, 0);
      G.wires.push({ pts: [[bx, 0], [bx, yT], [xs[0], yT]], I: s.I, battery: true, part: "top" });
      for (let k = 0; k < N - 1; k++) G.wires.push({ pts: [[xs[k], yT], [xs[k + 1], yT]], I: suffix(k + 1) });
      xs.forEach((x, k) => G.wires.push({ pts: [[x, yT], [x, yB]], I: s.el[k].I }));
      for (let k = N - 2; k >= 0; k--) G.wires.push({ pts: [[xs[k + 1], yB], [xs[k], yB]], I: suffix(k + 1) });
      G.wires.push({ pts: [[xs[0], yB], [bx, yB], [bx, 1]], I: s.I, battery: true, part: "bot" });
    } else {
      const yT = H * 0.42, yB = H * 0.9, ym = (yT + yB) / 2;
      const xA = lerp(bx, xR, 0.36), xB = lerp(bx, xR, 0.72), bw = Math.min(w * 0.2, 170), dy = Math.min(H * 0.17, 66);
      Object.assign(G, { bx, xR, yT, yB, ym });
      const block = (xc, m, off, Ig) => {
        const a1 = xc - bw / 2, a2 = xc + bw / 2, ys = Array.from({ length: m }, (_, j) => yT + (j - (m - 1) / 2) * dy);
        if (m > 1) { G.extra.push([a1, ys[0], a1, ys[m - 1]]); G.extra.push([a2, ys[0], a2, ys[m - 1]]); }
        ys.forEach((y, j) => {
          G.elems.push({ k: off + j, x: xc, y, h: true, hw: bw / 2 - 16 });
          G.wires.push({ pts: [[a1, y], [a2, y]], I: s.el[off + j].I });
        });
        return [a1, a2];
      };
      const [A1, A2] = block(xA, nA, 0), [B1, B2] = block(xB, nB, nA);
      G.wires.push({ pts: [[bx, 0], [bx, yT], [A1, yT]], I: s.I, battery: true, part: "top" });
      G.wires.push({ pts: [[A2, yT], [B1, yT]], I: s.I });
      G.wires.push({ pts: [[B2, yT], [xR, yT], [xR, yB], [bx, yB], [bx, 1]], I: s.I, battery: true, part: "bot" });
      G.meters.push({ t: "A", x: (bx + xR) / 2, y: yB, r: 15, val: s.I });
      G.key = { x: xR, y: ym, ang: Math.PI / 2 };
      G.groupLabels = [[xA, yT + ((nA - 1) / 2) * dy + 46, "R′"], [xB, yT + ((nB - 1) / 2) * dy + 46, "R″"]];
    }
    return G;
  }
  let last = null;
  onFrame(dt => {
    if (!cv.w) return;
    const s = solve();
    const G = layout(cv.w, cv.h, s);
    G.wires.forEach((wv, k) => { phases[k] = (phases[k] || 0) + dt * 28 * Math.min(4, Math.sqrt(Math.max(0, wv.I))); });
    last = s;
    draw();
  });
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const s = last || solve(), p = pal();
    ctx.clearRect(0, 0, w, H);
    const G = layout(w, H, s), wc = p.text;
    const bat = battery(ctx, G.bx, G.ym, 2, wc, p);
    const fix = pt => (pt[1] === 0 ? [pt[0], bat.top] : pt[1] === 1 ? [pt[0], bat.bot] : pt);
    G.wires.forEach(wv => { const pts = wv.pts.map(fix); for (let j = 1; j < pts.length; j++) line(ctx, pts[j - 1][0], pts[j - 1][1], pts[j][0], pts[j][1], wc, 2.5); });
    G.extra.forEach(([a, b, c, d]) => line(ctx, a, b, c, d, wc, 2.5));
    G.wires.forEach((wv, k) => { if (wv.I > 1e-9) drawFlow(ctx, pathInfo(wv.pts.map(fix)), phases[k] || 0, 30, "c", p.r1); });
    label(ctx, `${nice(V)} V`, G.bx + 22, G.ym, { color: wc, size: 13, align: "left", weight: 700 });
    const small = w < 560 ? 11 : 12, rb = clamp(H * 0.055, 12, 20);
    G.elems.forEach(e => {
      const el = s.el[e.k];
      if (view === "bulb") {
        bulbGlyph(ctx, e.x, e.y, rb, el.on ? brightness(el.P) : 0, p, !el.on);
      } else {
        ctx.fillStyle = p.surface2;
        if (e.h) ctx.fillRect(e.x - e.hw, e.y - 12, 2 * e.hw, 24); else ctx.fillRect(e.x - 12, e.y - e.hw, 24, 2 * e.hw);
        if (el.on) { if (e.h) zigzag(ctx, e.x - e.hw, e.y, e.x + e.hw, e.y, p.img, 2.4, 8, 8); else zigzag(ctx, e.x, e.y - e.hw, e.x, e.y + e.hw, p.img, 2.4, 8, 8); }
        else { label(ctx, "taken out", e.x, e.y, { color: p.warn, size: 11, weight: 700 }); }
      }
      const txt = `R${e.k + 1} = ${nice(el.R)} Ω`;
      if (e.h) label(ctx, txt, e.x, e.y + (view === "bulb" ? rb : 10) + 13, { color: p.text, size: small, weight: 700 });
      else label(ctx, txt, e.x - (view === "bulb" ? rb : 12) - 6, e.y, { color: p.text, size: small, weight: 700, align: "right" });
    });
    if (G.groupLabels && s.groups) {
      G.groupLabels.forEach(([x, y, t], j) => { const Rg = j ? s.groups.RB : s.groups.RA; label(ctx, `${t} = ${isFinite(Rg) ? nice(Rg, 4) + " Ω" : "open"}`, x, y, { color: p.accent, size: 13, weight: 700, bg: p.surface2 }); });
    }
    plugKey(ctx, G.key.x, G.key.y, true, p, G.key.ang);
    G.meters.forEach(m => {
      if (m.t === "V") {
        line(ctx, m.lead[0], m.lead[1], m.x, m.lead[1], p.soft, 1.6); line(ctx, m.lead[0], m.lead[2], m.x, m.lead[2], p.soft, 1.6);
        line(ctx, m.x, m.lead[1], m.x, m.y - m.r, p.soft, 1.6); line(ctx, m.x, m.y + m.r, m.x, m.lead[2], p.soft, 1.6);
        meter(ctx, m.x, m.y, m.r, "V", p);
        label(ctx, `${nice(V)} V`, m.x, m.y + m.r + 14, { color: p.accent, size: 13, weight: 700, bg: p.surface2 });
        return;
      }
      ctx.fillStyle = p.surface2; ctx.fillRect(m.x - m.r - 2, m.y - m.r - 2, 2 * m.r + 4, 2 * m.r + 4);
      meter(ctx, m.x, m.y, m.r, "A", p);
      const t = unitI(m.val);
      if (m.small) label(ctx, t, m.x + m.r + 5, m.y, { color: p.accent, size: small, weight: 700, align: "left", bg: p.surface2 });
      else label(ctx, t, m.x, m.y + (mode === "series" ? -m.r - 13 : m.r + 14), { color: p.accent, size: 13, weight: 700, bg: p.surface2 });
    });
    // series: voltmeter across the chosen part
    if (mode === "series") {
      const N = s.N, yv = Math.max(16, G.yT - H * 0.22);
      let xa, xb, Vread;
      if (vm === "all") { xa = G.xs[0] - G.hw - 4; xb = G.xs[N - 1] + G.hw + 4; Vread = s.el.reduce((a, e) => a + e.V, 0); }
      else if (vm === "bat") { xa = G.bx; xb = G.bx + 1; Vread = V; }
      else { const k = +vm; xa = G.xs[k] - G.hw - 3; xb = G.xs[k] + G.hw + 3; Vread = s.el[k].V; }
      if (vm === "bat") {
        const xv = G.bx + 70, yt = bat.top - 6, yb = bat.bot + 6;
        line(ctx, G.bx, yt, xv, yt, p.soft, 1.6); line(ctx, G.bx, yb, xv, yb, p.soft, 1.6);
        line(ctx, xv, yt, xv, G.ym - 13, p.soft, 1.6); line(ctx, xv, yb, xv, G.ym + 13, p.soft, 1.6);
        meter(ctx, xv, G.ym, 13, "V", p);
        label(ctx, `${nice(Vread)} V`, xv + 20, G.ym, { color: p.accent, size: 13, weight: 700, align: "left", bg: p.surface2 });
      } else {
        const xm = (xa + xb) / 2;
        line(ctx, xa, G.yT, xa, yv, p.soft, 1.6); line(ctx, xb, G.yT, xb, yv, p.soft, 1.6);
        line(ctx, xa, yv, xm - 14, yv, p.soft, 1.6); line(ctx, xm + 14, yv, xb, yv, p.soft, 1.6);
        circle(ctx, xa, G.yT, 3.2, p.text); circle(ctx, xb, G.yT, 3.2, p.text);
        meter(ctx, xm, yv, 14, "V", p);
        label(ctx, `${nice(Vread)} V`, xm + 20, yv, { color: p.accent, size: 13, weight: 700, align: "left", bg: p.surface2 });
      }
    }
  }
  function update() {
    const s = solve();
    last = s;
    draw();
    const N = s.N, el = s.el;
    let reqTxt;
    if (mode === "series") reqTxt = `Rs = ${el.map(e => nice(e.R, 4)).join(" + ")} = ${nice(s.Req, 4)} Ω`;
    else if (mode === "parallel") { const on = el.filter(e => e.on); reqTxt = on.length ? `1/Rp = ${on.map(e => `1/${nice(e.R, 4)}`).join(" + ")}, so Rp = ${nice(s.Req, 4)} Ω` : "All taken out: no closed path"; }
    else {
      const gA = el.slice(0, nA).filter(e => e.on), gB = el.slice(nA).filter(e => e.on);
      const f = (g, Rg, nm) => (g.length === 0 ? `${nm}: open` : g.length === 1 ? `${nm} = ${nice(Rg, 4)} Ω` : `1/${nm} = ${g.map(e => `1/${nice(e.R, 4)}`).join(" + ")}, so ${nm} = ${nice(Rg, 4)} Ω`);
      reqTxt = `${f(gA, s.groups.RA, "R′")};  ${f(gB, s.groups.RB, "R″")};  R = R′ + R″ = ${isFinite(s.Req) ? nice(s.Req, 4) + " Ω" : "open circuit"}`;
    }
    const items = [
      { k: "Equivalent resistance", v: reqTxt, wide: true },
      { k: "Current from the battery I = V/R", v: unitI(s.I) },
      { k: "Power from the battery", v: `${nice(V * s.I)} W` }
    ];
    el.forEach((e, k) => items.push({ k: view === "bulb" ? `Bulb ${k + 1} (R${k + 1})` : `R${k + 1}`, v: e.on ? `${nice(e.V)} V, ${unitI(e.I)}${view === "bulb" ? `, ${nice(e.P)} W` : ""}` : "Taken out" }));
    if (mode === "series") {
      items.push({ k: "Check", v: s.I > 0 ? `V = V₁ + V₂ + … = ${el.map(e => nice(e.V)).join(" + ")} = ${nice(el.reduce((a, e) => a + e.V, 0))} V. The current is the same in every part.` : "No current flows.", wide: true });
      if (out.some(Boolean)) items.push({ k: "Notice", v: "Taking out one resistor breaks the only path, so the current stops everywhere. This is why one fused bulb in a string of series ‘fairy lights’ puts all of them out.", wide: true, tone: "bad" });
    } else if (mode === "parallel") {
      items.push({ k: "Check", v: `I = I₁ + I₂ + … = ${el.map(e => nice(e.I)).join(" + ")} = ${nice(s.I)} A. Every resistor has the same potential difference ${nice(V)} V.`, wide: true });
      if (out.some(Boolean) && el.some(e => e.on)) items.push({ k: "Notice", v: "The others keep working, because each has its own path to the battery.", wide: true, tone: "good" });
    }
    ro(items);
  }
  syncAll();
  return {
    set(o) {
      if (o.mode) mode = o.mode;
      if (o.n != null) n = o.n;
      if (o.nA != null) { nA = o.nA; aSeg.set(String(nA)); }
      if (o.nB != null) { nB = o.nB; bSeg.set(String(nB)); }
      if (o.V != null) { V = o.V; nV.set(V); }
      if (o.R) o.R.forEach((r, k) => { R[k] = r; nR[k].set(r); });
      if (o.view) { view = o.view; vSeg.set(view); }
      if (o.amm != null) amm = o.amm;
      if (o.vm != null) vm = String(o.vm);
      resetOut();
      syncAll();
    }
  };
};

/* =================================================================
   11.7 Heating effect: Joule's law H = I²Rt, the fuse, and the bulb
   ================================================================= */
CR.sims.heating = function (stage, opt = {}) {
  let mode = opt.mode || "joule", I = opt.I ?? 5, R = opt.R ?? 20, t = opt.t ?? 30;
  let P = opt.P ?? 1000, fuse = opt.fuse ?? 5, on = opt.on ?? true, Vb = opt.Vb ?? 220;
  let melted = false, heat = 0;
  const cv = makeCanvas(stage, { ratio: 0.42, mratio: 0.8, alt: "Heating effect of electric current" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["joule", "Joule's law: H = I²Rt"], ["fuse", "Electric fuse"], ["bulb", "Electric bulb"]] }, v => { mode = v; sync(); draw(); });
  const nI = numInput(ctl, { label: "Current I", value: I, min: 0.01, max: 1000, step: 0.5, unit: "A" }, v => { I = v; draw(); });
  const nR = numInput(ctl, { label: "Resistance R", value: R, min: 0.01, max: 1e6, step: 1, unit: "Ω" }, v => { R = v; draw(); });
  const nt = numInput(ctl, { label: "Time t", value: t, min: 0.01, max: 1e7, step: 1, unit: "s" }, v => { t = v; draw(); });
  const pSel = select(ctl, { label: "Appliance (220 V)", value: String(P), options: [["60", "Bulb, 60 W"], ["500", "Mixer, 500 W"], ["1000", "Electric iron, 1 kW"], ["1500", "Heater, 1.5 kW"], ["2000", "Oven, 2 kW"]] }, v => { P = +v; melted = false; heat = 0; draw(); });
  const fSeg = seg(ctl, { label: "Fuse rating", value: String(fuse), options: [["1", "1 A"], ["2", "2 A"], ["3", "3 A"], ["5", "5 A"], ["10", "10 A"]] }, v => { fuse = +v; melted = false; heat = 0; draw(); });
  const oSeg = seg(ctl, { label: "Switch", value: on ? "on" : "off", options: [["on", "On"], ["off", "Off"]] }, v => { on = v === "on"; if (on) { melted = false; heat = 0; } draw(); });
  const sV = slider(ctl, { label: "Supply to the bulb", min: 0, max: 230, step: 1, value: Vb, unit: "V" }, v => { Vb = v; draw(); });
  const qRow = chipRow(stage, "Try");
  chip(qRow, "Double the current", () => { I *= 2; nI.set(I); draw(); });
  chip(qRow, "Double the resistance", () => { R *= 2; nR.set(R); draw(); });
  chip(qRow, "Double the time", () => { t *= 2; nt.set(t); draw(); });
  chip(qRow, "Reset", () => { I = 5; R = 20; t = 30; nI.set(I); nR.set(R); nt.set(t); draw(); });
  const ro = readouts(stage);
  function sync() {
    const j = mode === "joule", f = mode === "fuse", b = mode === "bulb";
    nI.el.style.display = nR.el.style.display = nt.el.style.display = qRow.style.display = j ? "" : "none";
    pSel.el.style.display = fSeg.el.style.display = oSeg.el.style.display = f ? "" : "none";
    sV.el.style.display = b ? "" : "none";
  }
  sync();
  let time = 0;
  onFrame(dt => {
    time += dt;
    if (mode === "fuse") {
      const Iapp = on ? P / 220 : 0;
      if (!melted && Iapp > fuse) { heat += dt * 0.9 * (Iapp / fuse); if (heat >= 1) melted = true; }
      if (Iapp <= fuse) heat = Math.max(0, heat - dt);
    }
    draw();
  });
  cv.draw = draw;
  function glowCol(f) { return `rgb(${Math.round(lerp(90, 255, f))},${Math.round(lerp(40, 200, f * f))},${Math.round(lerp(30, 80, f * f * f))})`; }
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "joule") drawJoule(ctx, w, H, p);
    else if (mode === "fuse") drawFuse(ctx, w, H, p);
    else drawBulb(ctx, w, H, p);
  }
  function drawJoule(ctx, w, H, p) {
    const Pw = I * I * R, Hh = Pw * t, Vv = I * R;
    const cx = w * 0.42, cy = H * 0.52, cw = Math.min(w * 0.36, 300);
    const f = clamp(Math.log10(1 + Pw) / 4, 0, 1);
    // heating coil on a ceramic base
    ctx.fillStyle = p.dark ? "#3a3f4b" : "#d9d4c7"; roundRect(ctx, cx - cw / 2 - 16, cy + 26, cw + 32, 16, 6); ctx.fill();
    ctx.save(); ctx.strokeStyle = glowCol(f); ctx.lineWidth = 5; ctx.shadowColor = glowCol(f); ctx.shadowBlur = 18 * f;
    ctx.beginPath(); for (let k = 0; k <= 160; k++) { const tt = k / 160, x = cx - cw / 2 + cw * tt, y = cy + 16 * Math.sin(tt * Math.PI * 22); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    line(ctx, cx - cw / 2 - 40, cy, cx - cw / 2, cy, p.text, 3); line(ctx, cx + cw / 2, cy, cx + cw / 2 + 40, cy, p.text, 3);
    label(ctx, `R = ${nice(R)} Ω`, cx, cy + 58, { color: p.text, size: 13, weight: 700 });
    label(ctx, `I = ${nice(I)} A`, cx - cw / 2 - 40, cy - 16, { color: p.r1, size: 13, weight: 700, align: "left" });
    const nW = Math.round(2 + 6 * f);
    for (let k = 0; k < nW; k++) {
      const x = cx - cw / 2 + (k + 0.5) * cw / nW, ph = (time * 1.4 + k * 0.37) % 1;
      ctx.save(); ctx.globalAlpha = (1 - ph) * 0.8; ctx.strokeStyle = "#e8672a"; ctx.lineWidth = 2; ctx.beginPath();
      for (let j = 0; j <= 20; j++) { const y = cy - 24 - j * 3 - ph * 40, xx = x + 5 * Math.sin(j * 0.6 + time * 3); j ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y); }
      ctx.stroke(); ctx.restore();
    }
    // heat bar (logarithmic)
    const bx = w * 0.82, bt = H * 0.12, bb = H * 0.86, frac = clamp(Math.log10(1 + Hh) / 8, 0, 1);
    ctx.fillStyle = p.surface; roundRect(ctx, bx - 14, bt, 28, bb - bt, 8); ctx.fill(); ctx.strokeStyle = p.border; ctx.stroke();
    ctx.fillStyle = "#e8672a"; roundRect(ctx, bx - 12, bb - (bb - bt) * frac, 24, (bb - bt) * frac, 7); ctx.fill();
    label(ctx, "Heat H", bx, bt - 10, { color: p.text, size: 12, weight: 700 });
    label(ctx, `${nice(Hh)} J`, bx - 22, bb - (bb - bt) * frac, { color: p.text, size: 12, weight: 700, align: "right", bg: p.surface2 });
    ro([
      { k: "Heat H = I²Rt", v: `${nice(Hh)} J` },
      { k: "Power P = I²R", v: `${nice(Pw)} W` },
      { k: "Potential difference V = IR", v: `${nice(Vv)} V` },
      { k: "Working", v: `H = I²Rt = (${nice(I)} A)² × ${nice(R)} Ω × ${nice(t)} s = ${nice(Hh)} J`, wide: true },
      { k: "Joule's law of heating", v: "The heat produced in a resistor is directly proportional to the square of the current (for a given resistance), to the resistance (for a given current), and to the time for which the current flows. Double I and H becomes 4 times; double R or t and H doubles.", wide: true },
      { k: "Where it comes from", v: "The source supplies energy VIt to keep the current flowing. In a purely resistive circuit all of it is dissipated as heat: H = VIt = I²Rt.", wide: true }
    ]);
  }
  function drawFuse(ctx, w, H, p) {
    const Iapp = on ? P / 220 : 0, flows = on && !melted;
    const x1 = w * 0.1, x2 = w * 0.9, yT = H * 0.3, yB = H * 0.8, ym = (yT + yB) / 2, wc = p.text;
    // AC supply
    circle(ctx, x1, ym, 20, p.surface, wc, 2);
    ctx.save(); ctx.strokeStyle = wc; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 20; k++) { const x = x1 - 11 + k * 1.1, y = ym - 7 * Math.sin(k / 20 * Math.PI * 2); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore();
    label(ctx, "220 V", x1 - 26, ym - 8, { color: p.soft, size: 12, align: "right" });
    label(ctx, "AC", x1 - 26, ym + 8, { color: p.soft, size: 12, align: "right" });
    line(ctx, x1, ym - 20, x1, yT, p.live, 3); line(ctx, x1, ym + 20, x1, yB, p.neutral, 3);
    const fx = w * 0.36, fw = Math.min(110, w * 0.16);
    line(ctx, x1, yT, fx - fw / 2, yT, p.live, 3); line(ctx, fx + fw / 2, yT, x2, yT, p.live, 3);
    line(ctx, x2, yB, x1, yB, p.neutral, 3);
    label(ctx, "Live", x1 + 10, yT - 12, { color: p.live, size: 12, align: "left", weight: 700 });
    label(ctx, "Neutral", x1 + 10, yB + 14, { color: p.neutral, size: 12, align: "left", weight: 700 });
    if (flows) { const info = pathInfo([[x1, ym - 20], [x1, yT], [x2, yT], [x2, yB], [x1, yB], [x1, ym + 20]]); drawFlow(ctx, info, time * 40, 34, "c", p.r1); }
    // fuse cartridge
    ctx.fillStyle = p.dark ? "#d8d2c4" : "#f2ede1"; roundRect(ctx, fx - fw / 2, yT - 13, fw, 26, 7); ctx.fill(); ctx.strokeStyle = p.soft; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#9aa1ad"; ctx.fillRect(fx - fw / 2 - 6, yT - 9, 8, 18); ctx.fillRect(fx + fw / 2 - 2, yT - 9, 8, 18);
    const hot = clamp(heat, 0, 1);
    if (!melted) line(ctx, fx - fw / 2 + 6, yT, fx + fw / 2 - 6, yT, hot > 0.05 ? glowCol(0.3 + 0.7 * hot) : "#7d7466", 2 + hot);
    else { line(ctx, fx - fw / 2 + 6, yT, fx - 8, yT + 4, "#7d7466", 2); line(ctx, fx + 8, yT - 4, fx + fw / 2 - 6, yT, "#7d7466", 2); circle(ctx, fx - 8, yT + 4, 2.5, "#7d7466"); circle(ctx, fx + 8, yT - 4, 2.5, "#7d7466"); }
    label(ctx, `Fuse ${fuse} A (in the live wire)`, fx, yT - 26, { color: p.text, size: 12, weight: 700 });
    // appliance between live and neutral
    const ax = x2, rb = 22;
    line(ctx, ax, yT, ax, ym - rb, wc, 2.5); line(ctx, ax, ym + rb, ax, yB, wc, 2.5);
    const appName = { 60: "60 W bulb", 500: "Mixer", 1000: "Electric iron", 1500: "Heater", 2000: "Oven" }[P];
    ctx.fillStyle = flows ? (P >= 1000 ? "#ffcf8a" : "#fff1b8") : p.surface; roundRect(ctx, ax - 30, ym - rb, 60, 2 * rb, 8); ctx.fill(); ctx.strokeStyle = wc; ctx.lineWidth = 2; ctx.stroke();
    label(ctx, `${P} W`, ax, ym, { color: "#3a2a10", size: 12, weight: 700 });
    label(ctx, appName, ax - 36, ym, { color: p.text, size: 12, weight: 700, align: "right" });
    const msg = !on ? "Switched off" : melted ? "The fuse wire melted and broke the circuit" : Iapp > fuse ? "Too much current: the fuse wire is heating up…" : "Current is within the rating: the fuse is safe";
    label(ctx, msg, w / 2, H - 12, { color: melted || (on && Iapp > fuse) ? p.warn : p.ok, size: 13, weight: 700 });
    ro([
      { k: "Current drawn I = P/V", v: on ? `${nice(P)} W ÷ 220 V = ${fmt(Iapp, 2)} A` : "0 A" },
      { k: "Fuse rating", v: `${fuse} A` },
      { k: "Result", v: !on ? "—" : melted ? "Fuse blown" : Iapp > fuse ? "Fuse will melt" : "Safe", tone: melted || (on && Iapp > fuse) ? "bad" : on ? "good" : null },
      { k: "The fuse (NCERT)", v: "A fuse protects circuits and appliances by stopping the flow of any unduly high electric current. It is placed in series with the device and is a piece of wire of a metal or alloy of suitable melting point (for example aluminium, copper, iron or lead). Too large a current heats the wire until it melts and breaks the circuit.", wide: true },
      { k: "Ratings", v: "Fuses for domestic use are rated 1 A, 2 A, 3 A, 5 A, 10 A and so on. A 1 kW electric iron at 220 V draws 1000/220 A, about 4.5 A, so a 5 A fuse must be used.", wide: true }
    ]);
  }
  function drawBulb(ctx, w, H, p) {
    const cx = w * 0.45, cy = H * 0.42, r = Math.min(H * 0.28, w * 0.18);
    const Prat = 100, Rh = 220 * 220 / Prat, Pnow = Vb * Vb / Rh;    // treated as a fixed (hot) resistance
    const f = clamp(Math.pow(Pnow / Prat, 0.6), 0, 1);
    if (f > 0.02) { const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4); g.addColorStop(0, `rgba(255,220,120,${(0.75 * f).toFixed(3)})`); g.addColorStop(1, "rgba(255,220,120,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r * 2.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.72, Math.PI * 2.28); ctx.lineTo(cx + r * 0.42, cy + r * 1.25); ctx.lineTo(cx - r * 0.42, cy + r * 1.25); ctx.closePath();
    ctx.fillStyle = p.dark ? "rgba(200,220,255,0.12)" : "rgba(220,235,255,0.55)"; ctx.fill(); ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.fillStyle = "#9aa1ad"; roundRect(ctx, cx - r * 0.45, cy + r * 1.25, r * 0.9, r * 0.45, 4); ctx.fill();
    line(ctx, cx - r * 0.25, cy + r * 1.25, cx - r * 0.35, cy - r * 0.05, p.soft, 2); line(ctx, cx + r * 0.25, cy + r * 1.25, cx + r * 0.35, cy - r * 0.05, p.soft, 2);
    ctx.save(); ctx.strokeStyle = f > 0.02 ? glowCol(0.35 + 0.65 * f) : "#6b6b6b"; ctx.lineWidth = 2.4; ctx.shadowColor = "#ffd27a"; ctx.shadowBlur = 20 * f; ctx.beginPath();
    for (let k = 0; k <= 60; k++) { const tt = k / 60, x = lerp(cx - r * 0.35, cx + r * 0.35, tt), y = cy - r * 0.05 - 7 * Math.abs(Math.sin(tt * Math.PI * 9)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
    const lx = cx + r * 1.15;
    label(ctx, "Tungsten filament (melts at 3380 °C)", lx, cy - r * 0.15, { color: p.text, size: 12, weight: 700, align: "left" });
    label(ctx, "Filled with nitrogen and argon", lx, cy + r * 0.45, { color: p.text, size: 12, weight: 700, align: "left" });
    label(ctx, "(chemically inactive gases)", lx, cy + r * 0.45 + 16, { color: p.soft, size: 12, align: "left" });
    label(ctx, `${Vb} V supply, 100 W bulb rated for 220 V`, 10, H - 12, { color: p.soft, size: 11, align: "left" });
    ro([
      { k: "Power used (about)", v: `${nice(Pnow)} W` },
      { k: "Filament", v: Vb < 40 ? "Not hot enough to glow" : Vb < 150 ? "Glows dull red to orange" : "White hot: bright" },
      { k: "Why tungsten", v: "The filament must retain as much of the heat as possible, so that it gets very hot and emits light, without melting. Tungsten, a strong metal with a high melting point (3380 °C), is used. The filament is thermally isolated as much as possible, using insulating supports.", wide: true },
      { k: "The gases", v: "Bulbs are usually filled with chemically inactive nitrogen and argon to prolong the life of the filament. Most of the power consumed by the filament appears as heat; only a small part is radiated as light.", wide: true },
      { k: "Model used", v: "The filament is treated as a fixed resistance of 484 Ω (220 V, 100 W). A real filament has less resistance when cooler.", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.I != null) { I = o.I; nI.set(I); }
      if (o.R != null) { R = o.R; nR.set(R); }
      if (o.t != null) { t = o.t; nt.set(t); }
      if (o.P != null) { P = o.P; pSel.set(String(P)); }
      if (o.fuse != null) { fuse = o.fuse; fSeg.set(String(fuse)); }
      if (o.on != null) { on = !!o.on; oSeg.set(on ? "on" : "off"); }
      if (o.Vb != null) { Vb = o.Vb; sV.value = Vb; }
      melted = false; heat = 0;
      draw();
    }
  };
};

/* =================================================================
   11.8 Electric power: a rated appliance on any supply, energy and its
   cost, and a home electricity bill.
   ================================================================= */
CR.sims.elecPower = function (stage, opt = {}) {
  let mode = opt.mode || "rated", Vr = opt.Vr ?? 220, Pr = opt.Pr ?? 100, Vs = opt.Vs ?? 220;
  let eP = opt.eP ?? 400, eH = opt.eH ?? 8, eD = opt.eD ?? 30, rate = opt.rate ?? 3;
  let aP = opt.aP ?? 250, aT = opt.aT ?? 60, bP = opt.bP ?? 1200, bT = opt.bT ?? 10;
  const cv = makeCanvas(stage, { ratio: 0.36, mratio: 0.7, min: 200, alt: "Electric power" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["rated", "Rated appliance"], ["energy", "Energy and cost"], ["bill", "Home electricity bill"]] }, v => { mode = v; sync(); draw(); });
  const rated = controls(stage);
  const nVr = numInput(rated, { label: "Rated voltage", value: Vr, min: 1, max: 1000, step: 1, unit: "V" }, v => { Vr = v; draw(); });
  const nPr = numInput(rated, { label: "Rated power", value: Pr, min: 0.1, max: 100000, step: 1, unit: "W" }, v => { Pr = v; draw(); });
  const sVs = slider(rated, { label: "Supply voltage", min: 0, max: 250, step: 1, value: Vs, unit: "V" }, v => { Vs = v; draw(); });
  const en = controls(stage);
  const nE = [
    numInput(en, { label: "Power", value: eP, min: 0.1, max: 100000, step: 1, unit: "W" }, v => { eP = v; draw(); }),
    numInput(en, { label: "Hours per day", value: eH, min: 0, max: 24, step: 0.5, unit: "h" }, v => { eH = v; draw(); }),
    numInput(en, { label: "Days", value: eD, min: 1, max: 366, step: 1 }, v => { eD = v; draw(); }),
    numInput(en, { label: "Rate", value: rate, min: 0, max: 100, step: 0.5, unit: "₹ per kW h" }, v => { rate = v; draw(); })
  ];
  const cmp = controls(stage);
  const nC = [
    numInput(cmp, { label: "Appliance A: power", value: aP, min: 0.1, max: 100000, step: 1, unit: "W" }, v => { aP = v; draw(); }),
    numInput(cmp, { label: "A: time", value: aT, min: 0.1, max: 100000, step: 1, unit: "min" }, v => { aT = v; draw(); }),
    numInput(cmp, { label: "Appliance B: power", value: bP, min: 0.1, max: 100000, step: 1, unit: "W" }, v => { bP = v; draw(); }),
    numInput(cmp, { label: "B: time", value: bT, min: 0.1, max: 100000, step: 1, unit: "min" }, v => { bT = v; draw(); })
  ];
  // home bill table
  const apps = [
    { n: "LED bulb", p: 9, q: 4, hrs: 6 }, { n: "Ceiling fan", p: 75, q: 2, hrs: 10 }, { n: "Television", p: 100, q: 1, hrs: 4 },
    { n: "Refrigerator", p: 200, q: 1, hrs: 10 }, { n: "Electric iron", p: 1000, q: 1, hrs: 0.5 },
    { n: "Water heater", p: 2000, q: 0, hrs: 1 }, { n: "Air conditioner", p: 1500, q: 0, hrs: 6 }
  ];
  let bRate = 7;
  const billBox = h("div");
  stage.append(billBox);
  const tbody = h("tbody");
  billBox.append(h("p", { style: "margin:.6rem 0;color:var(--text-soft)" }, "Change the numbers to match a student's home. Energy = power × time; 1 kW h is one ‘unit’ on the bill."),
    h("div", { class: "bill-wrap" }, h("table", { class: "bill" },
      h("thead", {}, h("tr", {}, h("th", {}, "Appliance"), h("th", { class: "num" }, "Power (W)"), h("th", {}, "How many"), h("th", { class: "num" }, "Hours/day"), h("th", { class: "num" }, "kW h/day"), h("th", { class: "bar-cell" }, "Share"))),
      tbody)));
  const rows = apps.map(a => {
    const cnt = h("span", {}, String(a.q)), kwh = h("td", { class: "num" }), bar = h("div", { class: "bar" });
    const pIn = h("input", { type: "number", min: 1, max: 5000, step: 1, value: a.p, "aria-label": `${a.n} power in watts` });
    const hIn = h("input", { type: "number", min: 0, max: 24, step: 0.5, value: a.hrs, "aria-label": `${a.n} hours per day` });
    pIn.addEventListener("input", () => { a.p = Math.max(0, +pIn.value || 0); draw(); });
    hIn.addEventListener("input", () => { a.hrs = clamp(+hIn.value || 0, 0, 24); draw(); });
    const step = dlt => () => { a.q = clamp(a.q + dlt, 0, 20); cnt.textContent = String(a.q); draw(); };
    tbody.append(h("tr", {}, h("td", {}, a.n), h("td", { class: "num" }, pIn),
      h("td", {}, h("span", { class: "stepper" }, h("button", { type: "button", onclick: step(-1), "aria-label": "fewer" }, "−"), cnt, h("button", { type: "button", onclick: step(1), "aria-label": "more" }, "+"))),
      h("td", { class: "num" }, hIn), kwh, h("td", { class: "bar-cell" }, bar)));
    return { kwh, bar, a };
  });
  const bctl = controls(billBox);
  numInput(bctl, { label: "Rate", value: bRate, min: 0, max: 100, step: 0.5, unit: "₹ per unit" }, v => { bRate = v; draw(); });
  const ro = readouts(stage);
  function sync() {
    rated.style.display = mode === "rated" ? "" : "none";
    en.style.display = cmp.style.display = mode === "energy" ? "" : "none";
    billBox.style.display = mode === "bill" ? "" : "none";
    cv.cv.parentNode.style.display = mode === "bill" ? "none" : "";
    if (mode !== "bill") cv.resize();
  }
  sync();
  cv.draw = draw;
  function draw() {
    const p = pal();
    const { ctx, w, h: H } = cv;
    if (w && mode !== "bill") ctx.clearRect(0, 0, w, H);
    if (mode === "rated") {
      const Rr = Vr * Vr / Pr, I = Vs / Rr, P = Vs * Vs / Rr;
      if (w) {
        const cx = w * 0.3, cy = H * 0.5, rb = Math.min(H * 0.22, 46);
        bulbGlyph(ctx, cx, cy, rb, brightness(P * 30 / Math.max(Pr, 1)), p);
        label(ctx, `Rated ${nice(Vr)} V, ${nice(Pr)} W`, cx, cy + rb + 18, { color: p.text, size: 13, weight: 700 });
        const bx = w * 0.62, bw = w * 0.3, bh = 22, frac = clamp(P / Math.max(Pr, 1e-9), 0, 1.5) / 1.5;
        label(ctx, "Power used compared with the rating", bx, cy - 40, { color: p.soft, size: 12, align: "left" });
        ctx.fillStyle = p.surface; roundRect(ctx, bx, cy - 22, bw, bh, 6); ctx.fill(); ctx.strokeStyle = p.border; ctx.stroke();
        ctx.fillStyle = P > Pr * 1.001 ? p.warn : p.accent; roundRect(ctx, bx, cy - 22, Math.max(2, bw * frac), bh, 6); ctx.fill();
        line(ctx, bx + bw / 1.5, cy - 30, bx + bw / 1.5, cy + 8, p.text, 1.5, [3, 3]);
        label(ctx, "rated", bx + bw / 1.5, cy + 18, { color: p.soft, size: 11 });
        label(ctx, `${nice(P)} W at ${nice(Vs)} V`, bx, cy + 36, { color: p.text, size: 14, weight: 700, align: "left" });
      }
      ro([
        { k: "Resistance R = V²/P (rated values)", v: `${nice(Rr)} Ω` },
        { k: "Current I = V/R", v: unitI(I) },
        { k: "Power P = V²/R", v: `${nice(P)} W` },
        { k: "Working", v: `R = ${nice(Vr)}² / ${nice(Pr)} = ${nice(Rr)} Ω;  P = V²/R = ${nice(Vs)}² / ${nice(Rr)} = ${nice(P)} W;  I = V/R = ${unitI(I)}`, wide: true },
        { k: "Electric power", v: "The rate at which electric energy is consumed: P = VI = I²R = V²/R. Its SI unit is the watt: 1 W is the power consumed by a device that carries 1 A at a potential difference of 1 V (1 W = 1 V A). 1 kilowatt = 1000 watts.", wide: true },
        { k: "Note", v: "Taking the resistance as fixed (a simple model), halving the voltage makes the power one-fourth, as in Exercise 3.", wide: true }
      ]);
    } else if (mode === "energy") {
      const kwh = eP * eH * eD / 1000, J = kwh * 3.6e6;
      const EA = aP * aT * 60, EB = bP * bT * 60;
      if (w) {
        const bx = w * 0.18, bw = w * 0.62, y1 = H * 0.3, y2 = H * 0.62, bh = Math.min(28, H * 0.13), mx = Math.max(EA, EB, 1);
        label(ctx, "Which uses more energy?", bx, H * 0.12, { color: p.text, size: 14, weight: 700, align: "left" });
        [[`A: ${nice(aP)} W for ${nice(aT)} min`, EA, y1, p.r1], [`B: ${nice(bP)} W for ${nice(bT)} min`, EB, y2, p.r3]].forEach(([t, E, y, c]) => {
          label(ctx, t, bx, y - bh / 2 - 12, { color: p.text, size: 12, weight: 700, align: "left" });
          ctx.fillStyle = c; roundRect(ctx, bx, y - bh / 2, Math.max(3, bw * E / mx), bh, 6); ctx.fill();
          label(ctx, `${sci(E, 2)} J`, bx + Math.max(3, bw * E / mx) + 8, y, { color: p.text, size: 13, weight: 700, align: "left" });
        });
        label(ctx, EA === EB ? "Both use the same energy" : EA > EB ? "A uses more energy" : "B uses more energy", bx, H * 0.88, { color: p.accent, size: 13, weight: 700, align: "left" });
      }
      ro([
        { k: "Energy used", v: `${nice(eP)} W × ${nice(eH)} h/day × ${nice(eD)} days = ${nice(eP * eH * eD)} W h = ${nice(kwh)} kW h` },
        { k: "In joules", v: `${sci(J, 2)} J` },
        { k: "Cost", v: `${nice(kwh)} kW h × ₹ ${nice(rate)} = ₹ ${fmt(kwh * rate, 2)}` },
        { k: "Units", v: "Energy = power × time. One watt hour is the energy used when 1 W is used for 1 hour. The commercial unit is the kilowatt hour (kW h), the ‘unit’ on the bill: 1 kW h = 1000 W × 3600 s = 3.6 × 10⁶ J.", wide: true },
        { k: "More to know (NCERT)", v: "Electrons are not consumed in a circuit. We pay the electricity company for the energy that moves electrons through our gadgets.", wide: true }
      ]);
    } else {
      const day = rows.map(r => (r.a.p * r.a.q * r.a.hrs) / 1000), tot = day.reduce((a, b) => a + b, 0), mx = Math.max(...day, 1e-9);
      rows.forEach((r, k) => { r.kwh.textContent = fmt(day[k], 2); r.bar.style.width = `${(day[k] / mx) * 100}%`; r.bar.style.opacity = day[k] ? 1 : 0.15; });
      const load = rows.reduce((a, r) => a + r.a.p * r.a.q, 0), units = tot * 30;
      ro([
        { k: "All switched on together", v: `${nice(load)} W` },
        { k: "Current drawn at 220 V", v: `${fmt(load / 220, 2)} A` },
        { k: "Energy per day", v: `${fmt(tot, 2)} kW h` },
        { k: "Units per month (30 days)", v: `${fmt(units, 0)} units` },
        { k: "Bill per month", v: `₹ ${fmt(units * bRate, 0)}` }
      ]);
    }
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.Vr != null) { Vr = o.Vr; nVr.set(Vr); }
      if (o.Pr != null) { Pr = o.Pr; nPr.set(Pr); }
      if (o.Vs != null) { Vs = o.Vs; sVs.value = Vs; }
      if (o.eP != null) { eP = o.eP; nE[0].set(eP); }
      if (o.eH != null) { eH = o.eH; nE[1].set(eH); }
      if (o.eD != null) { eD = o.eD; nE[2].set(eD); }
      if (o.rate != null) { rate = o.rate; nE[3].set(rate); }
      if (o.aP != null) { aP = o.aP; nC[0].set(aP); }
      if (o.aT != null) { aT = o.aT; nC[1].set(aT); }
      if (o.bP != null) { bP = o.bP; nC[2].set(bP); }
      if (o.bT != null) { bT = o.bT; nC[3].set(bT); }
      draw();
    }
  };
};
})();
