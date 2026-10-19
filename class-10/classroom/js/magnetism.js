/* ============================================================
   Chapter 12 — Magnetic Effects of Electric Current (simulations)
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, MINUS, fmt, sgnf, sci, nice, pal, line, head, drawRay, vArrow, label, roundRect, circle, toEdge, shade, rgb, mix, pathInfo, pointAt, drawFlow, onFrame, makeCanvas, controls, slider, seg, select, chipRow, chip, readouts } = CR;

/* ---------- 5.10 Magnetic field lines with a movable compass ---------- */
/* A cross-section view: each conductor is drawn where it cuts the screen (⊙ current towards you,
   ⊗ away from you) and the field is the sum of the fields of long straight wires, B ∝ I/r.
   A loop is cut in two places and a solenoid in two rows. The bar magnet is drawn over a hidden
   solenoid, which has the same field outside. The µT value is shown only for the straight wire. */
function stream(x, y, dir, F, b, wires, rodR = 7) {
  const pts = [[x, y]];
  const step = 3, sx = x, sy = y;
  for (let i = 0; i < 1800; i++) {
    let [bx, by] = F(x, y);
    let m = Math.hypot(bx, by);
    if (m < 1e-12) break;
    const mx = x + (bx / m) * dir * step / 2, my = y + (by / m) * dir * step / 2;
    [bx, by] = F(mx, my);
    m = Math.hypot(bx, by);
    if (m < 1e-12) break;
    x += (bx / m) * dir * step;
    y += (by / m) * dir * step;
    pts.push([x, y]);
    if (x < b[0] - 4 || y < b[1] - 4 || x > b[2] + 4 || y > b[3] + 4) return { pts, closed: false };
    for (const wi of wires) if (Math.hypot(x - wi.x, y - wi.y) < rodR) return { pts, closed: false };
    if (i > 30 && Math.hypot(x - sx, y - sy) < step * 1.5) { pts.push([sx, sy]); return { pts, closed: true }; }
  }
  return { pts, closed: false };
}
function fieldLine(x, y, F, b, wires, both = true, rodR) {
  const f = stream(x, y, 1, F, b, wires, rodR);
  if (f.closed || !both) return f.pts;
  const r = stream(x, y, -1, F, b, wires, rodR);
  return r.pts.reverse().concat(f.pts.slice(1));
}
function arrowsAlong(ctx, pts, color, every = 130, first = 55) {
  let acc = 0, next = first;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const l = Math.hypot(x2 - x1, y2 - y1);
    acc += l;
    if (acc >= next) { head(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), 9, color); next += every; }
  }
}
function polyline(ctx, pts, color, width = 1.6, alpha = 1) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round";
  ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
function wireSymbol(ctx, x, y, I, p, r = 9) {
  circle(ctx, x, y, r, p.surface, p.text, 2);
  if (I > 0) circle(ctx, x, y, 2.8, p.text);
  else { line(ctx, x - r * 0.55, y - r * 0.55, x + r * 0.55, y + r * 0.55, p.text, 2); line(ctx, x - r * 0.55, y + r * 0.55, x + r * 0.55, y - r * 0.55, p.text, 2); }
}

function fieldSim(stage) {
  let cfg = "wire", I = 4, dir = 1, view = "lines";
  let comp = null, dragging = false;
  let cache = { key: "", lines: [] };
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 0.95, touch: true, alt: "Magnetic field lines and a compass" });
  const ctl = controls(stage);
  seg(ctl, { label: "Conductor", value: cfg, options: [["wire", "Straight wire"], ["loop", "Circular loop"], ["solenoid", "Solenoid"], ["magnet", "Bar magnet"]] },
    v => { cfg = v; draw(); });
  const sI = slider(ctl, { label: "Current I", min: 1, max: 10, step: 1, value: I, unit: "A" }, v => { I = v; draw(); });
  seg(ctl, { label: "Show", value: view, options: [["lines", "Field lines"], ["grid", "Compass grid"], ["both", "Both"]] }, v => { view = v; draw(); });
  const row = chipRow(stage, "");
  const revChip = chip(row, "⇄ Reverse the current", () => { dir = -dir; draw(); });
  row.append(h("span", { class: "presets-label" }, "Drag the compass, or tap anywhere to move it."));
  const ro = readouts(stage);

  function wires(w, H) {
    const cx = w / 2, cy = H / 2;
    if (cfg === "wire") return [{ x: cx, y: cy, I: dir }];
    if (cfg === "loop") { const a = Math.min(H * 0.2, 64); return [{ x: cx, y: cy - a, I: dir }, { x: cx, y: cy + a, I: -dir }]; }
    // solenoid: 7 turns; bar magnet: the same length with many thin turns, so its field is smooth
    const sp = Math.min(26, w * 0.05), a = Math.min(H * 0.13, 40), arr = [];
    const n = cfg === "magnet" ? 31 : 7, gap = (6 * sp) / (n - 1), I0 = cfg === "magnet" ? 7 / 31 : 1;
    for (let k = 0; k < n; k++) { const x = cx + (k - (n - 1) / 2) * gap; arr.push({ x, y: cy - a, I: dir * I0 }, { x, y: cy + a, I: -dir * I0 }); }
    return arr;
  }
  const field = ws => (x, y) => {
    let bx = 0, by = 0;
    for (const wi of ws) { const dx = x - wi.x, dy = y - wi.y, r2 = dx * dx + dy * dy + 1e-6; bx += wi.I * dy / r2; by += -wi.I * dx / r2; }
    return [bx, by];
  };

  function getLines(w, H, ws) {
    const key = `${cfg}|${I}|${dir}|${w}|${H}`;
    if (cache.key === key) return cache.lines;
    const F = field(ws), b = [0, 0, w, H], cx = w / 2, cy = H / 2, seeds = [];
    if (cfg === "wire") {
      const n = 4 + Math.round(I * 0.9), maxR = Math.hypot(w, H) / 2, q = Math.pow(maxR / 20, 1 / n);
      for (let k = 0; k < n; k++) seeds.push([cx + 20 * Math.pow(q, k), cy]);
    } else {
      const yTop = ws[0].y, yBot = ws[1].y, n = 3 + Math.round(I * 0.6);
      for (let k = 0; k < n; k++) seeds.push([cx, lerp(yTop + 10, yBot - 10, (k + 0.5) / n)]);
      for (const e of (cfg === "loop" ? [16, 34, 60] : cfg === "magnet" ? [30, 60] : [16, 34])) seeds.push([cx, yTop - e], [cx, yBot + e]);
    }
    cache = { key, lines: seeds.map(([x, y]) => fieldLine(x, y, F, b, ws)) };
    return cache.lines;
  }

  function pos(e) { const r = cv.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  cv.cv.addEventListener("pointerdown", e => { dragging = true; cv.cv.setPointerCapture(e.pointerId); comp = pos(e); draw(); });
  cv.cv.addEventListener("pointermove", e => { if (!dragging) return; const q = pos(e); comp = { x: clamp(q.x, 10, cv.w - 10), y: clamp(q.y, 10, cv.h - 10) }; draw(); });
  const stop = () => { dragging = false; };
  cv.cv.addEventListener("pointerup", stop);
  cv.cv.addEventListener("pointercancel", stop);

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const ws = wires(w, H), F = field(ws), cx = w / 2, cy = H / 2;
    sI.el.classList.toggle("disabled", cfg === "magnet");
    revChip.textContent = cfg === "magnet" ? "⇄ Turn the magnet round" : "⇄ Reverse the current";
    if (!comp) comp = { x: cx + w * 0.22, y: cy - H * 0.26 };
    comp.x = clamp(comp.x, 10, w - 10); comp.y = clamp(comp.y, 10, H - 10);

    // conductor outline
    if (cfg === "loop") {
      ctx.save(); ctx.strokeStyle = p.soft; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(cx, cy, 14, Math.abs(ws[0].y - cy), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    if (cfg === "solenoid") {
      const xL = ws[0].x - 12, xR = ws[ws.length - 2].x + 12;
      ctx.save(); ctx.strokeStyle = p.soft; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
      ctx.strokeRect(xL, ws[0].y - 12, xR - xL, ws[1].y - ws[0].y + 24); ctx.restore();
    }
    if (cfg === "magnet") {
      const xL = ws[0].x - 16, xR = ws[ws.length - 2].x + 16, yT = ws[0].y - 6, yB = ws[1].y + 6, xm = (xL + xR) / 2;
      const nRight = dir > 0;
      ctx.save(); ctx.globalAlpha = 0.85;
      ctx.fillStyle = nRight ? "#3f6fd8" : "#d9534f"; ctx.fillRect(xL, yT, xm - xL, yB - yT);
      ctx.fillStyle = nRight ? "#d9534f" : "#3f6fd8"; ctx.fillRect(xm, yT, xR - xm, yB - yT);
      ctx.restore();
      label(ctx, nRight ? "S" : "N", (xL + xm) / 2, cy, { color: "#fff", size: 22, weight: 700 });
      label(ctx, nRight ? "N" : "S", (xm + xR) / 2, cy, { color: "#fff", size: 22, weight: 700 });
    }

    if (view !== "grid") {
      for (const pts of getLines(w, H, ws)) { polyline(ctx, pts, p.accent, 1.7, 0.9); arrowsAlong(ctx, pts, p.accent); }
    }
    if (view !== "lines") {
      const sp = w < 560 ? 26 : 32;
      for (let gx = sp / 2; gx < w; gx += sp) for (let gy = sp / 2; gy < H; gy += sp) {
        if (ws.some(wi => Math.hypot(gx - wi.x, gy - wi.y) < 14)) continue;
        const [bx, by] = F(gx, gy), a = Math.atan2(by, bx), L = sp * 0.36;
        line(ctx, gx, gy, gx + Math.cos(a) * L, gy + Math.sin(a) * L, p.r1, 2.4);
        line(ctx, gx, gy, gx - Math.cos(a) * L, gy - Math.sin(a) * L, p.soft, 2.4);
      }
    }
    if (cfg !== "magnet") ws.forEach(wi => wireSymbol(ctx, wi.x, wi.y, wi.I, p));
    if (cfg === "solenoid") {
      const xL = ws[0].x - 26, xR = ws[ws.length - 2].x + 26;
      label(ctx, dir > 0 ? "S" : "N", xL, cy, { color: dir > 0 ? "#3f6fd8" : "#d9534f", size: 20, weight: 700 });
      label(ctx, dir > 0 ? "N" : "S", xR, cy, { color: dir > 0 ? "#d9534f" : "#3f6fd8", size: 20, weight: 700 });
    }

    // compass
    const [bx, by] = F(comp.x, comp.y), a = Math.atan2(by, bx);
    circle(ctx, comp.x, comp.y, 22, p.surface, p.text, 2.5);
    ctx.save(); ctx.translate(comp.x, comp.y); ctx.rotate(a);
    ctx.fillStyle = "#d9534f"; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.soft; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(0, -5); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    circle(ctx, comp.x, comp.y, 2.5, p.text);

    // strength at compass (1 px = 0.5 mm, 2-D model of long wires)
    let Bx = 0, By = 0;
    for (const wi of ws) {
      const dx = (comp.x - wi.x) * 5e-4, dy = (comp.y - wi.y) * 5e-4, r2 = dx * dx + dy * dy + 1e-12;
      const k = 2e-7 * I * wi.I / r2;
      Bx += k * dy; By += -k * dx;
    }
    const B = Math.hypot(Bx, By) * 1e6;
    const rule = cfg === "wire"
      ? (dir > 0 ? "Current comes out of the screen (⊙): field lines go anticlockwise." : "Current goes into the screen (⊗): field lines go clockwise.")
      : cfg === "loop" ? `Near the centre of the loop the lines are nearly straight and point to the ${dir > 0 ? "right" : "left"}. The loop behaves like a thin magnet.`
      : cfg === "solenoid" ? `Inside, the field is uniform (parallel lines). The ${dir > 0 ? "right" : "left"} end acts as a North pole.`
      : "Outside the magnet the lines go from N to S. Inside, they go from S to N, so each line is a closed loop.";
    label(ctx, cfg === "magnet" ? "Field of a bar magnet"
      : w < 640 ? "⊙ current towards you   ⊗ away from you" : "⊙ current towards you (out of screen)   ⊗ current away from you (into screen)", 10, 14, { color: p.soft, size: 12, align: "left" });
    if (cfg === "wire") {
      const dist = Math.hypot(comp.x - cx, comp.y - cy) * 0.05;
      ro([
        { k: "Distance from wire", v: `${fmt(dist, 1)} cm` },
        { k: "Field at the compass", v: `≈ ${nice(B)} µT` },
        { k: "For comparison", v: "Earth's magnetic field ≈ 50 µT" },
        { k: "Right-hand thumb rule", v: rule, wide: true }
      ]);
    } else {
      ro([
        { k: cfg === "magnet" ? "Field lines of a bar magnet" : "Right-hand thumb rule", v: rule, wide: true },
        { k: "Strength", v: cfg === "magnet" ? "Strongest near the poles, where the lines are closest" : "Stronger where the lines are closer together", wide: true }
      ]);
    }
  }
}

/* ---------- 5.11 Force on a conductor: Fleming's left-hand rule ---------- */
/* The rod is seen end-on (current towards or away from you). Field from N to S across the gap.
   Force direction F = I × B: with current out of the screen and the field to the right, F is up.
   "Magnet + wire" adds the wire's own circular field to the magnet's field (the lines crowd on
   one side; the rod is pushed from the crowded side to the other side). */
function flemingSim(stage) {
  let Iamp = 3, idir = 1, bdir = 1, comb = "off", off = 0;
  let cache = { key: "", lines: [] };
  const cv = makeCanvas(stage, { ratio: 0.6, mratio: 1.0, alt: "Force on a current-carrying rod between magnet poles" });
  const ctl = controls(stage);
  seg(ctl, { label: "Current in rod", value: "1", options: [["1", "Out of screen ⊙"], ["-1", "Into screen ⊗"]] }, v => { idir = +v; });
  seg(ctl, { label: "Magnet", value: "1", options: [["1", "N on left"], ["-1", "N on right"]] }, v => { bdir = +v; });
  slider(ctl, { label: "Current I", min: 0, max: 5, step: 0.5, value: Iamp, unit: "A", fmt: v => fmt(v, 1) }, v => { Iamp = v; });
  seg(ctl, { label: "Field lines", value: comb, options: [["off", "Magnet only"], ["on", "Magnet + wire"]] }, v => { comb = v; });
  const ro = readouts(stage);
  let lastRo = "";

  onFrame(dt => {
    const H = cv.h || 300;
    const target = -idir * bdir * (Iamp / 5) * H * 0.16;
    off += (target - off) * Math.min(1, dt * 4);
    draw();
  });
  cv.draw = draw;

  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const xL = w * 0.2, xR = w * 0.8, yT = H * 0.08, yB = H * 0.62, cx = w / 2, cy0 = (yT + yB) / 2;
    const ry = cy0 + off;
    const nLeft = bdir > 0;
    const red = "#d9534f", blue = "#3f6fd8";
    ctx.save(); ctx.globalAlpha = 0.9;
    ctx.fillStyle = nLeft ? red : blue; ctx.fillRect(w * 0.04, yT, xL - w * 0.04, yB - yT);
    ctx.fillStyle = nLeft ? blue : red; ctx.fillRect(xR, yT, w * 0.96 - xR, yB - yT);
    ctx.restore();
    label(ctx, nLeft ? "N" : "S", (w * 0.04 + xL) / 2, cy0, { color: "#fff", size: 26, weight: 700 });
    label(ctx, nLeft ? "S" : "N", (xR + w * 0.96) / 2, cy0, { color: "#fff", size: 26, weight: 700 });

    if (comb === "on" && Iamp > 0) {
      const c = Iamp * 14;
      const ws = [{ x: cx, y: ry, I: idir }];
      const F = (x, y) => {
        const dx = x - cx, dy = y - ry, r2 = dx * dx + dy * dy + 1e-6;
        return [bdir + c * idir * dy / r2, -c * idir * dx / r2];
      };
      const key = `${Iamp}|${idir}|${bdir}|${w}|${H}|${Math.round(ry)}`;
      if (cache.key !== key) {
        const lines = [];
        for (let y = yT + 6; y < yB - 2; y += 12) lines.push(fieldLine(bdir > 0 ? xL + 2 : xR - 2, y, F, [xL, yT, xR, yB], ws, false, 16));
        cache = { key, lines };
      }
      cache.lines.forEach(pts => { polyline(ctx, pts, p.accent, 1.5, 0.85); arrowsAlong(ctx, pts, p.accent, 150, 40); });
    } else {
      for (let y = yT + 14; y < yB - 4; y += 22) {
        if (bdir > 0) drawRay(ctx, xL + 4, y, xR - 4, y, p.accent, { width: 1.5, alpha: 0.55 });
        else drawRay(ctx, xR - 4, y, xL + 4, y, p.accent, { width: 1.5, alpha: 0.55 });
      }
    }
    label(ctx, bdir > 0 ? "Magnetic field B: from N to S  →" : "←  Magnetic field B: from N to S", cx, yB + 14, { color: p.accent, size: 12, weight: 700 });

    // thread and rod
    line(ctx, cx - 40, 4, cx + 40, 4, p.text, 4);
    line(ctx, cx, 4, cx, ry - 15, p.soft, 1.5);
    circle(ctx, cx, ry, 15, p.surface, p.text, 2.5);
    if (idir > 0) circle(ctx, cx, ry, 4, p.text);
    else { line(ctx, cx - 7, ry - 7, cx + 7, ry + 7, p.text, 2.5); line(ctx, cx - 7, ry + 7, cx + 7, ry - 7, p.text, 2.5); }
    const Fup = idir * bdir;
    if (Iamp > 0) {
      const room = Fup > 0 ? (ry - 18) - (yT + 8) : (yB - 8) - (ry + 18);   // keep the arrow inside the gap
      const Lw = clamp(22 + Iamp * 9, 10, Math.max(10, room));
      const y2 = ry - Fup * (18 + Lw);
      line(ctx, cx + 30, ry - Fup * 18, cx + 30, y2 + Fup * 6, p.r1, 4);
      head(ctx, cx + 30, y2, Fup > 0 ? -Math.PI / 2 : Math.PI / 2, 14, p.r1);
      label(ctx, "Force F", cx + 42, y2 + Fup * 10, { color: p.r1, size: 14, align: "left", weight: 700 });
    }

    // left-hand gizmo
    const gy = H * 0.84, gx = w * 0.5, s = Math.min(70, w * 0.12);
    const narrow = w < 640;
    label(ctx, "Fleming's left-hand rule (left hand)", gx, H * 0.7, { color: p.text, size: 13, weight: 700 });
    circle(ctx, gx, gy, 4, p.text);
    drawRay(ctx, gx, gy, gx + bdir * s, gy, p.accent, { width: 3, at: 0.95 });
    label(ctx, narrow ? "Field" : "First finger: Field", gx + bdir * (s + 6), gy, { color: p.accent, size: 12, align: bdir > 0 ? "left" : "right", weight: 700 });
    const cxv = idir > 0 ? -0.6 : 0.6, cyv = idir > 0 ? 0.55 : -0.55;
    drawRay(ctx, gx, gy, gx + cxv * s, gy + cyv * s, p.r2, { width: 3, at: 0.95 });
    label(ctx, narrow ? `Current (${idir > 0 ? "out" : "in"})` : `Second finger: Current (${idir > 0 ? "out" : "in"})`, gx + cxv * (s + 6), gy + cyv * (s + 4),
      { color: p.r2, size: 12, align: idir > 0 ? "right" : "left", weight: 700 });
    if (Iamp > 0) {
      drawRay(ctx, gx, gy, gx, gy - Fup * s * 0.75, p.r1, { width: 3, at: 0.95 });
      label(ctx, narrow ? "Force" : "Thumb: Force", gx + 8, gy - Fup * s * 0.75, { color: p.r1, size: 12, align: "left", weight: 700 });
    }

    const roKey = `${Iamp}|${idir}|${bdir}`;
    if (roKey !== lastRo) {
      lastRo = roKey;
      ro([
        { k: "Current", v: Iamp ? (idir > 0 ? "Out of screen ⊙" : "Into screen ⊗") : "Zero" },
        { k: "Field", v: nLeft ? "Left → right (N to S)" : "Right → left (N to S)" },
        { k: "Force on rod", v: Iamp ? (Fup > 0 ? "Upward ↑" : "Downward ↓") : "None", tone: Iamp ? "good" : "" },
        { k: "Try", v: "Reverse only the current, or only the magnet: the force flips. Reverse both: the force stays the same. More current means a bigger force.", wide: true }
      ]);
    }
  }
}

/* ---------- 5.12 Domestic circuit: overloading, short circuit, fuse ---------- */
/* Appliances in parallel across 220 V. Total current I = P/V; the fuse in the live wire melts
   when I exceeds its rating. Mains is AC, so the dots move to and fro (slowed down: the real
   current changes direction every 1/100 s). */
function domesticSim(stage) {
  const APPS = [["LED bulb", 10], ["Fan", 75], ["TV", 120], ["Fridge", 250], ["Iron", 1000], ["Heater", 2000]];
  const counts = [2, 1, 0, 0, 0, 0];
  let rating = 5, blown = false, cause = "", flashT = 0, phase = 0, again = false;
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.9, alt: "Domestic electric circuit with a fuse" });
  const ctl = controls(stage);
  const rateSeg = seg(ctl, { label: "Circuit and fuse", value: "5", options: [["5", "5 A (lights, fans)"], ["15", "15 A (heavy appliances)"]] }, v => { rating = +v; check(); });
  const steps = h("div", { class: "app-steppers" });
  stage.append(steps);
  const cntEls = APPS.map(([n, pw], k) => {
    const c = h("span", {}, String(counts[k]));
    steps.append(h("span", { class: "stepper" }, h("b", {}, `${n} ${pw} W`),
      h("button", { type: "button", "aria-label": `remove ${n}`, onclick: () => { counts[k] = Math.max(0, counts[k] - 1); c.textContent = counts[k]; check(); } }, "−"), c,
      h("button", { type: "button", "aria-label": `add ${n}`, onclick: () => { counts[k] = Math.min(4, counts[k] + 1); c.textContent = counts[k]; check(); } }, "+")));
    return c;
  });
  const row = chipRow(stage, "");
  chip(row, "⚡ Short circuit", () => { if (!blown) { blown = true; cause = "short"; flashT = 1; again = false; } });
  chip(row, "Replace fuse", () => { blown = false; cause = ""; check(true); });
  const ro = readouts(stage);

  const power = () => APPS.reduce((a, [, pw], k) => a + pw * counts[k], 0);
  function check(fromReplace = false) {
    const I = power() / 220;
    if (!blown && I > rating) { blown = true; cause = "overload"; flashT = 1; again = fromReplace; }
  }

  let lastKey = "";
  onFrame(dt => {
    const I = blown ? 0 : power() / 220;
    phase += dt * 2 * Math.PI * 0.8;   // one to-and-fro swing in about 1.25 s
    flashT = Math.max(0, flashT - dt * 0.8);
    draw();
  });
  cv.draw = draw;

  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const yL = H * 0.2, yN = H * 0.34, yE = H * 0.9;
    const bx0 = w * 0.02, bx1 = w * 0.13;
    const fx0 = w * 0.2, fx1 = w * 0.27;
    const act = APPS.map((a, k) => ({ n: a[0], pw: a[1], q: counts[k] })).filter(a => a.q > 0);
    const bw = Math.min(86, (w * 0.6) / Math.max(1, act.length) - 8);
    const xs = act.map((_, k) => lerp(w * 0.38 + bw / 2 - 20, w - bw / 2 - 8, act.length === 1 ? 0.5 : k / (act.length - 1)));
    const xEnd = w - 6;
    const dead = blown ? p.soft : p.live;
    roundRect(ctx, bx0, H * 0.1, bx1 - bx0, H * 0.34, 6); ctx.fillStyle = p.surface2; ctx.fill(); ctx.strokeStyle = p.text; ctx.lineWidth = 1.5; ctx.stroke();
    label(ctx, "Mains", (bx0 + bx1) / 2, H * 0.36, { color: p.text, size: 12, weight: 700 });
    label(ctx, "220 V", (bx0 + bx1) / 2, H * 0.4, { color: p.soft, size: 11 });
    // wires
    line(ctx, bx1, yL, fx0, yL, p.live, 3.5);
    line(ctx, fx1, yL, xEnd, yL, dead, 3.5);
    line(ctx, bx1, yN, xEnd, yN, p.neutral, 3.5);
    line(ctx, (bx0 + bx1) / 2, H * 0.44, (bx0 + bx1) / 2, yE, p.earth, 3);
    line(ctx, (bx0 + bx1) / 2, yE, xEnd, yE, p.earth, 3);
    const nar = w < 640;
    label(ctx, nar ? "L" : "Live (red)", nar ? bx1 + 4 : fx1 + 6, yL - 11, { color: p.live, size: 12, align: "left", weight: 700 });
    label(ctx, nar ? "N" : "Neutral (black)", nar ? bx1 + 4 : fx1 + 6, yN - 11, { color: p.neutral, size: 12, align: "left", weight: 700 });
    label(ctx, nar ? "E" : "Earth (green)", (bx0 + bx1) / 2 + 8, yE - 11, { color: p.earth, size: 12, align: "left", weight: 700 });
    // fuse
    roundRect(ctx, fx0, yL - 11, fx1 - fx0, 22, 4); ctx.fillStyle = p.surface; ctx.fill(); ctx.strokeStyle = p.text; ctx.lineWidth = 1.5; ctx.stroke();
    if (!blown) line(ctx, fx0 + 3, yL, fx1 - 3, yL, p.text, 1.5);
    else {
      line(ctx, fx0 + 3, yL, fx0 + (fx1 - fx0) * 0.38, yL + 4, p.text, 1.5);
      line(ctx, fx1 - 3, yL, fx1 - (fx1 - fx0) * 0.38, yL - 4, p.text, 1.5);
      if (flashT > 0) {
        const g = ctx.createRadialGradient((fx0 + fx1) / 2, yL, 2, (fx0 + fx1) / 2, yL, 40);
        g.addColorStop(0, `rgba(255,200,40,${flashT})`); g.addColorStop(1, "rgba(255,200,40,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc((fx0 + fx1) / 2, yL, 40, 0, Math.PI * 2); ctx.fill();
      }
    }
    label(ctx, `Fuse ${rating} A`, (fx0 + fx1) / 2, yL - 22, { color: p.text, size: 12, weight: 700 });
    // appliances in parallel
    const bh = Math.max(44, H * 0.16), by = H * 0.52;
    act.forEach((a, k) => {
      const x = xs[k];
      line(ctx, x - bw * 0.25, yL, x - bw * 0.25, by, dead, 2.5);
      line(ctx, x + bw * 0.25, yN, x + bw * 0.25, by, p.neutral, 2.5);
      circle(ctx, x - bw * 0.25, yL, 3.5, dead);
      circle(ctx, x + bw * 0.25, yN, 3.5, p.neutral);
      line(ctx, x, by + bh, x, yE, p.earth, 2);
      circle(ctx, x, yE, 3.5, p.earth);
      roundRect(ctx, x - bw / 2, by, bw, bh, 7);
      ctx.fillStyle = blown ? p.surface2 : p.surface; ctx.fill(); ctx.strokeStyle = p.text; ctx.lineWidth = 1.5; ctx.stroke();
      label(ctx, a.q > 1 ? `${a.n} ×${a.q}` : a.n, x, by + bh * 0.36, { color: p.text, size: w < 560 ? 10 : 12, weight: 700 });
      label(ctx, `${a.pw * a.q} W`, x, by + bh * 0.7, { color: p.soft, size: w < 560 ? 10 : 11 });
    });
    if (!act.length) label(ctx, "Add appliances with the + buttons below", w * 0.6, by + 20, { color: p.soft, size: 13 });
    // AC: charges in the live and neutral wires move to and fro (in opposite directions at any instant)
    if (!blown && act.length) {
      const Inow = power() / 220;
      const amp = clamp(3 + Inow * 1.2, 3, 12);
      const sft = amp * Math.sin(phase);
      const lx = xs[xs.length - 1] - bw * 0.25, nx = xs[xs.length - 1] + bw * 0.25;
      for (let x = fx1 + 16; x < lx - 6; x += 26) circle(ctx, x + sft, yL, 3, p.live);
      for (let x = bx1 + 16; x < nx - 6; x += 26) circle(ctx, x - sft, yN, 3, p.neutral);
    }
    if (cause === "short") {
      const sx = w * 0.32;
      ctx.save(); ctx.strokeStyle = flashT > 0 ? "#ffb300" : p.warn; ctx.lineWidth = 3; ctx.beginPath();
      ctx.moveTo(sx, yL); ctx.lineTo(sx + 8, yL + (yN - yL) * 0.35); ctx.lineTo(sx - 6, yL + (yN - yL) * 0.6); ctx.lineTo(sx, yN); ctx.stroke(); ctx.restore();
    }
    if (blown) label(ctx, cause === "short" ? "Fuse blown: short circuit!" : "Fuse blown: overloading!", w - 10, 14,
      { color: p.warn, size: 15, weight: 700, align: "right", bg: p.surface });

    const P = power(), I = P / 220;
    const key = `${P}|${rating}|${blown}|${cause}|${again}`;
    if (key !== lastKey) {
      lastKey = key;
      const status = !blown ? (I > rating * 0.8 ? "Working, but close to the fuse limit" : "Working normally")
        : cause === "short" ? "Live touched neutral: resistance ≈ 0, so a huge current flowed. The fuse melted and cut the live wire."
        : `${again ? "Blew again! " : ""}${fmt(I, 1)} A is more than ${rating} A. Too many appliances on one circuit. Remove some, then replace the fuse.`;
      ro([
        { k: "Total power", v: `${P} W` },
        { k: "Current needed, I = P / V", v: `${fmt(I, 2)} A` },
        { k: "Fuse rating", v: `${rating} A` },
        { k: "Status", v: status, wide: true, tone: blown ? "bad" : I > rating * 0.8 ? "" : "good" },
        { k: "Mains supply", v: "AC, 220 V, 50 Hz. The current changes direction every 1/100 s; the moving dots show this, slowed down.", wide: true },
        { k: "Wires", v: "Live (L): red insulation. Neutral (N): black. Earth (E): green.", wide: true }
      ]);
    }
  }

  return {
    set(o) {
      if (o.rating) { rating = o.rating; rateSeg.set(String(rating)); }
      if (o.counts) o.counts.forEach((c, k) => { counts[k] = c; cntEls[k].textContent = String(c); });
      blown = false; cause = ""; again = false;
      check();
    }
  };
}

CR.sims.field = fieldSim;
CR.sims.fleming = flemingSim;
CR.sims.domestic = domesticSim;
})();
