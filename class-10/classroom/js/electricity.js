/* ============================================================
   Chapter 11 — Electricity (simulations)
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, MINUS, fmt, sgnf, sci, nice, pal, line, head, drawRay, vArrow, label, roundRect, circle, toEdge, shade, rgb, mix, pathInfo, pointAt, drawFlow, onFrame, makeCanvas, controls, slider, seg, select, chipRow, chip, readouts } = CR;

/* ---------- 5.6 Ohm's law with V–I graph ---------- */
/* Based on NCERT Activity 11.1: a wire XY, an ammeter, a voltmeter, and 1 to 4 cells of 1.5 V.
   Ideal meters and cells are assumed, so V across XY equals the battery voltage. */
function ohmSim(stage) {
  let cells = 2, R = 4, closed = "on", show = "current";
  let phase = 0;
  const readings = [];
  const twin = h("div", { class: "twin" });
  stage.append(twin);
  const left = h("div"), right = h("div");
  twin.append(left, right);
  const cv = makeCanvas(left, { ratio: 0.62, mratio: 0.78, alt: "Circuit for verifying Ohm's law" });
  const gv = makeCanvas(right, { ratio: 0.85, mratio: 0.8, max: 460, alt: "V–I graph of the recorded readings" });
  const ctl = controls(stage);
  slider(ctl, { label: "Cells (1.5 V each)", min: 1, max: 4, step: 1, value: cells, fmt: v => `${v} → ${fmt(v * 1.5, 1)} V` }, v => { cells = v; drawGraph(); });
  slider(ctl, { label: "Resistance of wire XY", min: 1, max: 10, step: 0.5, value: R, unit: "Ω", fmt: v => fmt(v, 1) }, v => { R = v; drawGraph(); });
  seg(ctl, { label: "Plug key", value: closed, options: [["on", "Closed"], ["off", "Open"]] }, v => { closed = v; drawGraph(); });
  seg(ctl, { label: "Show moving", value: show, options: [["current", "Conventional current"], ["e", "Electrons"]] }, v => { show = v; });
  const row = chipRow(stage, "Lab record");
  const recBtn = chip(row, "Record this reading", () => {
    if (closed !== "on") return;
    const V = cells * 1.5, I = V / R;
    const ix = readings.findIndex(r => r.R === R && r.V === V);
    if (ix >= 0) readings.splice(ix, 1);
    readings.push({ R, V, I });
    drawGraph();
  });
  chip(row, "Clear graph", () => { readings.length = 0; drawGraph(); });
  const ro = readouts(stage);
  const GCOL = ["r1", "r3", "r2", "beam", "accent", "img"];
  let roKey = "";

  const values = () => {
    const V = cells * 1.5;
    const I = closed === "on" ? V / R : 0;
    return { V, I, VR: I * R };
  };

  onFrame(dt => {
    const { I } = values();
    phase += dt * 30 * I * (show === "e" ? -1 : 1);
    drawCircuit();
  });
  cv.draw = drawCircuit;
  gv.draw = drawGraph;

  function drawCircuit() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const x1 = w * 0.12, x2 = w * 0.88, y1 = H * 0.16, y2 = H * 0.84, ym = (y1 + y2) / 2, cxm = (x1 + x2) / 2;
    const { V, I, VR } = values();
    // battery of `cells` cells: long plate (+) on top of each cell
    const btop = ym - cells * 9;
    const plateTop = btop + 4;                         // first long plate (+ terminal)
    const plateBot = btop + (cells - 1) * 18 + 13;     // last short plate (− terminal)
    const xa = cxm - w * 0.12, xb = cxm + w * 0.12;
    const wc = p.text;
    line(ctx, x1, plateTop, x1, y1, wc, 2.5);
    line(ctx, x1, y1, xa, y1, wc, 2.5);
    line(ctx, xb, y1, x2, y1, wc, 2.5);
    line(ctx, x2, y1, x2, ym - 14, wc, 2.5);
    line(ctx, x2, ym + 14, x2, y2, wc, 2.5);
    line(ctx, x2, y2, cxm + 17, y2, wc, 2.5);
    line(ctx, cxm - 17, y2, x1, y2, wc, 2.5);
    line(ctx, x1, y2, x1, plateBot, wc, 2.5);
    for (let j = 0; j < cells; j++) {
      const yy = btop + j * 18 + 4;
      line(ctx, x1 - 16, yy, x1 + 16, yy, wc, 2.5);
      line(ctx, x1 - 8, yy + 9, x1 + 8, yy + 9, wc, 5);
      if (j < cells - 1) line(ctx, x1, yy + 9, x1, yy + 18, wc, 2);
    }
    label(ctx, "+", x1 - 24, plateTop, { color: p.r1, size: 16, weight: 700 });
    label(ctx, "−", x1 - 24, plateBot, { color: p.r3, size: 16, weight: 700 });
    label(ctx, `${fmt(V, 1)} V`, x1 + 22, ym, { color: p.text, size: 13, align: "left" });
    // wire XY (resistor)
    ctx.save(); ctx.strokeStyle = p.img; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(xa, y1);
    const nz = 8;
    for (let k = 0; k < nz; k++) ctx.lineTo(lerp(xa, xb, (k + 0.5) / nz), y1 + (k % 2 ? 9 : -9));
    ctx.lineTo(xb, y1); ctx.stroke(); ctx.restore();
    label(ctx, "X", xa, y1 - 14, { color: p.soft, size: 12 });
    label(ctx, "Y", xb, y1 - 14, { color: p.soft, size: 12 });
    label(ctx, `R = ${fmt(R, 1)} Ω`, cxm, y1 - 22, { color: p.img, size: 13, weight: 700 });
    // plug key
    if (closed === "on") line(ctx, x2, ym - 14, x2, ym + 14, wc, 2.5);
    else line(ctx, x2, ym + 14, x2 + 15, ym - 10, wc, 2.5);
    circle(ctx, x2, ym - 14, 3, wc); circle(ctx, x2, ym + 14, 3, wc);
    label(ctx, "Key", x2 + 10, ym + 24, { color: p.soft, size: 12, align: "left" });
    // moving charges (outside the battery)
    const info = pathInfo([[x1, plateTop], [x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, plateBot]]);
    if (I > 0) drawFlow(ctx, info, phase, 26, show === "e" ? "e" : "c", show === "e" ? p.r3 : p.r1);
    // voltmeter across XY (in parallel)
    const yv = y1 + (y2 - y1) * 0.36;
    line(ctx, xa, y1, xa, yv, p.soft, 1.8);
    line(ctx, xb, y1, xb, yv, p.soft, 1.8);
    line(ctx, xa, yv, cxm - 17, yv, p.soft, 1.8);
    line(ctx, cxm + 17, yv, xb, yv, p.soft, 1.8);
    circle(ctx, cxm, yv, 17, p.surface, p.text, 2);
    label(ctx, "V", cxm, yv + 1, { color: p.text, size: 15, weight: 700 });
    label(ctx, `${fmt(VR, 2)} V`, cxm, yv + 30, { color: p.accent, size: 14, weight: 700 });
    // ammeter (in series)
    circle(ctx, cxm, y2, 17, p.surface, p.text, 2);
    label(ctx, "A", cxm, y2 + 1, { color: p.text, size: 15, weight: 700 });
    label(ctx, `${fmt(I, 2)} A`, cxm, y2 - 30, { color: p.accent, size: 14, weight: 700 });
    label(ctx, show === "e" ? "Electrons flow from − to + outside the cell" : "Conventional current flows from + to − outside the cell",
      w / 2, H - 10, { color: p.soft, size: 12 });

    const key = `${cells}|${R}|${closed}|${readings.length}`;
    if (key !== roKey) {
      roKey = key;
      recBtn.disabled = closed !== "on";
      ro([
        { k: "Potential difference V", v: `${fmt(VR, 2)} V` },
        { k: "Current I", v: `${fmt(I, 2)} A` },
        { k: "V ÷ I", v: I > 0 ? `${fmt(VR / I, 2)} Ω` : "—" },
        { k: "Readings recorded", v: String(readings.length) },
        { k: "Ohm's law", v: "Double the number of cells and the current doubles: I ∝ V, so V/I stays equal to R.", wide: true }
      ]);
    }
  }

  function drawGraph() {
    const { ctx, w, h: H } = gv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const ml = 46, mb = 40, mt = 30, mr = 14;
    const pw = w - ml - mr, ph = H - mt - mb;
    const { I: Inow, VR: Vnow } = values();
    const steps = [0.5, 1, 1.5, 2, 3, 4, 5, 6];
    const need = Math.max(0.5, Inow, ...readings.map(r => r.I));
    const Imax = steps.find(s => s >= need - 1e-9) || 6;
    const Vmax = 6;
    const X = i => ml + (i / Imax) * pw, Y = v => mt + ph - (v / Vmax) * ph;
    label(ctx, "V–I graph (slope = R)", ml, 14, { color: p.text, size: 13, align: "left", weight: 700 });
    for (let v = 0; v <= Vmax; v += 1) {
      line(ctx, ml, Y(v), ml + pw, Y(v), p.border, 1);
      label(ctx, String(v), ml - 8, Y(v), { color: p.soft, size: 11, align: "right" });
    }
    const istep = Imax <= 1 ? 0.25 : Imax <= 2 ? 0.5 : 1;
    for (let i = 0; i <= Imax + 1e-9; i += istep) {
      line(ctx, X(i), mt, X(i), mt + ph, p.border, 1);
      label(ctx, String(+i.toFixed(2)), X(i), mt + ph + 13, { color: p.soft, size: 11 });
    }
    line(ctx, ml, mt + ph, ml + pw, mt + ph, p.text, 2);
    line(ctx, ml, mt, ml, mt + ph, p.text, 2);
    label(ctx, "Current I (ampere) →", ml + pw, H - 6, { color: p.soft, size: 12, align: "right", base: "bottom" });
    ctx.save(); ctx.translate(12, mt + ph / 2); ctx.rotate(-Math.PI / 2);
    label(ctx, "Potential difference V (volt) →", 0, 0, { color: p.soft, size: 12 }); ctx.restore();

    const groups = [...new Set(readings.map(r => r.R))];
    groups.forEach((Rg, gi) => {
      const col = p[GCOL[gi % GCOL.length]];
      const pts = readings.filter(r => r.R === Rg);
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
}

/* ---------- 5.7 Series and parallel ---------- */
/* Three bulbs treated as fixed resistors with an ideal battery. Brightness follows the power
   P = VI used in each bulb. Moving arrows travel faster where the current is larger. */
function circuitsSim(stage) {
  let mode = "series", V = 6;
  const Rs = [4, 6, 12], broken = [false, false, false];
  const phases = new Array(12).fill(0);
  const cv = makeCanvas(stage, { ratio: 0.42, mratio: 0.85, alt: "Bulbs connected in series or parallel" });
  const ctl = controls(stage);
  const modeSeg = seg(ctl, { label: "Connection", value: mode, options: [["series", "Series"], ["parallel", "Parallel"]] }, v => { mode = v; });
  const sV = slider(ctl, { label: "Battery voltage", min: 1.5, max: 12, step: 1.5, value: V, unit: "V", fmt: v => fmt(v, 1) }, v => { V = v; });
  const sR = Rs.map((r, k) => slider(ctl, { label: `R${k + 1}`, min: 1, max: 30, step: 1, value: r, unit: "Ω" }, v => { Rs[k] = v; }));
  const row = chipRow(stage, "Remove a bulb");
  const bbtn = [0, 1, 2].map(k => chip(row, `Bulb ${k + 1}`, () => { broken[k] = !broken[k]; bbtn[k].setAttribute("aria-pressed", String(broken[k])); }, false));
  const ro = readouts(stage);
  let roKey = "";

  function solve() {
    const br = Rs.map((r, k) => ({ R: r, on: !broken[k], I: 0, V: 0, P: 0 }));
    let Req, I;
    if (mode === "series") {
      Req = Rs.reduce((a, b) => a + b, 0);
      I = broken.some(b => b) ? 0 : V / Req;
      br.forEach(b => { if (b.on) { b.I = I; b.V = I * b.R; b.P = I * I * b.R; } });
    } else {
      const act = br.filter(b => b.on);
      Req = act.length ? 1 / act.reduce((a, b) => a + 1 / b.R, 0) : Infinity;
      br.forEach(b => { if (b.on) { b.V = V; b.I = V / b.R; b.P = V * V / b.R; } });
      I = br.reduce((a, b) => a + b.I, 0);
    }
    return { Req, I, br };
  }

  // wire segments, each with the current it carries (direction of conventional current)
  function segments(s, g) {
    const { bx, yT, yB, plateTop, plateBot, xs, xR } = g;
    if (mode === "series") {
      return [{ pts: [[bx, plateTop], [bx, yT], [xR, yT], [xR, yB], [bx, yB], [bx, plateBot]], I: s.I }];
    }
    const [I1, I2, I3] = s.br.map(b => b.I);
    return [
      { pts: [[bx, plateTop], [bx, yT], [xs[0], yT]], I: s.I },
      { pts: [[xs[0], yT], [xs[1], yT]], I: I2 + I3 },
      { pts: [[xs[1], yT], [xs[2], yT]], I: I3 },
      { pts: [[xs[0], yT], [xs[0], yB]], I: I1 },
      { pts: [[xs[1], yT], [xs[1], yB]], I: I2 },
      { pts: [[xs[2], yT], [xs[2], yB]], I: I3 },
      { pts: [[xs[2], yB], [xs[1], yB]], I: I3 },
      { pts: [[xs[1], yB], [xs[0], yB]], I: I2 + I3 },
      { pts: [[xs[0], yB], [bx, yB], [bx, plateBot]], I: s.I }
    ];
  }
  function geom(w, H) {
    const bx = w * 0.08, yT = H * 0.18, yB = H * 0.82, ym = (yT + yB) / 2;
    const btop = ym - 22;
    return {
      bx, yT, yB, ym, btop, plateTop: btop + 4, plateBot: btop + 22 + 14,
      xs: mode === "series" ? [0.33, 0.55, 0.77].map(f => f * w) : [0.36, 0.6, 0.84].map(f => f * w),
      xR: w * 0.93
    };
  }

  let last = null;
  onFrame(dt => {
    const s = solve();
    last = s;
    if (cv.w) segments(s, geom(cv.w, cv.h)).forEach((sg, k) => (phases[k] += dt * 26 * sg.I));
    draw();
  });
  cv.draw = draw;

  function bulb(ctx, x, y, rb, b, p) {
    if (!b.on) {
      circle(ctx, x, y, rb, p.surface2, p.soft, 1.5);
      line(ctx, x - rb * 0.55, y - rb * 0.55, x + rb * 0.55, y + rb * 0.55, p.warn, 2.5);
      line(ctx, x - rb * 0.55, y + rb * 0.55, x + rb * 0.55, y - rb * 0.55, p.warn, 2.5);
      return;
    }
    const br = b.P > 0 ? clamp(Math.pow(b.P / 30, 0.4), 0.06, 1) : 0;
    if (br > 0.01) {
      const g = ctx.createRadialGradient(x, y, rb * 0.3, x, y, rb * (1.6 + 2.6 * br));
      g.addColorStop(0, `rgba(255,205,70,${0.85 * br})`); g.addColorStop(1, "rgba(255,205,70,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rb * (1.6 + 2.6 * br), 0, Math.PI * 2); ctx.fill();
    }
    circle(ctx, x, y, rb, br > 0 ? `rgba(255,${Math.round(235 - 40 * br)},${Math.round(160 - 110 * br)},${0.35 + 0.6 * br})` : p.surface2, p.text, 2);
    ctx.save(); ctx.strokeStyle = br > 0.05 ? "#b85c00" : p.soft; ctx.lineWidth = 1.6; ctx.beginPath();
    ctx.moveTo(x - rb * 0.6, y + rb * 0.3);
    for (let k = 0; k <= 6; k++) ctx.lineTo(x - rb * 0.6 + (k * rb * 1.2) / 6, y + (k % 2 ? -rb * 0.3 : rb * 0.1));
    ctx.stroke(); ctx.restore();
  }

  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const s = last || solve();
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const g = geom(w, H);
    const { bx, yT, yB, ym, btop, plateTop, plateBot, xs, xR } = g;
    const wc = p.text;
    const rb = clamp(H * 0.06, 13, 22);
    // battery (two cells; long plate is +)
    line(ctx, bx, yT, bx, plateTop, wc, 2.5);
    line(ctx, bx, plateBot, bx, yB, wc, 2.5);
    for (let j = 0; j < 2; j++) {
      const yy = btop + j * 22 + 4;
      line(ctx, bx - 16, yy, bx + 16, yy, wc, 2.5);
      line(ctx, bx - 8, yy + 10, bx + 8, yy + 10, wc, 5);
      if (j === 0) line(ctx, bx, yy + 10, bx, yy + 22, wc, 2);
    }
    label(ctx, `${fmt(V, 1)} V`, bx + 22, ym, { color: wc, size: 13, align: "left", weight: 700 });
    const fontSmall = w < 560 ? 11 : 12;

    if (mode === "series") {
      line(ctx, bx, yT, xR, yT, wc, 2.5); line(ctx, xR, yT, xR, yB, wc, 2.5); line(ctx, xR, yB, bx, yB, wc, 2.5);
    } else {
      line(ctx, bx, yT, xs[2], yT, wc, 2.5); line(ctx, bx, yB, xs[2], yB, wc, 2.5);
      xs.forEach(x => line(ctx, x, yT, x, yB, wc, 2.5));
    }
    segments(s, g).forEach((sg, k) => { if (sg.I > 1e-9) drawFlow(ctx, pathInfo(sg.pts), phases[k], 28, "c", p.r1); });

    if (mode === "series") {
      s.br.forEach((b, k) => {
        bulb(ctx, xs[k], yT, rb, b, p);
        label(ctx, `R${k + 1} = ${b.R} Ω`, xs[k], yT + rb + 14, { color: p.text, size: fontSmall, weight: 700 });
        label(ctx, b.on ? `${fmt(b.V, 1)} V · ${fmt(b.I, 2)} A` : "removed", xs[k], yT + rb + 30, { color: p.soft, size: fontSmall });
      });
      label(ctx, `Same current through every bulb: ${fmt(s.I, 2)} A`, (bx + xR) / 2, yB - 16, { color: p.accent, size: 13, weight: 700 });
    } else {
      s.br.forEach((b, k) => {
        bulb(ctx, xs[k], ym, rb, b, p);
        label(ctx, `R${k + 1} = ${b.R} Ω`, xs[k] - rb - 6, ym - 10, { color: p.text, size: fontSmall, weight: 700, align: "right" });
        label(ctx, b.on ? `${fmt(b.I, 2)} A` : "removed", xs[k] - rb - 6, ym + 8, { color: p.soft, size: fontSmall, align: "right" });
      });
      label(ctx, `Same voltage across each bulb: ${fmt(V, 1)} V`, (bx + xs[2]) / 2, yT - 14, { color: p.accent, size: 13, weight: 700 });
    }

    const key = `${mode}|${V}|${Rs.join()}|${broken.join()}`;
    if (key === roKey) return;
    roKey = key;
    const reqTxt = mode === "series"
      ? `Rs = ${Rs.join(" + ")} = ${nice(s.Req)} Ω`
      : (isFinite(s.Req) ? `1/Rp = ${s.br.filter(b => b.on).map(b => `1/${b.R}`).join(" + ")}, so Rp = ${nice(s.Req)} Ω` : "All bulbs removed: no closed path");
    const items = [
      { k: "Equivalent resistance", v: reqTxt, wide: true },
      { k: "Current from battery", v: `${fmt(s.I, 2)} A` },
      { k: "Power from battery", v: `${fmt(V * s.I, 2)} W` }
    ];
    s.br.forEach((b, k) => items.push({ k: `Bulb ${k + 1}`, v: b.on ? `${fmt(b.V, 2)} V, ${fmt(b.I, 2)} A, ${fmt(b.P, 2)} W` : "Removed" }));
    if (mode === "series" && broken.some(b => b)) items.push({ k: "Notice", v: "Removing one bulb breaks the only path, so every bulb goes off.", wide: true, tone: "bad" });
    if (mode === "parallel" && broken.some(b => b) && broken.some(b => !b)) items.push({ k: "Notice", v: "The other bulbs stay on, because each has its own path. This is why houses are wired in parallel.", wide: true, tone: "good" });
    ro(items);
  }

  return {
    set(o) {
      if (o.mode) { mode = o.mode; modeSeg.set(mode); }
      if (o.V) { V = o.V; sV.value = V; }
      if (o.R) o.R.forEach((r, k) => { Rs[k] = r; sR[k].value = r; });
      broken.fill(false);
      bbtn.forEach(b => b.setAttribute("aria-pressed", "false"));
    }
  };
}

/* ---------- 5.8 Resistance and resistivity ---------- */
/* Resistivity at 20 °C in Ω m. The metal values are those in NCERT Table 11.2. The textbook
   table prints the alloys as "× 10⁻⁶"; measured values are about 100 times smaller
   (constantan ≈ 4.9 × 10⁻⁷ Ω m, nichrome ≈ 1.0–1.1 × 10⁻⁶ Ω m), and those are used here. */
function resistivitySim(stage) {
  const MATS = [
    { id: "cu", name: "Copper", rho: 1.62e-8, col: "#c8743c" },
    { id: "al", name: "Aluminium", rho: 2.63e-8, col: "#a9b2bc" },
    { id: "w", name: "Tungsten", rho: 5.20e-8, col: "#80889a" },
    { id: "fe", name: "Iron", rho: 10.0e-8, col: "#77706a" },
    { id: "con", name: "Constantan", rho: 49e-8, col: "#b8935a", alloy: "49 × 10⁻⁶" },
    { id: "ni", name: "Nichrome", rho: 100e-8, col: "#938d82", alloy: "100 × 10⁻⁶" }
  ];
  let mat = "ni", L = 1, d = 0.5, note = "";
  const LIM = { L: [0.5, 5, 0.1], d: [0.1, 1, 0.05] };
  const cv = makeCanvas(stage, { ratio: 0.24, mratio: 0.55, min: 170, alt: "A wire of chosen length and thickness" });
  const ctl = controls(stage);
  seg(ctl, { label: "Material", value: mat, options: MATS.map(m => [m.id, m.name]) }, v => { mat = v; note = ""; draw(); });
  const sL = slider(ctl, { label: "Length l", min: LIM.L[0], max: LIM.L[1], step: LIM.L[2], value: L, unit: "m", fmt: v => fmt(v, 1) }, v => { L = v; note = ""; draw(); });
  const sD = slider(ctl, { label: "Diameter d", min: LIM.d[0], max: LIM.d[1], step: LIM.d[2], value: d, unit: "mm", fmt: v => fmt(v, 2) }, v => { d = v; note = ""; draw(); });
  const row = chipRow(stage, "Try");
  const quick = (txt, which, factor, hint) => chip(row, txt, () => {
    const [mn, mxv, st] = LIM[which];
    const cur = which === "L" ? L : d;
    const target = cur * factor;
    const k = (target - mn) / st;
    if (target < mn - 1e-9 || target > mxv + 1e-9 || Math.abs(k - Math.round(k)) > 1e-6) {
      note = `The slider can't go exactly to ${which === "L" ? fmt(target, 2) + " m" : fmt(target, 3) + " mm"}. ${hint}`;
      draw();
      return;
    }
    const before = res();
    if (which === "L") { L = +target.toFixed(2); sL.value = L; } else { d = +target.toFixed(3); sD.value = d; }
    note = `${txt}: R changes from ${nice(before)} Ω to ${nice(res())} Ω, which is ${fmt(res() / before, 2)} times.`;
    draw();
  });
  quick("Double the length", "L", 2, "Try a length of 1.0 m or 2.0 m first.");
  quick("Halve the length", "L", 0.5, "Try a length of 2.0 m or 4.0 m first.");
  quick("Double the diameter", "d", 2, "Try a diameter of 0.2 mm or 0.4 mm first.");
  quick("Halve the diameter", "d", 0.5, "Try a diameter of 0.4 mm or 0.8 mm first.");
  const ro = readouts(stage);

  const M = () => MATS.find(m => m.id === mat);
  const area = () => Math.PI * Math.pow(d * 1e-3, 2) / 4;
  const res = () => M().rho * L / area();
  const rhoText = m => {
    const v = m.rho / 1e-8;
    return `${m.alloy ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)} × 10⁻⁸ Ω m`;
  };

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const m = M();
    const x0 = w * 0.08, len = 30 + (L / 5) * (w * 0.8), th = 4 + d * 34, y = H * 0.5;
    const g = ctx.createLinearGradient(0, y - th / 2, 0, y + th / 2);
    g.addColorStop(0, shade(m.col, -0.35)); g.addColorStop(0.35, shade(m.col, 0.45)); g.addColorStop(0.6, m.col); g.addColorStop(1, shade(m.col, -0.45));
    ctx.fillStyle = g;
    ctx.fillRect(x0, y - th / 2, len, th);
    ctx.beginPath(); ctx.ellipse(x0 + len, y, Math.max(2, th * 0.18), th / 2, 0, 0, Math.PI * 2); ctx.fillStyle = shade(m.col, 0.2); ctx.fill();
    ctx.fillStyle = p.text;
    ctx.fillRect(x0 - 12, y - 10, 12, 20);
    ctx.fillRect(x0 + len, y - 10, 12, 20);
    line(ctx, x0, y + th / 2 + 18, x0 + len, y + th / 2 + 18, p.soft, 1.5);
    head(ctx, x0 + len, y + th / 2 + 18, 0, 8, p.soft);
    head(ctx, x0, y + th / 2 + 18, Math.PI, 8, p.soft);
    label(ctx, `l = ${fmt(L, 1)} m`, x0 + len / 2, y + th / 2 + 32, { color: p.text, size: 13, weight: 700 });
    label(ctx, `d = ${fmt(d, 2)} mm`, x0 + len + 20, y, { color: p.text, size: 13, align: "left" });
    label(ctx, `${m.name} wire`, x0, y - th / 2 - 14, { color: p.soft, size: 13, align: "left" });
    label(ctx, "Thickness not to scale", 10, H - 12, { color: p.soft, size: 11, align: "left" });
    const R = res();
    label(ctx, `R = ${nice(R)} Ω`, w - 12, 18, { color: p.accent, size: 18, weight: 700, align: "right" });

    const cu = MATS[0];
    const items = [
      { k: "Resistivity ρ (20 °C)", v: rhoText(m) },
      { k: "Area A = πd²/4", v: `${sci(area(), 2)} m²` },
      { k: "R = ρl / A", v: `${nice(R)} Ω` },
      m.id === "cu"
        ? { k: "Copper", v: "Very low ρ, so it is used for connecting wires" }
        : { k: "Same wire in copper", v: `${nice(cu.rho * L / area())} Ω (${m.name} is ${fmt(m.rho / cu.rho, 1)} × copper)` },
      { k: note ? "Result" : "Remember", v: note || "R ∝ l and R ∝ 1/A. ρ depends only on the material (and its temperature), not on the length or thickness of the wire.", wide: true }
    ];
    if (m.alloy) items.push({ k: "Note for the teacher", v: `NCERT Table 11.2 prints ${m.name.toLowerCase()} as ${m.alloy} Ω m. Measured values for these alloys are about 100 times smaller, as used here.`, wide: true });
    ro(items);
  }
  draw();
}

/* ---------- 5.9 Power, heating and the electricity bill ---------- */
function powerSim(stage) {
  const apps = [
    { n: "LED bulb", p: 9, q: 4, hrs: 6 }, { n: "Ceiling fan", p: 75, q: 2, hrs: 10 }, { n: "Television", p: 100, q: 1, hrs: 4 },
    { n: "Refrigerator", p: 200, q: 1, hrs: 10 }, { n: "Electric iron", p: 1000, q: 1, hrs: 0.5 },
    { n: "Water heater", p: 2000, q: 0, hrs: 1 }, { n: "Air conditioner", p: 1500, q: 0, hrs: 6 }
  ];
  let rate = 7;
  const wrap = h("div", { class: "bill-wrap" });
  const tbody = h("tbody");
  wrap.append(h("table", { class: "bill" },
    h("thead", {}, h("tr", {}, h("th", {}, "Appliance"), h("th", { class: "num" }, "Power (W)"), h("th", {}, "How many"),
      h("th", { class: "num" }, "Hours/day"), h("th", { class: "num" }, "kWh/day"), h("th", { class: "bar-cell" }, "Share"))),
    tbody));
  stage.append(h("p", { style: "margin:0 0 .6rem;color:var(--text-soft)" },
    "Change the numbers to match a student's home. Energy = power × time, and 1 kWh is one “unit” on the bill."), wrap);
  const rows = apps.map((a, k) => {
    const cnt = h("span", {}, String(a.q));
    const kwh = h("td", { class: "num" });
    const bar = h("div", { class: "bar" });
    const pIn = h("input", { type: "number", min: 1, max: 5000, step: 1, value: a.p, "aria-label": `${a.n} power in watts` });
    const hIn = h("input", { type: "number", min: 0, max: 24, step: 0.5, value: a.hrs, "aria-label": `${a.n} hours per day` });
    pIn.addEventListener("input", () => { a.p = Math.max(0, +pIn.value || 0); calc(); });
    hIn.addEventListener("input", () => { a.hrs = clamp(+hIn.value || 0, 0, 24); calc(); });
    const step = dlt => () => { a.q = clamp(a.q + dlt, 0, 20); cnt.textContent = String(a.q); calc(); };
    tbody.append(h("tr", {}, h("td", {}, a.n), h("td", { class: "num" }, pIn),
      h("td", {}, h("span", { class: "stepper" }, h("button", { type: "button", onclick: step(-1), "aria-label": "fewer" }, "−"), cnt,
        h("button", { type: "button", onclick: step(1), "aria-label": "more" }, "+"))),
      h("td", { class: "num" }, hIn), kwh, h("td", { class: "bar-cell" }, bar)));
    return { kwh, bar, a, k };
  });
  const ctl = controls(stage);
  const rateIn = h("input", { type: "number", min: 0, max: 50, step: 0.5, value: rate, "aria-label": "rupees per unit" });
  rateIn.addEventListener("input", () => { rate = Math.max(0, +rateIn.value || 0); calc(); });
  ctl.append(h("label", { class: "ctl" }, h("span", { class: "ctl-label" }, "Rate (₹ per unit)"), rateIn));
  const ro = readouts(stage);

  // Joule's law calculator
  const calcBox = h("div", { class: "calc" });
  calcBox.append(h("h3", {}, "Heating effect: H = I²Rt"));
  stage.append(calcBox);
  let jI = 2, jR = 4, jt = 30;
  slider(calcBox, { label: "Current I", min: 0.5, max: 10, step: 0.5, value: jI, unit: "A", fmt: v => fmt(v, 1) }, v => { jI = v; calc(); });
  slider(calcBox, { label: "Resistance R", min: 1, max: 100, step: 1, value: jR, unit: "Ω" }, v => { jR = v; calc(); });
  slider(calcBox, { label: "Time t", min: 1, max: 600, step: 1, value: jt, unit: "s" }, v => { jt = v; calc(); });
  const ro2 = readouts(stage);

  function calc() {
    const day = rows.map(r => (r.a.p * r.a.q * r.a.hrs) / 1000);
    const tot = day.reduce((a, b) => a + b, 0);
    const mx = Math.max(...day, 1e-9);
    rows.forEach((r, k) => { r.kwh.textContent = fmt(day[k], 2); r.bar.style.width = `${(day[k] / mx) * 100}%`; r.bar.style.opacity = day[k] ? 1 : 0.15; });
    const load = rows.reduce((a, r) => a + r.a.p * r.a.q, 0);
    const units = tot * 30;
    ro([
      { k: "All switched on together", v: `${nice(load)} W` },
      { k: "Current drawn at 220 V", v: `${fmt(load / 220, 2)} A` },
      { k: "Energy per day", v: `${fmt(tot, 2)} kWh` },
      { k: "Units per month (30 days)", v: `${fmt(units, 0)} units` },
      { k: "Bill per month", v: `₹ ${fmt(units * rate, 0)}` },
      { k: "Energy per day in joules", v: `${sci(tot * 3.6e6, 2)} J` }
    ]);
    const H = jI * jI * jR * jt;
    ro2([
      { k: "Heat produced H", v: `${nice(H)} J` },
      { k: "Power P = I²R", v: `${nice(jI * jI * jR)} W` },
      { k: "Voltage V = IR", v: `${nice(jI * jR)} V` },
      { k: "Try this", v: "Double I and H becomes 4 times. Double R or t and H only doubles.", wide: true }
    ]);
  }
  calc();
}

CR.sims.ohm = ohmSim;
CR.sims.circuits = circuitsSim;
CR.sims.resistivity = resistivitySim;
CR.sims.elecPower = powerSim;
})();
