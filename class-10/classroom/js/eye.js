/* ============================================================
   Chapter 10 — The Human Eye and the Colourful World (simulations)
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, fmt, sgnf, pal, line, head, drawRay, vArrow, label, textWidth, roundRect, circle, toEdge,
  rgb, mix, onFrame, makeCanvas, controls, slider, seg, numInput, chipRow, chip, toggles, readouts } = CR;

const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
/* the smaller angle between two directions, drawn as an arc with a label */
function arcBetween(ctx, x, y, r, u, v, color, txt, o = {}) {
  const a1 = Math.atan2(u[1], u[0]);
  let d = Math.atan2(v[1], v[0]) - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  if (Math.abs(d) < 0.01) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x, y, r, a1, a1 + d, d < 0); ctx.stroke(); ctx.restore();
  if (txt) {
    const am = a1 + d / 2, off = o.off ?? 12;
    label(ctx, txt, x + Math.cos(am) * (r + off), y + Math.sin(am) * (r + off), { color, size: o.size || 13, weight: 700, bg: o.bg || null, pad: 2 });
  }
}
/* where a ray from (x, y) along d leaves a circle that contains the point */
function exitCircle(x, y, d, cx, cy, r) {
  const ox = x - cx, oy = y - cy, b = ox * d[0] + oy * d[1], c = ox * ox + oy * oy - r * r;
  const t = -b + Math.sqrt(Math.max(0, b * b - c));
  return [x + d[0] * t, y + d[1] * t];
}
function callout(ctx, txt, px, py, lx, ly, color, align, W) {
  const tw = textWidth(ctx, txt, 12, 700);
  if (align === "left") lx = Math.min(lx, W - tw - 8);
  if (align === "right") lx = Math.max(lx, tw + 8);
  line(ctx, px, py, lx, ly, color, 1);
  circle(ctx, px, py, 2.4, color);
  label(ctx, txt, lx + (align === "left" ? 4 : align === "right" ? -4 : 0), ly, { color, size: 12, align, weight: 700 });
}

/* =================================================================
   10.1 The human eye: parts, and the power of accommodation
   Simple model: eye lens and retina 2.0 cm apart. Normal eye: near
   point 25 cm, far point infinity. Distances outside the eye are not
   to scale.
   ================================================================= */
CR.sims.eyeParts = function (stage, opt = {}) {
  let u = opt.u ?? Infinity, light = opt.light || "bright";
  const show = { labels: opt.labels ?? true };
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.85, alt: "Parts of the human eye and accommodation" });
  const ctl = controls(stage);
  const SMAX = 3.2;
  const toS = d => (isFinite(d) ? clamp(Math.log10(d), 1, 3) : SMAX);
  const fromS = s => (s > 3.05 ? Infinity : Math.pow(10, s));
  const dTxt = d => (!isFinite(d) ? "Very far (at infinity)" : d >= 100 ? `${fmt(d / 100, 1)} m` : `${Math.round(d)} cm`);
  const sU = slider(ctl, { label: "Distance of the object from the eye", min: 1, max: SMAX, step: 0.005, value: toS(u), fmt: s => dTxt(fromS(s)) }, s => { u = fromS(s); draw(); });
  const lSeg = seg(ctl, { label: "Light", value: light, options: [["bright", "Bright"], ["dim", "Dim"]] }, v => { light = v; draw(); });
  const pre = chipRow(stage, "Object");
  [["At infinity", Infinity], ["2 m away", 200], ["50 cm", 50], ["25 cm: near point", 25], ["15 cm: too close", 15]].forEach(([t, d]) =>
    chip(pre, t, () => { u = d; sU.value = toS(d); draw(); }));
  const sh = chipRow(stage, "Show");
  const showT = toggles(sh, [["labels", "Names of parts"]], show, () => draw());
  const ro = readouts(stage);

  const DCM = 2.0, fFar = DCM, fNear = 1 / (1 / DCM + 1 / 25);
  function state() {
    const need = isFinite(u) ? 1 / (1 / DCM + 1 / u) : fFar;
    const f = Math.max(need, fNear);
    const v = isFinite(u) ? 1 / (1 / f - 1 / u) : f;
    const acc = clamp((1 / f - 1 / fFar) / (1 / fNear - 1 / fFar), 0, 1);
    return { f, v, acc, sharp: !isFinite(u) || u >= 25 - 1e-6 };
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    const st = state();
    const narrow = W < 600;
    const ay = H * 0.5;
    const R = Math.min(H * 0.36, W * (narrow ? 0.25 : 0.19));
    const cx = W - R - (narrow ? 40 : Math.min(150, W * 0.13));
    const xL = cx - 0.5 * R, Rr = R - 3;
    const cC = cx - 0.32 * R, cR = 0.76 * R, xCor = cC - cR;
    const pupil = (light === "bright" ? 0.08 : 0.19) * R;
    const lensA = 0.33 * R, lensT = lerp(0.055, 0.15, st.acc) * R;
    const xIris = xL - lensT - 0.05 * R;
    line(ctx, 0, ay, W, ay, p.soft, 1, [6, 5], 0.7);

    // eyeball, cornea, retina, optic nerve
    circle(ctx, cx, ay, R, p.dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)", p.soft, 2);
    ctx.save(); ctx.beginPath(); ctx.arc(cC, ay, cR, Math.PI - 0.8, Math.PI + 0.8);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.12)" : "rgba(70,150,215,0.10)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.strokeStyle = p.r1; ctx.globalAlpha = 0.75; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, ay, Rr, -1.0, 1.0); ctx.stroke(); ctx.restore();
    const nA = 0.2, nx = cx + R * Math.cos(nA), ny = ay + R * Math.sin(nA);
    ctx.save(); ctx.fillStyle = p.dark ? "#7d6f35" : "#ead27a"; ctx.strokeStyle = p.soft; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(nx - 3, ny - 0.07 * R); ctx.lineTo(nx + 0.4 * R, ny + 0.06 * R); ctx.lineTo(nx + 0.36 * R, ny + 0.2 * R); ctx.lineTo(nx - 3, ny + 0.08 * R);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    // ciliary muscles holding the eye lens
    const mY = lensA + 0.15 * R, mw = 0.07 * R, mh = lerp(0.07, 0.12, st.acc) * R;
    [-1, 1].forEach(s => {
      const my = ay + s * mY;
      line(ctx, xL, ay + s * lensA, xL, my - s * mh / 2, p.soft, 1.2);
      ctx.save(); ctx.fillStyle = `rgba(205,70,70,${(0.5 + 0.4 * st.acc).toFixed(2)})`;
      roundRect(ctx, xL - mw / 2, my - mh / 2, mw, mh, 3); ctx.fill(); ctx.restore();
    });
    // eye lens
    ctx.save(); ctx.beginPath(); ctx.ellipse(xL, ay, lensT, lensA, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.3)" : "rgba(70,150,215,0.25)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    // iris, with the pupil between its two halves
    const irisCol = p.dark ? "#a7743f" : "#6b4423";
    const wallY = Math.sqrt(Math.max(0, R * R - (xIris - cx) * (xIris - cx))) - 4;
    line(ctx, xIris, ay - wallY, xIris, ay - pupil, irisCol, 0.055 * R);
    line(ctx, xIris, ay + pupil, xIris, ay + wallY, irisCol, 0.055 * R);

    // rays (schematic thin-lens tracing at the eye lens)
    const T = isFinite(u) ? [lerp(xCor - 40, 26, clamp((Math.log10(u) - 1) / 2, 0, 1)), ay - 0.3 * R] : null;
    const tilt = 0.075;
    const chief = T ? norm([xL - T[0], ay - T[1]]) : [Math.cos(tilt), Math.sin(tilt)];
    const Pc = exitCircle(xL, ay, chief, cx, ay, Rr);
    const dist = Math.hypot(Pc[0] - xL, Pc[1] - ay);
    const beyond = 1 + 4 * (st.v / DCM - 1);          // how far behind the retina the rays would meet (drawn 4 times larger)
    const target = st.sharp ? Pc : [xL + chief[0] * dist * beyond, ay + chief[1] * dist * beyond];
    const hits = [];
    [-0.8, 0, 0.8].forEach(k => {
      const y = ay + k * pupil;
      const from = T || [0, y - xL * Math.tan(tilt)];
      drawRay(ctx, from[0], from[1], xL, y, p.beam, { width: 2, at: T ? 0.5 : 0.25 });
      const d = norm([target[0] - xL, target[1] - y]);
      const hit = exitCircle(xL, y, d, cx, ay, Rr);
      line(ctx, xL, y, hit[0], hit[1], p.beam, 2);
      hits.push(hit);
    });
    if (st.sharp) {
      vArrow(ctx, Pc[0], ay, Pc[1], p.img, { width: 3 });
      label(ctx, "Image", Pc[0] - 8, Pc[1] + 14, { color: p.img, size: 12, align: "right", bg: p.surface2 });
    } else {
      hits.sort((a, b) => a[1] - b[1]);
      ctx.save(); ctx.globalAlpha = 0.45; ctx.strokeStyle = p.img; ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(hits[0][0], hits[0][1]); ctx.lineTo(hits[2][0], hits[2][1]); ctx.stroke(); ctx.restore();
      line(ctx, hits[2][0], hits[2][1], target[0], target[1], p.beam, 1.2, [4, 4], 0.6);
      label(ctx, "Blurred", hits[2][0] - 10, hits[2][1] + 16, { color: p.warn, size: 12, align: "right", weight: 700, bg: p.surface2 });
    }
    if (T) {
      vArrow(ctx, T[0], ay, T[1], p.obj, { width: 3.5 });
      label(ctx, "Object", T[0], T[1] - 12, { color: p.obj, size: 13 });
      label(ctx, dTxt(u), T[0], ay + 16, { color: p.soft, size: 12 });
    } else {
      label(ctx, "Rays from the top of a very distant object", 10, 16, { color: p.soft, size: 12, align: "left" });
    }

    // names of parts
    if (show.labels) {
      const lc = p.accent;
      const ca = Math.PI + 0.5;
      callout(ctx, "Cornea", cC + cR * Math.cos(ca), ay + cR * Math.sin(ca), xCor - 0.22 * R, ay - 0.8 * R, lc, "right", W);
      callout(ctx, "Iris", xIris, ay - (pupil + wallY) / 2, xIris - 0.12 * R, ay - 1.0 * R, lc, "right", W);
      callout(ctx, "Pupil", xIris, ay + pupil * 0.4, xCor - 0.22 * R, ay + 0.8 * R, lc, "right", W);
      callout(ctx, "Ciliary muscles", xL, ay - mY - mh / 2, xL + 0.2 * R, ay - 1.07 * R, lc, "left", W);
      callout(ctx, "Eye lens", xL + lensT * 0.5, ay + lensA * 0.75, xL + 0.12 * R, ay + 1.07 * R, lc, "left", W);
      const ra = -0.72;
      callout(ctx, "Retina", cx + Rr * Math.cos(ra), ay + Rr * Math.sin(ra), cx + 0.95 * R, ay - 0.98 * R, lc, "left", W);
      callout(ctx, "Optic nerve", nx + 0.3 * R, ny + 0.13 * R, cx + 0.62 * R, ay + 1.0 * R, lc, "left", W);
    }
    label(ctx, "Schematic; distances outside the eye not to scale", 10, H - 12, { color: p.soft, size: 11, align: "left" });

    const what = !isFinite(u)
      ? "Light enters through the cornea and the pupil. The ciliary muscles are relaxed, so the eye lens is thin and the rays from a distant object meet on the retina. The light-sensitive cells of the retina send electrical signals to the brain through the optic nerve."
      : u >= 25.5
        ? "As the object comes closer, the ciliary muscles contract, the eye lens becomes thicker and its focal length decreases, so the image still forms on the retina. This ability of the eye lens to adjust its focal length is accommodation."
        : st.sharp
          ? "At about 25 cm the eye lens is as thick as it can become. This is the near point, or the least distance of distinct vision."
          : "Closer than 25 cm the focal length of the eye lens cannot decrease any further, so the rays would meet behind the retina. The image is blurred and the eye feels strain.";
    ro([
      { k: "Object", v: isFinite(u) ? `${dTxt(u)} from the eye` : "Very far away (at infinity)" },
      { k: "Ciliary muscles", v: st.acc < 0.02 ? "Relaxed" : st.acc > 0.999 ? "Fully contracted" : "Contracted" },
      { k: "Eye lens", v: st.acc < 0.02 ? "Thin: longest focal length" : st.acc > 0.999 ? "Thickest it can be: shortest focal length" : "Thicker: shorter focal length" },
      { k: "Focal length of the eye lens (simple model)", v: `${fmt(st.f, 2)} cm` },
      { k: "Image on the retina", v: st.sharp ? "Real, inverted and sharp" : "Blurred", tone: st.sharp ? "good" : "bad" },
      { k: "Pupil", v: light === "bright" ? "Small: the iris lets in less light" : "Wide: the iris lets in more light" },
      { k: "What happens", v: what, wide: true },
      { k: "Model used", v: "The eye lens and the retina are taken 2.0 cm apart. The image distance does not change; the eye changes the focal length of its lens instead. A normal eye sees clearly from about 25 cm (near point) to infinity (far point).", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.u !== undefined) { u = o.u === null ? Infinity : o.u; sU.value = toS(u); }
      if (o.light) { light = o.light; lSeg.set(light); }
      if (o.labels != null) { show.labels = !!o.labels; showT.sync(); }
      draw();
    }
  };
};

/* =================================================================
   10.2 Defects of vision and their correction
   Schematic eye: near and far points are given in units of the eye
   lens-retina distance D (not to scale). Paraxial thin-lens tracing.
   ================================================================= */
CR.sims.eye = function (stage, opt = {}) {
  let cond = opt.cond || "myopia", obj = opt.obj || "far", fix = opt.fix || "off";
  let farPt = opt.far ?? 80, nearPt = opt.near ?? 100;
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.7, alt: "Defects of vision and their correction" });
  const ctl = controls(stage);
  const cSeg = seg(ctl, { label: "Eye", value: cond, options: [["normal", "Normal"], ["myopia", "Myopia"], ["hyper", "Hypermetropia"], ["presby", "Presbyopia"], ["bifocal", "Myopia + presbyopia"]] }, v => { cond = v; draw(); });
  const oSeg = seg(ctl, { label: "Looking at", value: obj, options: [["far", "Distant object"], ["near", "Book at 25 cm"]] }, v => { obj = v; draw(); });
  const fSeg = seg(ctl, { label: "Spectacles", value: fix, options: [["off", "Off"], ["on", "On"]] }, v => { fix = v; draw(); });
  const ro = readouts(stage);
  const calc = h("div", { class: "calc" });
  stage.append(calc);
  calc.append(h("h3", {}, "Power of the lens needed (as in Exercises 6 and 7)"));
  const crow = h("div", { class: "controls" });
  calc.append(crow);
  const nF = numInput(crow, { label: "Myopia: far point of the eye", value: farPt, min: 10, max: 2000, step: 1, unit: "cm" }, v => { farPt = v; upd(); });
  const nN = numInput(crow, { label: "Hypermetropia: near point of the eye", value: nearPt, min: 26, max: 2000, step: 1, unit: "cm" }, v => { nearPt = v; upd(); });
  const outM = h("p", { class: "calc-out" }), outH = h("p", { class: "calc-out" });
  calc.append(outM, outH);
  function upd() {
    outM.textContent = `Myopia: a concave lens that makes a distant object (u = −∞) appear at the far point (v = −${fmt(farPt, 0)} cm). ` +
      `1/f = 1/v − 1/u = −1/${fmt(farPt, 0)}, so f = −${fmt(farPt, 0)} cm = ${fmt(-farPt / 100, 2)} m and P = 1/f = ${sgnf(-100 / farPt, 2)} D.`;
    const fH = 25 * nearPt / (nearPt - 25);
    outH.textContent = `Hypermetropia: a convex lens that makes a book at 25 cm (u = −25 cm) appear at the near point (v = −${fmt(nearPt, 0)} cm). ` +
      `1/f = 1/v − 1/u = −1/${fmt(nearPt, 0)} + 1/25, so f = +${fmt(fH, 1)} cm = +${fmt(fH / 100, 3)} m and P = 1/f = ${sgnf(100 / fH, 2)} D.`;
  }
  upd();

  // near point (NP) and far point (FP) of each eye, in units of D in front of the eye lens
  const EYES = {
    normal: { NP: 1.37, FP: Infinity }, myopia: { NP: 1.1, FP: 2.125 }, hyper: { NP: 2.0, FP: Infinity },
    presby: { NP: 2.0, FP: Infinity }, bifocal: { NP: 1.75, FP: 2.125 }
  };
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    fSeg.el.classList.toggle("disabled", cond === "normal");
    const ay = H * 0.5;
    const r = Math.min(w * (w < 640 ? 0.22 : 0.17), H * 0.36);
    const cx = w * 0.74;
    const xE = cx - 0.6 * r, xR = cx + r, D = xR - xE;
    const xC = cx - r - Math.max(24, w * 0.05);
    const xNear = xE - 1.37 * D;                       // the book, 25 cm away
    const E = EYES[cond];
    const xNP = xE - E.NP * D, xFP = isFinite(E.FP) ? xE - E.FP * D : -Infinity;
    const Pmax = 1 / D + 1 / (E.NP * D);
    // the weakest the eye lens can be. (A hypermetropic eye may relax as far as needed: the spectacle lens is drawn
    // farther from the eye than in real life, which exaggerates its effect on distant light.)
    const Pmin = isFinite(E.FP) ? 1 / D + 1 / (E.FP * D) : cond === "hyper" ? 0 : 1 / (1.04 * D);
    // which spectacle lens: concave for distant vision, convex for near vision
    let part = null;
    if (cond === "myopia") part = "concave";
    else if (cond === "hyper" || cond === "presby") part = "convex";
    else if (cond === "bifocal") part = obj === "far" ? "concave" : "convex";
    let fC = null;
    if (part === "concave") fC = xFP - xC;
    if (part === "convex") { const uc = xNear - xC, vc = xNP - xC; fC = 1 / (1 / vc - 1 / uc); }
    const useLens = fix === "on" && fC !== null;

    let xInt;
    if (obj === "far") xInt = useLens ? xC + fC : -Infinity;
    else xInt = useLens ? xC + 1 / (1 / fC + 1 / (xNear - xC)) : xNear;
    const fReq = xInt === -Infinity ? D : 1 / (1 / D - 1 / (xInt - xE));
    const fEye = clamp(fReq, 1 / Pmax, Pmin > 0 ? 1 / Pmin : 1e9);
    const xImg = xInt === -Infinity ? xE + fEye : xE + 1 / (1 / fEye + 1 / (xInt - xE));

    // the eye
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
    const rx = clamp(r * (0.06 + 0.13 * (D / fEye - 1)), 0.05 * r, 0.3 * r);
    ctx.save(); ctx.beginPath(); ctx.ellipse(xE, ay, rx, a * 1.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.25)" : "rgba(70,150,215,0.22)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, "Eye lens", xE, ay - 0.62 * r - 12, { color: p.soft, size: 12 });

    // spectacle lens (a bifocal lens has a concave upper part and a convex lower part)
    const hl = a * 1.7, t = 9;
    const lensShape = (kind, y0, y1, fill) => {
      const ym = (y0 + y1) / 2;
      ctx.save(); ctx.beginPath();
      if (kind === "convex") { ctx.moveTo(xC, y0); ctx.quadraticCurveTo(xC + t * 2, ym, xC, y1); ctx.quadraticCurveTo(xC - t * 2, ym, xC, y0); }
      else { ctx.moveTo(xC - t, y0); ctx.lineTo(xC + t, y0); ctx.quadraticCurveTo(xC - t * 0.4, ym, xC + t, y1); ctx.lineTo(xC - t, y1); ctx.quadraticCurveTo(xC + t * 0.4, ym, xC - t, y0); }
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    };
    const glass = p.dark ? "rgba(110,180,240,0.25)" : "rgba(70,150,215,0.22)", faint = p.dark ? "rgba(110,180,240,0.06)" : "rgba(70,150,215,0.05)";
    if (fix === "on" && cond === "bifocal") {
      lensShape("concave", ay - hl, ay, part === "concave" ? glass : faint);
      lensShape("convex", ay, ay + hl, part === "convex" ? glass : faint);
      label(ctx, "Bifocal lens", xC + 12, ay - hl - 28, { color: p.glassEdge, size: 12, weight: 700, align: "right" });
      label(ctx, part === "concave" ? "Using the upper, concave part" : "Using the lower, convex part", xC + 12, ay - hl - 12, { color: p.soft, size: 11, align: "right" });
    } else if (useLens) {
      lensShape(part, ay - hl, ay + hl, glass);
      label(ctx, part === "convex" ? "Convex lens (+)" : "Concave lens (−)", xC, ay - hl - 12, { color: p.glassEdge, size: 12, weight: 700 });
    }

    // rays (heights measured upwards from the axis)
    const lenses = [];
    if (useLens) lenses.push({ x: xC, f: fC });
    lenses.push({ x: xE, f: fEye });
    const ends = [], afterSpec = [];
    for (let k = 0; k < 5; k++) {
      const tt = k / 4 * 2 - 1;
      let x, y, sl;
      if (obj === "far") { x = 0; y = tt * a * 0.85; sl = 0; }
      else { x = xNear; y = 0; sl = (tt * a * 0.85) / (lenses[0].x - xNear); }
      const pts = [[x, y]];
      lenses.forEach((Ln, j) => {
        y += sl * (Ln.x - x); x = Ln.x; pts.push([x, y]); sl -= y / Ln.f;
        if (useLens && j === 0) afterSpec.push({ x, y, sl });
      });
      const end = exitCircle(x, -y, norm([1, -sl]), cx, 0, r);
      end[1] = -end[1];
      pts.push(end);
      ends.push(end);
      ctx.save(); ctx.strokeStyle = p.beam; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, ay - py) : ctx.moveTo(px, ay - py))); ctx.stroke(); ctx.restore();
      const [ax0, ay0] = pts[0], [ax1, ay1] = pts[1];
      const fa = obj === "far" ? Math.min(0.5, (ax1 - 40) / Math.max(1, ax1 - ax0)) : 0.55;
      head(ctx, lerp(ax0, ax1, fa), ay - lerp(ay0, ay1, fa), Math.atan2(-(ay1 - ay0), ax1 - ax0), 9, p.beam);
    }
    const virtualSrc = useLens && part === "concave" && obj === "far" ? xFP : useLens && part === "convex" && obj === "near" ? xNP : null;
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
      label(ctx, "Sharp image on the retina ✓", xR - 4, msgY, { color: p.ok, size: 13, weight: 700, align: "right", bg: p.surface });
    } else if (xImg > xR) {
      ends.forEach(([ex, ey]) => line(ctx, ex, ay - ey, xImg, ay, p.beam, 1.5, [4, 4], 0.75));
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Would focus behind the retina ✗", xR - 6, msgY, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    } else {
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Focus in front of the retina ✗", xR - 6, msgY, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    }
    if (obj === "far") label(ctx, "Parallel rays from a distant object", 10, 16, { color: p.soft, size: 13, align: "left" });
    else {
      ctx.save(); ctx.fillStyle = p.obj; roundRect(ctx, xNear - 4, ay - 14, 8, 28, 2); ctx.fill(); ctx.restore();
      label(ctx, "Book (25 cm)", xNear, ay - 26, { color: p.obj, size: 13 });
    }
    const showFP = isFinite(xFP) && (cond === "myopia" || obj === "far") && xFP > 8;
    const showNP = (cond === "hyper" || cond === "presby" || cond === "bifocal") && obj === "near" && xNP > 8;
    if (showFP) { line(ctx, xFP, ay - 7, xFP, ay + 7, p.r3, 2); label(ctx, "Far point", xFP, ay + 20, { color: p.r3, size: 12 }); }
    if (showNP) { line(ctx, xNP, ay - 7, xNP, ay + 7, p.r3, 2); label(ctx, "Near point", xNP, ay + 20, { color: p.r3, size: 12 }); }
    label(ctx, "Schematic eye, not to scale", 10, H - 12, { color: p.soft, size: 11, align: "left" });

    const M = {
      "normal-far": "Normal eye, relaxed: the eye lens is thin and parallel rays from a distant object meet on the retina.",
      "normal-near": "Accommodation: the ciliary muscles make the eye lens thicker (shorter focal length), so a book at 25 cm is also focused on the retina.",
      "myopia-far-off": "Myopia (near-sightedness): the image of a distant object forms in front of the retina, so it looks blurred. Causes: excessive curvature of the eye lens, or elongation of the eyeball.",
      "myopia-far-on": "A concave (diverging) lens of suitable power makes the rays seem to come from the far point of the eye. The image forms on the retina.",
      "myopia-near": "A myopic eye sees nearby objects clearly. Its far point is nearer than infinity.",
      "hyper-near-off": "Hypermetropia (far-sightedness): the near point is farther than 25 cm. Rays from the book would meet behind the retina, so it looks blurred. Causes: the focal length of the eye lens is too long, or the eyeball has become too small.",
      "hyper-near-on": "A convex (converging) lens of suitable power makes the rays seem to come from the near point of the eye. The image forms on the retina.",
      "hyper-far": "A hypermetropic eye sees distant objects clearly.",
      "presby-near-off": "Presbyopia: with age the ciliary muscles weaken and the eye lens becomes less flexible, so the near point gradually recedes. The book looks blurred.",
      "presby-near-on": "A convex lens makes the book seem to be at the near point of the eye, so it is read clearly.",
      "presby-far-off": "Distant objects are still seen clearly.",
      "presby-far-on": "Through reading glasses (convex) distant objects look blurred. People often need bifocal lenses.",
      "bifocal-off": "Both defects: distant objects are blurred (the far point is near) and so is the book (the near point has receded).",
      "bifocal-far-on": "Bifocal lens: the upper part is a concave lens. Looking through it, the person sees distant objects clearly.",
      "bifocal-near-on": "Bifocal lens: the lower part is a convex lens. Looking through it, the person reads clearly."
    };
    let key;
    if (cond === "normal") key = `normal-${obj}`;
    else if (cond === "myopia") key = obj === "far" ? `myopia-far-${fix}` : "myopia-near";
    else if (cond === "hyper") key = obj === "near" ? `hyper-near-${fix}` : "hyper-far";
    else if (cond === "presby") key = `presby-${obj}-${fix}`;
    else key = fix === "off" ? "bifocal-off" : `bifocal-${obj}-on`;
    const lensTxt = { normal: "Not needed", myopia: "Concave lens: negative power", hyper: "Convex lens: positive power", presby: "Convex lens for reading", bifocal: "Bifocal: concave above, convex below" }[cond];
    ro([
      { k: "What happens", v: M[key], wide: true },
      { k: "Image", v: sharp ? "Sharp ✓" : "Blurred ✗", tone: sharp ? "good" : "bad" },
      { k: "Correcting lens", v: lensTxt }
    ]);
  }
  return {
    set(o) {
      if (o.cond) { cond = o.cond; cSeg.set(cond); }
      if (o.obj) { obj = o.obj; oSeg.set(obj); }
      if (o.fix) { fix = o.fix; fSeg.set(fix); }
      if (o.far != null) { farPt = o.far; nF.set(farPt); }
      if (o.near != null) { nearPt = o.near; nN.set(nearPt); }
      upd(); draw();
    }
  };
};

/* =================================================================
   10.3–10.4 Prism: refraction (Activity 10.1), dispersion
   (Activity 10.2), Newton's two prisms, and a raindrop (rainbow).
   Vector Snell's law. For the colours the refractive indices are
   spread more than in real glass or water, so the colours separate
   clearly.
   ================================================================= */
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
function refractV(d, nrm, eta) {           // nrm points against d
  const cosi = -(nrm[0] * d[0] + nrm[1] * d[1]);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  const c = eta * cosi - Math.sqrt(k);
  return [eta * d[0] + c * nrm[0], eta * d[1] + c * nrm[1]];
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
    const pnt = [o[0] + d[0] * best.t, o[1] + d[1] * best.t];
    pts.push(pnt);
    let nx = -(best.b[1] - best.a[1]), ny = best.b[0] - best.a[0];
    const L = Math.hypot(nx, ny); nx /= L; ny /= L;
    if (nx * d[0] + ny * d[1] > 0) { nx = -nx; ny = -ny; }
    const entering = inside !== best.pi;
    const n2 = entering ? polys[best.pi].n : 1;
    const nd = refractV(d, [nx, ny], n1 / n2);
    if (!nd) { const dn = d[0] * nx + d[1] * ny; d = [d[0] - 2 * dn * nx, d[1] - 2 * dn * ny]; }
    else { d = nd; inside = entering ? best.pi : -1; n1 = n2; }
    o = [pnt[0] + d[0] * 1e-3, pnt[1] + d[1] * 1e-3];
  }
  return { pts, dir: d };
}
const SPEC = [["Red", "#e53935"], ["Orange", "#fb8c00"], ["Yellow", "#f2c200"], ["Green", "#43a047"], ["Blue", "#1e88e5"], ["Indigo", "#4b3fb5"], ["Violet", "#9c27b0"]];

CR.sims.prism = function (stage, opt = {}) {
  let mode = opt.mode || "act", iDeg = opt.i ?? 48;
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.85, alt: "Refraction and dispersion of light by a glass prism" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["act", "Activity 10.1: one ray"], ["disp", "Activity 10.2: dispersion"], ["newton", "Newton's two prisms"], ["rain", "Rainbow: a raindrop"]] }, v => { mode = v; sync(); draw(); });
  const sI = slider(ctl, { label: "Angle of incidence ∠i", min: 35, max: 75, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
  const ro = readouts(stage);
  function sync() { sI.el.style.display = mode === "rain" ? "none" : ""; }
  sync();

  function prismGeom(w, H, shift) {
    const L = Math.min(w * 0.3, H * 0.62), hh = L * Math.sqrt(3) / 2;
    const cx = w * shift, cy = H * 0.56;
    return { L, hh, cx, cy, A: [cx, cy - 2 * hh / 3], B: [cx - L / 2, cy + hh / 3], C: [cx + L / 2, cy + hh / 3] };
  }
  function fillGlass(ctx, p, pts) {
    ctx.save(); ctx.beginPath(); pts.forEach((q, j) => (j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.16)" : "rgba(70,150,215,0.14)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  // incident ray on face AB at its middle, making angle i with the normal
  function incident(g, w, H) {
    const { A, B, cx, cy } = g;
    const P0 = [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5)];
    let nIx = B[1] - A[1], nIy = -(B[0] - A[0]);
    const nl = Math.hypot(nIx, nIy); nIx /= nl; nIy /= nl;
    if ((cx - P0[0]) * nIx + (cy - P0[1]) * nIy < 0) { nIx = -nIx; nIy = -nIy; }
    const th = Math.atan2(nIy, nIx) - iDeg * DEG;
    const d = [Math.cos(th), Math.sin(th)];
    return { P0, nIn: [nIx, nIy], d, start: toEdge(P0[0], P0[1], -d[0], -d[1], w, H) };
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "rain") return drawRain(ctx, w, H, p);
    if (mode === "act") return drawAct(ctx, w, H, p);
    const g = prismGeom(w, H, mode === "newton" ? 0.34 : 0.42);
    const { A, B, C, cx, cy } = g;
    const polys = [{ pts: [A, B, C] }];
    let second = null;
    if (mode === "newton") {
      const ex = C[0] - A[0], ey = C[1] - A[1], el = Math.hypot(ex, ey);
      let nx = ey / el, ny = -ex / el;
      const mx = (A[0] + C[0]) / 2, my = (A[1] + C[1]) / 2;
      if ((mx + nx - cx) * nx + (my + ny - cy) * ny < 0) { nx = -nx; ny = -ny; }
      const M = [mx + nx * 5, my + ny * 5];
      second = [A, B, C].map(P => [2 * M[0] - P[0], 2 * M[1] - P[1]]);
      polys.push({ pts: second });
    }
    fillGlass(ctx, p, [A, B, C]);
    if (second) fillGlass(ctx, p, second);
    const inc = incident(g, w, H);
    const screenX = w - 22;
    line(ctx, screenX, H * 0.06, screenX, H * 0.94, p.soft, 5);
    label(ctx, "Screen", screenX - 6, H * 0.06 - 2, { color: p.soft, size: 12, align: "right", base: "top" });
    // slit in a cardboard sheet
    const sx = lerp(inc.start[0], inc.P0[0], 0.45), sy = lerp(inc.start[1], inc.P0[1], 0.45);
    line(ctx, sx, sy - 70, sx, sy - 8, p.text, 5); line(ctx, sx, sy + 8, sx, sy + 70, p.text, 5);
    label(ctx, "Slit in cardboard", sx, sy - 82, { color: p.soft, size: 12 });
    line(ctx, inc.P0[0] - inc.nIn[0] * 50, inc.P0[1] - inc.nIn[1] * 50, inc.P0[0] + inc.nIn[0] * 30, inc.P0[1] + inc.nIn[1] * 30, p.soft, 1.3, [4, 4]);
    const results = [];
    SPEC.forEach(([name, col], k) => {
      polys.forEach(pp => (pp.n = 1.5 + 0.01 * k));
      const res = traceRay(inc.start, inc.d, polys, screenX, H);
      results.push({ name, col, res });
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.95; ctx.lineJoin = "round";
      ctx.beginPath(); res.pts.slice(1).forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
      const end = res.pts[res.pts.length - 1];
      circle(ctx, end[0], end[1], 4, col);
    });
    drawRay(ctx, inc.start[0], inc.start[1], inc.P0[0], inc.P0[1], p.text, { width: 4.5 });
    label(ctx, "White light", inc.start[0] + 8, inc.start[1] + 18, { color: p.text, size: 13, align: "left" });
    label(ctx, "A", A[0], A[1] - 12, { color: p.soft, size: 12 });
    const dirIn = inc.d;
    const dev = r => {
      let an = Math.atan2(r.res.dir[1], r.res.dir[0]) - Math.atan2(dirIn[1], dirIn[0]);
      while (an > Math.PI) an -= 2 * Math.PI;
      while (an < -Math.PI) an += 2 * Math.PI;
      return Math.abs(an) / DEG;
    };
    const red = results[0], vio = results[results.length - 1];
    if (mode === "disp") {
      const rEnd = red.res.pts[red.res.pts.length - 1], vEnd = vio.res.pts[vio.res.pts.length - 1];
      if (Math.abs(rEnd[0] - screenX) < 1) label(ctx, "Red", screenX - 10, rEnd[1] - 8, { color: red.col, size: 12, align: "right", weight: 700 });
      if (Math.abs(vEnd[0] - screenX) < 1) label(ctx, "Violet", screenX - 10, vEnd[1] + 10, { color: vio.col, size: 12, align: "right", weight: 700 });
      label(ctx, "Spectrum", screenX - 10, (rEnd[1] + vEnd[1]) / 2, { color: p.text, size: 12, align: "right", weight: 700, bg: p.surface2 });
    } else {
      label(ctx, "The colours recombine: white light", screenX - 10, H * 0.94 - 8, { color: p.text, size: 12, align: "right" });
    }
    label(ctx, "Spread of colours exaggerated so it is easy to see", 10, H - 12, { color: p.soft, size: 11, align: "left" });
    const dr = dev(red), dv = dev(vio);
    ro(mode === "disp" ? [
      { k: "Angle of the prism ∠A", v: "60°" },
      { k: "Angle of incidence ∠i", v: `${iDeg}°` },
      { k: "Deviation of red", v: `${fmt(dr, 1)}°` },
      { k: "Deviation of violet", v: `${fmt(dv, 1)}°` },
      { k: "On the screen, top to bottom", v: "Red, orange, yellow, green, blue, indigo, violet" },
      { k: "Why", v: "Different colours of light bend through different angles with respect to the incident ray as they pass through the prism. Red bends the least and violet the most, so each colour comes out along a different path. The band of colours is the spectrum; the splitting of light into its colours is dispersion (VIBGYOR).", wide: true }
    ] : [
      { k: "Net deviation of red", v: `${fmt(dr, 1)}°` },
      { k: "Net deviation of violet", v: `${fmt(dv, 1)}°` },
      { k: "Newton's conclusion", v: "The second, identical prism placed upside down lets all the colours through and recombines them: white light comes out. So sunlight is made up of seven colours.", wide: true }
    ]);
  }

  // Activity 10.1: a single ray, glass n = 1.50
  function drawAct(ctx, w, H, p) {
    const g = prismGeom(w, H, 0.45);
    const { A, B, C } = g;
    fillGlass(ctx, p, [A, B, C]);
    const inc = incident(g, w, H);
    const res = traceRay(inc.start, inc.d, [{ pts: [A, B, C], n: 1.5 }], w, H);
    const [S0, Ep, Fp, Sn] = res.pts;
    const d1 = norm([Ep[0] - S0[0], Ep[1] - S0[1]]), d2 = norm([Fp[0] - Ep[0], Fp[1] - Ep[1]]), d3 = norm([Sn[0] - Fp[0], Sn[1] - Fp[1]]);
    // normals
    const nE = inc.nIn;
    let nF = [C[1] - A[1], -(C[0] - A[0])];
    nF = norm(nF);
    if ((g.cx - Fp[0]) * nF[0] + (g.cy - Fp[1]) * nF[1] < 0) nF = [-nF[0], -nF[1]];   // nF points into the prism
    line(ctx, Ep[0] - nE[0] * 60, Ep[1] - nE[1] * 60, Ep[0] + nE[0] * 45, Ep[1] + nE[1] * 45, p.soft, 1.3, [5, 4]);
    line(ctx, Fp[0] - nF[0] * 60, Fp[1] - nF[1] * 60, Fp[0] + nF[0] * 45, Fp[1] + nF[1] * 45, p.soft, 1.3, [5, 4]);
    // deviation: the incident ray produced forward meets the emergent ray produced backward
    const den = d1[0] * d3[1] - d1[1] * d3[0];
    let X = null;
    if (Math.abs(den) > 1e-6) {
      const t = ((Fp[0] - Ep[0]) * d3[1] - (Fp[1] - Ep[1]) * d3[0]) / den;
      X = [Ep[0] + d1[0] * t, Ep[1] + d1[1] * t];
      line(ctx, Ep[0], Ep[1], X[0] + d1[0] * 40, X[1] + d1[1] * 40, p.soft, 1.4, [6, 4]);
      line(ctx, Fp[0], Fp[1], X[0], X[1], p.soft, 1.4, [6, 4]);
    }
    drawRay(ctx, S0[0], S0[1], Ep[0], Ep[1], p.r1, { width: 3 });
    drawRay(ctx, Ep[0], Ep[1], Fp[0], Fp[1], p.r1, { width: 3 });
    drawRay(ctx, Fp[0], Fp[1], Sn[0], Sn[1], p.r1, { width: 3 });
    // pins
    const pin = (pt, name, dx, dy) => { circle(ctx, pt[0], pt[1], 5, p.surface, p.text, 2); label(ctx, name, pt[0] + dx, pt[1] + dy, { color: p.text, size: 13, weight: 700 }); };
    const lenIn = Math.hypot(Ep[0] - S0[0], Ep[1] - S0[1]), lenOut = Math.hypot(Sn[0] - Fp[0], Sn[1] - Fp[1]);
    pin([Ep[0] - d1[0] * lenIn * 0.72, Ep[1] - d1[1] * lenIn * 0.72], "P", -4, 16);
    pin([Ep[0] - d1[0] * lenIn * 0.4, Ep[1] - d1[1] * lenIn * 0.4], "Q", -4, 16);
    pin([Fp[0] + d3[0] * Math.min(lenOut * 0.35, 90), Fp[1] + d3[1] * Math.min(lenOut * 0.35, 90)], "R", 4, -16);
    pin([Fp[0] + d3[0] * Math.min(lenOut * 0.7, 180), Fp[1] + d3[1] * Math.min(lenOut * 0.7, 180)], "S", 4, -16);
    label(ctx, "E", Ep[0] - 10, Ep[1] - 16, { color: p.text, size: 13, weight: 700 });
    label(ctx, "F", Fp[0] + 14, Fp[1] - 8, { color: p.text, size: 13, weight: 700 });
    label(ctx, "A", A[0], A[1] - 13, { color: p.text, size: 13, weight: 700 });
    label(ctx, "B", B[0] - 12, B[1] + 6, { color: p.text, size: 13, weight: 700 });
    label(ctx, "C", C[0] + 12, C[1] + 6, { color: p.text, size: 13, weight: 700 });
    // angles
    const back = [-d1[0], -d1[1]];
    arcBetween(ctx, Ep[0], Ep[1], 30, back, [-nE[0], -nE[1]], p.r3, "i");
    arcBetween(ctx, Ep[0], Ep[1], 30, d2, nE, p.r2, "r");
    arcBetween(ctx, Fp[0], Fp[1], 30, d3, [-nF[0], -nF[1]], p.r3, "e");
    arcBetween(ctx, A[0], A[1], 26, [B[0] - A[0], B[1] - A[1]], [C[0] - A[0], C[1] - A[1]], p.accent, "A", { off: 10 });
    if (X) arcBetween(ctx, X[0], X[1], 34, d1, d3, p.accent, "D", { off: 12, bg: p.surface2 });
    label(ctx, "Incident ray PE", lerp(S0[0], Ep[0], 0.2), lerp(S0[1], Ep[1], 0.2) + 18, { color: p.r1, size: 12, align: "left" });
    const eLab = "Emergent ray FS", eW = textWidth(ctx, eLab, 12), mo = Math.min(lenOut * 0.5, 135);
    const ex0 = Fp[0] + d3[0] * mo - d3[1] * 22, ey0 = Fp[1] + d3[1] * mo + d3[0] * 22;
    label(ctx, eLab, clamp(ex0, eW / 2 + 6, w - eW / 2 - 6), Math.min(ey0, H - 14), { color: p.r1, size: 12 });

    const n = 1.5, i = iDeg * DEG, r1 = Math.asin(Math.sin(i) / n), r2 = 60 * DEG - r1, e = Math.asin(n * Math.sin(r2));
    const Ddeg = iDeg + e / DEG - 60;
    ro([
      { k: "Angle of incidence ∠i", v: `${iDeg}°` },
      { k: "Angle of refraction ∠r (at AB)", v: `${fmt(r1 / DEG, 1)}°` },
      { k: "Angle of emergence ∠e (at AC)", v: `${fmt(e / DEG, 1)}°` },
      { k: "Angle of the prism ∠A", v: "60°" },
      { k: "Angle of deviation ∠D", v: `${fmt(Ddeg, 1)}°` },
      { k: "Glass", v: "Refractive index 1.50 (one colour of light)" },
      { k: "What to notice", v: "At AB the ray goes from air into glass and bends towards the normal. At AC it goes from glass into air and bends away from the normal. The two faces are not parallel, so, unlike in a glass slab, the emergent ray FS is bent at an angle to the incident ray: this is the angle of deviation ∠D.", wide: true },
      { k: "NCERT names", v: "PE incident ray, EF refracted ray, FS emergent ray, ∠A angle of the prism, ∠i angle of incidence, ∠r angle of refraction, ∠e angle of emergence, ∠D angle of deviation.", wide: true }
    ]);
  }

  // a raindrop: refraction and dispersion, internal reflection, refraction
  function drawRain(ctx, w, H, p) {
    const R = Math.min(H * 0.26, w * 0.18), cx = w * 0.66, cy = H * 0.31;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.14)" : "rgba(70,150,215,0.12)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, "Raindrop", cx + R * 0.8, cy + R * 0.95, { color: p.soft, size: 12, align: "left" });
    const b = 0.86 * R, y0 = cy - b, x0 = 0;
    const xIn = cx - Math.sqrt(R * R - b * b);
    drawRay(ctx, x0, y0, xIn, y0, p.text, { width: 4.5, at: 0.4 });
    label(ctx, "Sunlight (white)", 12, y0 - 14, { color: p.text, size: 13, align: "left" });
    const circT = (o, d) => { const ox = o[0] - cx, oy = o[1] - cy, bb = ox * d[0] + oy * d[1], c = ox * ox + oy * oy - R * R; return -bb + Math.sqrt(Math.max(0, bb * bb - c)); };
    const ends = [];
    SPEC.forEach(([name, col], k) => {
      const n = 1.33 + 0.011 * k;
      const P1 = [xIn, y0];
      const n1 = norm([P1[0] - cx, P1[1] - cy]);
      const d2 = refractV([1, 0], n1, 1 / n);
      const t2 = circT([P1[0] + d2[0] * 1e-6, P1[1] + d2[1] * 1e-6], d2);
      const P2 = [P1[0] + d2[0] * t2, P1[1] + d2[1] * t2];
      const n2 = norm([P2[0] - cx, P2[1] - cy]);
      const dn = d2[0] * n2[0] + d2[1] * n2[1];
      const d3 = [d2[0] - 2 * dn * n2[0], d2[1] - 2 * dn * n2[1]];
      const t3 = circT([P2[0] + d3[0] * 1e-6, P2[1] + d3[1] * 1e-6], d3);
      const P3 = [P2[0] + d3[0] * t3, P2[1] + d3[1] * t3];
      const n3 = norm([P3[0] - cx, P3[1] - cy]);
      const d4 = refractV(d3, [-n3[0], -n3[1]], n) || d3;
      const P4 = toEdge(P3[0], P3[1], d4[0], d4[1], w, H);
      const L4 = Math.min(Math.hypot(P4[0] - P3[0], P4[1] - P3[1]) - 26, Math.max(w, H) * 0.5);
      const P5 = [P3[0] + d4[0] * L4, P3[1] + d4[1] * L4];
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineJoin = "round"; ctx.globalAlpha = 0.95;
      ctx.beginPath(); ctx.moveTo(P1[0], P1[1]); ctx.lineTo(P2[0], P2[1]); ctx.lineTo(P3[0], P3[1]); ctx.lineTo(P5[0], P5[1]); ctx.stroke(); ctx.restore();
      head(ctx, P5[0], P5[1], Math.atan2(d4[1], d4[0]), 9, col);
      ends.push({ name, col, P2, P3, P5 });
    });
    const red = ends[0], vio = ends[ends.length - 1];
    const at = (e, f) => [lerp(e.P3[0], e.P5[0], f), lerp(e.P3[1], e.P5[1], f)];
    const rA = at(red, 0.8), vA = at(vio, 0.8), dd = norm([red.P5[0] - red.P3[0], red.P5[1] - red.P3[1]]), perp = [-dd[1], dd[0]];
    const sgn = Math.sign((rA[0] - vA[0]) * perp[0] + (rA[1] - vA[1]) * perp[1]) || 1;
    label(ctx, "Red", rA[0] + perp[0] * sgn * 22, rA[1] + perp[1] * sgn * 22, { color: red.col, size: 12, weight: 700, bg: p.surface2 });
    label(ctx, "Violet", vA[0] - perp[0] * sgn * 26, vA[1] - perp[1] * sgn * 26, { color: vio.col, size: 12, weight: 700, bg: p.surface2 });
    label(ctx, "1. Refraction and dispersion", xIn - 6, y0 - 16, { color: p.accent, size: 12, align: "left", weight: 700, bg: p.surface2 });
    label(ctx, "2. Internal reflection", red.P2[0] + 10, red.P2[1], { color: p.accent, size: 12, align: "left", weight: 700, bg: p.surface2 });
    label(ctx, "3. Refraction", red.P3[0] - 10, red.P3[1] + 18, { color: p.accent, size: 12, align: "right", weight: 700, bg: p.surface2 });
    label(ctx, "To an observer with the Sun behind", 10, H - 30, { color: p.soft, size: 12, align: "left" });
    label(ctx, "Spread of colours exaggerated so it is easy to see", 10, H - 12, { color: p.soft, size: 11, align: "left" });
    ro([
      { k: "A rainbow", v: "A natural spectrum appearing in the sky after a rain shower, caused by dispersion of sunlight by tiny water droplets in the atmosphere.", wide: true },
      { k: "Inside each drop", v: "The drop acts like a small prism: it refracts and disperses the sunlight, reflects it internally, and refracts it again as it comes out. Different colours reach the observer's eye.", wide: true },
      { k: "Where to look", v: "A rainbow always forms in the direction opposite to the Sun: the Sun must be behind you. You can also see one through a waterfall or a fountain on a sunny day.", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.i != null) { iDeg = o.i; sI.value = iDeg; }
      draw();
    }
  };
};

/* =================================================================
   10.5 Atmospheric refraction: twinkling stars, advance sunrise and
   delayed sunset, objects seen through hot air. The bending is
   exaggerated so that it can be seen.
   ================================================================= */
CR.sims.atmos = function (stage, opt = {}) {
  let mode = opt.mode || "twinkle", where = opt.where || "low", air = opt.air || "moving", ev = opt.ev || "rise", tMin = opt.t ?? -1.5;
  let fire = opt.fire ?? true;
  const show = { actual: opt.actual ?? true };
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.9, alt: "Atmospheric refraction" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["twinkle", "Twinkling of stars"], ["sun", "Advance sunrise, delayed sunset"], ["hot", "Air above a fire"]] }, v => { mode = v; sync(); draw(); });
  const wSeg = seg(ctl, { label: "Star seen", value: where, options: [["low", "Near the horizon"], ["high", "High in the sky"]] }, v => { where = v; draw(); });
  const aSeg = seg(ctl, { label: "Air", value: air, options: [["moving", "Changing (as it really is)"], ["still", "Still (imagine)"]] }, v => { air = v; draw(); });
  const eSeg = seg(ctl, { label: "Time of day", value: ev, options: [["rise", "Sunrise"], ["set", "Sunset"]] }, v => { ev = v; sT.inp.dispatchEvent(new Event("input")); });
  const tTxt = v => (Math.abs(v) < 0.05 ? `at the actual ${ev === "rise" ? "sunrise" : "sunset"}` : `${fmt(Math.abs(v), 1)} min ${v < 0 ? "before" : "after"} the actual ${ev === "rise" ? "sunrise" : "sunset"}`);
  const sT = slider(ctl, { label: "Time", min: -4, max: 4, step: 0.1, value: tMin, fmt: v => tTxt(v) }, v => { tMin = v; draw(); });
  const fSeg = seg(ctl, { label: "Fire", value: fire ? "on" : "off", options: [["on", "Burning"], ["off", "Put out"]] }, v => { fire = v === "on"; draw(); });
  const sh = chipRow(stage, "Show");
  const showT = toggles(sh, [["actual", "Actual position"]], show, () => draw());
  const ro = readouts(stage);
  function sync() {
    wSeg.el.style.display = aSeg.el.style.display = mode === "twinkle" ? "" : "none";
    eSeg.el.style.display = sT.el.style.display = mode === "sun" ? "" : "none";
    fSeg.el.style.display = mode === "hot" ? "" : "none";
    sh.style.display = mode === "hot" ? "none" : "";
  }
  sync();
  let time = 0, bg = null, bgKey = "";
  onFrame((dt) => { time += dt; if (mode !== "sun") draw(); });

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "twinkle") drawTwinkle(ctx, w, H, p);
    else if (mode === "sun") drawSun(ctx, w, H, p);
    else drawHot(ctx, w, H, p);
  }

  function drawTwinkle(ctx, w, H, p) {
    const gy = H * 0.86, top = H * 0.36, N = 8;
    const g = ctx.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, "#04060d"); g.addColorStop(1, "#141c33");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, gy);
    for (let k = 0; k < 70; k++) circle(ctx, (k * 97.3) % w, (k * 41.7) % (top * 0.95), k % 7 === 0 ? 1.3 : 0.7, "rgba(255,255,255,0.7)");
    const moving = air === "moving";
    const layerH = (gy - top) / N;
    const delta = [];
    for (let k = 0; k < N; k++) {
      const base = 0.05 * Math.pow(1 - k / N, 1.6) + 0.003;
      const wob = moving ? 0.45 * Math.sin(1.9 * time + 1.3 * k) * Math.sin(1.1 * time + 2.1 * k) + 0.3 * Math.sin(4.3 * time + 0.7 * k) : 0;
      delta.push(base * (1 + wob));
    }
    for (let k = 0; k < N; k++) {
      ctx.fillStyle = `rgba(120,160,255,${(0.04 + 1.6 * delta[k]).toFixed(3)})`;
      ctx.fillRect(0, gy - (k + 1) * layerH, w, layerH);
    }
    line(ctx, 0, top, w, top, "rgba(255,255,255,0.5)", 1, [6, 6]);
    label(ctx, "Top of the atmosphere", w - 10, top - 10, { color: "rgba(255,255,255,0.85)", size: 12, align: "right" });
    ctx.fillStyle = p.dark ? "#1d2618" : "#2f3a24"; ctx.fillRect(0, gy, w, H - gy);
    const ox = w * 0.8, oy = gy;
    // trace upwards from the observer at elevation alpha; returns the path and the point where it reaches height ys
    const traceUp = (alpha, dl, ys) => {
      const pts = [[ox, oy]];
      const n0 = 1 + dl[0], s0 = n0 * Math.cos(alpha);         // n sin(zenith angle) is the same in every layer
      let x = ox, y = oy;
      for (let k = 0; k < N; k++) {
        const nk = 1 + dl[k], sz = s0 / nk, tz = sz / Math.sqrt(Math.max(1e-9, 1 - sz * sz));
        x -= layerH * tz; y -= layerH; pts.push([x, y]);
      }
      const tz = s0 / Math.sqrt(Math.max(1e-9, 1 - s0 * s0));
      x -= (y - ys) * tz; y = ys; pts.push([x, y]);
      return pts;
    };
    const ys = top * 0.78;
    const sx = where === "low" ? w * 0.08 : ox - (oy - ys) / Math.tan(58 * DEG);
    const elev = Math.atan2(oy - ys, ox - sx);
    const solve = dl => {
      let lo = 0.5 * DEG, hi = 89 * DEG;
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2, pts = traceUp(m, dl, ys); if (pts[pts.length - 1][0] < sx) lo = m; else hi = m; }
      return (lo + hi) / 2;
    };
    const al = solve(delta);
    const path = traceUp(al, delta, ys);
    const dist = Math.hypot(sx - ox, ys - oy);
    const ax = ox - Math.cos(al) * dist, ayy = oy - Math.sin(al) * dist;
    ctx.save(); ctx.strokeStyle = "rgba(255,240,180,0.9)"; ctx.lineWidth = 1.8; ctx.beginPath();
    path.slice().reverse().forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    line(ctx, ox, oy, ax, ayy, "rgba(255,240,180,0.55)", 1.3, [5, 5]);
    // the star: brightness flickers when the air keeps changing
    const flick = moving ? clamp(0.6 + 0.4 * Math.sin(17 * time) * Math.sin(7.3 * time + 1) + 0.25 * Math.sin(29 * time), 0.15, 1) : 1;
    const glow = ctx.createRadialGradient(ax, ayy, 1, ax, ayy, 16 * flick + 4);
    glow.addColorStop(0, `rgba(255,255,230,${flick.toFixed(2)})`); glow.addColorStop(1, "rgba(255,255,230,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ax, ayy, 16 * flick + 4, 0, Math.PI * 2); ctx.fill();
    circle(ctx, ax, ayy, 2.2 + 1.5 * flick, "#fffbe6");
    label(ctx, "Star, where it is seen", ax + 14, ayy - 12, { color: "#fff6c8", size: 12, align: "left", weight: 700 });
    if (show.actual) {
      circle(ctx, sx, ys, 5, null, "rgba(255,255,255,0.75)", 1.5);
      label(ctx, "Actual position", sx + 10, ys + 12, { color: "rgba(255,255,255,0.85)", size: 12, align: "left" });
    }
    // a planet: an extended source, steady
    const pa = (where === "low" ? 16 : 36) * DEG, pd = dist * 0.72;
    const px = ox - Math.cos(pa) * pd, py = oy - Math.sin(pa) * pd;
    circle(ctx, px, py, 6, "#ffd59a");
    label(ctx, "Planet: steady", px + 12, py, { color: "#ffd59a", size: 12, align: "left", weight: 700 });
    // observer
    ctx.save(); ctx.strokeStyle = "#e9edf5"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(ox, oy - 26, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy - 21); ctx.lineTo(ox, oy - 9); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox - 5, oy); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox + 5, oy); ctx.stroke(); ctx.restore();
    label(ctx, "Layers of air: denser and with a higher refractive index near the ground", 10, H - 30, { color: "rgba(255,255,255,0.8)", size: 11, align: "left" });
    label(ctx, "Not to scale; bending exaggerated", 10, H - 12, { color: "rgba(255,255,255,0.7)", size: 11, align: "left" });
    const raised = (al - elev) / DEG;
    ro([
      { k: "Star appears", v: where === "low" ? "Higher than its actual position" : "Almost at its actual position (bending is least overhead)" },
      { k: "Seen with changing air", v: moving ? "Its position and brightness keep changing: it twinkles" : "Still air: no twinkling (but still raised)" },
      { k: "Planet", v: "Does not twinkle" },
      { k: "Extra bending drawn here", v: `${fmt(raised, 1)}° (exaggerated)` },
      { k: "Why stars twinkle", v: "Starlight entering the atmosphere is refracted continuously in a medium of gradually changing refractive index, bending towards the normal. The physical conditions of the air keep changing, so the path of the light varies slightly: the apparent position of the star fluctuates and the amount of light entering the eye flickers. Stars are so distant that they are point-sized sources.", wide: true },
      { k: "Why planets do not", v: "Planets are much closer and are seen as extended sources, like a collection of many point-sized sources. The variations in the light from all of them average out to zero.", wide: true }
    ]);
  }

  function drawSun(ctx, w, H, p) {
    const K = 12;                                  // angles are drawn 12 times larger than real
    const rise = ev === "rise";
    const oy = H * 0.74, ox = w * 0.5;
    const Re = w * 1.6, ecx = ox, ecy = oy + Re, T = H * 0.17;
    // real angles (degrees): the Sun moves about 0.25° a minute; near the horizon light bends by about 0.57°.
    const topTrue = 0.25 * (rise ? tMin : -tMin);  // elevation of the top edge of the Sun, actual
    const semi = 0.27, bend = 0.57;
    const cTrue = topTrue - semi, cApp = cTrue + bend;
    const seen = topTrue + bend > 0;
    const day = clamp((topTrue + bend + 1.5) / 3, 0, 1);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(mix([10, 14, 32], [70, 120, 200], day))); g.addColorStop(oy / H, rgb(mix([40, 40, 70], [250, 180, 120], day)));
    g.addColorStop(1, rgb(mix([40, 40, 70], [250, 190, 140], day)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, H);
    // atmosphere shell
    ctx.save(); ctx.beginPath(); ctx.arc(ecx, ecy, Re + T, 0, 2 * Math.PI); ctx.fillStyle = "rgba(170,210,255,0.16)"; ctx.fill();
    ctx.beginPath(); ctx.arc(ecx, ecy, Re + T, Math.PI, 2 * Math.PI); ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    label(ctx, "Top of the atmosphere (not to scale)", 10, oy - T - 12, { color: "rgba(255,255,255,0.85)", size: 12, align: "left" });
    // the Sun, far away: actual and apparent positions
    const Ds = Math.min(w * 0.42, H * 1.0), dir = rise ? -1 : 1;
    const pos = deg => [ox + dir * Ds * Math.cos(deg * K * DEG), oy - Ds * Math.sin(deg * K * DEG)];
    const rs = Ds * Math.tan(semi * K * DEG);
    const [axs, ays] = pos(cApp);
    if (seen) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, oy); ctx.clip();
      const glow = ctx.createRadialGradient(axs, ays, rs * 0.5, axs, ays, rs * 3);
      glow.addColorStop(0, "rgba(255,200,120,0.75)"); glow.addColorStop(1, "rgba(255,200,120,0)");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(axs, ays, rs * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffcf6e"; ctx.beginPath(); ctx.ellipse(axs, ays, rs, rs * 0.86, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      label(ctx, "Sun as we see it (flattened)", axs - dir * (rs + 8), ays - rs - 10, { color: "#fff1c8", size: 12, align: rise ? "left" : "right", weight: 700 });
    }
    // ground: the curved Earth
    ctx.save(); ctx.beginPath(); ctx.arc(ecx, ecy, Re, 0, 2 * Math.PI); ctx.fillStyle = p.dark ? "#1d2618" : "#56703f"; ctx.fill(); ctx.restore();
    line(ctx, 0, oy, w, oy, "rgba(255,255,255,0.8)", 1.4, [8, 6]);
    label(ctx, "Horizon", rise ? w - 10 : 10, oy - 10, { color: "#fff", size: 12, align: rise ? "right" : "left", weight: 700 });
    if (show.actual) {
      const [txs, tys] = pos(cTrue);
      circle(ctx, txs, tys, rs, null, "rgba(255,230,160,0.9)", 1.6);
      label(ctx, `Actual position${topTrue < 0 ? " (below the horizon)" : ""}`, txs - dir * (rs + 8), tys + rs + 14, { color: "#fff1c8", size: 12, align: rise ? "left" : "right" });
      // path of the light from the actual Sun: it bends in the atmosphere and reaches the observer along the apparent direction
      if (seen) {
        const ua = cApp * K * DEG, L = Ds * 0.5;
        const ccx = ox + dir * L * Math.cos(ua), ccy = oy - 2 - L * Math.sin(ua);
        ctx.save(); ctx.strokeStyle = "rgba(255,230,160,0.95)"; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(txs, tys); ctx.quadraticCurveTo(ccx, ccy, ox, oy - 2); ctx.stroke(); ctx.restore();
        head(ctx, ox + dir * 4, oy - 2, dir > 0 ? Math.PI : 0, 9, "rgba(255,230,160,0.95)");
        line(ctx, ox, oy - 2, axs, ays, "rgba(255,255,255,0.7)", 1.2, [5, 5]);
      }
    }
    ctx.save(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(ox, oy - 26, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy - 21); ctx.lineTo(ox, oy - 9); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox - 5, oy); ctx.moveTo(ox, oy - 9); ctx.lineTo(ox + 5, oy); ctx.stroke(); ctx.restore();
    label(ctx, "Observer", ox, oy + 16, { color: "#fff", size: 12 });
    label(ctx, "Angles drawn 12 times larger than real", 10, H - 12, { color: "rgba(255,255,255,0.8)", size: 11, align: "left" });
    ro([
      { k: "Time", v: tTxt(tMin) },
      { k: "Actual Sun", v: topTrue < -1e-9 ? "Below the horizon" : "Above the horizon" },
      { k: "Can we see the Sun?", v: seen ? "Yes" : "Not yet", tone: seen ? "good" : null },
      { k: "Why", v: "Light from the Sun is bent by the Earth's atmosphere. So the Sun is visible about 2 minutes before the actual sunrise and about 2 minutes after the actual sunset (the actual sunrise is the actual crossing of the horizon by the Sun). The apparent flattening of the Sun's disc at sunrise and sunset is due to the same effect.", wide: true }
    ]);
  }

  function drawHot(ctx, w, H, p) {
    const dpr = window.devicePixelRatio || 1;
    const key = `${w}x${H}x${dpr}x${p.dark}`;
    const gy = H * 0.82;
    if (key !== bgKey) {
      bgKey = key;
      bg = document.createElement("canvas");
      bg.width = Math.round(w * dpr); bg.height = Math.round(H * dpr);
      const b = bg.getContext("2d");
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      const sg = b.createLinearGradient(0, 0, 0, gy);
      sg.addColorStop(0, p.dark ? "#1f3557" : "#8fc1f0"); sg.addColorStop(1, p.dark ? "#3b4d6a" : "#dcecfb");
      b.fillStyle = sg; b.fillRect(0, 0, w, gy);
      b.fillStyle = p.dark ? "#26331f" : "#86a463"; b.fillRect(0, gy, w, H - gy);
      // a distant building with windows, and a pole
      const bx = w * 0.42, bw = w * 0.16, bt = H * 0.22;
      b.fillStyle = p.dark ? "#5b6170" : "#7d8597"; b.fillRect(bx, bt, bw, gy - bt);
      b.fillStyle = p.dark ? "#ffe69a" : "#fdf3c4";
      for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) b.fillRect(bx + 10 + c * (bw - 20) / 4, bt + 14 + r * (gy - bt - 30) / 7, (bw - 20) / 4 - 8, (gy - bt - 30) / 7 - 10);
      b.fillStyle = p.dark ? "#cfd4de" : "#3a3f4b"; b.fillRect(w * 0.64, H * 0.3, 5, gy - H * 0.3);
      b.beginPath(); b.arc(w * 0.64 + 2.5, H * 0.3, 9, 0, Math.PI * 2); b.fill();
    }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0); ctx.restore();
    const fx = w * 0.5, colW = w * 0.34, fy = gy + 6;
    if (fire) {
      // slices of the scene seen through the rising hot air are shifted sideways, changing all the time
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
      const x0 = Math.round((fx - colW / 2) * dpr), wd = Math.round(colW * dpr), step = Math.max(2, Math.round(3 * dpr));
      for (let y = Math.round(H * 0.08 * dpr); y < Math.round((gy - 4) * dpr); y += step) {
        const yy = y / dpr, f = clamp((gy - yy) / (gy - H * 0.08), 0, 1);
        const amp = 4.5 * (1 - 0.6 * f);
        const dx = amp * Math.sin(0.09 * yy - 7 * time) * Math.sin(0.043 * yy + 3.1 * time + 1);
        ctx.drawImage(bg, x0, y, wd, step, x0 + dx * dpr, y, wd, step);
      }
      ctx.restore();
      ctx.save(); const hg = ctx.createLinearGradient(0, H * 0.1, 0, gy);
      hg.addColorStop(0, "rgba(255,160,80,0)"); hg.addColorStop(1, "rgba(255,160,80,0.10)");
      ctx.fillStyle = hg; ctx.fillRect(fx - colW / 2, H * 0.08, colW, gy - H * 0.08); ctx.restore();
      label(ctx, "Hot air rising", fx + colW / 2 + 6, H * 0.2, { color: p.dark ? "#ffd2a8" : "#8a3b0c", size: 12, align: "left", weight: 700 });
    }
    // the fire
    ctx.fillStyle = p.dark ? "#5b4636" : "#6d4c33"; roundRect(ctx, fx - 46, fy - 6, 92, 14, 5); ctx.fill();
    if (fire) {
      for (let k = 0; k < 7; k++) {
        const fxk = fx - 36 + k * 12, hk = 26 + 12 * Math.sin(9 * time + k * 1.7) + 8 * Math.sin(5 * time + k);
        ctx.save(); ctx.beginPath(); ctx.moveTo(fxk - 8, fy - 4); ctx.quadraticCurveTo(fxk - 6, fy - hk * 0.6, fxk, fy - hk); ctx.quadraticCurveTo(fxk + 6, fy - hk * 0.6, fxk + 8, fy - 4); ctx.closePath();
        ctx.fillStyle = k % 2 ? "rgba(255,170,40,0.9)" : "rgba(240,90,30,0.85)"; ctx.fill(); ctx.restore();
      }
    }
    label(ctx, "Fire", fx, fy + 20, { color: p.text, size: 12 });
    ro([
      { k: "What you see", v: fire ? "The building and the pole seem to waver" : "Steady: no hot air rising", tone: fire ? null : "good" },
      { k: "Why", v: "The air just above the fire becomes hotter than the air further up. Hotter air is lighter (less dense) and has a refractive index slightly less than the cooler air above it. The conditions of this air keep changing, so the apparent position of an object seen through it fluctuates. This is atmospheric refraction on a small scale; the twinkling of stars is the same effect on a much larger scale.", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.where) { where = o.where; wSeg.set(where); }
      if (o.air) { air = o.air; aSeg.set(air); }
      if (o.ev) { ev = o.ev; eSeg.set(ev); }
      if (o.t != null) { tMin = o.t; sT.value = tMin; }
      if (o.fire != null) { fire = !!o.fire; fSeg.set(fire ? "on" : "off"); }
      if (o.actual != null) { show.actual = !!o.actual; showT.sync(); }
      draw();
    }
  };
};

/* =================================================================
   10.6 Scattering of light: Tyndall effect, size of the particles,
   the blue sky, and red danger signals. Colours are illustrative.
   ================================================================= */
CR.sims.scatter = function (stage, opt = {}) {
  let mode = opt.mode || "tyndall", smoke = opt.smoke ?? true, size = opt.size ?? 0.1, air = opt.air ?? true, fog = opt.fog ?? 0.5;
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.9, alt: "Scattering of light" });
  const ctl = controls(stage);
  const mSeg = seg(ctl, { label: "Show", value: mode, options: [["tyndall", "Tyndall effect"], ["size", "Size of the particles"], ["sky", "Why the sky is blue"], ["signal", "Red danger signals"]] }, v => { mode = v; sync(); draw(); });
  const smSeg = seg(ctl, { label: "Smoke in the room", value: smoke ? "yes" : "no", options: [["yes", "Yes"], ["no", "No"]] }, v => { smoke = v === "yes"; draw(); });
  const sS = slider(ctl, { label: "Size of the scattering particles", min: 0, max: 1, step: 0.01, value: size, fmt: v => (v < 0.25 ? "Very fine" : v < 0.75 ? "Larger" : "Large") }, v => { size = v; draw(); });
  const aSeg = seg(ctl, { label: "Atmosphere", value: air ? "yes" : "no", options: [["yes", "On the Earth (with air)"], ["no", "No air (space, or very high up)"]] }, v => { air = v === "yes"; draw(); });
  const sF = slider(ctl, { label: "Fog or smoke", min: 0, max: 1, step: 0.01, value: fog, fmt: v => (v < 0.05 ? "Clear" : v < 0.4 ? "Light" : v < 0.75 ? "Thick" : "Very thick") }, v => { fog = v; draw(); });
  const ro = readouts(stage);
  function sync() {
    smSeg.el.style.display = mode === "tyndall" ? "" : "none";
    sS.el.style.display = mode === "size" ? "" : "none";
    aSeg.el.style.display = mode === "sky" ? "" : "none";
    sF.el.style.display = mode === "signal" ? "" : "none";
  }
  sync();
  let time = 0;
  const parts = Array.from({ length: 260 }, (_, k) => [(k * 0.618034) % 1, (k * 0.7548777) % 1, (k * 0.5698403) % 1]);
  onFrame(dt => { time += dt; if (mode === "tyndall" || mode === "size") draw(); });
  // relative strength of scattering for red, green and blue light; very fine particles: strongly favour blue
  const scatterRGB = s => { const pw = 4 * Math.pow(1 - s, 1.5); const wv = [650, 550, 450].map(l => Math.pow(450 / l, pw)); return wv.map(x => 255 * x); };

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "tyndall") drawTyndall(ctx, w, H, p);
    else if (mode === "size") drawSize(ctx, w, H, p);
    else if (mode === "sky") drawSky(ctx, w, H, p);
    else drawSignal(ctx, w, H, p);
  }
  function drawTyndall(ctx, w, H, p) {
    const wallX = w * 0.14, floorY = H * 0.88, holeY = H * 0.22;
    ctx.fillStyle = "#14161d"; ctx.fillRect(wallX, 0, w - wallX, H);
    ctx.fillStyle = "#2a2e38"; ctx.fillRect(wallX, floorY, w - wallX, H - floorY);
    const og = ctx.createLinearGradient(0, 0, wallX, 0);
    og.addColorStop(0, "#fff7d6"); og.addColorStop(1, "#ffe9a8");
    ctx.fillStyle = og; ctx.fillRect(0, 0, wallX - 8, H);
    ctx.fillStyle = "#4a4f5c"; ctx.fillRect(wallX - 8, 0, 10, H);
    ctx.fillStyle = "#fff7d6"; ctx.fillRect(wallX - 8, holeY - 5, 10, 10);
    label(ctx, "Sunlight", 8, 18, { color: "#6b4b00", size: 13, align: "left", weight: 700 });
    label(ctx, "Small hole", wallX + 8, holeY - 16, { color: "#c9cfdb", size: 12, align: "left" });
    const ex = w * 0.62, spread = 26;
    const beamPoly = [[wallX, holeY - 4], [wallX, holeY + 4], [ex + spread, floorY], [ex - spread, floorY]];
    const inBeam = (x, y) => {
      if (x < wallX || y < holeY - 6 || y > floorY) return false;
      const t = clamp((y - holeY) / (floorY - holeY), 0, 1);
      return Math.abs(x - lerp(wallX, ex, t)) < lerp(4, spread, t) + 3;
    };
    if (smoke) {
      ctx.save(); ctx.beginPath(); beamPoly.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fillStyle = "rgba(255,240,190,0.28)"; ctx.fill(); ctx.restore();
      parts.forEach(([a, b, c]) => {
        const x = wallX + 6 + ((a + 0.01 * Math.sin(time * 0.6 + c * 9)) % 1) * (w - wallX - 12);
        const y = 6 + ((b + time * 0.004 * (0.5 + c)) % 1) * (floorY - 12);
        const lit = inBeam(x, y);
        circle(ctx, x, y, lit ? 2.2 : 1.3, lit ? "rgba(255,246,210,0.95)" : "rgba(160,165,180,0.35)");
      });
    }
    ctx.save(); ctx.fillStyle = "rgba(255,240,190,0.9)"; ctx.beginPath(); ctx.ellipse(ex, floorY, spread, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // observer looking at the beam from the side
    const vx = w * 0.88, vy = H * 0.5;
    ctx.save(); ctx.translate(vx, vy); ctx.strokeStyle = "#e9edf5"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2); ctx.stroke(); circle(ctx, -4, 0, 3, "#e9edf5"); ctx.restore();
    label(ctx, "Eye", vx, vy + 18, { color: "#c9cfdb", size: 12 });
    if (smoke) {
      [0.3, 0.5, 0.7].forEach(t => {
        const bx = lerp(wallX, ex, t), by = lerp(holeY, floorY, t);
        drawRay(ctx, bx + 6, by, vx - 16, vy, "rgba(255,240,190,0.75)", { width: 1.4, arrow: true, at: 0.6 });
      });
      label(ctx, "The path of the beam is visible", w - 10, 18, { color: "#ffe9a8", size: 13, align: "right", weight: 700 });
    } else {
      label(ctx, "No particles: the path of the beam cannot be seen", w - 10, 18, { color: "#c9cfdb", size: 13, align: "right", weight: 700 });
    }
    ro([
      { k: "Can you see the beam?", v: smoke ? "Yes" : "No, only the bright patch where it lands", tone: smoke ? "good" : null },
      { k: "Tyndall effect", v: "The Earth's atmosphere contains minute particles: smoke, tiny water droplets, dust and molecules of air. When a beam of light strikes such fine particles, its path becomes visible: the light reaches us after being reflected diffusely (scattered) by them.", wide: true },
      { k: "Seen in", v: "A fine beam of sunlight entering a smoke-filled room through a small hole; sunlight passing through the canopy of a dense forest, where tiny water droplets in the mist scatter light.", wide: true }
    ]);
  }
  function drawSize(ctx, w, H, p) {
    const sc = scatterRGB(size);
    const top = H * 0.3, bot = H * 0.7, x0 = w * 0.08, x1 = w * 0.92;
    ctx.fillStyle = p.dark ? "#0f131c" : "#1a1f2b"; ctx.fillRect(0, 0, w, H);
    ctx.save(); ctx.strokeStyle = "rgba(200,220,255,0.6)"; ctx.lineWidth = 2; ctx.strokeRect(x0, top, x1 - x0, bot - top); ctx.restore();
    label(ctx, "Medium with particles", x0 + 8, top - 12, { color: "#d6dcea", size: 12, align: "left" });
    const by = (top + bot) / 2;
    const glow = ctx.createLinearGradient(0, top, 0, bot);
    glow.addColorStop(0, rgb(sc, 0)); glow.addColorStop(0.5, rgb(sc, 0.55)); glow.addColorStop(1, rgb(sc, 0));
    ctx.fillStyle = glow; ctx.fillRect(x0 + 2, top + 2, x1 - x0 - 4, bot - top - 4);
    line(ctx, 0, by, w, by, "#fffdf2", 5);
    head(ctx, w * 0.5, by, 0, 14, "#fffdf2");
    label(ctx, "White light", 8, by - 16, { color: "#fffdf2", size: 13, align: "left", weight: 700 });
    const r0 = 0.8 + size * 4.2;
    parts.slice(0, 120).forEach(([a, b, c]) => {
      const x = x0 + 6 + ((a + time * 0.01 * (c - 0.5)) % 1 + 1) % 1 * (x1 - x0 - 12), y = top + 6 + b * (bot - top - 12);
      circle(ctx, x, y, r0, `rgba(220,226,240,${(0.35 + 0.3 * c).toFixed(2)})`);
    });
    // swatch: colour of the light scattered sideways
    const sw = Math.min(120, w * 0.18), sy = bot + 26;
    roundRect(ctx, w / 2 - sw / 2, sy, sw, 26, 6); ctx.fillStyle = rgb(sc); ctx.fill();
    label(ctx, "Colour of the scattered light", w / 2, sy + 42, { color: "#d6dcea", size: 12 });
    const txt = size < 0.25 ? "Very fine particles scatter mainly blue light." : size < 0.75 ? "Larger particles scatter light of longer wavelengths as well, so the scattered light is paler." : "Particles large enough scatter all colours, so the scattered light may even appear white.";
    ro([
      { k: "Particles", v: size < 0.25 ? "Very fine" : size < 0.75 ? "Larger" : "Large" },
      { k: "Scattered light looks", v: size < 0.25 ? "Blue" : size < 0.75 ? "Pale blue to whitish" : "White" },
      { k: "Rule (NCERT)", v: "The colour of the scattered light depends on the size of the scattering particles. " + txt, wide: true }
    ]);
  }
  function drawSky(ctx, w, H, p) {
    const gy = H * 0.82, ox = w * 0.5;
    const g = ctx.createLinearGradient(0, 0, 0, gy);
    if (air) { g.addColorStop(0, "#2f6fd6"); g.addColorStop(1, "#b5d5f7"); } else { g.addColorStop(0, "#03050b"); g.addColorStop(1, "#0a0d17"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, gy);
    if (!air) for (let k = 0; k < 70; k++) circle(ctx, (k * 97.3) % w, (k * 53.7) % (gy * 0.95), k % 7 === 0 ? 1.4 : 0.8, "rgba(255,255,255,0.8)");
    const sx = w * 0.2, sy = H * 0.16;
    const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 60);
    glow.addColorStop(0, "rgba(255,255,240,0.9)"); glow.addColorStop(1, "rgba(255,255,240,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 60, 0, Math.PI * 2); ctx.fill();
    circle(ctx, sx, sy, 17, air ? "#fff6d0" : "#ffffff");
    label(ctx, "Sun", sx, sy + 30, { color: air ? "#11305e" : "#ffffff", size: 12, weight: 700 });
    if (air) {
      line(ctx, sx + 14, sy + 10, ox - 6, gy - 30, "rgba(255,250,225,0.95)", 4);
      for (let k = 1; k <= 5; k++) {
        const f = k / 6, px = lerp(sx + 14, ox - 6, f), py = lerp(sy + 10, gy - 30, f);
        circle(ctx, px, py, 2.6, "rgba(255,255,255,0.95)");
        for (let j = 0; j < 4; j++) {
          const a = k * 0.7 + j * Math.PI / 2;
          line(ctx, px + Math.cos(a) * 4, py + Math.sin(a) * 4, px + Math.cos(a) * 16, py + Math.sin(a) * 16, "#1e5bd8", 2);
          head(ctx, px + Math.cos(a) * 19, py + Math.sin(a) * 19, a, 6, "#1e5bd8");
        }
      }
      label(ctx, "Air molecules scatter blue light in all directions", w - 10, 18, { color: "#0d2a57", size: 12, align: "right", weight: 700 });
    } else {
      line(ctx, sx + 14, sy + 10, ox - 6, gy - 30, "rgba(255,255,255,0.9)", 3);
      label(ctx, "No air: nothing scatters the sunlight", w - 10, 18, { color: "#ffffff", size: 12, align: "right", weight: 700 });
    }
    ctx.fillStyle = p.dark ? "#26331f" : "#7b9a5a"; ctx.fillRect(0, gy, w, H - gy);
    const fig = air ? "#1c2233" : "#f2f4f8";
    ctx.save(); ctx.strokeStyle = fig; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(ox, gy - 26, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, gy - 21); ctx.lineTo(ox, gy - 9); ctx.moveTo(ox, gy - 9); ctx.lineTo(ox - 5, gy); ctx.moveTo(ox, gy - 9); ctx.lineTo(ox + 5, gy); ctx.moveTo(ox - 6, gy - 17); ctx.lineTo(ox + 6, gy - 17); ctx.stroke(); ctx.restore();
    label(ctx, "You", ox + 12, gy - 18, { color: fig, size: 12, align: "left" });
    ro(air ? [
      { k: "Sky looks", v: "Blue" },
      { k: "Why", v: "The molecules of air and other fine particles in the atmosphere are smaller than the wavelength of visible light. They scatter light of shorter wavelengths (the blue end) more strongly than light of longer wavelengths (the red end); red light has a wavelength about 1.8 times that of blue. The scattered blue light enters our eyes from all parts of the sky.", wide: true }
    ] : [
      { k: "Sky looks", v: "Dark" },
      { k: "Why", v: "If the Earth had no atmosphere there would be no scattering, and the sky would look dark. The sky appears dark to passengers flying at very high altitudes, as scattering is not prominent at such heights, and to astronauts in space.", wide: true }
    ]);
  }
  function drawSignal(ctx, w, H, p) {
    const gy = H * 0.8;
    ctx.fillStyle = p.dark ? "#1b2230" : "#9fb3c8"; ctx.fillRect(0, 0, w, gy);
    ctx.fillStyle = p.dark ? "#2b2f37" : "#5f646d"; ctx.fillRect(0, gy, w, H - gy);
    const lamps = [["Red", [235, 40, 30], 1.0], ["Green", [40, 200, 70], 1.45], ["Blue", [40, 110, 255], 2.1]];
    const T = lamps.map(([, , k]) => Math.exp(-1.7 * k * fog));
    const xs = lamps.map((_, j) => w * (0.28 + 0.22 * j)), y = H * 0.38;
    xs.forEach(x => {
      ctx.fillStyle = "#1a1c22"; ctx.fillRect(x - 3, y, 6, gy - y);
      ctx.fillStyle = "#23262e"; roundRect(ctx, x - 22, y - 26, 44, 52, 8); ctx.fill();
    });
    const fogCol = [214, 218, 226];
    ctx.fillStyle = rgb(fogCol, 0.75 * fog); ctx.fillRect(0, 0, w, gy);
    lamps.forEach(([name, col], j) => {
      const x = xs[j], a = T[j];
      const glow = ctx.createRadialGradient(x, y, 2, x, y, 50);
      glow.addColorStop(0, rgb(col, 0.85 * a)); glow.addColorStop(1, rgb(col, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 50, 0, Math.PI * 2); ctx.fill();
      circle(ctx, x, y, 15, rgb(mix(mix([60, 60, 66], fogCol, fog), col, a)));
      label(ctx, name, x, gy + 18, { color: p.dark ? "#d6dcea" : "#ffffff", size: 13, weight: 700 });
    });
    label(ctx, "Lamps seen from far away through fog or smoke", 10, 18, { color: p.dark ? "#eef2f8" : "#1a2333", size: 12, align: "left", weight: 700 });
    label(ctx, "Illustration", 10, H - 12, { color: p.dark ? "#d6dcea" : "#ffffff", size: 11, align: "left" });
    const pc = x => `${fmt(100 * x, 0)}%`;
    ro([
      { k: "Red light reaching you", v: pc(T[0]) },
      { k: "Green light reaching you", v: pc(T[1]) },
      { k: "Blue light reaching you", v: pc(T[2]) },
      { k: "Why danger signals are red", v: "Red light is scattered the least by fog or smoke. So it can be seen in the same colour from a distance.", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; mSeg.set(mode); sync(); }
      if (o.smoke != null) { smoke = !!o.smoke; smSeg.set(smoke ? "yes" : "no"); }
      if (o.size != null) { size = o.size; sS.value = size; }
      if (o.air != null) { air = !!o.air; aSeg.set(air ? "yes" : "no"); }
      if (o.fog != null) { fog = o.fog; sF.value = fog; }
      draw();
    }
  };
};
})();
