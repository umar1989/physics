/* ============================================================
   Chapter 12 — Magnetic Effects of Electric Current (simulations)
   NCERT Class 10, rationalised edition. Plain JavaScript, no libraries.
   Sims: oersted (Activities 12.1, 12.4), field (bar magnet, straight
   wire, coil, solenoid; Activities 12.2, 12.3, 12.5, 12.6), thumbRule
   (12.2.2), force (Activity 12.7), flhr (Fleming's left-hand rule),
   domestic (12.4: circuits, fuse, earthing, AC supply).
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, fmt, nice, pal, line, head, label, labelBox, labelPlacer, textWidth, roundRect, circle,
  polyline, arrowsAlong, onFrame, makeCanvas, controls, slider, seg, select, chipRow, chip, toggles, readouts } = CR;

const B_EARTH = 35;                               // horizontal part of the Earth's field in India, about 35 µT
const wireField = (I, rCm) => 20 * I / rCm;       // long straight wire: B = μ₀I/2πr → µT, with I in A and r in cm
const RED = "#d9433f", BLUE = "#3f6fd8", COPPER = "#c8743c", ORANGE = "#e08a1e";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- shared drawing ---------- */
function compass(ctx, x, y, R, ang, p, { rose = false } = {}) {
  circle(ctx, x, y, R, p.dark ? "#1d2230" : "#ffffff", p.text, Math.max(1.5, R * 0.07));
  if (rose) {
    [["N", -Math.PI / 2], ["E", 0], ["S", Math.PI / 2], ["W", Math.PI]].forEach(([t, a]) =>
      label(ctx, t, x + Math.cos(a) * (R - 12), y + Math.sin(a) * (R - 12), { color: p.soft, size: 12, weight: 700 }));
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const L = R * (rose ? 0.66 : 0.8), w = Math.max(2.5, R * (rose ? 0.11 : 0.17));
  ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
  ctx.fillStyle = p.dark ? "#a7afc4" : "#5d6577"; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
  ctx.restore();
  circle(ctx, x, y, Math.max(2, R * 0.08), p.text);
}
function wireEnd(ctx, x, y, I, p, r = 10) {
  circle(ctx, x, y, r, COPPER, p.text, 2);
  if (I > 0) circle(ctx, x, y, r * 0.3, "#1c2233");
  else if (I < 0) { const k = r * 0.55; line(ctx, x - k, y - k, x + k, y + k, "#1c2233", 2.2); line(ctx, x - k, y + k, x + k, y - k, "#1c2233", 2.2); }
}
function northArrow(ctx, x, y, p) {
  line(ctx, x, y + 22, x, y - 10, p.text, 2.5);
  head(ctx, x, y - 16, -Math.PI / 2, 11, p.text);
  label(ctx, "N", x, y - 28, { color: p.text, size: 14, weight: 700 });
}
/* field lines from a 2-D field F(x, y); stops at the box b or near any wire */
function stream(x, y, dir, F, b, wires, rodR) {
  const pts = [[x, y]], step = 3, sx = x, sy = y;
  for (let i = 0; i < 2200; i++) {
    let [bx, by] = F(x, y), m = Math.hypot(bx, by);
    if (m < 1e-12) break;
    const mx = x + (bx / m) * dir * step / 2, my = y + (by / m) * dir * step / 2;
    [bx, by] = F(mx, my); m = Math.hypot(bx, by);
    if (m < 1e-12) break;
    x += (bx / m) * dir * step; y += (by / m) * dir * step;
    pts.push([x, y]);
    if (x < b[0] - 4 || y < b[1] - 4 || x > b[2] + 4 || y > b[3] + 4) return { pts, closed: false };
    for (const wi of wires) if (Math.hypot(x - wi.x, y - wi.y) < rodR) return { pts, closed: false };
    if (i > 40 && Math.hypot(x - sx, y - sy) < step * 1.5) { pts.push([sx, sy]); return { pts, closed: true }; }
  }
  return { pts, closed: false };
}
function fieldLine(x, y, F, b, wires, rodR = 7) {
  const f = stream(x, y, 1, F, b, wires, rodR);
  if (f.closed) return f.pts;
  const r = stream(x, y, -1, F, b, wires, rodR);
  return r.pts.reverse().concat(f.pts.slice(1));
}

/* oblique 3-D view: x to the right (east), y away from the viewer (north), z up */
function view3D(cx, cy, s, yaw = 30 * DEG, pitch = 20 * DEG) {
  const cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
  const f = (x, y, z) => [cx + s * (x * cY + y * sY), cy - s * (z * cP + (-x * sY + y * cY) * sP)];
  f.depth = (x, y) => -x * sY + y * cY;            // larger = farther from the viewer
  f.s = s;
  return f;
}
function arrow3(ctx, P, a, b, color, width = 3, size = 11, dash = null, alpha = 1) {
  const [x1, y1] = P(...a), [x2, y2] = P(...b);
  const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 4) return;
  line(ctx, x1, y1, x2 - Math.cos(ang) * size * 0.6, y2 - Math.sin(ang) * size * 0.6, color, width, dash, alpha);
  head(ctx, x2, y2, ang, size, color, alpha);
}
function poly3(ctx, P, pts, fill, stroke, width = 1.5, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath();
  pts.forEach((q, j) => { const [x, y] = P(...q); if (j) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke(); }
  ctx.restore();
}
/* a box seen from the front-right, above: draws the faces −y, +x and +z */
function box3(ctx, P, x0, x1, y0, y1, z0, z1, col, p, alpha = 1) {
  const edge = p.dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)";
  poly3(ctx, P, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], col, edge, 1.2, alpha);
  poly3(ctx, P, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shadeOf(col, -0.22), edge, 1.2, alpha);
  poly3(ctx, P, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], shadeOf(col, 0.18), edge, 1.2, alpha);
}
function shadeOf(hex, amt) { return CR.shade(hex, amt); }
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const same = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 1e-6;
const neg = a => [-a[0], -a[1], -a[2]];

/* cells drawn on a vertical wire at x, centred at yc; long plate (+) on top when plusUp */
function cellsV(ctx, x, yc, n, plusUp, p) {
  const top = yc - n * 9, wc = p.text;
  for (let j = 0; j < n; j++) {
    const y0 = top + j * 18 + 4;
    const yl = plusUp ? y0 : y0 + 9, ys = plusUp ? y0 + 9 : y0;
    line(ctx, x - 15, yl, x + 15, yl, wc, 2.5);
    line(ctx, x - 7, ys, x + 7, ys, wc, 5);
    if (j < n - 1) line(ctx, x, y0 + 9, x, y0 + 18, wc, 2);
  }
  label(ctx, "+", x + 24, plusUp ? top + 4 : top + (n - 1) * 18 + 13, { color: RED, size: 15, weight: 700 });
  return [top + 4, top + (n - 1) * 18 + 13];
}

/* =================================================================
   Activities 12.1 and 12.4 — a compass near a current-carrying wire
   Top view, north up. The needle points along the resultant of the
   Earth's field (35 µT, north) and the wire's field (μ₀I/2πr).
   ================================================================= */
CR.sims.oersted = function (stage, opt = {}) {
  let mode = opt.mode || "a121", on = opt.on ?? false, I = opt.I ?? 3, dirV = opt.dirV ?? 1, dirH = opt.dirH ?? 1;
  let comp = opt.comp ? { ...opt.comp } : { e: 0, n: 3 };
  const show = { field: opt.field ?? true };
  const D124 = 1.5;                                  // the wire is 1.5 cm above the needle (Activity 12.4)
  let phase = 0, scale = 30, dragging = false;
  const cv = makeCanvas(stage, { ratio: 0.54, mratio: 0.95, touch: true, alt: "A compass near a current-carrying wire, seen from above" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Activity", value: mode, options: [["a121", "12.1: wire XY perpendicular to the paper"], ["a124", "12.4: wire over the compass needle"]] }, v => { mode = v; sync(); draw(); });
  const kSeg = seg(ctl, { label: "Plug key", value: on ? "in" : "out", options: [["out", "Out: no current"], ["in", "In: current flows"]] }, v => { on = v === "in"; draw(); });
  const vSeg = seg(ctl, { label: "Current in wire XY", value: String(dirV), options: [["1", "Upwards (out of the paper ⊙)"], ["-1", "Downwards (into the paper ⊗)"]] }, v => { dirV = +v; draw(); });
  const hSeg = seg(ctl, { label: "Current in the wire", value: String(dirH), options: [["1", "North to south (Fig. 12.5 a)"], ["-1", "South to north (Fig. 12.5 b)"]] }, v => { dirH = +v; draw(); });
  const sI = slider(ctl, { label: "Current", min: 0.5, max: 5, step: 0.5, value: I, unit: "A", fmt: v => fmt(v, 1) }, v => { I = v; draw(); });
  const pRow = chipRow(stage, "Put the compass");
  [["North of the wire", { e: 0, n: 3 }], ["East", { e: 3, n: 0 }], ["South", { e: 0, n: -3 }], ["West", { e: -3, n: 0 }], ["Farther away (6 cm north)", { e: 0, n: 6 }]]
    .forEach(([t, c]) => chip(pRow, t, () => { comp = { ...c }; draw(); }));
  pRow.append(h("span", { class: "presets-label" }, "or drag it."));
  const sRow = chipRow(stage, "Show");
  const showT = toggles(sRow, [["field", "Circles of the wire's magnetic field"]], show, () => draw());
  const ro = readouts(stage);
  function sync() {
    mSeg.el.style.display = opt.lock ? "none" : "";
    vSeg.el.style.display = pRow.style.display = sRow.style.display = mode === "a121" ? "" : "none";
    hSeg.el.style.display = mode === "a124" ? "" : "none";
  }
  sync();

  const toCm = e => { const q = cv.pos(e); return { e: (q.x - cv.w / 2) / scale, n: (cv.h / 2 - q.y) / scale }; };
  function place(c) {
    const r = Math.hypot(c.e, c.n), lim = 1.4;
    if (r < lim) { if (r < 1e-6) { c.e = 0; c.n = lim; } else { c.e *= lim / r; c.n *= lim / r; } }
    const maxE = (cv.w / 2 - 28) / scale, maxN = (cv.h / 2 - 28) / scale;
    comp = { e: clamp(c.e, -maxE, maxE), n: clamp(c.n, -maxN, maxN) };
    draw();
  }
  cv.cv.addEventListener("pointerdown", e => { if (mode !== "a121") return; dragging = true; cv.cv.setPointerCapture(e.pointerId); place(toCm(e)); });
  cv.cv.addEventListener("pointermove", e => { if (dragging) place(toCm(e)); });
  ["pointerup", "pointercancel"].forEach(t => cv.cv.addEventListener(t, () => { dragging = false; }));
  onFrame(dt => { if (mode === "a124" && on) { phase += dt * 40; draw(); } });

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = p.dark ? "#202534" : "#fbfaf6"; ctx.fillRect(0, 0, W, H);
    northArrow(ctx, 26, 48, p);
    if (mode === "a121") drawA121(ctx, W, H, p); else drawA124(ctx, W, H, p);
  }

  function needleTxt(dlt, small) {
    if (!on) return "Points north: only the Earth's magnetic field acts on it";
    if (Math.abs(dlt) < 0.5) return "Still points north: here the wire's field lies along the north–south line";
    if (Math.abs(dlt) > 179.5) return "Turned right round to point south: here the wire's field is opposite to the Earth's field and stronger";
    return `Turned ${fmt(Math.abs(dlt), 0)}° towards the ${dlt > 0 ? "east" : "west"}`;
  }

  function drawA121(ctx, W, H, p) {
    scale = Math.min(W, H) / 15;
    const s = scale, cx = W / 2, cy = H / 2;
    label(ctx, "Paper seen from above. Wire XY passes vertically through it.", W - 10, 9, { color: p.soft, size: W < 560 ? 11 : 12, align: "right", base: "top", maxW: W - 70 });
    if (on && show.field) {
      [1.5, 3, 4.5, 6].forEach(r => {
        const R = r * s;
        ctx.save(); ctx.strokeStyle = p.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        [Math.PI / 4, Math.PI * 1.25].forEach(a => {
          const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
          const t = dirV > 0 ? a + Math.PI / 2 : a - Math.PI / 2;   // anticlockwise (seen from above) for current upwards
          head(ctx, x, y, Math.atan2(-Math.sin(t), Math.cos(t)), 10, p.accent, 0.85);
        });
      });
    }
    wireEnd(ctx, cx, cy, on ? dirV : 0, p, 11);
    label(ctx, "Wire XY", cx, cy + 26, { color: p.text, size: 12, bg: p.surface2 });
    const r = Math.hypot(comp.e, comp.n);
    const Bw = on ? wireField(I, r) : 0;
    const Be = Bw * dirV * (-comp.n / r), Bn = Bw * dirV * (comp.e / r) + B_EARTH;
    const dlt = Math.atan2(Be, Bn) / DEG;
    const x = cx + comp.e * s, y = cy - comp.n * s, R = Math.max(19, s * 0.85);
    compass(ctx, x, y, R, Math.atan2(-Bn, Be), p);
    label(ctx, "Compass", x, y + R + 12, { color: p.soft, size: 12 });
    ro([
      { k: "North pole of the compass needle", v: needleTxt(dlt), wide: true, tone: on && Math.abs(dlt) >= 0.5 ? "good" : "" },
      { k: "Distance from the wire", v: `${fmt(r, 1)} cm` },
      { k: "Wire's field at the compass", v: on ? `≈ ${nice(Bw, 2)} µT` : "0 (no current)" },
      { k: "Earth's field (horizontal)", v: `≈ ${B_EARTH} µT, towards north` },
      { k: "What this shows", v: on ? "The needle is deflected: the electric current through the copper wire has produced a magnetic effect. Electricity and magnetism are linked to each other." : "Note where the needle points. Then put the key in, so that a current flows through wire XY.", wide: true }
    ]);
  }

  function drawA124(ctx, W, H, p) {
    const cx = Math.min(W * 0.42, W / 2 - 40), cy = H / 2;
    const R = Math.min(W * 0.21, H * 0.36);
    const xr = Math.min(W - 60, cx + R + 170), yT = 22, yB = H - 22;
    const wc = p.text;
    // circuit: wire (north end at the top) → right → cells → key → back to the south end
    line(ctx, cx, yT, xr, yT, wc, 2.5);
    line(ctx, cx, yB, xr, yB, wc, 2.5);
    const yc = cy - 46, n = 2;
    const [pTop, pBot] = [yc - n * 9 + 4, yc - n * 9 + (n - 1) * 18 + 13];
    line(ctx, xr, yT, xr, pTop, wc, 2.5);
    cellsV(ctx, xr, yc, n, dirH > 0, p);
    const yk = cy + 52;
    line(ctx, xr, pBot, xr, yk - 12, wc, 2.5);
    circle(ctx, xr, yk - 12, 3, wc); circle(ctx, xr, yk + 12, 3, wc);
    if (on) { ctx.fillStyle = p.dark ? "#c9cfdc" : "#2b2f3a"; ctx.fillRect(xr - 4, yk - 10, 8, 20); }
    line(ctx, xr, yk + 12, xr, yB, wc, 2.5);
    const roomR = W - xr > 80;   // room for the labels to the right of the circuit?
    label(ctx, "Cells", roomR ? xr + 34 : xr - 24, yc, { color: p.soft, size: 12, align: roomR ? "left" : "right" });
    label(ctx, "Plug key", roomR ? xr + 14 : xr - 14, yk, { color: p.soft, size: 12, align: roomR ? "left" : "right" });

    const Bw = on ? wireField(I, D124) : 0;
    const Be = Bw * dirH, Bn = B_EARTH;
    const dlt = Math.atan2(Be, Bn) / DEG;
    compass(ctx, cx, cy, R, Math.atan2(-Bn, Be), p, { rose: true });
    // the wire runs north–south over the needle
    ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = COPPER; ctx.fillRect(cx - 5, yT - 2, 10, yB - yT + 4); ctx.restore();
    line(ctx, cx - 5, yT, cx - 5, yB, shadeOf(COPPER, -0.35), 1);
    line(ctx, cx + 5, yT, cx + 5, yB, shadeOf(COPPER, -0.35), 1);
    label(ctx, "Copper wire, over the needle", cx + 12, yT + 16, { color: p.text, size: 12, align: "left", bg: p.surface2 });
    if (on) {
      const path = dirH > 0 ? [[cx, yT], [cx, yB], [xr, yB], [xr, yT], [cx, yT]] : [[cx, yB], [cx, yT], [xr, yT], [xr, yB], [cx, yB]];
      CR.drawFlow(ctx, CR.pathInfo(path), phase, 46, "c", p.r1);
    }
    ro([
      { k: "North pole of the needle", v: on ? `Moves towards the ${dirH > 0 ? "east" : "west"} (turned ${fmt(Math.abs(dlt), 0)}°)` : "Points north (no current)", tone: on ? "good" : "" },
      { k: "Current in the wire", v: on ? (dirH > 0 ? "From north to south" : "From south to north") : "None" },
      { k: "Wire's field at the needle", v: on ? `≈ ${nice(Bw, 2)} µT (wire 1.5 cm above)` : "0" },
      { k: "What this shows", v: "Reversing the current reverses the deflection of the needle. So the direction of the magnetic field produced by the current is also reversed. A larger current gives a larger deflection.", wide: true }
    ]);
  }

  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); }
      if (o.on != null) { on = !!o.on; kSeg.set(on ? "in" : "out"); }
      if (o.I != null) { I = o.I; sI.value = I; }
      if (o.dirV != null) { dirV = o.dirV; vSeg.set(String(dirV)); }
      if (o.dirH != null) { dirH = o.dirH; hSeg.set(String(dirH)); }
      if (o.comp) comp = { ...o.comp };
      if (o.field != null) { show.field = !!o.field; showT.sync(); }
      sync(); draw();
    }
  };
};

/* =================================================================
   12.1, 12.2.1, 12.2.3, 12.2.4 — field patterns
   A plane view (paper or cardboard). Conductors are drawn where they
   cross the plane: ⊙ current towards you, ⊗ current away from you. The
   field is the sum of the fields of long straight wires (∝ I/r). A bar
   magnet is drawn over a hidden solenoid, which has the same pattern.
   ================================================================= */
CR.sims.field = function (stage, opt = {}) {
  const modes = opt.modes || ["magnet", "wire", "loop", "solenoid"];
  let mode = opt.mode || modes[0], view = opt.view || "filings";
  let I = opt.I ?? 3, dir = opt.dir ?? 1, n = opt.n ?? 1, core = !!opt.core, on = opt.on ?? true;
  let comp = opt.comp || null, traces = [], tracing = null, traceK = 0, dragging = false;
  const NAMES = { magnet: "Bar magnet", wire: "Straight wire", loop: "Circular coil", solenoid: "Solenoid" };
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 0.95, touch: true, alt: "Pattern of a magnetic field" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Source of the field", value: mode, options: modes.map(m => [m, NAMES[m]]) }, v => { mode = v; comp = null; traces = []; tracing = null; sync(); draw(); });
  const vSeg = seg(ctl, { label: "Show", value: view, options: [["filings", "Iron filings"], ["lines", "Field lines"], ["compasses", "Compass needles"], ["none", "Plain paper"]] }, v => { view = v; draw(); });
  const kSeg = seg(ctl, { label: "Plug key", value: on ? "in" : "out", options: [["out", "Out"], ["in", "In: current flows"]] }, v => { on = v === "in"; draw(); });
  const sI = slider(ctl, { label: "Current (rheostat)", min: 0.5, max: 5, step: 0.5, value: I, unit: "A", fmt: v => fmt(v, 1) }, v => { I = v; draw(); });
  const sN = slider(ctl, { label: "Number of turns n", min: 1, max: 50, step: 1, value: n }, v => { n = v; draw(); });
  const cRow = chipRow(stage, "");
  const revChip = chip(cRow, "⇄ Reverse the current", () => { dir = -dir; traces = []; tracing = null; draw(); });
  const coreChip = chip(cRow, "Soft iron core inside", () => { core = !core; coreChip.setAttribute("aria-pressed", String(core)); draw(); }, core);
  const pChip = chip(cRow, "Compass at P", () => { comp = ptPQ(2); draw(); });
  const qChip = chip(cRow, "Compass at Q (farther)", () => { comp = ptPQ(5); draw(); });
  const trChip = chip(cRow, "Trace a field line with a compass (Activity 12.3)", () => startTrace());
  const clrChip = chip(cRow, "Clear the marks", () => { traces = []; tracing = null; draw(); });
  cRow.append(h("span", { class: "presets-label" }, "Drag the compass, or tap to move it."));
  const ro = readouts(stage);
  function sync() {
    mSeg.el.style.display = modes.length > 1 ? "" : "none";
    const cur = mode !== "magnet";
    kSeg.el.style.display = sI.el.style.display = cur ? "" : "none";
    revChip.textContent = cur ? "⇄ Reverse the current" : "⇄ Turn the magnet round";
    sN.el.style.display = mode === "loop" ? "" : "none";
    coreChip.style.display = mode === "solenoid" ? "" : "none";
    pChip.style.display = qChip.style.display = mode === "wire" ? "" : "none";
    trChip.style.display = clrChip.style.display = mode === "magnet" ? "" : "none";
  }
  sync();

  function geom(W, H) {
    const cx = W / 2, cy = H / 2, s = Math.min(W, H) / 12;
    const g = { cx, cy, s, wires: [], vis: true };
    if (mode === "wire") g.wires = [{ x: cx, y: cy, I: dir }];
    else if (mode === "loop") { const a = Math.min(W * 0.16, H * 0.22); g.a = a; g.wires = [{ x: cx - a, y: cy, I: dir }, { x: cx + a, y: cy, I: -dir }]; }
    else {
      const len = Math.min(W * 0.36, 300), a = Math.min(H * 0.12, 42), nT = mode === "magnet" ? 31 : 9;
      Object.assign(g, { len, a, x1: cx - len / 2, x2: cx + len / 2, vis: mode !== "magnet" });
      for (let k = 0; k < nT; k++) { const x = g.x1 + (k + 0.5) * len / nT; g.wires.push({ x, y: cy - a, I: dir }, { x, y: cy + a, I: -dir }); }
      g.xN = dir > 0 ? g.x2 : g.x1; g.xS = dir > 0 ? g.x1 : g.x2;   // the field leaves the N end
    }
    return g;
  }
  const fieldAt = (g, x, y) => {
    let bx = 0, by = 0;
    for (const wi of g.wires) { const dx = x - wi.x, dy = y - wi.y, r2 = dx * dx + dy * dy + 4; bx += wi.I * dy / r2; by -= wi.I * dx / r2; }
    return [bx, by];
  };
  const strength = () => (mode === "magnet" ? 3 : !on ? 0 : mode === "wire" ? I : mode === "loop" ? n * I : I * (core ? 6 : 1));
  function inside(g, x, y, m) {
    if (mode === "magnet") return x > g.x1 - m && x < g.x2 + m && Math.abs(y - g.cy) < g.a + 7 + m;
    return g.wires.some(wi => Math.hypot(x - wi.x, y - wi.y) < 8 + m);
  }
  function ptPQ(rCm) { const g = geom(cv.w, cv.h); return { x: g.cx + rCm * g.s * Math.cos(-35 * DEG), y: g.cy + rCm * g.s * Math.sin(-35 * DEG) }; }
  function defaultComp(g) {
    if (mode === "wire") return ptPQ(2);
    if (mode === "loop") return { x: g.cx, y: g.cy + Math.min(70, cv.h * 0.3) };
    return { x: g.xN + (dir > 0 ? 70 : -70), y: g.cy - 50 };
  }

  /* iron filings: short dashes along the field, darker where the field is stronger */
  let fCache = null, fKey = "";
  function filings(g, W, H, p) {
    const S = strength();
    const key = [mode, dir, on, core, n, I, W, H, p.dark].join("|");
    if (key === fKey && fCache) return fCache;
    const c = document.createElement("canvas"), dpr = window.devicePixelRatio || 1;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    const x2 = c.getContext("2d"); x2.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rand = rng(20251019 + (mode.length * 7));
    const N = Math.round(W * H / 140);
    const refPt = mode === "wire" ? [g.cx, g.cy - 3 * g.s] : mode === "loop" ? [g.cx, g.cy - g.a * 1.6] : [g.cx, g.cy - g.a * 2.6];
    const ref = Math.hypot(...fieldAt(g, ...refPt)) * 3;
    const col = p.dark ? [222, 226, 236] : [38, 40, 46];
    x2.lineCap = "round"; x2.lineWidth = 1.35;
    for (let k = 0; k < N; k++) {
      const x = rand() * W, y = rand() * H;
      if (inside(g, x, y, 0)) continue;
      let ang, a;
      if (S <= 0) { ang = rand() * Math.PI; a = 0.3; }
      else {
        const [bx, by] = fieldAt(g, x, y);
        ang = Math.atan2(by, bx);
        a = clamp(0.34 + 0.3 * Math.log10(Math.hypot(bx, by) * S / ref), 0.08, 0.95);
      }
      const L = 3.8;
      x2.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`;
      x2.beginPath(); x2.moveTo(x - Math.cos(ang) * L, y - Math.sin(ang) * L); x2.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); x2.stroke();
    }
    fCache = c; fKey = key;
    return c;
  }
  /* field lines (cached) */
  let lCache = null, lKey = "";
  function fieldLines(g, W, H) {
    const key = [mode, dir, on, core, n, I, W, H].join("|");
    if (key === lKey) return lCache;
    let out = [];
    if (strength() > 0 && mode !== "wire") {
      const F = (x, y) => fieldAt(g, x, y), b = [0, 0, W, H], seeds = [];
      if (mode === "loop") {
        const cnt = clamp(Math.round(3 + 1.3 * Math.sqrt(n * I)), 3, 14);
        for (let k = 0; k < cnt; k++) seeds.push([g.cx - g.a + 12 + (2 * g.a - 24) * (k + 0.5) / cnt, g.cy]);
        for (const e of [16, 38, 66]) seeds.push([g.cx - g.a - e, g.cy], [g.cx + g.a + e, g.cy]);
      } else {
        const cnt = mode === "magnet" ? 7 : clamp(Math.round(4 + I * 0.8 + (core ? 4 : 0)), 4, 14);
        for (let k = 0; k < cnt; k++) seeds.push([g.cx, g.cy - g.a + 8 + (2 * g.a - 16) * (k + 0.5) / cnt]);
        for (const e of (mode === "magnet" ? [30, 62] : [22, 48])) seeds.push([g.cx, g.cy - g.a - e], [g.cx, g.cy + g.a + e]);
      }
      out = seeds.map(([x, y]) => fieldLine(x, y, F, b, mode === "magnet" ? [] : g.wires, 7));
    }
    lCache = out; lKey = key;
    return out;
  }

  /* Activity 12.3: move a compass step by step from the N pole, marking the needle's ends */
  function startTrace() {
    if (mode !== "magnet" || !cv.w) return;
    const g = geom(cv.w, cv.h);
    // start just outside the north half, near its end, and work round to the south pole
    const A = g.a + 7, starts = [[14, -1], [14, 1], [42, -1], [42, 1], [75, -1], [75, 1], [110, -1], [110, 1]];
    const [dx, side] = starts[traceK % starts.length]; traceK++;
    const sg = dir > 0 ? 1 : -1, Ln = 26;
    let x = g.xN - sg * dx, y = g.cy + side * (A + 7);
    const pts = [[x, y]];
    for (let k = 0; k < 220; k++) {
      const [bx, by] = fieldAt(g, x, y), m = Math.hypot(bx, by);
      if (m < 1e-12) break;
      const [bx2, by2] = fieldAt(g, x + bx / m * Ln / 2, y + by / m * Ln / 2), m2 = Math.hypot(bx2, by2);
      x += bx2 / m2 * Ln; y += by2 / m2 * Ln;
      pts.push([x, y]);
      if (x < 4 || y < 4 || x > cv.w - 4 || y > cv.h - 4) break;
      if (k > 1 && x > g.x1 - 6 && x < g.x2 + 6 && Math.abs(y - g.cy) < g.a + 12) break;
    }
    tracing = { pts, t: 0 };
  }
  onFrame(dt => {
    if (!tracing) return;
    tracing.t += dt;
    if (1 + Math.floor(tracing.t / 0.12) >= tracing.pts.length + 3) { traces.push(tracing.pts); tracing = null; }
    draw();
  });

  function hitComp(q) { return comp && Math.hypot(q.x - comp.x, q.y - comp.y) < 26; }
  cv.cv.addEventListener("pointerdown", e => { const q = cv.pos(e); dragging = true; cv.cv.setPointerCapture(e.pointerId); if (!hitComp(q)) { comp = q; draw(); } });
  cv.cv.addEventListener("pointermove", e => { if (!dragging) return; const q = cv.pos(e); comp = { x: clamp(q.x, 12, cv.w - 12), y: clamp(q.y, 12, cv.h - 12) }; draw(); });
  ["pointerup", "pointercancel"].forEach(t => cv.cv.addEventListener(t, () => { dragging = false; }));

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = p.dark ? "#202534" : "#fbfaf6"; ctx.fillRect(0, 0, W, H);
    const g = geom(W, H), S = strength();
    if (!comp) comp = defaultComp(g);
    comp.x = clamp(comp.x, 12, W - 12); comp.y = clamp(comp.y, 12, H - 12);
    const small = W < 560 ? 11 : 12;

    // body of the source
    if (mode === "magnet") {
      const yT = g.cy - g.a - 7, yB = g.cy + g.a + 7, xm = g.cx;
      const nRight = dir > 0;
      ctx.save(); ctx.globalAlpha = 0.95;
      ctx.fillStyle = nRight ? BLUE : RED; ctx.fillRect(g.x1, yT, xm - g.x1, yB - yT);
      ctx.fillStyle = nRight ? RED : BLUE; ctx.fillRect(xm, yT, g.x2 - xm, yB - yT);
      ctx.restore();
      label(ctx, nRight ? "S" : "N", (g.x1 + xm) / 2, g.cy, { color: "#fff", size: 24, weight: 700 });
      label(ctx, nRight ? "N" : "S", (xm + g.x2) / 2, g.cy, { color: "#fff", size: 24, weight: 700 });
    }
    if (mode === "solenoid") {
      ctx.save(); ctx.strokeStyle = p.soft; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
      ctx.strokeRect(g.x1 - 6, g.cy - g.a - 12, g.len + 12, 2 * g.a + 24); ctx.restore();
      if (core) {
        ctx.fillStyle = p.dark ? "#59606e" : "#a3a9b4";
        ctx.fillRect(g.x1 + 2, g.cy - g.a + 13, g.len - 4, 2 * g.a - 26);
        const ct = on ? "Soft iron core (now a strong magnet)" : "Soft iron core (not a magnet now)";
        label(ctx, textWidth(ctx, ct, small, 700) < g.len - 12 ? ct : ct.replace(" (", "\n("), g.cx, g.cy, { color: "#fff", size: small, weight: 700, maxW: g.len - 12 });
      }
    }
    if (mode === "loop") {
      line(ctx, g.cx - g.a, g.cy, g.cx + g.a, g.cy, COPPER, 3, [7, 6], 0.5);
      label(ctx, `Coil of ${n} turn${n > 1 ? "s" : ""} (stands upright through two holes)`, g.cx, g.cy + 30, { color: p.soft, size: small, bg: p.surface2 });
    }

    // pattern
    if (view === "filings") ctx.drawImage(filings(g, W, H, p), 0, 0, W, H);
    else if (view === "lines" && S > 0) {
      if (mode === "wire") {
        const cnt = 4 + Math.round(I * 0.9), maxR = Math.hypot(W, H) / 2, q = Math.pow(maxR / 20, 1 / cnt);
        for (let k = 0; k < cnt; k++) {
          const R = 20 * Math.pow(q, k);
          ctx.save(); ctx.strokeStyle = p.accent; ctx.globalAlpha = 0.85; ctx.lineWidth = 1.7;
          ctx.beginPath(); ctx.arc(g.cx, g.cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          [-Math.PI / 2 + 0.3 * k, Math.PI / 2 + 0.3 * k].forEach(a => {
            const x = g.cx + R * Math.cos(a), y = g.cy + R * Math.sin(a);   // screen angle a
            const t = dir > 0 ? a - Math.PI / 2 : a + Math.PI / 2;          // anticlockwise on screen for ⊙
            head(ctx, x, y, t, 10, p.accent);
          });
        }
      } else {
        for (const pts of fieldLines(g, W, H)) { polyline(ctx, pts, p.accent, 1.7, 0.9); arrowsAlong(ctx, pts, p.accent, 130, 50, 9); }
      }
    } else if (view === "compasses") {
      const sp = W < 560 ? 26 : 32;
      for (let gx = sp / 2; gx < W; gx += sp) for (let gy = sp / 2; gy < H; gy += sp) {
        if (inside(g, gx, gy, 6)) continue;
        let a = -Math.PI / 2;
        if (S > 0) { const [bx, by] = fieldAt(g, gx, gy); a = Math.atan2(by, bx); }
        const L = sp * 0.36;
        line(ctx, gx, gy, gx + Math.cos(a) * L, gy + Math.sin(a) * L, RED, 2.4);
        line(ctx, gx, gy, gx - Math.cos(a) * L, gy - Math.sin(a) * L, p.soft, 2.4);
      }
      if (S <= 0) label(ctx, "No current: every compass points north (the Earth's field)", W / 2, H - 16, { color: p.text, size: small, bg: p.surface });
    }
    if (view === "lines" && S <= 0) label(ctx, "No current, so no magnetic field", W / 2, 40, { color: p.text, size: 13, bg: p.surface2 });

    // conductors where they cross the plane
    if (g.vis) g.wires.forEach(wi => wireEnd(ctx, wi.x, wi.y, on ? wi.I : 0, p, mode === "wire" ? 11 : 9));
    if (mode === "solenoid" && on) {
      const nE = dir > 0 ? g.x2 + 26 : g.x1 - 26, sE = dir > 0 ? g.x1 - 26 : g.x2 + 26;
      label(ctx, "N", nE, g.cy, { color: RED, size: 22, weight: 700, bg: p.surface });
      label(ctx, "S", sE, g.cy, { color: BLUE, size: 22, weight: 700, bg: p.surface });
    }
    if (mode === "wire") {
      [[2, "P"], [5, "Q"]].forEach(([r, t]) => {
        const q = ptPQ(r);
        circle(ctx, q.x, q.y, 3.5, p.text);
        label(ctx, t, q.x + 10, q.y - 12, { color: p.text, size: 14, weight: 700 });
      });
    }

    // traced field lines (Activity 12.3)
    const drawDots = (pts, k) => { for (let j = 0; j < k; j++) circle(ctx, pts[j][0], pts[j][1], 3, RED); };
    traces.forEach(pts => { polyline(ctx, pts, p.r2, 2.2, 0.95); arrowsAlong(ctx, pts, p.r2, 120, 60, 9); drawDots(pts, pts.length); });
    if (tracing) {
      const k = Math.min(tracing.pts.length, 1 + Math.floor(tracing.t / 0.12));
      drawDots(tracing.pts, k);
      if (k >= 2) {
        const [x1, y1] = tracing.pts[k - 2], [x2, y2] = tracing.pts[k - 1];
        compass(ctx, (x1 + x2) / 2, (y1 + y2) / 2, 17, Math.atan2(y2 - y1, x2 - x1), p);
      }
    }

    // the movable compass
    let ang = -Math.PI / 2;
    if (S > 0) { const [bx, by] = fieldAt(g, comp.x, comp.y); ang = Math.atan2(by, bx); }
    compass(ctx, comp.x, comp.y, 19, ang, p);

    const where = { magnet: "Bar magnet on a sheet of paper, seen from above", wire: "Cardboard seen from above: the wire passes vertically through it (⊙ current upwards, ⊗ downwards)", loop: "Cardboard seen from above: the coil passes through two holes in it", solenoid: "A solenoid cut along its length:\n⊙ current towards you, ⊗ current away from you" }[mode];
    const wTxt = textWidth(ctx, where.replace("\n", " "), small) < W - 24 ? where.replace("\n", " ") : where;
    label(ctx, wTxt, 10, 9, { color: p.soft, size: small, align: "left", base: "top", bg: p.surface2, maxW: W - 24 });

    const items = [];
    if (mode === "magnet") {
      items.push({ k: "Outside the magnet", v: "Field lines emerge from the north pole and merge at the south pole" });
      items.push({ k: "Inside the magnet", v: "From the south pole to the north pole, so field lines are closed curves" });
      items.push({ k: "Where the field is strongest", v: "Near the poles, where the field lines are crowded together" });
      items.push({ k: "Compass", v: "Its north pole points along the field line at that point; no two field lines ever cross", wide: true });
      if (traces.length || tracing) items.push({ k: "Activity 12.3", v: "Each red dot marks where an end of the needle was. Joining the dots with a smooth curve gives one field line. The deflection of the needle increases near the poles.", wide: true });
    } else if (mode === "wire") {
      const r = Math.hypot(comp.x - g.cx, comp.y - g.cy) / g.s;
      items.push({ k: "Field lines", v: on ? `Concentric circles; ${dir > 0 ? "anticlockwise" : "clockwise"} seen from above for current ${dir > 0 ? "upwards" : "downwards"}` : "None: no current", wide: true });
      items.push({ k: "Compass distance from the wire", v: `${fmt(r, 1)} cm` });
      items.push({ k: "Field at the compass", v: on ? `≈ ${nice(wireField(I, r), 2)} µT` : "0" });
      items.push({ k: "What changes the field", v: "A larger current gives a stronger field. Farther from the wire the field is weaker, so the circles get larger and farther apart.", wide: true });
    } else if (mode === "loop") {
      const Rcm = g.a / g.s;
      items.push({ k: "Near the centre of the coil", v: on ? "The field lines are almost straight lines" : "No current, no field", wide: true });
      items.push({ k: "Field at the centre", v: on ? `≈ ${nice(62.83 * n * I / Rcm, 3)} µT (radius ${fmt(Rcm, 1)} cm)` : "0" });
      items.push({ k: "With n turns", v: `${n} × the field of one turn` });
      items.push({ k: "Why", v: "The current in every turn has the same direction, so the fields of all the turns add up.", wide: true });
    } else {
      items.push({ k: "Inside the solenoid", v: on ? "Parallel straight lines: the field is the same at all points (uniform)" : "No current, no field", wide: true });
      items.push({ k: "Ends", v: on ? `Like a bar magnet: the ${dir > 0 ? "right" : "left"} end is a north pole` : "Not a magnet now" });
      items.push({ k: "Soft iron core", v: core ? (on ? "Magnetised strongly: an electromagnet" : "Loses its magnetism when the current stops") : "Not inside" });
    }
    ro(items);
  }

  return {
    set(o) {
      if (o.mode && modes.includes(o.mode)) { mode = o.mode; mSeg.set(mode); comp = null; traces = []; tracing = null; }
      if (o.view) { view = o.view; vSeg.set(view); }
      if (o.on != null) { on = !!o.on; kSeg.set(on ? "in" : "out"); }
      if (o.I != null) { I = o.I; sI.value = I; }
      if (o.n != null) { n = o.n; sN.value = n; }
      if (o.dir != null) dir = o.dir;
      if (o.core != null) { core = !!o.core; coreChip.setAttribute("aria-pressed", String(core)); }
      if (o.at) comp = o.at === "P" ? ptPQ(2) : o.at === "Q" ? ptPQ(5) : null;
      if (o.trace) { traces = []; tracing = null; sync(); startTrace(); }
      sync(); draw();
    }
  };
};

/* =================================================================
   12.2.2 — Right-hand thumb rule (3-D views)
   ================================================================= */
CR.sims.thumbRule = function (stage, opt = {}) {
  let mode = opt.mode || "vertical", dirV = opt.dirV ?? 1, dirP = opt.dirP ?? 1, cw = opt.cw ?? true;
  const show = { hand: opt.hand ?? true, needles: opt.needles ?? true };
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 0.95, alt: "Right-hand thumb rule" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Conductor", value: mode, options: [["vertical", "Vertical wire"], ["powerline", "Horizontal power line (Example 12.1)"], ["loop", "Loop lying on a table"]] }, v => { mode = v; sync(); draw(); });
  const vSeg = seg(ctl, { label: "Current", value: String(dirV), options: [["1", "Upwards"], ["-1", "Downwards"]] }, v => { dirV = +v; draw(); });
  const pSeg = seg(ctl, { label: "Current", value: String(dirP), options: [["1", "East to west"], ["-1", "West to east"]] }, v => { dirP = +v; draw(); });
  const lSeg = seg(ctl, { label: "Current, seen from above", value: cw ? "cw" : "acw", options: [["cw", "Clockwise"], ["acw", "Anticlockwise"]] }, v => { cw = v === "cw"; draw(); });
  const sRow = chipRow(stage, "Show");
  const showT = toggles(sRow, [["hand", "Thumb and curled fingers"], ["needles", "Compass needles"]], show, () => draw());
  const ro = readouts(stage);
  function sync() {
    vSeg.el.style.display = mode === "vertical" ? "" : "none";
    pSeg.el.style.display = mode === "powerline" ? "" : "none";
    lSeg.el.style.display = mode === "loop" ? "" : "none";
    sRow.style.display = mode === "loop" ? "none" : "";
  }
  sync();

  function circle3(ctx, P, pts, col, part, width = 2, alpha = 0.9) {
    // pts: [[x,y,z], …] round a closed circle; part: "back" | "front" decided by depth relative to dRef
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.globalAlpha = part === "back" ? alpha * 0.55 : alpha; ctx.lineCap = "round";
    ctx.beginPath(); let pen = false;
    pts.forEach(q => {
      const keep = q.back === (part === "back");
      const [x, y] = P(q[0], q[1], q[2]);
      if (keep) { if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; } } else pen = false;
    });
    ctx.stroke(); ctx.restore();
  }
  function rod3(ctx, P, a, b, p, wpx = 7) {
    const [x1, y1] = P(...a), [x2, y2] = P(...b);
    line(ctx, x1, y1, x2, y2, shadeOf(COPPER, -0.4), wpx + 2);
    line(ctx, x1, y1, x2, y2, COPPER, wpx);
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    const small = W < 560 ? 11 : 12;
    if (mode === "loop") return drawLoop(ctx, W, H, p, small);
    if (mode === "vertical") {
      const s = Math.min(W / 7.6, H / 5.6), P = view3D(W * 0.5, H * 0.6, s, 30 * DEG, 24 * DEG);
      poly3(ctx, P, [[-2.6, -2.2, 0], [2.6, -2.2, 0], [2.6, 2.2, 0], [-2.6, 2.2, 0]], p.dark ? "rgba(214,190,150,0.16)" : "rgba(214,190,150,0.35)", p.soft, 1.2);
      label(ctx, "Cardboard", ...P(2.5, -2.1, 0), { color: p.soft, size: small, align: "right", base: "top" });
      arrow3(ctx, P, [-2.3, 1.6, 0], [-1.5, 1.6, 0], p.soft, 2, 9); label(ctx, "E", ...P(-1.35, 1.6, 0), { color: p.soft, size: 12, weight: 700 });
      arrow3(ctx, P, [-2.3, 1.6, 0], [-2.3, 2.15, 0], p.soft, 2, 9); label(ctx, "N", ...P(-2.3, 2.4, 0), { color: p.soft, size: 12, weight: 700 });
      const rings = [0.7, 1.3, 1.9].map(r => {
        const pts = [];
        for (let k = 0; k <= 96; k++) { const t = k / 96 * 2 * Math.PI, q = [r * Math.cos(t), r * Math.sin(t), 0]; q.back = P.depth(q[0], q[1]) > 0; pts.push(q); }
        return { r, pts };
      });
      rings.forEach(R => circle3(ctx, P, R.pts, p.accent, "back"));
      rod3(ctx, P, [0, 0, -1.9], [0, 0, 2.5], p);
      rings.forEach(R => circle3(ctx, P, R.pts, p.accent, "front"));
      // arrowheads on the front of each ring (anticlockwise seen from above for current upwards)
      rings.forEach(R => {
        const t0 = 30 * DEG - Math.PI / 2;
        [t0, t0 + 0.9].forEach(t => {
          const q = [R.r * Math.cos(t), R.r * Math.sin(t), 0], tn = [-Math.sin(t) * dirV, Math.cos(t) * dirV, 0];
          const [x1, y1] = P(...q), [x2, y2] = P(q[0] + tn[0] * 0.05, q[1] + tn[1] * 0.05, 0);
          head(ctx, x1, y1, Math.atan2(y2 - y1, x2 - x1), 11, p.accent);
        });
      });
      [-1.2, 1.1].forEach(z => arrow3(ctx, P, [0, 0, z - 0.3 * dirV], [0, 0, z + 0.3 * dirV], p.r1, 3, 12));
      label(ctx, `Current ${dirV > 0 ? "upwards" : "downwards"}`, ...((q) => [q[0] + 14, q[1]])(P(0, 0, 2.2)), { color: p.r1, size: 13, align: "left", weight: 700 });
      if (show.needles) {
        [[0, "E"], [90, "N"], [180, "W"], [270, "S"]].forEach(([tdeg]) => {
          const t = tdeg * DEG, c = [1.3 * Math.cos(t), 1.3 * Math.sin(t), 0.02], b = [-Math.sin(t) * dirV, Math.cos(t) * dirV, 0];
          const [xa, ya] = P(c[0] - b[0] * 0.3, c[1] - b[1] * 0.3, c[2]), [xb, yb] = P(c[0] + b[0] * 0.3, c[1] + b[1] * 0.3, c[2]), [xc, yc] = P(...c);
          line(ctx, xc, yc, xb, yb, RED, 4); line(ctx, xa, ya, xc, yc, p.dark ? "#a7afc4" : "#5d6577", 4); circle(ctx, xc, yc, 2.5, p.text);
        });
      }
      if (show.hand) {
        const z0 = 1.55, rr = 0.42, a0 = -40 * DEG, span = 280 * DEG, pts = [];
        for (let k = 0; k <= 40; k++) { const t = a0 + dirV * span * k / 40; pts.push(P(rr * Math.cos(t), rr * Math.sin(t), z0)); }
        polyline(ctx, pts, ORANGE, 6, 0.9);
        const [xe, ye] = pts[pts.length - 1], [xd, yd] = pts[pts.length - 3];
        head(ctx, xe, ye, Math.atan2(ye - yd, xe - xd), 15, ORANGE);
        arrow3(ctx, P, [-0.62, 0, 1.55 - 0.55 * dirV], [-0.62, 0, 1.55 + 0.75 * dirV], ORANGE, 7, 16);
        const [lx, ly] = P(-0.75, 0, 1.55 + 0.75 * dirV);
        label(ctx, "Thumb: current", lx - 8, ly, { color: ORANGE, size: 13, align: "right", weight: 700 });
        const [fx, fy] = P(rr, 0, z0);
        label(ctx, "Curled fingers: field", fx + 30, fy + 8, { color: ORANGE, size: 13, align: "left", weight: 700 });
      }
      ro([
        { k: "Current in the wire", v: dirV > 0 ? "Upwards" : "Downwards" },
        { k: "Field lines", v: `Concentric circles, ${dirV > 0 ? "anticlockwise" : "clockwise"} when seen from above` },
        { k: "Right-hand thumb rule", v: `Hold the wire in your right hand with the thumb pointing ${dirV > 0 ? "upwards" : "downwards"}, along the current. Your fingers wrap round the wire in the direction of the field lines: ${dirV > 0 ? "anticlockwise" : "clockwise"} seen from above.`, wide: true }
      ]);
    } else {
      const s = Math.min(W / 8.2, H / 5.4), P = view3D(W * 0.5, H * 0.47, s, 34 * DEG, 18 * DEG);
      const zg = -1.9;
      poly3(ctx, P, [[-3.2, -1.8, zg], [3.2, -1.8, zg], [3.2, 1.8, zg], [-3.2, 1.8, zg]], p.dark ? "rgba(100,150,90,0.18)" : "rgba(120,170,100,0.25)", p.soft, 1);
      arrow3(ctx, P, [-2.9, -1.3, zg], [-2.1, -1.3, zg], p.soft, 2, 9); label(ctx, "E", ...P(-1.9, -1.3, zg), { color: p.text, size: 12, weight: 700 });
      arrow3(ctx, P, [-2.9, -1.3, zg], [-2.9, -0.4, zg], p.soft, 2, 9); label(ctx, "N", ...P(-2.9, -0.15, zg), { color: p.text, size: 12, weight: 700 });
      [-2.9, 2.9].forEach(x => { const [a1, b1] = P(x, 0, zg), [a2, b2] = P(x, 0, 0.15); line(ctx, a1, b1, a2, b2, p.dark ? "#8a7a66" : "#7a6650", 5); });
      const rings = [-1.6, 0, 1.6].map(x0 => {
        const r = 0.95, pts = [];
        for (let k = 0; k <= 96; k++) { const t = k / 96 * 2 * Math.PI, q = [x0, r * Math.cos(t), r * Math.sin(t)]; q.back = q[1] > 0; pts.push(q); }
        return { x0, r, pts };
      });
      const Bat = t => [0, dirP * Math.sin(t), -dirP * Math.cos(t)];   // field at angle t round a wire with current east→west (dirP = 1)
      rings.forEach(R => circle3(ctx, P, R.pts, p.accent, "back"));
      rod3(ctx, P, [-3.3, 0, 0], [3.3, 0, 0], p, 6);
      rings.forEach(R => circle3(ctx, P, R.pts, p.accent, "front"));
      rings.forEach(R => [-0.55, 0.55].forEach(t0 => {
        const t = Math.PI + t0, q = [R.x0, R.r * Math.cos(t), R.r * Math.sin(t)], b = Bat(t);
        const [x1, y1] = P(...q), [x2, y2] = P(q[0], q[1] + b[1] * 0.05, q[2] + b[2] * 0.05);
        head(ctx, x1, y1, Math.atan2(y2 - y1, x2 - x1), 11, p.accent);
      }));
      [-2.3, 0.8].forEach(x => arrow3(ctx, P, [x + 0.35 * dirP, 0, 0], [x - 0.35 * dirP, 0, 0], p.r1, 3, 12));
      label(ctx, `Current from ${dirP > 0 ? "east to west" : "west to east"} (red arrows on the wire)`, 10, 9, { color: p.r1, size: small + 1, weight: 700, align: "left", base: "top", maxW: W - 20 });
      const pts = [[0, 0, 0.95, "above"], [0, 0, -0.95, "below"]];
      pts.forEach(([x, y, z, nm]) => {
        const b = Bat(nm === "above" ? Math.PI / 2 : -Math.PI / 2);
        const [xc, yc] = P(x, y, z);
        circle(ctx, xc, yc, 4, p.text);
        if (show.needles) {
          const [xa, ya] = P(x, y - b[1] * 0.42, z), [xb, yb] = P(x, y + b[1] * 0.42, z);
          line(ctx, xc, yc, xb, yb, RED, 4.5); line(ctx, xa, ya, xc, yc, p.dark ? "#a7afc4" : "#5d6577", 4.5);
        }
        const dirTxt = b[1] > 0 ? "north" : "south";
        const up = nm === "above";
        label(ctx, `Directly ${nm}: field towards the ${dirTxt}`, xc + 26, yc + (up ? -8 : 10), { color: p.text, size: 13, align: "left", base: up ? "bottom" : "top", weight: 700, bg: p.surface2, maxW: W - xc - 34 });
      });
      if (show.hand) {
        const x0 = 2.25, rr = 0.42, pts2 = [];
        for (let k = 0; k <= 40; k++) { const t = -Math.PI / 2 - 0.7 + (k / 40) * 4.9 * (dirP > 0 ? -1 : 1); pts2.push(P(x0, rr * Math.cos(t), rr * Math.sin(t))); }
        polyline(ctx, pts2, ORANGE, 6, 0.9);
        const [xe, ye] = pts2[pts2.length - 1], [xd, yd] = pts2[pts2.length - 3];
        head(ctx, xe, ye, Math.atan2(ye - yd, xe - xd), 15, ORANGE);
        arrow3(ctx, P, [x0 + 0.55 * dirP, 0, 0.62], [x0 - 0.75 * dirP, 0, 0.62], ORANGE, 7, 16);
        label(ctx, "Thumb: current", ...((q) => [q[0], q[1] - 16])(P(x0 - 0.1, 0, 0.62)), { color: ORANGE, size: 13, weight: 700 });
      }
      const above = dirP > 0 ? "north" : "south", below = dirP > 0 ? "south" : "north";
      ro([
        { k: "Current", v: dirP > 0 ? "From east to west" : "From west to east" },
        { k: "Field directly below the line", v: `From ${above} to ${below}, i.e. towards the ${below}` },
        { k: "Field directly above the line", v: `From ${below} to ${above}, i.e. towards the ${above}` },
        { k: "Right-hand thumb rule", v: `Point the thumb of your right hand ${dirP > 0 ? "west" : "east"}, along the current. The fingers curl ${below === "south" ? "towards the south under the wire and towards the north over it" : "towards the north under the wire and towards the south over it"}.`, wide: true }
      ]);
    }
  }

  function drawLoop(ctx, W, H, p, small) {
    const cx = W / 2, cy = H / 2 - 4, R = Math.min(W * 0.27, (H - 64) * 0.3);
    roundRect(ctx, cx - R * 1.75, cy - R * 1.55, R * 3.5, R * 3.1, 14);
    ctx.fillStyle = p.dark ? "rgba(214,190,150,0.14)" : "rgba(214,190,150,0.3)"; ctx.fill();
    label(ctx, "A loop lying on a table top, seen from above", 10, 9, { color: p.soft, size: small, align: "left", base: "top", maxW: W - 20 });
    ctx.save(); ctx.strokeStyle = COPPER; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    [0, 1, 2, 3].forEach(k => {
      const a = k * Math.PI / 2 + Math.PI / 4, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      head(ctx, x, y, a + (cw ? Math.PI / 2 : -Math.PI / 2), 16, p.r1);
    });
    const sym = (x, y, into) => {
      circle(ctx, x, y, 9, p.surface, p.accent, 2);
      if (into) { const k = 5; line(ctx, x - k, y - k, x + k, y + k, p.accent, 2); line(ctx, x - k, y + k, x + k, y - k, p.accent, 2); }
      else circle(ctx, x, y, 2.6, p.accent);
    };
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
      const x = cx + i * R * 0.3, y = cy + j * R * 0.3;
      if (Math.hypot(x - cx, y - cy) < R * 0.78) sym(x, y, cw);
    }
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6 + 0.26; sym(cx + 1.32 * R * Math.cos(a), cy + 1.32 * R * Math.sin(a), !cw); }
    const leg = "⊗ field into the table (downwards)    ⊙ field out of the table (upwards)";
    const one = textWidth(ctx, leg, small) < W - 24;
    label(ctx, one ? leg : leg.replace("    ", "\n"), W / 2, H - 8, { color: p.text, size: small, base: "bottom", bg: p.surface2 });
    label(ctx, `Current ${cw ? "clockwise" : "anticlockwise"}`, cx, cy - R - 22, { color: p.r1, size: 13, weight: 700, bg: p.surface2 });
    ro([
      { k: "Inside the loop", v: cw ? "Field into the table (vertically downwards)" : "Field out of the table (vertically upwards)" },
      { k: "Outside the loop", v: cw ? "Field out of the table (vertically upwards)" : "Field into the table (vertically downwards)" },
      { k: "How to see it", v: `Apply the right-hand thumb rule to any part of the loop. For example, where the current goes ${cw ? "east along the far (north) side" : "west along the far (north) side"}, the fingers curl ${cw ? "downwards on the inside and upwards on the outside" : "upwards on the inside and downwards on the outside"}. Every part of the loop gives the same answer.`, wide: true }
    ]);
  }

  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); }
      if (o.dirV != null) { dirV = o.dirV; vSeg.set(String(dirV)); }
      if (o.dirP != null) { dirP = o.dirP; pSeg.set(String(dirP)); }
      if (o.cw != null) { cw = !!o.cw; lSeg.set(cw ? "cw" : "acw"); }
      ["hand", "needles"].forEach(k => { if (o[k] != null) show[k] = !!o[k]; });
      showT.sync(); sync(); draw();
    }
  };
};

/* =================================================================
   12.3, Activity 12.7 — force on a current-carrying rod
   Rod AB runs away from you (A near, B far). Field upwards when the
   north pole is below and the south pole above. F = I × B: current
   from B to A with the field upwards pushes the rod to the left.
   ================================================================= */
CR.sims.force = function (stage, opt = {}) {
  let on = opt.on ?? true, cur = opt.cur ?? 1, up = opt.up ?? true, I = opt.I ?? 3, strong = !!opt.strong, long = !!opt.long;
  const show = { rule: opt.rule ?? true };
  let x = 0, phase = 0;
  const cv = makeCanvas(stage, { ratio: 0.58, mratio: 1.02, alt: "Activity 12.7: a current-carrying aluminium rod between the poles of a horse-shoe magnet" });
  const ctl = controls(stage);
  const kSeg = seg(ctl, { label: "Key", value: on ? "on" : "off", options: [["off", "Open"], ["on", "Closed"]] }, v => { on = v === "on"; });
  const cSeg = seg(ctl, { label: "Current in rod AB", value: String(cur), options: [["1", "From B to A"], ["-1", "From A to B"]] }, v => { cur = +v; });
  const fSeg = seg(ctl, { label: "Magnet", value: up ? "up" : "down", options: [["up", "N below, S above (field upwards)"], ["down", "Poles interchanged (field downwards)"]] }, v => { up = v === "up"; });
  const sI = slider(ctl, { label: "Current (rheostat)", min: 0.5, max: 5, step: 0.5, value: I, unit: "A", fmt: v => fmt(v, 1) }, v => { I = v; });
  const gSeg = seg(ctl, { label: "Horse-shoe magnet", value: strong ? "strong" : "normal", options: [["normal", "Ordinary"], ["strong", "Stronger"]] }, v => { strong = v === "strong"; });
  const lSeg = seg(ctl, { label: "Rod AB", value: long ? "long" : "short", options: [["short", "About 5 cm"], ["long", "Longer (10 cm)"]] }, v => { long = v === "long"; });
  const sRow = chipRow(stage, "Show");
  const showT = toggles(sRow, [["rule", "Fleming's left-hand rule"]], show, () => {});
  const ro = readouts(stage);
  const b = () => (up ? 1 : -1);
  const Fx = () => -cur * b();                       // (0, −cur, 0) × (0, 0, b) = (−cur·b, 0, 0)
  const mag = () => (strong ? 2 : 1) * I * (long ? 2 : 1);
  const target = () => (on ? Fx() * 0.75 * Math.pow(mag() / 20, 0.7) : 0);
  onFrame(dt => { x += (target() - x) * Math.min(1, dt * 5); phase += dt * (on ? 30 : 0); draw(); });

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    const small = W < 560 ? 11 : 12;
    const s = Math.min(W / 8.4, H / 5.8), P = view3D(W * (W < 640 ? 0.44 : 0.42), H * 0.57, s, 28 * DEG, 24 * DEG);
    const L = long ? 3.0 : 1.9, lw = 2.1, zr = lw - Math.sqrt(lw * lw - x * x);
    const col = { N: "#c9443f", S: "#3f6fd8" };
    const bot = up ? "N" : "S", topP = up ? "S" : "N";
    // stand
    const stand = p.dark ? "#8b93a7" : "#6b7280";
    const [s1x, s1y] = P(-2.7, 0.9, -1.7), [s2x, s2y] = P(-2.7, 0.9, lw), [s3x, s3y] = P(0, 0.9, lw);
    line(ctx, s1x, s1y, s2x, s2y, stand, 6); line(ctx, s2x, s2y, s3x, s3y, stand, 5);
    const [b1x, b1y] = P(0, -L / 2 - 0.15, lw), [b2x, b2y] = P(0, L / 2 + 0.15, lw);
    line(ctx, b1x, b1y, b2x, b2y, stand, 5);
    label(ctx, "Stand", s1x - 8, s1y - 20, { color: p.soft, size: small, align: "right" });
    // magnet: bottom pole, body on the right
    box3(ctx, P, -0.85, 0.85, -0.42, 0.42, -1.3, -0.62, col[bot], p);
    box3(ctx, P, 0.85, 1.4, -0.42, 0.42, -1.3, 1.3, "#8a8f9c", p);
    box3(ctx, P, -0.85, 0.85, -0.42, 0.42, 0.62, 1.3, col[topP], p, 0.95);
    label(ctx, bot, ...P(0, -0.42, -0.96), { color: "#fff", size: 18, weight: 700 });
    label(ctx, topP, ...P(0, -0.42, 0.96), { color: "#fff", size: 18, weight: 700 });

    label(ctx, "Horse-shoe magnet", ...((q) => [q[0] + 6, q[1]])(P(1.4, -0.42, -1.3)), { color: p.soft, size: small, align: "left", base: "top" });
    // field arrows in the gap between the poles
    const fz = up ? [-0.55, 0.55] : [0.55, -0.55];
    [[-0.55, 0.2], [0, 0.2], [0.55, 0.2], [-0.55, -0.25], [0, -0.25], [0.55, -0.25]].forEach(([fx, fy]) =>
      arrow3(ctx, P, [fx, fy, fz[0]], [fx, fy, fz[1]], p.r3, 2, 10, null, 0.7));
    // suspension wires and the rod
    [-1, 1].forEach(k => {
      const [ax, ay] = P(0, k * L / 2 * 0.96, lw), [cx2, cy2] = P(x, k * L / 2 * 0.96, zr);
      line(ctx, ax, ay, cx2, cy2, p.text, 1.5);
    });
    const [rax, ray] = P(x, -L / 2, zr), [rbx, rby] = P(x, L / 2, zr);
    line(ctx, rax, ray, rbx, rby, "#6c7380", 11); line(ctx, rax, ray, rbx, rby, "#c6ccd6", 7);
    label(ctx, "A", rax - 14, ray + 4, { color: p.text, size: 16, weight: 700 });
    label(ctx, "B", rbx + 14, rby - 4, { color: p.text, size: 16, weight: 700 });
    // current and force
    if (on) {
      CR.drawFlow(ctx, CR.pathInfo(cur > 0 ? [P(x, L / 2, zr + 0.16), P(x, -L / 2, zr + 0.16)] : [P(x, -L / 2, zr + 0.16), P(x, L / 2, zr + 0.16)]), phase, 34, "c", p.r2);
      arrow3(ctx, P, [x, 0, zr], [x + Math.sign(Fx()) * 1.25, 0, zr], p.r1, 4.5, 15);
      const [fxl, fyl] = P(x + Math.sign(Fx()) * 1.3, 0, zr);
      label(ctx, "Force", fxl + (Fx() < 0 ? -8 : 8), fyl - 14, { color: p.r1, size: 14, weight: 700, align: Fx() < 0 ? "right" : "left" });
    }
    const [flx, fly] = P(1.4, 0.42, -0.45);   // below the force arrow, so the two labels never meet
    label(ctx, `Magnetic field ${up ? "upwards" : "downwards"}`, flx + 8, fly, { color: p.r3, size: small, align: "left", weight: 700, maxW: W - flx - 14 });
    label(ctx, "Current: battery, key and rheostat in series with AB", 10, H - 8, { color: p.soft, size: small, align: "left", base: "bottom", maxW: W - 20 });
    // Fleming's left-hand rule inset
    if (show.rule && W > 420) {
      const bw = 196, bh = Math.min(H * 0.5, 210), bx = W - bw - 8;
      const Q = view3D(bx + bw / 2, 22 + bh * 0.55, 46, 28 * DEG, 24 * DEG);
      roundRect(ctx, bx, 8, bw, bh, 10); ctx.fillStyle = p.surface; ctx.globalAlpha = 0.94; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = p.border; ctx.lineWidth = 1; ctx.stroke();
      label(ctx, "Fleming's left-hand rule", bx + bw / 2, 22, { color: p.text, size: 12, weight: 700 });
      const tip = (v, dx, dy) => { const [x, y] = Q(...v); return [x + dx, y + dy]; };
      arrow3(ctx, Q, [0, 0, 0], [0, 0, b()], p.r3, 3, 11);
      arrow3(ctx, Q, [0, 0, 0], [0, -cur * 1.15, 0], p.r2, 3, 11);
      if (on) arrow3(ctx, Q, [0, 0, 0], [Math.sign(Fx()), 0, 0], p.r1, 3.5, 12);
      label(ctx, "First finger: field", ...tip([0, 0, b()], 0, up ? -9 : 10), { color: p.r3, size: 11, weight: 700 });
      label(ctx, "Second finger: current", ...tip([0, -cur * 1.15, 0], cur > 0 ? 6 : -6, cur > 0 ? 11 : -10), { color: p.r2, size: 11, weight: 700 });
      if (on) label(ctx, "Thumb: force", ...tip([Math.sign(Fx()), 0, 0], 0, Fx() < 0 ? 12 : -12), { color: p.r1, size: 11, weight: 700 });   // on the side away from the current's label
    }
    const dirTxt = Fx() < 0 ? "left" : "right";
    ro([
      { k: "Force on rod AB", v: on ? `Towards the ${dirTxt}` : "None: no current", tone: on ? "good" : "" },
      { k: "Magnetic field", v: up ? "Upwards (N below, S above)" : "Downwards (poles interchanged)" },
      { k: "Current in the rod", v: on ? (cur > 0 ? "From B to A (towards you)" : "From A to B (away from you)") : "None" },
      { k: "Size of the displacement", v: on ? `${fmt(100 * Math.pow(mag() / 20, 0.7), 0)}% of the largest here` : "0" },
      { k: "Fleming's left-hand rule", v: on ? `First finger ${up ? "up" : "down"} (field), second finger ${cur > 0 ? "towards you, from B to A" : "away from you, from A to B"} (current): the thumb points to the ${dirTxt} (force).` : "Close the key to pass a current.", wide: true },
      { k: "What NCERT finds", v: "Reversing the current, or interchanging the poles, reverses the force. The displacement is largest when the current is at right angles to the field. A larger current, a stronger magnet or a longer rod gives a larger displacement.", wide: true }
    ]);
  }

  return {
    set(o) {
      if (o.on != null) { on = !!o.on; kSeg.set(on ? "on" : "off"); }
      if (o.cur != null) { cur = o.cur; cSeg.set(String(cur)); }
      if (o.up != null) { up = !!o.up; fSeg.set(up ? "up" : "down"); }
      if (o.I != null) { I = o.I; sI.value = I; }
      if (o.strong != null) { strong = !!o.strong; gSeg.set(strong ? "strong" : "normal"); }
      if (o.long != null) { long = !!o.long; lSeg.set(long ? "long" : "short"); }
      if (o.rule != null) { show.rule = !!o.rule; showT.sync(); }
    },
    info: () => ({ fx: Fx(), on, x })
  };
};

/* =================================================================
   12.3 — Fleming's left-hand rule: find the force, or find the field
   F = I × B for a current (or positive charge); an electron's current
   is opposite to its motion.
   ================================================================= */
const FRAMES = {
  page: { name: "Directions on a page", dirs: [["right", "Towards the right", [1, 0, 0]], ["left", "Towards the left", [-1, 0, 0]], ["top", "Towards the top of the page", [0, 0, 1]], ["bottom", "Towards the bottom of the page", [0, 0, -1]], ["out", "Out of the page ⊙", [0, -1, 0]], ["into", "Into the page ⊗", [0, 1, 0]]] },
  compass: { name: "Compass directions", dirs: [["east", "East", [1, 0, 0]], ["west", "West", [-1, 0, 0]], ["north", "North", [0, 1, 0]], ["south", "South", [0, -1, 0]], ["up", "Upwards", [0, 0, 1]], ["down", "Downwards", [0, 0, -1]]] },
  room: { name: "In a room (facing the front wall)", dirs: [["right", "To your right", [1, 0, 0]], ["left", "To your left", [-1, 0, 0]], ["front", "Towards the front wall", [0, 1, 0]], ["back", "Towards the back wall", [0, -1, 0]], ["up", "Upwards", [0, 0, 1]], ["down", "Downwards", [0, 0, -1]]] }
};
const FDEF = { page: { b: "top", m: "out", f: "left" }, compass: { b: "up", m: "west", f: "north" }, room: { b: "down", m: "front", f: "right" } };
CR.sims.flhr = function (stage, opt = {}) {
  let frame = opt.frame || "page", find = opt.find || "force", carrier = opt.carrier || "current";
  let bD = opt.b || FDEF[frame].b, mD = opt.m || FDEF[frame].m, fD = opt.f || FDEF[frame].f, angle = opt.angle ?? 90;
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.95, alt: "Fleming's left-hand rule" });
  const ctl = controls(stage);
  const frSeg = seg(ctl, { label: "Directions given as", value: frame, options: [["page", "On a page"], ["compass", "Compass"], ["room", "In a room"]] }, v => { frame = v; ({ b: bD, m: mD, f: fD } = FDEF[frame]); fill(); draw(); });
  const fiSeg = seg(ctl, { label: "Find", value: find, options: [["force", "The force"], ["field", "The magnetic field"]] }, v => { find = v; sync(); draw(); });
  const caSeg = seg(ctl, { label: "What moves", value: carrier, options: [["current", "Current"], ["positive", "Positive charge (proton, alpha particle)"], ["electron", "Electron"]] }, v => { carrier = v; fill(); draw(); });
  const sB = select(ctl, { label: "Magnetic field", options: [], value: "" }, v => { bD = v; draw(); });
  const sM = select(ctl, { label: "Current", options: [], value: "" }, v => { mD = v; draw(); });
  const sF = select(ctl, { label: "Force (deflection)", options: [], value: "" }, v => { fD = v; draw(); });
  const sA = slider(ctl, { label: "Angle between current and field", min: 0, max: 90, step: 5, value: angle, unit: "°" }, v => { angle = v; draw(); });
  const pre = chipRow(stage, "NCERT cases");
  [["Activity 12.7", { frame: "page", find: "force", carrier: "current", b: "top", m: "out", angle: 90 }],
   ["Example 12.2: electron", { frame: "page", find: "force", carrier: "electron", b: "right", m: "bottom", angle: 90 }],
   ["In-text: alpha particle", { frame: "compass", find: "field", carrier: "positive", m: "west", f: "north" }],
   ["Exercise 6: electron beam", { frame: "room", find: "field", carrier: "electron", m: "front", f: "right" }],
   ["Exercise 5: when is the force largest?", { frame: "page", find: "force", carrier: "current", b: "top", m: "right", angle: 90 }]]
    .forEach(([t, o]) => chip(pre, t, () => api.set(o)));
  const ro = readouts(stage);
  function fill() {
    const opts = FRAMES[frame].dirs.map(([v, t]) => h("option", { value: v }, t));
    [sB, sM, sF].forEach(s => s.sel.replaceChildren(...opts.map(o => o.cloneNode(true))));
    sB.set(bD); sM.set(mD); sF.set(fD);
    sM.el.querySelector(".ctl-label").textContent = carrier === "current" ? "Current" : carrier === "electron" ? "Electron moves" : "Charge moves";
  }
  function sync() {
    sB.el.style.display = sA.el.style.display = find === "force" ? "" : "none";
    sF.el.style.display = find === "field" ? "" : "none";
  }
  fill(); sync();
  const vec = d => FRAMES[frame].dirs.find(x => x[0] === d)[2];
  const nameOf = v => { const f = FRAMES[frame].dirs.find(x => same(x[2], v)); return f ? f[1] : "—"; };

  function solve() {
    const motion = vec(mD), Iv = carrier === "electron" ? neg(motion) : motion;
    if (find === "force") {
      const Bv = vec(bD);
      if (same(Bv, Iv) || same(Bv, neg(Iv))) return { Iv, Bv, motion, none: true };
      return { Iv, Bv, motion, Fv: cross(Iv, Bv), size: Math.sin(angle * DEG) };
    }
    const Fv = vec(fD);
    if (same(Fv, Iv) || same(Fv, neg(Iv))) return { Iv, Fv, motion, impossible: true };
    return { Iv, Fv, motion, Bv: cross(Fv, Iv), size: 1 };
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    const nar = W < 560, small = nar ? 11 : 12;
    const PL = labelPlacer(ctx, W, H);
    const title = "Left hand: forefinger → field, middle finger → current, thumb → force (motion)";
    const tOpt = { color: p.text, size: small, align: "left", base: "top", bg: p.surface2, maxW: W - 24 };
    const tBox = labelBox(ctx, title, 10, 9, tOpt);
    const top = tBox[3] + 4;
    const s = nar ? Math.min(W / 6.1, (H - top - 30) / 3.7) : Math.min(W / 6.4, (H - top) / 4.0);
    const P = view3D(W * 0.47, (top + H) / 2 - 0.12 * s, s, 32 * DEG, 20 * DEG);
    const D = FRAMES[frame].dirs;
    // reference surface
    if (frame === "page") poly3(ctx, P, [[-2.3, 0, -1.6], [2.3, 0, -1.6], [2.3, 0, 1.6], [-2.3, 0, 1.6]], p.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)", p.soft, 1.2);
    else poly3(ctx, P, [[-2.2, -1.6, -1.1], [2.2, -1.6, -1.1], [2.2, 1.6, -1.1], [-2.2, 1.6, -1.1]], p.dark ? "rgba(120,170,100,0.16)" : "rgba(120,170,100,0.22)", p.soft, 1);
    PL.put(title, [[10, 9]], tOpt);

    const r = solve();
    const Lf = 1.45;
    let symK = 0;
    const tips = [];   // where each label goes, placed after all the arrows are drawn
    const drawVec = (v, col, txt, dash = null, len = Lf) => {
      arrow3(ctx, P, [0, 0, 0], [v[0] * len, v[1] * len, v[2] * len], col, 4, 15, dash);
      if (frame === "page" && Math.abs(v[1]) > 0.5) {
        const [ox, oy] = P(0, 0, 0);
        const into = v[1] > 0, sx = ox - 30 - 28 * symK++, sy = oy + 30;
        circle(ctx, sx, sy, 11, p.surface, col, 2.5);
        if (into) { line(ctx, sx - 6, sy - 6, sx + 6, sy + 6, col, 2.5); line(ctx, sx - 6, sy + 6, sx + 6, sy - 6, col, 2.5); } else circle(ctx, sx, sy, 3, col);
        PL.block([sx - 13, sy - 13, sx + 13, sy + 13]);
      }
      if (txt) tips.push([v, col, txt, len]);
    };
    const names = nar ? { cur: "Current\n(middle finger)", field: "Field\n(forefinger)", force: "Force\n(thumb)", e: "Electron\nmoves", q: "Charge\nmoves" }
      : { cur: "Current (middle finger)", field: "Field (forefinger)", force: "Force (thumb)", e: "Electron moves", q: "Charge moves" };
    let Bshow = r.Bv;
    if (find === "force" && r.Bv && !r.none && angle < 90) {
      const a = angle * DEG; Bshow = [Math.cos(a) * r.Iv[0] + Math.sin(a) * r.Bv[0], Math.cos(a) * r.Iv[1] + Math.sin(a) * r.Bv[1], Math.cos(a) * r.Iv[2] + Math.sin(a) * r.Bv[2]];
    }
    const showF = r.Fv && !r.impossible;
    const fLen = find === "force" ? Lf * (r.size ?? 1) : Lf;
    if (carrier !== "current") drawVec(r.motion, p.soft, carrier === "electron" ? names.e : names.q, [6, 5]);
    drawVec(r.Iv, p.r2, names.cur);
    if (Bshow) drawVec(Bshow, p.r3, names.field);
    if (showF) {
      if (fLen > 0.03) drawVec(r.Fv, p.r1, null, null, fLen);
      tips.push([r.Fv, p.r1, names.force, Math.max(fLen, 0.45)]);
    }
    circle(ctx, ...P(0, 0, 0), 4, p.text);
    // names of the directions round the floor: placed before the labels of the arrows, so they always show
    if (frame === "page") {
      PL.put("The page", [[...P(-2.2, 0, 1.5), { align: "left", base: "top" }], [...P(2.2, 0, 1.5), { align: "right", base: "top" }], [...P(-2.2, 0, -1.5), { align: "left", base: "bottom" }]], { color: p.soft, size: small }, false);
    } else {
      const [fx0, fy0] = P(0, 0, -1.1);
      [[2.2, 0, 0, "left"], [-2.2, 0, 1, "right"], [0, 1.6, 2, "center"], [0, -1.6, 3, "center"]].forEach(([x, y, k, al]) => {
        const [ex, ey] = P(x, y, -1.1), ux = ex - fx0, uy = ey - fy0, m = Math.hypot(ux, uy) || 1;
        const txt = nar && frame === "room" ? ["Right", "Left", "Front wall", "Back wall"][k] : D[k][1];
        const c = [0, 10, 22, 34, -10].map(d => [ex + d * ux / m, ey + d * uy / m]);
        PL.put(txt, c, { color: p.soft, size: small, weight: 700, bg: p.surface2, align: al });
      });
    }

    // labels: the answer first, so it always gets the best place
    const [ox, oy] = P(0, 0, 0);
    const answerCol = find === "force" ? p.r1 : p.r3;
    tips.sort((a, b) => (b[1] === answerCol) - (a[1] === answerCol));
    tips.forEach(([v, col, txt, len]) => {
      const c = [];
      for (const k of [0.34, 0.6, 0.9]) {
        const [x, y] = P(v[0] * (len + k), v[1] * (len + k), v[2] * (len + k));
        const ux = x - ox, uy = y - oy, m = Math.hypot(ux, uy) || 1;
        c.push([x, y], [x + 16 * ux / m, y + 16 * uy / m], [x - 22 * uy / m, y + 22 * ux / m], [x + 22 * uy / m, y - 22 * ux / m]);
      }
      PL.put(txt, c, { color: col, size: nar ? 12 : 13, weight: 700, bg: p.surface2 });
    });
    const items = [];
    if (find === "force") {
      if (r.none) items.push({ k: "Force", v: "None: the current is along the field", wide: true, tone: "bad" });
      else {
        items.push({ k: "Force", v: nameOf(r.Fv), tone: "good" });
        items.push({ k: "Size of the force", v: angle === 90 ? "Largest (current at right angles to the field)" : angle === 0 ? "Zero (current along the field)" : `${fmt(100 * r.size, 0)}% of the largest` });
      }
      items.push({ k: "Magnetic field", v: nameOf(r.Bv) });
    } else {
      if (r.impossible) items.push({ k: "Magnetic field", v: "Not possible: the force is always at right angles to the current", wide: true, tone: "bad" });
      else items.push({ k: "Magnetic field", v: nameOf(r.Bv), tone: "good" });
      items.push({ k: "Force (deflection)", v: nameOf(r.Fv) });
    }
    items.push({ k: "Current", v: nameOf(r.Iv) });
    if (carrier === "electron") items.push({ k: "Remember", v: "An electron is negatively charged, so the current is taken opposite to the direction in which the electrons move.", wide: true });
    if (!r.none && !r.impossible) {
      const B = nameOf(r.Bv).toLowerCase(), Iw = nameOf(r.Iv).toLowerCase(), F = nameOf(r.Fv).toLowerCase();
      items.push({ k: "Using your left hand", v: `Stretch the thumb, forefinger and middle finger so they are mutually perpendicular. Point the forefinger ${B} (field) and the middle finger ${Iw} (current): the thumb points ${F} (force).`, wide: true });
    }
    ro(items);
  }
  const api = {
    set(o) {
      if (o.frame) { frame = o.frame; frSeg.set(frame); ({ b: bD, m: mD, f: fD } = FDEF[frame]); }
      if (o.find) { find = o.find; fiSeg.set(find); }
      if (o.carrier) { carrier = o.carrier; caSeg.set(carrier); }
      if (o.b) bD = o.b; if (o.m) mD = o.m; if (o.f) fD = o.f;
      if (o.angle != null) { angle = o.angle; sA.value = angle; }
      fill(); sync(); draw();
    },
    info: () => solve()
  };
  return api;
};

/* =================================================================
   12.4 — Domestic electric circuits: circuits and fuses (overloading,
   short-circuiting), earthing, and the AC supply.
   Appliances are treated as resistors rated at 220 V: I = V·P/220².
   ================================================================= */
CR.sims.domestic = function (stage, opt = {}) {
  let mode = opt.mode || "circuits";
  const APPS = [
    { id: "geyser", n: "Geyser", sn: "Geyser", P: 2000, c: 15, metal: true, kind: "heat" },
    { id: "cooler", n: "Air cooler", sn: "Cooler", P: 250, c: 15, metal: true, kind: "fan" },
    { id: "iron", n: "Electric iron", sn: "Iron", P: 1000, c: 15, metal: true, kind: "heat" },
    { id: "bulb", n: "Bulb", sn: "Bulb", P: 60, c: 5, kind: "bulb" },
    { id: "fan", n: "Fan", sn: "Fan", P: 75, c: 5, kind: "fan" },
    { id: "tv", n: "Television", sn: "TV", P: 120, c: 5, kind: "tv" },
    { id: "oven", n: "2 kW oven", sn: "Oven", P: 2000, c: 5, metal: true, kind: "heat" }
  ];
  const DEF = { geyser: true, cooler: false, iron: false, bulb: true, fan: true, tv: false, oven: false };
  const onS = Object.assign({}, DEF, opt.on || {});
  let volts = opt.volts ?? 220, msg = "";
  const blown = { 15: false, 5: false }, shorted = { 15: false, 5: false };
  let fault = opt.fault ?? false, earthOK = opt.earth ?? true, touch = opt.touch ?? true, eBlown = false, blowIn = -1;
  let showDC = true, t = 0, flash = 0;
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 1.15, alt: "Domestic electric circuit" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["circuits", "Circuits and fuses"], ["earthing", "Earthing"], ["ac", "AC supply"]] }, v => { mode = v; sync(); draw(); });
  const vSeg = seg(ctl, { label: "Supply voltage", value: String(volts), options: [["220", "220 V (normal)"], ["250", "Accidental hike to 250 V"]] }, v => { volts = +v; evaluate(); draw(); });
  const fSeg = seg(ctl, { label: "Fault", value: fault ? "yes" : "no", options: [["no", "None"], ["yes", "Live wire touches the metal body"]] }, v => { fault = v === "yes"; evalEarth(); draw(); });
  const eSeg = seg(ctl, { label: "Earth wire", value: earthOK ? "ok" : "broken", options: [["ok", "Connected"], ["broken", "Broken / missing"]] }, v => { earthOK = v === "ok"; evalEarth(); draw(); });
  const tSeg = seg(ctl, { label: "A person", value: touch ? "yes" : "no", options: [["no", "Stands away"], ["yes", "Touches the metal body"]] }, v => { touch = v === "yes"; draw(); });
  const appRow = chipRow(stage, "Switch on / off");
  const appT = toggles(appRow, APPS.map(a => [a.id, `${a.n} ${a.P >= 1000 ? (a.P / 1000) + " kW" : a.P + " W"} (${a.c} A circuit)`]), onS, () => { msg = ""; evaluate(); draw(); });
  const actRow = chipRow(stage, "");
  const sc5 = chip(actRow, "⚡ Short circuit in the 5 A circuit", () => { shorted[5] = true; flash = 1; evaluate(); draw(); });
  const sc15 = chip(actRow, "⚡ Short circuit in the 15 A circuit", () => { shorted[15] = true; flash = 1; evaluate(); draw(); });
  const rep = chip(actRow, "Replace the fuse", () => {
    if (mode === "earthing") { eBlown = false; evalEarth(true); }
    else { [15, 5].forEach(c => { if (blown[c]) { blown[c] = false; shorted[c] = false; } }); msg = ""; evaluate(true); }
    draw();
  });
  const dcRow = chipRow(stage, "Compare with");
  const dcChip = chip(dcRow, "DC from a cell", () => { showDC = !showDC; dcChip.setAttribute("aria-pressed", String(showDC)); draw(); }, showDC);
  const ro = readouts(stage);
  function sync() {
    const c = mode === "circuits", e = mode === "earthing";
    vSeg.el.style.display = appRow.style.display = sc5.style.display = sc15.style.display = c ? "" : "none";
    fSeg.el.style.display = eSeg.el.style.display = tSeg.el.style.display = e ? "" : "none";
    actRow.style.display = c || e ? "" : "none";
    dcRow.style.display = mode === "ac" ? "" : "none";
  }
  sync();
  const ampsOf = a => a.P * volts / (220 * 220);
  const circuitI = c => (shorted[c] ? Infinity : APPS.filter(a => a.c === c && onS[a.id]).reduce((s, a) => s + ampsOf(a), 0));
  function evaluate(replacing = false) {
    [15, 5].forEach(c => {
      const Ic = circuitI(c);
      if (!blown[c] && Ic > c) {
        blown[c] = true; flash = 1;
        msg = shorted[c] ? `Short circuit in the ${c} A circuit: the live and neutral wires touched, the current increased heavily and the fuse melted.`
          : `${replacing ? "The new fuse blew too: " : ""}${fmt(Ic, 2)} A is more than the ${c} A rating, so the circuit is overloaded and its fuse melted.`;
      }
    });
  }
  function evalEarth(replacing = false) {
    if (fault && earthOK && !eBlown) { if (blowIn < 0) blowIn = 0.9; }   // a large current flows to the earth, then the fuse melts
    else blowIn = -1;
    if (replacing && !fault) eBlown = false;
  }
  evaluate(); evalEarth();
  onFrame(dt => {
    t += dt; flash = Math.max(0, flash - dt * 0.9);
    if (blowIn > 0) { blowIn -= dt; if (blowIn <= 0) { blowIn = -1; if (fault && earthOK) { eBlown = true; flash = 1; } } }
    draw();
  });

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    if (mode === "circuits") drawCircuits(ctx, W, H, p);
    else if (mode === "earthing") drawEarthing(ctx, W, H, p);
    else drawAC(ctx, W, H, p);
  }

  function fuseBox(ctx, x, y, w, ok, p, txt) {
    roundRect(ctx, x, y - 9, w, 18, 4); ctx.fillStyle = p.surface; ctx.fill(); ctx.strokeStyle = p.text; ctx.lineWidth = 1.4; ctx.stroke();
    if (ok) line(ctx, x + 3, y, x + w - 3, y, p.text, 1.5);
    else {
      line(ctx, x + 3, y, x + w * 0.38, y + 4, p.text, 1.5); line(ctx, x + w - 3, y, x + w * 0.62, y - 4, p.text, 1.5);
      if (flash > 0) { const g = ctx.createRadialGradient(x + w / 2, y, 2, x + w / 2, y, 34); g.addColorStop(0, `rgba(255,200,40,${flash})`); g.addColorStop(1, "rgba(255,200,40,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + w / 2, y, 34, 0, Math.PI * 2); ctx.fill(); }
    }
    if (txt) label(ctx, txt, x + w / 2, y - 18, { color: ok ? p.text : p.warn, size: 11, weight: 700 });
  }
  function applianceIcon(ctx, a, x, y, w, hh, powered, p) {
    const cx = x + w / 2, cy = y + hh * 0.42;
    if (a.kind === "bulb") {
      if (powered) { const g = ctx.createRadialGradient(cx, cy, 3, cx, cy, 26); g.addColorStop(0, "rgba(255,210,80,0.95)"); g.addColorStop(1, "rgba(255,210,80,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill(); }
      circle(ctx, cx, cy, 10, powered ? "#ffd75a" : p.surface2, p.text, 1.5);
    } else if (a.kind === "fan") {
      const ang = powered ? t * 9 : 0.3;
      for (let k = 0; k < 3; k++) { const q = ang + k * 2.094; line(ctx, cx, cy, cx + Math.cos(q) * 12, cy + Math.sin(q) * 12, p.text, 4); }
      circle(ctx, cx, cy, 3, p.text);
    } else if (a.kind === "tv") {
      roundRect(ctx, cx - 16, cy - 10, 32, 20, 3); ctx.fillStyle = powered ? "#5aa9e6" : (p.dark ? "#111" : "#333"); ctx.fill();
    } else {
      ctx.save(); ctx.strokeStyle = powered ? "#ff7a1a" : p.soft; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let k = 0; k <= 8; k++) { const xx = cx - 14 + k * 3.5, yy = cy + (k % 2 ? -6 : 6); if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke(); ctx.restore();
    }
  }

  function drawCircuits(ctx, W, H, p) {
    const nar = W < 640, small = nar ? 10 : 11;
    const bandTop = 8, bandBot = H - 50, bandH = (bandBot - bandTop) / 2;
    const xMF = W * 0.035, xMeter = W * 0.095, wMeter = W * 0.07, xSw = W * 0.19, xD = W * 0.235, xFuse = W * 0.25, wFuse = W * 0.045, xE = W * 0.305, xC0 = W * 0.33, xC1 = W - 8;
    const bands = [15, 5].map((c, k) => {
      const y0 = bandTop + k * bandH;
      return { c, y0, yL: y0 + 28, yN: y0 + 44, yB0: y0 + 64, yB1: y0 + bandH - 32, yE: y0 + bandH - 16 };
    });
    // the earth plate
    const yG = H - 30;
    line(ctx, 0, yG, W * 0.42, yG, p.soft, 1.5);
    for (let x = 6; x < W * 0.42; x += 12) line(ctx, x, yG, x - 6, yG + 7, p.soft, 1);
    ctx.fillStyle = p.dark ? "#8b93a7" : "#6b7280"; ctx.fillRect(xE - 16, H - 16, 32, 7);
    line(ctx, xE, bands[0].yE, xE, H - 16, p.earth, 3);
    // mains in: live and neutral of band 0 run from the left edge
    const L0 = bands[0];
    const p15 = !blown[15], p5 = !blown[5];
    line(ctx, 0, L0.yL, xMF, L0.yL, p.live, 3.5);
    fuseBox(ctx, xMF, L0.yL, W * 0.045, true, p, nar ? "" : "Main fuse");
    line(ctx, xMF + W * 0.045, L0.yL, xMeter, L0.yL, p.live, 3.5);
    line(ctx, 0, L0.yN, xMeter, L0.yN, p.neutral, 3.5);
    roundRect(ctx, xMeter, L0.yL - 12, wMeter, L0.yN - L0.yL + 24, 4); ctx.fillStyle = p.surface2; ctx.fill(); ctx.strokeStyle = p.text; ctx.lineWidth = 1.4; ctx.stroke();
    if (textWidth(ctx, "kWh", 11, 700) < wMeter - 4) label(ctx, "kWh", xMeter + wMeter / 2, (L0.yL + L0.yN) / 2, { color: p.text, size: 11, weight: 700 });
    else label(ctx, "kWh", xMeter + wMeter / 2, L0.yL - 20, { color: p.text, size: 10, weight: 700 });
    if (!nar) label(ctx, "Meter", xMeter + wMeter / 2, L0.yN + 22, { color: p.soft, size: small });
    line(ctx, xMeter + wMeter, L0.yL, xSw, L0.yL, p.live, 3.5);
    line(ctx, xMeter + wMeter, L0.yN, xSw, L0.yN, p.neutral, 3.5);
    // main switch (closed)
    [L0.yL, L0.yN].forEach(y => { circle(ctx, xSw, y, 3, p.text); line(ctx, xSw, y, xSw + 16, y, p.text, 2.5); circle(ctx, xSw + 16, y, 3, p.text); });
    if (!nar) label(ctx, "Main switch", xSw + 8, L0.yL - 16, { color: p.soft, size: small });
    // distribution box
    ctx.save(); ctx.strokeStyle = p.soft; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2;
    ctx.strokeRect(xSw - 10, L0.yL - 32, xFuse + wFuse + 6 - (xSw - 10), bands[1].yN + 18 - (L0.yL - 32)); ctx.restore();
    if (!nar) label(ctx, "Distribution box", xSw - 6, bands[1].yN + 30, { color: p.soft, size: small, align: "left" });
    line(ctx, xSw + 16, L0.yL, xFuse, L0.yL, p.live, 3.5);
    line(ctx, xSw + 16, L0.yN, xC0 - 2, L0.yN, p.neutral, 3.5);
    line(ctx, xD, L0.yL, xD, bands[1].yL, p.live, 3.5);
    line(ctx, xD + 9, L0.yN, xD + 9, bands[1].yN, p.neutral, 3.5);
    circle(ctx, xD, L0.yL, 3.5, p.live); circle(ctx, xD + 9, L0.yN, 3.5, p.neutral);
    line(ctx, xD, bands[1].yL, xFuse, bands[1].yL, p.live, 3.5);
    line(ctx, xD + 9, bands[1].yN, xC0 - 2, bands[1].yN, p.neutral, 3.5);
    bands.forEach(B => {
      const ok = !blown[B.c];
      fuseBox(ctx, xFuse, B.yL, wFuse, ok, p, `${B.c} A`);
      const live = ok ? p.live : p.soft;
      line(ctx, xFuse + wFuse, B.yL, xC1, B.yL, live, 3.5);
      line(ctx, xC0 - 2, B.yN, xC1, B.yN, p.neutral, 3.5);
      line(ctx, xE, B.yE, xC1, B.yE, p.earth, 3);
      circle(ctx, xE, B.yE, 3.5, p.earth);
      label(ctx, `${B.c} A circuit${nar ? "" : B.c === 15 ? " (geysers, air coolers …)" : " (bulbs, fans …)"}`, xC0 + 4, B.y0 + 4, { color: p.text, size: small, align: "left", base: "top", weight: 700 });
      const apps = APPS.filter(a => a.c === B.c);
      const slot = (xC1 - xC0 - 10) / apps.length, bw = Math.min(104, slot - 12), bh = B.yB1 - B.yB0;
      apps.forEach((a, k) => {
        const x = xC0 + 10 + slot * (k + 0.5), bx = x - bw / 2;
        const sw = onS[a.id], powered = sw && ok && !shorted[B.c];
        const xl = x - bw * 0.28, xn = x + bw * 0.28;
        // live lead with a switch; it hops over the neutral rail
        line(ctx, xl, B.yL, xl, B.yN - 6, ok ? p.live : p.soft, 2);
        ctx.save(); ctx.strokeStyle = ok ? p.live : p.soft; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xl, B.yN, 6, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.restore();
        const ys = (B.yN + B.yB0) / 2 + 2;
        line(ctx, xl, B.yN + 6, xl, ys - 5, ok ? p.live : p.soft, 2);
        circle(ctx, xl, ys - 5, 2.4, p.text);
        if (sw) line(ctx, xl, ys - 5, xl, ys + 5, p.text, 2); else line(ctx, xl, ys - 5, xl + 8, ys + 3, p.text, 2);
        line(ctx, xl, ys + 5, xl, B.yB0, p.text, 2);
        circle(ctx, xl, B.yL, 3, ok ? p.live : p.soft);
        line(ctx, xn, B.yN, xn, B.yB0, p.neutral, 2); circle(ctx, xn, B.yN, 3, p.neutral);
        if (a.metal) { line(ctx, x, B.yB1, x, B.yE, p.earth, 2); circle(ctx, x, B.yE, 3, p.earth); }
        roundRect(ctx, bx, B.yB0, bw, bh, 7);
        ctx.fillStyle = a.metal ? (p.dark ? "#3a4152" : "#dfe3ea") : p.surface; ctx.fill();
        ctx.strokeStyle = p.text; ctx.lineWidth = 1.4; ctx.stroke();
        applianceIcon(ctx, a, bx, B.yB0, bw, bh, powered, p);
        // power at the foot of the box, the name just above it (stacked by their real heights)
        const pb = label(ctx, a.P >= 1000 ? `${a.P / 1000} kW` : `${a.P} W`, x, B.yB0 + bh - 2, { color: p.soft, size: nar ? 9 : 10, base: "bottom", pad: 1 });
        label(ctx, textWidth(ctx, a.n, nar ? 9 : 11, 700) < bw - 6 ? a.n : a.sn, x, pb[1], { color: p.text, size: nar ? 9 : 11, weight: 700, base: "bottom", pad: 1, maxW: bw - 4 });
        a.hit = { x: bx, y: B.yB0, w: bw, h: bh };
      });
      if (shorted[B.c]) {
        const sx = xC0 + 4;
        ctx.save(); ctx.strokeStyle = flash > 0 ? "#ffb300" : p.warn; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(sx, B.yL); ctx.lineTo(sx + 8, B.yL + 6); ctx.lineTo(sx - 4, B.yL + 11); ctx.lineTo(sx, B.yN); ctx.stroke(); ctx.restore();
      }
      // AC: charges in the live wire move to and fro
      const Ic = circuitI(B.c);
      if (ok && Ic > 0 && isFinite(Ic)) {
        const amp = clamp(2 + Ic * 0.7, 2, 9), sft = amp * Math.sin(t * 2 * Math.PI * 0.8);
        for (let x = xFuse + wFuse + 14; x < xC1 - 6; x += 30) circle(ctx, x + sft, B.yL, 2.6, p.live);
      }
    });
    // legend for the wire colours, then the name of the earth plate where there is room
    const LEG = nar ? [["Live", p.live], ["Neutral", p.neutral], ["Earth", p.earth]] : [["Live (red)", p.live], ["Neutral (black)", p.neutral], ["Earth (green)", p.earth]];
    let lx = W - 8 - LEG.reduce((a, [txt]) => a + 34 + textWidth(ctx, txt, small) + 14, 0) + 14;
    const legX0 = lx;
    LEG.forEach(([txt, c]) => {
      line(ctx, lx, H - 14, lx + 22, H - 14, c, 3.5);
      label(ctx, txt, lx + 28, H - 14, { color: p.text, size: small, align: "left" });
      lx += 34 + textWidth(ctx, txt, small) + 14;
    });
    const plate = "Metal plate deep in the earth";
    if (xE + 22 + textWidth(ctx, plate, small) < legX0 - 12) label(ctx, plate, xE + 22, H - 12, { color: p.soft, size: small, align: "left" });
    else label(ctx, "Earth plate", xE - 22, H - 12, { color: p.soft, size: small, align: "right", maxW: xE - 30 });
    const I15 = blown[15] ? 0 : circuitI(15), I5 = blown[5] ? 0 : circuitI(5);
    const st = (c, Ic) => (blown[c] ? `Fuse blown: no current` : `${fmt(Ic, 2)} A (rating ${c} A)${Ic > 0.8 * c ? ", close to the limit" : ""}`);
    ro([
      { k: "15 A circuit", v: st(15, I15), tone: blown[15] ? "bad" : "" },
      { k: "5 A circuit", v: st(5, I5), tone: blown[5] ? "bad" : "" },
      { k: "Supply", v: `${volts} V AC, 50 Hz` },
      { k: "What happened", v: msg || "Every appliance is connected in parallel across the live and neutral wires, so each gets the same potential difference and has its own switch. Add appliances, raise the supply voltage or make a short circuit to see the fuse act.", wide: true, tone: msg ? "bad" : "" }
    ]);
  }

  function drawEarthing(ctx, W, H, p) {
    const nar = W < 640, small = nar ? 10 : 11;
    const yL = H * 0.2, yN = H * 0.3, yG = H * 0.86;
    const bx0 = W * 0.36, bx1 = W * 0.64, by0 = H * 0.14, by1 = H * 0.62;
    const xFu = W * 0.1, wFu = W * 0.06;
    const flowing = fault && earthOK && !eBlown;
    const bodyLive = fault && !eBlown && !earthOK;
    const shock = bodyLive && touch;
    // ground and plate
    ctx.fillStyle = p.dark ? "#2b2a24" : "#e9e2d2"; ctx.fillRect(0, yG, W, H - yG);
    line(ctx, 0, yG, W, yG, p.soft, 1.5);
    const xPl = W * 0.2;
    ctx.fillStyle = p.dark ? "#8b93a7" : "#6b7280"; ctx.fillRect(xPl - 20, H - 16, 40, 8);
    label(ctx, "Metal plate deep in the earth", xPl + 26, H - 12, { color: p.soft, size: small, align: "left" });
    // wires
    line(ctx, 0, yL, xFu, yL, p.live, 3.5);
    fuseBox(ctx, xFu, yL, wFu, !eBlown, p, "Fuse");
    line(ctx, xFu + wFu, yL, bx0 + 30, yL, eBlown ? p.soft : p.live, 3.5);
    line(ctx, 0, yN, bx0 + 30, yN, p.neutral, 3.5);
    label(ctx, "Live", 6, yL - 10, { color: p.live, size: small, align: "left", weight: 700 });
    label(ctx, "Neutral", 6, yN + 12, { color: p.neutral, size: small, align: "left", weight: 700 });
    // the appliance with a metal body
    roundRect(ctx, bx0, by0, bx1 - bx0, by1 - by0, 10);
    ctx.fillStyle = p.dark ? "#4a5163" : "#cfd5de"; ctx.fill();
    ctx.lineWidth = bodyLive ? 4 : 2; ctx.strokeStyle = bodyLive ? p.warn : p.text; ctx.stroke();
    label(ctx, "Toaster with a metal body", (bx0 + bx1) / 2, by0 + 16, { color: p.text, size: small, weight: 700 });
    // heating element between live and neutral inside
    const ex0 = bx0 + 30, ex1 = bx1 - 30, ey = (by0 + by1) / 2 + 6;
    line(ctx, bx0 + 30, yL, ex0, yL, eBlown ? p.soft : p.live, 2.5);
    line(ctx, ex0, yL, ex0, ey, eBlown ? p.soft : p.live, 2.5);
    line(ctx, bx0 + 30, yN, bx0 + 40, yN, p.neutral, 2.5);
    ctx.save(); ctx.strokeStyle = !eBlown && !flowing ? "#ff7a1a" : p.soft; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let k = 0; k <= 14; k++) { const xx = lerp(ex0, ex1, k / 14), yy = ey + (k % 2 ? -7 : 7); if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
    ctx.stroke(); ctx.restore();
    line(ctx, ex1, ey, ex1, ey + 28, p.neutral, 2.5); line(ctx, ex1, ey + 28, bx0 + 40, ey + 28, p.neutral, 2.5); line(ctx, bx0 + 40, ey + 28, bx0 + 40, yN, p.neutral, 2.5);
    label(ctx, "Heating element", (ex0 + ex1) / 2, ey - 18, { color: p.soft, size: small });
    if (fault) {
      ctx.save(); ctx.strokeStyle = flash > 0 ? "#ffb300" : p.warn; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(ex0, (yL + ey) / 2); ctx.lineTo(ex0 - 12, (yL + ey) / 2 + 6); ctx.lineTo(ex0 - 6, (yL + ey) / 2 + 12); ctx.lineTo(bx0, (yL + ey) / 2 + 16); ctx.stroke(); ctx.restore();
      label(ctx, "Insulation damaged", bx0 - 6, (yL + ey) / 2 + 30, { color: p.warn, size: small, align: "right", weight: 700 });
    }
    // earth wire from the body to the plate
    const xEw = bx0 + 14;
    if (earthOK) { line(ctx, xEw, by1, xEw, yG, p.earth, 3); line(ctx, xEw, yG, xPl, yG, p.earth, 3); line(ctx, xPl, yG, xPl, H - 16, p.earth, 3); }
    else {
      line(ctx, xEw, by1, xEw, by1 + 20, p.earth, 3); line(ctx, xEw, by1 + 44, xEw, yG, p.earth, 3, [4, 4]); line(ctx, xEw, yG, xPl, yG, p.earth, 3, [4, 4]); line(ctx, xPl, yG, xPl, H - 16, p.earth, 3, [4, 4]);
      label(ctx, "✂ broken", xEw + 8, by1 + 32, { color: p.warn, size: small, align: "left", weight: 700 });
    }
    circle(ctx, xEw, by1, 3.5, p.earth);
    label(ctx, "Earth wire (green)", xEw - 8, by1 + 18 + (earthOK ? 0 : 42), { color: p.earth, size: small, align: "right", weight: 700 });
    if (flowing) CR.drawFlow(ctx, CR.pathInfo([[xFu + wFu, yL], [ex0, yL], [ex0, (yL + ey) / 2], [bx0, (yL + ey) / 2 + 16], [xEw, by1], [xEw, yG], [xPl, yG]]), t * 80, 28, "c", p.warn);
    // the person
    const px = W * 0.8, feet = yG, headY = feet - H * 0.36, wc = p.dark ? "#e6e9f2" : "#1c2233";
    circle(ctx, px, headY, 11, null, wc, 2.5);
    line(ctx, px, headY + 11, px, feet - H * 0.14, wc, 3);
    line(ctx, px, feet - H * 0.14, px - 12, feet, wc, 3); line(ctx, px, feet - H * 0.14, px + 12, feet, wc, 3);
    const handX = touch ? bx1 + 2 : px - 30, handY = touch ? (by0 + by1) / 2 : headY + 40;
    line(ctx, px, headY + 26, handX, handY, wc, 3);
    line(ctx, px, headY + 26, px + 22, headY + 46, wc, 3);
    if (shock) {
      ctx.save(); ctx.strokeStyle = "#ffb300"; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(px + 26, headY - 20); ctx.lineTo(px + 14, headY - 4); ctx.lineTo(px + 26, headY - 4); ctx.lineTo(px + 12, headY + 14); ctx.stroke(); ctx.restore();
      CR.drawFlow(ctx, CR.pathInfo([[handX, handY], [px, headY + 26], [px, feet - H * 0.14], [px, feet]]), t * 60, 22, "c", p.warn);
      label(ctx, "Severe electric shock!", px, headY - 30, { color: p.warn, size: 14, weight: 700, bg: p.surface });
    } else if (touch) label(ctx, "Safe ✓", px, headY - 30, { color: p.ok, size: 14, weight: 700, bg: p.surface });

    const bodyV = bodyLive ? "220 V (dangerous)" : "0 V (earth's potential)";
    let what;
    if (!fault) what = eBlown ? "The fuse is still blown. Replace it." : "No fault: the metal body is not connected to the live wire, so it is safe to touch.";
    else if (earthOK) what = "The live wire touches the metal body, but the earth wire gives a low-resistance path to the earth. A large current flows to the earth, the fuse melts and cuts off the live wire. The body stays at the earth's potential, so the user does not get a severe shock.";
    else what = touch ? "With no earth wire the metal body is at 220 V. The person touching it becomes the path to the earth and gets a severe electric shock. (The fuse does not blow, because the current through the body is far below its rating.)" : "With no earth wire the metal body is at 220 V, and nothing shows it. Anyone who touches it will get a severe shock.";
    ro([
      { k: "Metal body is at", v: bodyV, tone: bodyLive ? "bad" : "good" },
      { k: "Fuse", v: eBlown ? "Blown (circuit cut off)" : "Intact" },
      { k: "Person", v: shock ? "Gets a severe shock" : "Safe", tone: shock ? "bad" : "good" },
      { k: "What happens", v: what, wide: true }
    ]);
  }

  function drawAC(ctx, W, H, p) {
    const small = W < 560 ? 11 : 12;
    const gx0 = 58, gx1 = W - 26, gy0 = 30, gy1 = H * 0.66, gm = (gy0 + gy1) / 2, amp = (gy1 - gy0) * 0.42;
    const T = 40;                                    // ms shown
    const X = ms => gx0 + (ms / T) * (gx1 - gx0);
    for (let ms = 0; ms <= T; ms += 10) {
      line(ctx, X(ms), gy0, X(ms), gy1, p.border, 1);
      label(ctx, `${ms} ms`, X(ms), gy1 + 14, { color: p.soft, size: 11 });
    }
    line(ctx, gx0, gm, gx1, gm, p.text, 1.5);
    line(ctx, gx0, gy0, gx0, gy1, p.text, 1.5);
    label(ctx, "time →", gx1, gy1 + 30, { color: p.soft, size: small, align: "right" });
    label(ctx, "+", gx0 - 14, gm - amp, { color: p.soft, size: 14, weight: 700 });
    label(ctx, "−", gx0 - 14, gm + amp, { color: p.soft, size: 14, weight: 700 });
    ctx.save(); ctx.translate(16, gm); ctx.rotate(-Math.PI / 2); label(ctx, "current (direction)", 0, 0, { color: p.soft, size: small }); ctx.restore();
    const pts = [];
    for (let k = 0; k <= 400; k++) { const ms = k / 400 * T; pts.push([X(ms), gm - amp * Math.sin(2 * Math.PI * 50 * ms / 1000)]); }
    polyline(ctx, pts, p.r1, 2.6);
    label(ctx, "AC mains (50 Hz)", X(2), gm - amp - 10, { color: p.r1, size: 13, weight: 700, align: "left" });
    if (showDC) {
      line(ctx, gx0, gm - amp * 0.55, gx1, gm - amp * 0.55, p.r3, 2.6);
      label(ctx, "DC from a cell", gx1 - 4, gm - amp * 0.55 - 10, { color: p.r3, size: 13, weight: 700, align: "right" });
    }
    [[0, 20, "one cycle = 1/50 s = 20 ms"]].forEach(([a, b, txt]) => {
      const y = gy1 - 12;
      line(ctx, X(a), y, X(b), y, p.text, 1.5); head(ctx, X(b), y, 0, 8, p.text); head(ctx, X(a), y, Math.PI, 8, p.text);
      label(ctx, txt, (X(a) + X(b)) / 2, y - 11, { color: p.text, size: small, bg: p.surface2 });
    });
    // slow-motion cursor (one cycle every 2.5 s)
    const ms = ((t / 2.5) * 20) % T, val = Math.sin(2 * Math.PI * 50 * ms / 1000);
    line(ctx, X(ms), gy0, X(ms), gy1, p.accent, 2, [5, 4]);
    circle(ctx, X(ms), gm - amp * val, 5, p.r1);
    // wires below: charges to and fro (AC) and one way (DC)
    const wy1 = H * 0.8, wy2 = H * 0.92, wx0 = gx0, wx1 = gx1;
    line(ctx, wx0, wy1, wx1, wy1, p.text, 6, null, 0.25);
    for (let x = wx0 + 20; x < wx1 - 10; x += 34) circle(ctx, x + 12 * val, wy1, 3, p.r1);
    label(ctx, "AC: charges move to and fro", wx0, wy1 - 14, { color: p.r1, size: small, align: "left", weight: 700 });
    if (showDC) {
      line(ctx, wx0, wy2, wx1, wy2, p.text, 6, null, 0.25);
      for (let x = wx0 + 20; x < wx1 - 10; x += 34) circle(ctx, wx0 + 20 + ((x - wx0 - 20 + t * 30) % (wx1 - wx0 - 40)), wy2, 3, p.r3);
      label(ctx, "DC: one direction only", wx0, wy2 - 14, { color: p.r3, size: small, align: "left", weight: 700 });
    }
    ro([
      { k: "Supply in our houses", v: "AC at 220 V, frequency 50 Hz" },
      { k: "50 Hz means", v: "50 complete cycles every second: one cycle takes 1/50 s = 0.02 s" },
      { k: "Direction of the current", v: "Reverses every 1/100 s (0.01 s)" },
      { k: "Direct current (DC)", v: "Flows in one direction only, e.g. from a cell or a battery" },
      { k: "Advantage of AC over DC (CBSE syllabus)", v: "Electric power can be transmitted over long distances without much loss of energy.", wide: true }
    ]);
  }

  cv.cv.addEventListener("pointerdown", e => {
    if (mode !== "circuits") return;
    const q = cv.pos(e);
    const a = APPS.find(x => x.hit && q.x >= x.hit.x && q.x <= x.hit.x + x.hit.w && q.y >= x.hit.y && q.y <= x.hit.y + x.hit.h);
    if (a) { onS[a.id] = !onS[a.id]; appT.sync(); msg = ""; evaluate(); draw(); }
  });

  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); }
      if (o.on) { Object.keys(onS).forEach(k => { onS[k] = !!o.on[k]; }); appT.sync(); }
      if (o.volts) { volts = o.volts; vSeg.set(String(volts)); }
      if (o.reset) { blown[15] = blown[5] = false; shorted[15] = shorted[5] = false; msg = ""; eBlown = false; blowIn = -1; }
      if (o.short) { shorted[o.short] = true; flash = 1; }
      if (o.fault != null) { fault = !!o.fault; fSeg.set(fault ? "yes" : "no"); }
      if (o.earth != null) { earthOK = !!o.earth; eSeg.set(earthOK ? "ok" : "broken"); }
      if (o.touch != null) { touch = !!o.touch; tSeg.set(touch ? "yes" : "no"); }
      sync(); evaluate(); evalEarth(); draw();
    },
    info: () => ({ blown: { ...blown }, I15: circuitI(15), I5: circuitI(5), eBlown, blowing: blowIn > 0, shock: fault && !eBlown && !earthOK && touch })
  };
};
})();
