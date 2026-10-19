/* ============================================================
   Chapter 10 — The Human Eye and the Colourful World (simulations)
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, MINUS, fmt, sgnf, sci, nice, pal, line, head, drawRay, vArrow, label, roundRect, circle, toEdge, shade, rgb, mix, pathInfo, pointAt, drawFlow, onFrame, makeCanvas, controls, slider, seg, select, chipRow, chip, readouts } = CR;

/* ---------- 5.3 Human eye: defects and correction ---------- */
/* A schematic eye, not to scale. Rays are traced with the thin-lens rule through the
   spectacle lens and the eye lens. The eye lens can change its power within a fixed range
   (accommodation); myopia shifts that range to more power, hypermetropia to less. */
function eyeSim(stage) {
  let cond = "myopia", obj = "far", fix = "off";
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.66, alt: "Rays entering the human eye" });
  const ctl = controls(stage);
  seg(ctl, { label: "Eye", value: cond, options: [["normal", "Normal"], ["myopia", "Myopia"], ["hyper", "Hypermetropia"]] }, v => { cond = v; draw(); });
  seg(ctl, { label: "Looking at", value: obj, options: [["far", "Distant object"], ["near", "Object at 25 cm"]] }, v => { obj = v; draw(); });
  const sf = seg(ctl, { label: "Spectacle lens", value: fix, options: [["off", "Off"], ["on", "On"]] }, v => { fix = v; draw(); });
  const ro = readouts(stage);

  function circleHit(x, y, sl, cx, r) {
    const dx = x - cx;
    const A = 1 + sl * sl, B = 2 * (dx + y * sl), C = dx * dx + y * y - r * r;
    const disc = Math.max(0, B * B - 4 * A * C);
    const t = (-B + Math.sqrt(disc)) / (2 * A);
    return [x + t, y + sl * t];
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    sf.el.classList.toggle("disabled", cond === "normal");

    const ay = H * 0.5;
    const r = Math.min(w * (w < 640 ? 0.22 : 0.17), H * 0.36);
    const cx = w * 0.74;
    const xE = cx - 0.6 * r, xR = cx + r, D = xR - xE;   // eye lens and retina (on the axis)
    const xC = cx - r - Math.max(24, w * 0.05);          // spectacle lens
    const xNear = xE - 1.37 * D;                          // the normal near point (25 cm)
    const uN = xNear - xE;
    const fN = 1 / (1 / D - 1 / uN);                      // normal eye focused on its near point
    const fH = 1 / (1 / (1.3 * D) - 1 / uN);              // hypermetropic eye at its strongest
    const fM = 0.68 * D;                                  // myopic eye at its most relaxed
    const spanLo = 1 / (D * 1.04), spanHi = 1 / (fN * 0.97);
    const shift = cond === "myopia" ? 1 / fM - 1 / D : cond === "hyper" ? 1 / fH - 1 / fN : 0;
    const range = [1 / (spanHi + shift), 1 / (spanLo + shift)];
    // The spectacle lens is drawn further from the eye than in real life, which exaggerates its effect on
    // distant light; let the hypermetropic eye relax as far as needed so glasses never blur distant objects.
    if (cond === "hyper") range[1] = 1e9;

    let fC = null, xFP = null, xNP = null;
    if (cond === "myopia") { xFP = xE + 1 / (1 / D - 1 / fM); fC = xFP - xC; }
    if (cond === "hyper") {
      xNP = xE + 1 / (1 / D - 1 / fH);
      const uc = xNear - xC, vc = xNP - xC;
      fC = 1 / (1 / vc - 1 / uc);
    }
    const useLens = fix === "on" && fC !== null;

    let xInt;
    if (obj === "far") xInt = useLens ? xC + fC : -Infinity;
    else xInt = useLens ? xC + 1 / (1 / fC + 1 / (xNear - xC)) : xNear;
    const fReq = xInt === -Infinity ? D : 1 / (1 / D - 1 / (xInt - xE));
    const fEye = clamp(fReq, range[0], range[1]);
    const xImg = xInt === -Infinity ? xE + fEye : xE + 1 / (1 / fEye + 1 / (xInt - xE));

    // eyeball, cornea, retina, optic nerve, iris and eye lens
    circle(ctx, cx, ay, r, p.dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)", p.soft, 2);
    ctx.save(); ctx.strokeStyle = p.soft; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx - 0.25 * r, ay, 0.82 * r, Math.PI - 0.62, Math.PI + 0.62); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = p.r1; ctx.globalAlpha = 0.75; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, ay, r - 2, -0.95, 0.95); ctx.stroke(); ctx.restore();
    label(ctx, "Retina", cx + r * 0.62, ay - r * 0.92, { color: p.r1, size: 12 });
    line(ctx, cx + r, ay + 4, cx + r + 22, ay + 16, p.soft, 6);
    const a = 0.32 * r;
    line(ctx, xE, ay - 0.62 * r, xE, ay - a * 1.15, p.text, 4);
    line(ctx, xE, ay + a * 1.15, xE, ay + 0.62 * r, p.text, 4);
    const rx = clamp(r * (0.06 + 0.13 * (D / fEye - 1)), 0.05 * r, 0.3 * r);   // thicker lens = more power
    ctx.save();
    ctx.beginPath(); ctx.ellipse(xE, ay, rx, a * 1.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.25)" : "rgba(70,150,215,0.22)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, "Eye lens", xE, ay - 0.62 * r - 12, { color: p.soft, size: 12 });

    // spectacle lens
    if (useLens) {
      const hl = a * 1.7, t = 9;
      ctx.save(); ctx.beginPath();
      if (fC > 0) {
        ctx.moveTo(xC, ay - hl); ctx.quadraticCurveTo(xC + t * 2, ay, xC, ay + hl); ctx.quadraticCurveTo(xC - t * 2, ay, xC, ay - hl);
      } else {
        ctx.moveTo(xC - t, ay - hl); ctx.lineTo(xC + t, ay - hl); ctx.quadraticCurveTo(xC - t * 0.4, ay, xC + t, ay + hl);
        ctx.lineTo(xC - t, ay + hl); ctx.quadraticCurveTo(xC + t * 0.4, ay, xC - t, ay - hl);
      }
      ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(110,180,240,0.25)" : "rgba(70,150,215,0.22)"; ctx.fill();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      label(ctx, fC > 0 ? "Convex lens (+)" : "Concave lens (−)", xC, ay - hl - 12, { color: p.glassEdge, size: 12, weight: 700 });
    }

    // rays (paraxial thin-lens tracing; heights measured upwards from the axis)
    const lenses = [];
    if (useLens) lenses.push({ x: xC, f: fC });
    lenses.push({ x: xE, f: fEye });
    const ends = [], afterSpec = [];
    for (let k = 0; k < 5; k++) {
      const t = k / 4 * 2 - 1;
      let x, y, sl;
      if (obj === "far") { x = 0; y = t * a * 0.85; sl = 0; }
      else { x = xNear; y = 0; sl = (t * a * 0.85) / (lenses[0].x - xNear); }
      const pts = [[x, y]];
      lenses.forEach((Ln, j) => {
        y += sl * (Ln.x - x); x = Ln.x; pts.push([x, y]); sl -= y / Ln.f;
        if (useLens && j === 0) afterSpec.push({ x, y, sl });
      });
      const end = circleHit(x, y, sl, cx, r);
      pts.push(end);
      ends.push(end);
      ctx.save(); ctx.strokeStyle = p.beam; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, ay - py) : ctx.moveTo(px, ay - py))); ctx.stroke(); ctx.restore();
      // direction arrow on the incoming part of the ray
      const [ax0, ay0] = pts[0], [ax1, ay1] = pts[1];
      const fa = obj === "far" ? Math.min(0.5, (ax1 - 40) / Math.max(1, ax1 - ax0)) : 0.55;
      const hx = lerp(ax0, ax1, fa), hy = lerp(ay0, ay1, fa);
      head(ctx, hx, ay - hy, Math.atan2(-(ay1 - ay0), ax1 - ax0), 9, p.beam);
    }
    // where the rays seem to come from after the spectacle lens
    const virtualSrc = useLens && cond === "myopia" && obj === "far" ? xFP : useLens && cond === "hyper" && obj === "near" ? xNP : null;
    if (virtualSrc !== null) {
      afterSpec.forEach(q => {
        const xs = Math.max(virtualSrc, 4), ys = q.y + q.sl * (xs - q.x);
        line(ctx, q.x, ay - q.y, xs, ay - ys, p.beam, 1.3, [4, 4], 0.7);
      });
    }

    const sharp = Math.abs(xImg - xR) < 4;
    const msgY = ay + r * 0.5 + 6;
    if (sharp) {
      circle(ctx, xR, ay, 6, p.ok);
      label(ctx, "Sharp image on retina ✓", xR - 4, msgY, { color: p.ok, size: 13, weight: 700, align: "right", bg: p.surface });
    } else if (xImg > xR) {
      ends.forEach(([ex, ey]) => line(ctx, ex, ay - ey, xImg, ay, p.beam, 1.5, [4, 4], 0.75));
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Would focus behind retina ✗", xR - 6, msgY, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    } else {
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Focus in front of retina ✗", xR - 6, msgY, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    }

    // object and special points
    if (obj === "far") label(ctx, "Parallel rays from a distant object", 10, 16, { color: p.soft, size: 13, align: "left" });
    else {
      circle(ctx, xNear, ay, 6, p.obj);
      label(ctx, "Object (25 cm)", xNear, ay - 18, { color: p.obj, size: 13 });
    }
    if (cond === "myopia" && xFP > 8) {
      line(ctx, xFP, ay - 7, xFP, ay + 7, p.r3, 2);
      label(ctx, "Far point", xFP, ay + 20, { color: p.r3, size: 12 });
    }
    if (cond === "hyper" && obj === "near" && xNP > 8) {
      line(ctx, xNP, ay - 7, xNP, ay + 7, p.r3, 2);
      label(ctx, "Near point", xNP, ay + 20, { color: p.r3, size: 12 });
    }
    label(ctx, "Schematic eye, not to scale", 10, H - 12, { color: p.soft, size: 11, align: "left" });

    const msg = {
      "normal-far": "Normal eye, relaxed: the eye lens is thin and parallel rays focus exactly on the retina.",
      "normal-near": "Accommodation: the ciliary muscles make the eye lens thicker (shorter focal length), so an object at 25 cm is focused on the retina.",
      "myopia-far-off": "Myopia: the eye lens is too curved or the eyeball is too long. Rays from a distant object meet in front of the retina, so it looks blurred.",
      "myopia-far-on": "A concave (diverging) lens of suitable power spreads the rays so they seem to come from the eye's far point. Now the image forms on the retina.",
      "myopia-near": "A myopic (short-sighted) eye can see nearby objects clearly.",
      "hyper-near-off": "Hypermetropia: the focal length of the eye lens is too long or the eyeball is too small. Rays from a near object would meet behind the retina, so it looks blurred.",
      "hyper-near-on": "A convex (converging) lens of suitable power makes the rays seem to come from the eye's near point. Now the image forms on the retina.",
      "hyper-far": "A hypermetropic (long-sighted) eye can see distant objects clearly."
    };
    const key = cond === "normal" ? `normal-${obj}` :
      cond === "myopia" ? (obj === "far" ? `myopia-far-${fix}` : "myopia-near") :
      (obj === "near" ? `hyper-near-${fix}` : "hyper-far");
    ro([
      { k: "What happens", v: msg[key], wide: true },
      { k: "Image", v: sharp ? "Sharp ✓" : "Blurred ✗", tone: sharp ? "good" : "bad" },
      { k: "Correcting lens", v: cond === "normal" ? "Not needed" : cond === "myopia" ? "Concave, negative power" : "Convex, positive power" }
    ]);
  }
}

/* ---------- 5.4 Prism: dispersion (vector ray tracing) ---------- */
/* An equilateral prism (angle of prism A = 60°). Each colour is traced with Snell's law in
   vector form. The refractive indices (1.50 red to 1.56 violet) spread the colours more than
   real glass does, so the spectrum is easy to see. The slider starts at 35° so that every
   colour comes out of the second face (below that, violet is totally reflected inside). */
function segHit(o, d, a, b) {
  const ex = b[0] - a[0], ey = b[1] - a[1];
  const den = d[0] * ey - d[1] * ex;
  if (Math.abs(den) < 1e-12) return null;
  const ax = a[0] - o[0], ay = a[1] - o[1];
  const t = (ax * ey - ay * ex) / den;
  const u = (ax * d[1] - ay * d[0]) / den;
  if (u < 0 || u > 1) return null;
  return t;
}
function traceRay(o, d, polys, W, H) {
  const pts = [[o[0], o[1]]];
  let inside = -1, n1 = 1;
  for (let k = 0; k < 10; k++) {
    let best = null;
    polys.forEach((poly, pi) => {
      const P = poly.pts;
      for (let e = 0; e < P.length; e++) {
        const a = P[e], b = P[(e + 1) % P.length];
        const t = segHit(o, d, a, b);
        if (t !== null && t > 1e-6 && (!best || t < best.t)) best = { t, pi, a, b };
      }
    });
    if (!best) { pts.push(toEdge(o[0], o[1], d[0], d[1], W, H)); return { pts, dir: d }; }
    const p = [o[0] + d[0] * best.t, o[1] + d[1] * best.t];
    pts.push(p);
    let nx = -(best.b[1] - best.a[1]), ny = best.b[0] - best.a[0];
    const L = Math.hypot(nx, ny); nx /= L; ny /= L;
    if (nx * d[0] + ny * d[1] > 0) { nx = -nx; ny = -ny; }
    const entering = inside !== best.pi;
    const n2 = entering ? polys[best.pi].n : 1;
    const eta = n1 / n2;
    const cosi = -(nx * d[0] + ny * d[1]);
    const k2 = 1 - eta * eta * (1 - cosi * cosi);
    if (k2 < 0) d = [d[0] + 2 * cosi * nx, d[1] + 2 * cosi * ny];
    else {
      const c = eta * cosi - Math.sqrt(k2);
      d = [eta * d[0] + c * nx, eta * d[1] + c * ny];
      inside = entering ? best.pi : -1;
      n1 = n2;
    }
    o = [p[0] + d[0] * 1e-3, p[1] + d[1] * 1e-3];
  }
  return { pts, dir: d };
}

function prismSim(stage) {
  const COLS = [["Red", 1.500, "#e53935"], ["Orange", 1.510, "#fb8c00"], ["Yellow", 1.520, "#f2c200"], ["Green", 1.530, "#43a047"],
    ["Blue", 1.540, "#1e88e5"], ["Indigo", 1.550, "#4b3fb5"], ["Violet", 1.560, "#9c27b0"]];
  let iDeg = 48, newton = "one";
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.85, alt: "Dispersion of white light by a glass prism" });
  const ctl = controls(stage);
  slider(ctl, { label: "Angle of incidence i", min: 35, max: 75, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
  seg(ctl, { label: "Experiment", value: newton, options: [["one", "One prism"], ["two", "Newton: add inverted prism"]] }, v => { newton = v; draw(); });
  const ro = readouts(stage);

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const L = Math.min(w * 0.3, H * 0.62);
    const hh = L * Math.sqrt(3) / 2;
    const cx = newton === "two" ? w * 0.34 : w * 0.42, cy = H * 0.56;
    const A = [cx, cy - 2 * hh / 3], B = [cx - L / 2, cy + hh / 3], C = [cx + L / 2, cy + hh / 3];
    const polys = [{ pts: [A, B, C] }];
    let second = null;
    if (newton === "two") {
      const ex = C[0] - A[0], ey = C[1] - A[1], el = Math.hypot(ex, ey);
      let nx = ey / el, ny = -ex / el;
      const mx = (A[0] + C[0]) / 2, my = (A[1] + C[1]) / 2;
      if ((mx + nx - cx) * nx + (my + ny - cy) * ny < 0) { nx = -nx; ny = -ny; }
      const M = [mx + nx * 5, my + ny * 5];
      second = [A, B, C].map(P => [2 * M[0] - P[0], 2 * M[1] - P[1]]);
      polys.push({ pts: second });
    }
    const fillGlass = (pts) => {
      ctx.save(); ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(110,180,240,0.16)" : "rgba(70,150,215,0.14)"; ctx.fill();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    };
    fillGlass([A, B, C]);
    if (second) fillGlass(second);

    // incident ray on face AB
    const P0 = [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5)];
    let nIx = B[1] - A[1], nIy = -(B[0] - A[0]);
    const nl = Math.hypot(nIx, nIy); nIx /= nl; nIy /= nl;
    if ((cx - P0[0]) * nIx + (cy - P0[1]) * nIy < 0) { nIx = -nIx; nIy = -nIy; }
    const th = Math.atan2(nIy, nIx) - iDeg * DEG;
    const d = [Math.cos(th), Math.sin(th)];
    const start = toEdge(P0[0], P0[1], -d[0], -d[1], w, H);
    const screenX = w - 22;
    line(ctx, screenX, H * 0.06, screenX, H * 0.94, p.soft, 5);
    label(ctx, "Screen", screenX - 6, H * 0.06 - 2, { color: p.soft, size: 12, align: "right", base: "top" });
    // normal at incidence
    line(ctx, P0[0] - nIx * 50, P0[1] - nIy * 50, P0[0] + nIx * 30, P0[1] + nIy * 30, p.soft, 1.3, [4, 4]);

    const results = [];
    for (const [name, n, col] of COLS) {
      polys.forEach(pp => (pp.n = n));
      const res = traceRay(start, d, polys, screenX, H);
      results.push({ name, col, res });
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.95; ctx.lineJoin = "round";
      ctx.beginPath(); res.pts.slice(1).forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
      const end = res.pts[res.pts.length - 1];
      circle(ctx, end[0], end[1], 4, col);
    }
    drawRay(ctx, start[0], start[1], P0[0], P0[1], p.text, { width: 4.5 });
    label(ctx, "White light", start[0] + 8, start[1] + 18, { color: p.text, size: 13, align: "left" });
    label(ctx, "A", A[0], A[1] - 12, { color: p.soft, size: 12 });
    label(ctx, "Base", (B[0] + C[0]) / 2, B[1] + 14, { color: p.soft, size: 12 });

    const dev = r => {
      let a = Math.atan2(r.res.dir[1], r.res.dir[0]) - Math.atan2(d[1], d[0]);
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a < -Math.PI) a += 2 * Math.PI;
      return Math.abs(a) / DEG;
    };
    const red = results[0], vio = results[results.length - 1];
    if (newton === "one") {
      const rEnd = red.res.pts[red.res.pts.length - 1], vEnd = vio.res.pts[vio.res.pts.length - 1];
      if (Math.abs(rEnd[0] - screenX) < 1) label(ctx, "Red", screenX - 10, rEnd[1] - 8, { color: red.col, size: 12, align: "right", weight: 700 });
      if (Math.abs(vEnd[0] - screenX) < 1) label(ctx, "Violet", screenX - 10, vEnd[1] + 10, { color: vio.col, size: 12, align: "right", weight: 700 });
    } else {
      label(ctx, "Colours recombine → white light", screenX - 10, H * 0.94 - 8, { color: p.text, size: 12, align: "right" });
    }
    label(ctx, "Spread of colours exaggerated so it is easy to see", 10, H - 12, { color: p.soft, size: 11, align: "left" });

    const dr = dev(red), dv = dev(vio);
    ro(newton === "one" ? [
      { k: "Angle of prism A", v: "60°" },
      { k: "Angle of incidence", v: `${iDeg}°` },
      { k: "Deviation of red", v: `${fmt(dr, 1)}°` },
      { k: "Deviation of violet", v: `${fmt(dv, 1)}°` },
      { k: "Spectrum, top to bottom", v: "R O Y G B I V" },
      { k: "Why", v: "Each colour travels at a different speed in glass, so each bends through a different angle. Red bends the least and violet the most.", wide: true }
    ] : [
      { k: "Net deviation (red)", v: `${fmt(dr, 1)}°` },
      { k: "Net deviation (violet)", v: `${fmt(dv, 1)}°` },
      { k: "Newton's conclusion", v: "The inverted prism undoes the spreading, and white light comes out. So white light is a mixture of the seven colours.", wide: true }
    ]);
  }
}

/* ---------- 5.5 Scattering of light: why the sky is blue ---------- */
/* Fine particles of air scatter short wavelengths far more than long ones (strength used here:
   blue ≈ 5 × red). The colour of the Sun at sunrise and sunset is shown too, but it is marked
   as extra because the CBSE syllabus excludes it. Sky colours are illustrative. */
function scatterSim(stage) {
  let t = 0.5, air = "on";
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.8, alt: "Sunlight passing through the atmosphere" });
  const ctl = controls(stage);
  seg(ctl, { label: "Atmosphere", value: air, options: [["on", "Earth (with air)"], ["off", "No air (very high up)"]] }, v => { air = v; draw(); });
  const timeStr = v => {
    const mins = Math.round((6 + 12 * v) * 60);
    let hr = Math.floor(mins / 60);
    const mn = mins % 60;
    const ap = hr >= 12 ? "pm" : "am";
    hr = hr > 12 ? hr - 12 : hr;
    return `${hr}:${String(mn).padStart(2, "0")} ${ap}`;
  };
  const sT = slider(ctl, { label: "Time of day (Sun's position)", min: 0, max: 1, step: 0.005, value: t, fmt: timeStr }, v => { t = v; draw(); });
  const pre = chipRow(stage, "Jump to");
  [["Noon", 0.5], ["Morning", 0.22], ["Evening", 0.78], ["Sunrise (extra)", 0.01], ["Sunset (extra)", 0.99]].forEach(([n, v]) =>
    chip(pre, n, () => { t = v; sT.value = v; draw(); }));
  const ro = readouts(stage);
  const K = [0.06, 0.13, 0.3];      // relative scattering strength for red, green and blue light

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    const gy = H * 0.82, ox = w / 2;
    const theta = Math.PI * t;
    const eDeg = Math.max(0.5, t <= 0.5 ? 180 * t : 180 * (1 - t));
    const AM = 1 / (Math.sin(eDeg * DEG) + 0.50572 * Math.pow(eDeg + 6.07995, -1.6364));   // air crossed, relative to the Sun overhead
    const T = K.map(k => Math.exp(-k * AM));
    const mx = Math.max(...T);
    let sun = T.map(x => 255 * Math.pow(x / mx, 0.6));
    const dayness = clamp(Math.sin(eDeg * DEG) * 2.5, 0, 1);
    let zen, hor;
    if (air === "on") {
      zen = mix([38, 66, 150], [64, 132, 228], dayness);
      hor = mix(mix(sun, [255, 140, 60], 0.3), [175, 208, 245], dayness);
    } else {
      sun = [255, 255, 250]; zen = [6, 8, 16]; hor = [10, 12, 22];
    }
    const g = ctx.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, rgb(zen)); g.addColorStop(1, rgb(hor));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, gy);
    if (air === "off") {
      for (let k = 0; k < 60; k++) {
        const sx = (k * 97.3) % w, sy = (k * 53.7) % (gy * 0.95);
        circle(ctx, sx, sy, k % 7 === 0 ? 1.4 : 0.8, "rgba(255,255,255,0.8)");
      }
    }
    // atmosphere layer (schematic)
    const top = gy - H * 0.38;
    if (air === "on") {
      line(ctx, 0, top, w, top, "rgba(255,255,255,0.55)", 1.2, [6, 6]);
      label(ctx, "Top of the atmosphere (not to scale)", 10, top - 10, { color: "rgba(255,255,255,0.9)", size: 12, align: "left" });
    }
    // Sun
    const Rs = Math.min(w * 0.46, gy * 0.95);
    const sx = ox - Rs * Math.cos(theta), sy = gy - Rs * Math.sin(theta);
    const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 60);
    glow.addColorStop(0, rgb(sun, 0.9)); glow.addColorStop(1, rgb(sun, 0));
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 60, 0, Math.PI * 2); ctx.fill();
    circle(ctx, sx, sy, 17, rgb(sun));
    // sunlight path through the air, with blue light scattered sideways along it
    if (air === "on") {
      const dx = sx - ox, dy = sy - gy;
      const tt = (top - gy) / dy;
      const cx = ox + dx * tt, cy = top;
      line(ctx, sx, sy, cx, cy, rgb(sun, 0.5), 2, [4, 6]);
      line(ctx, cx, cy, ox, gy - 18, rgb(sun), 4);
      for (let k = 1; k <= 5; k++) {
        const f = k / 6;
        const px = lerp(cx, ox, f), py = lerp(cy, gy - 18, f);
        if (px < -5 || px > w + 5) continue;
        circle(ctx, px, py, 2.6, "rgba(255,255,255,0.95)");
        for (let j = 0; j < 4; j++) {
          const a = k * 0.7 + j * Math.PI / 2;
          line(ctx, px + Math.cos(a) * 4, py + Math.sin(a) * 4, px + Math.cos(a) * 15, py + Math.sin(a) * 15, "rgb(120,170,255)", 2);
          head(ctx, px + Math.cos(a) * 18, py + Math.sin(a) * 18, a, 6, "rgb(120,170,255)");
        }
      }
      label(ctx, "Air particles scatter blue light in all directions", w - 10, 16, { color: "rgba(255,255,255,0.95)", size: 12, align: "right" });
    } else {
      label(ctx, "No air: nothing scatters the sunlight", w - 10, 16, { color: "rgba(255,255,255,0.95)", size: 12, align: "right" });
    }
    // ground and observer
    ctx.fillStyle = p.dark ? "#26331f" : "#7b9a5a"; ctx.fillRect(0, gy, w, H - gy);
    const horLum = 0.299 * hor[0] + 0.587 * hor[1] + 0.114 * hor[2];
    const figure = horLum > 120 ? "#1c2233" : "#f2f4f8";
    ctx.save(); ctx.strokeStyle = figure; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(ox, gy - 26, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, gy - 21); ctx.lineTo(ox, gy - 9); ctx.moveTo(ox, gy - 9); ctx.lineTo(ox - 5, gy);
    ctx.moveTo(ox, gy - 9); ctx.lineTo(ox + 5, gy); ctx.moveTo(ox - 6, gy - 17); ctx.lineTo(ox + 6, gy - 17); ctx.stroke(); ctx.restore();
    label(ctx, "You", ox + 12, gy - 18, { color: figure, size: 12, align: "left" });

    const low = eDeg < 15;
    if (air === "on") {
      const items = [
        { k: "Sun's height", v: `${fmt(eDeg, 0)}° above the horizon` },
        { k: "Sky looks", v: low ? "Blue overhead, reddish near the Sun" : "Blue" },
        { k: "Why the sky is blue", v: "Air molecules and fine particles are much smaller than the wavelength of light. They scatter blue light (short wavelength) much more strongly than red. This scattered blue light reaches your eyes from every part of the sky.", wide: true }
      ];
      if (low) items.push({ k: "Extra (not in the CBSE syllabus)", v: `Near sunrise and sunset, sunlight crosses about ${fmt(AM, 0)} times as much air as at noon. Most of the blue is scattered away before it reaches you (blue reaching you: ${fmt(T[2] * 100, 0)}%, red: ${fmt(T[0] * 100, 0)}%), so the Sun looks reddish.`, wide: true });
      ro(items);
    } else {
      ro([
        { k: "Sky looks", v: "Dark, even in daytime" },
        { k: "Sun looks", v: "White" },
        { k: "Why", v: "If there were no atmosphere there would be no scattering, so the sky would look dark. The sky looks dark to passengers flying at very high altitudes, and to astronauts in space.", wide: true }
      ]);
    }
  }
}

CR.sims.eye = eyeSim;
CR.sims.prism = prismSim;
CR.sims.scatter = scatterSim;
})();
