/* ============================================================
   Chapter 9 — Light: Reflection and Refraction (simulations)
   ============================================================ */
"use strict";
(function () {
const { h, clamp, lerp, DEG, fmt, sgnf, nice, br, pal, line, head, drawRay, vArrow, label, textWidth, roundRect, circle,
  arcAngle, toEdge, hatch, makeCanvas, controls, slider, seg, select, numInput, chipRow, chip, toggles, readouts, ncertTable } = CR;

/* ---------- NCERT tables (wording as in the textbook) ---------- */
const HEAD_M = ["Position of the object", "Position of the image", "Size of the image", "Nature of the image"];
const HEAD_L = ["Position of the object", "Position of the image", "Relative size of the image", "Nature of the image"];
const T91 = {
  caption: "Table 9.1  Image formation by a concave mirror for different positions of the object", head: HEAD_M,
  rows: [
    ["At infinity", "At the focus F", "Highly diminished, point-sized", "Real and inverted"],
    ["Beyond C", "Between F and C", "Diminished", "Real and inverted"],
    ["At C", "At C", "Same size", "Real and inverted"],
    ["Between C and F", "Beyond C", "Enlarged", "Real and inverted"],
    ["At F", "At infinity", "Highly enlarged", "Real and inverted"],
    ["Between P and F", "Behind the mirror", "Enlarged", "Virtual and erect"]
  ]
};
const T92 = {
  caption: "Table 9.2  Nature, position and relative size of the image formed by a convex mirror", head: HEAD_M,
  rows: [
    ["At infinity", "At the focus F, behind the mirror", "Highly diminished, point-sized", "Virtual and erect"],
    ["Between infinity and the pole P of the mirror", "Between P and F, behind the mirror", "Diminished", "Virtual and erect"]
  ]
};
const T94 = {
  caption: "Table 9.4  Nature, position and relative size of the image formed by a convex lens for various positions of the object", head: HEAD_L,
  rows: [
    ["At infinity", "At focus F₂", "Highly diminished, point-sized", "Real and inverted"],
    ["Beyond 2F₁", "Between F₂ and 2F₂", "Diminished", "Real and inverted"],
    ["At 2F₁", "At 2F₂", "Same size", "Real and inverted"],
    ["Between F₁ and 2F₁", "Beyond 2F₂", "Enlarged", "Real and inverted"],
    ["At focus F₁", "At infinity", "Infinitely large or highly enlarged", "Real and inverted"],
    ["Between focus F₁ and optical centre O", "On the same side of the lens as the object", "Enlarged", "Virtual and erect"]
  ]
};
const T95 = {
  caption: "Table 9.5  Nature, position and relative size of the image formed by a concave lens for various positions of the object", head: HEAD_L,
  rows: [
    ["At infinity", "At focus F₁", "Highly diminished, point-sized", "Virtual and erect"],
    ["Between infinity and optical centre O of the lens", "Between focus F₁ and optical centre O", "Diminished", "Virtual and erect"]
  ]
};
CR.tables = Object.assign(CR.tables || {}, { T91, T92, T94, T95 });

/* Table 9.3 */
const T93 = [["Air", 1.0003], ["Ice", 1.31], ["Water", 1.33], ["Alcohol", 1.36], ["Kerosene", 1.44], ["Fused quartz", 1.46],
  ["Turpentine oil", 1.47], ["Benzene", 1.50], ["Crown glass", 1.52], ["Canada Balsam", 1.53], ["Rock salt", 1.54],
  ["Carbon disulphide", 1.63], ["Dense flint glass", 1.65], ["Ruby", 1.71], ["Sapphire", 1.77], ["Diamond", 2.42]];
const nTxt = n => (n === 1.0003 ? "1.0003" : n.toFixed(2));

/* =================================================================
   9.1 Reflection: laws of reflection and the plane mirror
   ================================================================= */
CR.sims.reflection = function (stage, opt = {}) {
  let mode = opt.mode || "laws", iDeg = opt.i ?? 40, d = opt.d ?? 20, word = "P";
  const cv = makeCanvas(stage, { ratio: 0.48, mratio: 0.85, alt: "Reflection of light by a plane mirror" });
  const ctl = controls(stage);
  const modeSeg = seg(ctl, { label: "Show", value: mode, options: [["laws", "Laws of reflection"], ["plane", "Image in a plane mirror"]] }, v => { mode = v; sync(); draw(); });
  const sI = slider(ctl, { label: "Angle of incidence i", min: 0, max: 85, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
  const sD = slider(ctl, { label: "Distance of object from mirror", min: 5, max: 40, step: 1, value: d, unit: "cm" }, v => { d = v; draw(); });
  const wordRow = chipRow(stage, "Lateral inversion: show");
  const wbtn = ["P", "R", "F", "LEFT"].map(wd => chip(wordRow, wd, () => { word = wd; wbtn.forEach(b => b.setAttribute("aria-pressed", String(b.textContent === wd))); draw(); }, wd === word));
  const ro = readouts(stage);
  function sync() {
    sI.el.style.display = mode === "laws" ? "" : "none";
    sD.el.style.display = mode === "plane" ? "" : "none";
    wordRow.style.display = mode === "plane" ? "" : "none";
  }
  sync();

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    if (mode === "laws") {
      const my = H * 0.8, mx = w / 2, half = Math.min(w * 0.36, 320), L = Math.min(H * 0.62, w * 0.4);
      line(ctx, mx - half, my, mx + half, my, p.glassEdge, 4);
      hatch(ctx, mx - half, my, mx + half, my, p.soft, 1);
      label(ctx, "Plane mirror", mx + half - 4, my + 22, { color: p.soft, size: 12, align: "right" });
      line(ctx, mx, my, mx, my - L * 1.05, p.soft, 1.5, [6, 5]);
      label(ctx, "Normal", mx, my - L * 1.05 - 10, { color: p.soft, size: 12 });
      const i = iDeg * DEG;
      const sx = mx - L * Math.sin(i), sy = my - L * Math.cos(i);
      drawRay(ctx, sx, sy, mx, my, p.r1, { width: 3 });
      drawRay(ctx, mx, my, mx + L * Math.sin(i), my - L * Math.cos(i), p.r3, { width: 3 });
      arcAngle(ctx, mx, my, 46, -Math.PI / 2 - i, -Math.PI / 2, p.r1, "i");
      arcAngle(ctx, mx, my, 46, -Math.PI / 2, -Math.PI / 2 + i, p.r3, "r");
      label(ctx, "Incident ray", lerp(sx, mx, 0.35) - 10, lerp(sy, my, 0.35), { color: p.r1, size: 13, align: "right", weight: 700 });
      label(ctx, "Reflected ray", lerp(mx, mx + L * Math.sin(i), 0.65) + 10, lerp(my, my - L * Math.cos(i), 0.65), { color: p.r3, size: 13, align: "left", weight: 700 });
      circle(ctx, mx, my, 4, p.text);
      label(ctx, "Point of incidence", mx, my + 16, { color: p.soft, size: 12 });
      ro([
        { k: "Angle of incidence ∠i", v: `${iDeg}°` },
        { k: "Angle of reflection ∠r", v: `${iDeg}°` },
        { k: "First law", v: "The angle of incidence is equal to the angle of reflection.", wide: true },
        { k: "Second law", v: "The incident ray, the normal to the mirror at the point of incidence and the reflected ray all lie in the same plane (here, the plane of the screen).", wide: true }
      ]);
    } else {
      const mxp = Math.round(w * 0.55), top = H * 0.1, bot = H * 0.92, base = H * 0.66;
      const s = (mxp - 46) / 42;                    // px per cm
      line(ctx, mxp, top, mxp, bot, p.glassEdge, 4);
      hatch(ctx, mxp, top, mxp, bot, p.soft, -1);
      label(ctx, "Plane mirror", mxp + 12, top + 6, { color: p.soft, size: 12, align: "left" });
      const ho = Math.min(H * 0.26, 80);
      const xo = mxp - d * s, xi = mxp + d * s, ty = base - ho;
      line(ctx, 0, base, w, base, p.border, 1);
      vArrow(ctx, xo, base, ty, p.obj, { width: 4 });
      label(ctx, "Object", xo, ty - 12, { color: p.obj, size: 13 });
      vArrow(ctx, xi, base, ty, p.img, { width: 4, dash: [6, 4] });
      label(ctx, "Image (virtual)", Math.min(xi, w - 50), ty - 12, { color: p.img, size: 13 });
      // two rays from the tip of the object, reflected at the mirror, seen by the eye
      const eye = [26, H * 0.86];
      const hit1 = ty + (eye[1] - ty) * (mxp - xi) / (eye[0] - xi);   // line eye–image tip meets the mirror
      const eye2y = clamp(H * 0.32, top + 10, base - 30);
      const hit2 = ty + (eye2y - ty) * (mxp - xi) / (eye[0] - xi);
      [[hit1, eye[1], p.r1], [hit2, eye2y, p.r3]].forEach(([hy, ey, col]) => {
        if (hy < top || hy > bot) return;
        drawRay(ctx, xo, ty, mxp, hy, col, { width: 2 });
        drawRay(ctx, mxp, hy, eye[0], ey, col, { width: 2 });
        line(ctx, mxp, hy, xi, ty, col, 1.5, [5, 5], 0.8);
      });
      // the eye, at two places: from anywhere, the reflected rays seem to come from the same image point
      const drawEye = (ex, ey, txt, below) => {
        ctx.save(); ctx.translate(ex, ey); ctx.strokeStyle = p.text; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2); ctx.stroke(); circle(ctx, 3, 0, 3, p.text); ctx.restore();
        label(ctx, txt, ex - 6, ey + (below ? 17 : -15), { color: p.soft, size: 12, align: "left" });
      };
      drawEye(eye[0], eye[1], "Eye", true);
      drawEye(eye[0], eye2y, "Eye at another place", false);
      // distances
      const dy = base + 22;
      line(ctx, xo, dy, mxp, dy, p.soft, 1.2); line(ctx, mxp, dy, xi, dy, p.soft, 1.2);
      head(ctx, xo, dy, Math.PI, 7, p.soft); head(ctx, mxp, dy, 0, 7, p.soft); head(ctx, mxp, dy, Math.PI, 7, p.soft); head(ctx, xi, dy, 0, 7, p.soft);
      label(ctx, `${d} cm`, (xo + mxp) / 2, dy + 13, { color: p.text, size: 12 });
      label(ctx, `${d} cm`, (xi + mxp) / 2, dy + 13, { color: p.text, size: 12 });
      // lateral inversion
      const fs = Math.min(36, w * 0.05);
      label(ctx, "Object", 18, top + 6, { color: p.soft, size: 12, align: "left" });
      label(ctx, word, 18, top + 30, { color: p.text, size: fs, weight: 700, align: "left" });
      ctx.save(); ctx.translate(w - 18, 0); ctx.scale(-1, 1);
      label(ctx, word, 0, top + 30, { color: p.img, size: fs, weight: 700, align: "left" });
      ctx.restore();
      label(ctx, "Its image", w - 18, top + 6, { color: p.soft, size: 12, align: "right" });
      ro([
        { k: "Object distance u", v: `${fmt(-d, 0)} cm` },
        { k: "Image distance v", v: `+${d} cm (behind the mirror)` },
        { k: "Magnification m", v: "+1 (same size)" },
        { k: "Image", v: "Virtual and erect, same size, as far behind the mirror as the object is in front, laterally inverted.", wide: true }
      ]);
    }
  }
  return {
    set(o) {
      if (o.mode) { mode = o.mode; modeSeg.set(mode); sync(); }
      if (o.i != null) { iDeg = o.i; sI.value = iDeg; }
      if (o.d != null) { d = o.d; sD.value = d; }
      draw();
    }
  };
};

/* =================================================================
   9.2 / 9.3 Spherical mirrors and lenses — ray diagrams
   Thin mirror / thin lens (paraxial) construction, NCERT New Cartesian
   sign convention. Mirror: 1/v + 1/u = 1/f, m = −v/u. Lens: 1/v − 1/u = 1/f,
   m = v/u. The drawing zooms so that the object and image stay visible;
   horizontal and vertical scales may differ, which keeps every straight
   line and every meeting point of rays correct.
   ================================================================= */
CR.sims.optics = function (stage, opt = {}) {
  const isMirror = opt.kind !== "lens";
  let type = opt.type || (isMirror ? "concave" : "convex");
  let F = opt.F ?? 10, U = opt.U ?? 25, inf = !!opt.inf, hObj = opt.h ?? 2;
  const rays = Object.assign(isMirror ? { r1: true, r2: true, r3: true, r4: false } : { r1: true, r2: true, r3: true }, opt.rays || {});
  const show = { labels: !!opt.labels, sign: !!opt.sign, cover: !!opt.cover };
  const word = isMirror ? "mirror" : "lens";

  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.85, alt: isMirror ? "Ray diagram for a spherical mirror" : "Ray diagram for a lens" });
  const ctl = controls(stage);
  const typeSeg = seg(ctl, {
    label: isMirror ? "Mirror" : "Lens", value: type,
    options: isMirror ? [["concave", "Concave"], ["convex", "Convex"]] : [["convex", "Convex"], ["concave", "Concave"]]
  }, v => { type = v; onType(); draw(); });
  const sF = slider(ctl, { label: "Focal length |f|", min: 5, max: 30, step: 0.5, value: F, unit: "cm", fmt: v => fmt(v, 1) }, v => { F = v; draw(); });
  const sU = slider(ctl, { label: "Object distance |u|", min: 2, max: 100, step: 0.5, value: U, unit: "cm", fmt: v => fmt(v, 1) }, v => { U = v; inf = false; draw(); });
  const nH = numInput(ctl, { label: "Object height h", value: hObj, min: 0.1, max: 50, step: 0.1, unit: "cm" }, v => { hObj = v; draw(); });
  const pre = chipRow(stage);
  const showRow = chipRow(stage, "Show");
  const rayItems = isMirror
    ? [["r1", "Ray 1: parallel to axis"], ["r2", "Ray 2: through F"], ["r3", "Ray 3: through C"], ["r4", "Ray 4: to the pole P"]]
    : [["r1", "Ray 1: parallel to axis"], ["r2", "Ray 2: through F₁"], ["r3", "Ray 3: through O"]];
  const rayT = toggles(showRow, rayItems, rays, () => draw());
  const showItems = [["labels", "Names of points"], ["sign", "Sign convention"]];
  if (!isMirror) showItems.push(["cover", "Cover the upper half of the lens"]);
  const showT = toggles(showRow, showItems, show, () => draw());
  const ro = readouts(stage);
  const tblWrap = h("div");
  stage.append(tblWrap);
  let tbl = null, tblType = null, last = null;

  const converging = () => (isMirror ? type === "concave" : type === "convex");
  const table = () => (isMirror ? (type === "concave" ? T91 : T92) : (type === "convex" ? T94 : T95));
  function region() {
    if (inf) return 0;
    if (!converging()) return 1;
    const e = 1e-9;
    if (U > 2 * F + e) return 1;
    if (Math.abs(U - 2 * F) <= e) return 2;
    if (U > F + e) return 3;
    if (Math.abs(U - F) <= e) return 4;
    return 5;
  }
  function onType() {
    const conv = converging();
    rayT.btns.r2.textContent = isMirror ? (conv ? "Ray 2: through F" : "Ray 2: towards F") : (conv ? "Ray 2: through F₁" : "Ray 2: towards F₂");
    if (isMirror) rayT.btns.r3.textContent = conv ? "Ray 3: through C" : "Ray 3: towards C";
    buildPresets();
    if (tblType !== type) {
      tblWrap.replaceChildren();
      tbl = ncertTable(tblWrap, table());
      tblType = type;
    }
  }
  function syncU() { if (inf) sU.show("At infinity (∞)"); else sU.value = U; }
  function buildPresets() {
    pre.replaceChildren(h("span", { class: "presets-label" }, "Place object"));
    const names = table().rows.map(r => r[0]);
    if (converging()) {
      const k = [0, 2.6, 2, 1.5, 1, 0.5];
      names.forEach((nm, j) => chip(pre, nm, () => {
        if (j === 0) inf = true;
        else { inf = false; U = clamp(Math.round(F * k[j] * 2) / 2, 2, 100); }
        syncU(); draw();
      }));
    } else {
      chip(pre, names[0], () => { inf = true; syncU(); draw(); });
      chip(pre, `Far from the ${word}`, () => { inf = false; U = clamp(Math.round(F * 3 * 2) / 2, 2, 100); syncU(); draw(); });
      chip(pre, `Close to the ${word}`, () => { inf = false; U = clamp(Math.round(F * 0.5 * 2) / 2, 2, 100); syncU(); draw(); });
    }
  }

  function solve() {
    const conv = converging();
    const f = isMirror ? (conv ? -F : F) : (conv ? F : -F);
    if (inf) return { f, u: -Infinity, v: f, m: 0, atInf: false, real: isMirror ? f < 0 : f > 0 };
    const u = -U;
    const inv = isMirror ? 1 / f - 1 / u : 1 / f + 1 / u;
    const atInf = Math.abs(inv) < 1e-9;
    const v = atInf ? Infinity : 1 / inv;
    const m = atInf ? Infinity : (isMirror ? -v / u : v / u);
    const real = isMirror ? v < 0 : v > 0;
    return { f, u, v, m, atInf, real, inv };
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w: W, h: H } = cv;
    if (!W) return;
    const p = pal();
    ctx.clearRect(0, 0, W, H);
    const conv = converging();
    const st = solve();
    const small = W < 560 ? 11 : 12;
    const reg = region();
    const row = table().rows[reg];

    /* ---- layout: horizontal extent in cm on each side of the pole / optical centre ---- */
    // The view zooms out to include the image, up to 12 focal lengths. An image farther away than
    // that (object very close to F) is not drawn; the view then stays on the object and the element.
    const capV = Math.max(12 * F, inf ? 0 : U);
    const imgShown = !inf && !st.atInf && Math.abs(st.v) <= capV;
    let left, right;
    if (isMirror) {
      if (inf) { left = conv ? 2.4 * F : 1.6 * F; right = conv ? 0.3 * F : 2.35 * F; }
      else {
        left = Math.max(U, conv ? 2.15 * F : 0.6 * F);
        right = conv ? 0.3 * F : 2.25 * F;
        if (imgShown) { if (st.real) left = Math.max(left, -st.v); else right = Math.max(right, st.v); }
      }
    } else {
      if (inf) { left = 2.3 * F; right = 2.4 * F; }
      else {
        left = Math.max(U, 2.15 * F); right = 2.25 * F;
        if (imgShown) { if (st.real) right = Math.max(right, st.v); else left = Math.max(left, -st.v); }
      }
    }
    const mL = 34, mR = 34;
    const sx = (W - mL - mR) / (left + right);
    const x0 = mL + left * sx;
    const ay = Math.round(H * 0.5);
    const E = H * 0.41;                                   // half-height of the mirror / lens
    let ho = Math.min(H * 0.22, 66);
    if (imgShown) ho = Math.min(ho, (E * 0.92) / Math.max(1, Math.abs(st.m)));
    if (isMirror && !inf) {
      // keep the ray through C on the mirror, unless that would make the object too small
      const xC = 2 * st.f, k3 = Math.abs(xC / (xC - st.u));
      const h3 = (E * 0.95) / k3;
      if (h3 >= Math.max(22, H * 0.065)) ho = Math.min(ho, h3);
    }
    ho = Math.max(ho, 9);
    const X = cm => x0 + cm * sx;

    /* ---- the mirror or lens ---- */
    const sag = isMirror ? Math.min(12, E * 0.07) : 0;
    const Rd = isMirror ? (E * E + sag * sag) / (2 * sag) : 0;
    const surf = y => (isMirror ? (type === "concave" ? -1 : 1) * (Rd - Math.sqrt(Math.max(0, Rd * Rd - (y - ay) * (y - ay)))) : 0);
    line(ctx, 0, ay, W, ay, p.soft, 1, [6, 5]);
    if (isMirror) {
      const a = Math.asin(E / Rd);
      const cxa = type === "concave" ? x0 - Rd : x0 + Rd;
      const a0 = type === "concave" ? -a : Math.PI - a, a1 = type === "concave" ? a : Math.PI + a;
      ctx.save(); ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(cxa, ay, Rd, a0, a1); ctx.stroke();
      ctx.lineWidth = 1.2;
      for (let k = 0; k <= 16; k++) {
        const th = lerp(a0, a1, k / 16);
        const px = cxa + Rd * Math.cos(th), py = ay + Rd * Math.sin(th);
        ctx.beginPath(); ctx.moveTo(px + 2, py); ctx.lineTo(px + 9, py - 7); ctx.stroke();
      }
      ctx.restore();
    } else {
      const t = 13;
      ctx.save(); ctx.beginPath();
      if (type === "convex") {
        ctx.moveTo(x0, ay - E); ctx.quadraticCurveTo(x0 + t * 2, ay, x0, ay + E); ctx.quadraticCurveTo(x0 - t * 2, ay, x0, ay - E);
      } else {
        ctx.moveTo(x0 - t, ay - E); ctx.lineTo(x0 + t, ay - E); ctx.quadraticCurveTo(x0 - t * 0.5, ay, x0 + t, ay + E);
        ctx.lineTo(x0 - t, ay + E); ctx.quadraticCurveTo(x0 + t * 0.5, ay, x0 - t, ay - E);
      }
      ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(110,180,240,0.18)" : "rgba(70,150,215,0.16)"; ctx.fill();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      if (show.cover) {
        ctx.save(); ctx.fillStyle = p.dark ? "#05070b" : "#1b1f2a"; ctx.globalAlpha = 0.92;
        roundRect(ctx, x0 - 17, ay - E - 4, 34, E + 4, 4); ctx.fill(); ctx.restore();
        label(ctx, "Black paper", x0 + 22, ay - E * 0.75, { color: p.soft, size: small, align: "left" });
      }
    }

    /* ---- points on the principal axis ---- */
    const pts = isMirror
      ? [[X(st.f), "F"], [X(2 * st.f), "C"]]
      : [[X(-F), "F₁"], [X(-2 * F), "2F₁"], [X(F), "F₂"], [X(2 * F), "2F₂"]];
    for (const [x, t] of pts) if (x > 6 && x < W - 6) { line(ctx, x, ay - 5, x, ay + 5, p.text, 2); label(ctx, t, x, ay + 17, { color: p.text, size: 13 }); }
    label(ctx, isMirror ? "P" : "O", x0 + (isMirror ? 12 : 13), ay + 17, { color: p.text, size: 13 });

    /* ---- rays ---- */
    const drawn = [];
    const Fout = isMirror ? X(st.f) : X(conv ? F : -F);   // focus related to the parallel ray after reflection / refraction
    const Fin = isMirror ? X(st.f) : X(conv ? -F : F);    // focus related to ray 2 before the element
    const Cx = X(2 * st.f);
    const back = isMirror ? -1 : 1;
    const blocked = y => !isMirror && show.cover && y < ay - 0.5;
    const labelIn = (t, x, y, o) => { const hw = textWidth(ctx, t, o.size, o.weight || 600) / 2 + 6; label(ctx, t, clamp(x, hw, W - hw), y, o); };
    const edgeX0 = 0, edgeX1 = W;

    // point where a line from (xa,ya) with slope k meets the mirror surface (or the lens plane)
    function meet(xa, ya, k) {
      let x = x0, y = ya + k * (x0 - xa);
      for (let n = 0; n < 4; n++) { x = x0 + surf(y); y = ya + k * (x - xa); }
      return [x, y];
    }
    let xo = 0, yo = 0, xi = 0, yi = 0;
    if (inf) {
      const hs = [-0.62, -0.3, 0.3, 0.62].map(k => ay + k * E);
      const imgX = isMirror ? X(st.f) : X(st.f);
      hs.forEach(y => {
        const xh = x0 + surf(y);
        if (blocked(y)) { drawRay(ctx, edgeX0, y, xh - 16, y, p.r1, { width: 2 }); return; }
        drawRay(ctx, edgeX0, y, xh, y, p.r1, { width: 2 });
        let dir;
        if (conv) dir = [imgX - xh, ay - y];
        else dir = [xh - imgX, y - ay];
        const [ex, ey] = toEdge(xh, y, dir[0], dir[1], edgeX1, H, edgeX0, 0);
        drawRay(ctx, xh, y, ex, ey, p.r1, { width: 2 });
        if (!conv) line(ctx, xh, y, imgX, ay, p.r1, 1.5, [5, 5], 0.85);
      });
      circle(ctx, imgX, ay, 5.5, p.img, p.surface, 1.5);
      labelIn("Image (point-sized)", imgX, ay - 16, { color: p.img, size: 13, bg: p.surface2 });
      label(ctx, "Parallel rays from an object at infinity", 10, 14, { color: p.soft, size: small, align: "left" });
      drawn.push([p.r1, "Rays parallel to the principal axis"]);
    } else {
      xo = X(st.u); yo = ay - ho;
      if (!st.atInf) { xi = X(st.v); yi = ay - st.m * ho; }
      const outDir = (xh, yh, rule) => {
        if (st.atInf) return rule;
        return st.real ? [xi - xh, yi - yh] : [xh - xi, yh - yi];
      };
      const names = isMirror
        ? { r1: "Parallel to axis", r2: conv ? "Through F" : "Towards F", r3: conv ? "Through C" : "Towards C", r4: "To the pole P" }
        : { r1: "Parallel to axis", r2: conv ? "Through F₁" : "Towards F₂", r3: "Through O" };
      const list = [], skipped = [];
      const edgeNote = isMirror ? "it would meet the mirror beyond its edge" : "it would meet the lens beyond its edge";
      // Ray 1: parallel to the principal axis
      if (rays.r1) {
        const xh = x0 + surf(yo), yh = yo;
        const rule = conv ? [Fout - xh, ay - yh] : [xh - Fout, yh - ay];
        list.push({ c: p.r1, xh, yh, dir: outDir(xh, yh, rule), extra: conv ? null : [Fout, ay], name: "r1" });
      }
      // Ray 2: through F (or towards F), comes out parallel
      if (rays.r2) {
        if (Math.abs(Fin - xo) <= 0.5 || st.atInf) skipped.push(`Ray 2 is not used when the object is at ${isMirror ? "F" : "F₁"}`);
        else if (Math.abs(yi - ay) > E) skipped.push(`Ray 2 not drawn: ${edgeNote}`);
        else {
          const yh = yi, xh = x0 + surf(yh);
          let pre = null, post = null;
          if (conv && U < F) pre = [Fin, ay];          // seems to come from F
          if (!conv) post = [Fin, ay];                  // aimed at F on the far side
          list.push({ c: p.r2, xh, yh, dir: outDir(xh, yh, [back, 0]), pre, post, name: "r2" });
        }
      }
      // Ray 3 (mirror): through C (or towards C), reflected back along the same path
      if (isMirror && rays.r3) {
        if (Math.abs(Cx - xo) <= 0.5) skipped.push("Ray 3 is not used when the object is at C");
        else {
          const k = (ay - yo) / (Cx - xo);
          const [xh, yh] = meet(xo, yo, k);
          if (Math.abs(yh - ay) > E) skipped.push(`Ray 3 not drawn: ${edgeNote}`);
          else {
            let pre = null, post = null;
            if (conv && U < 2 * F) pre = [Cx, ay];
            if (!conv) post = [Cx, ay];
            list.push({ c: p.r3, xh, yh, dir: [-(xh - xo), -(yh - yo)], pre, post, name: "r3" });
          }
        }
      }
      // Lens ray 3 / mirror ray 4: through the optical centre / to the pole
      const r4on = isMirror ? rays.r4 : rays.r3;
      if (r4on) {
        const dx = x0 - xo, dy = ay - yo;
        const dir = isMirror ? [-dx, dy] : [dx, dy];
        list.push({ c: isMirror ? p.r4 : p.r3, xh: x0, yh: ay, dir: st.atInf ? dir : outDir(x0, ay, dir), name: isMirror ? "r4" : "r3" });
      }
      for (const r of list) {
        if (r.pre) line(ctx, r.pre[0], r.pre[1], xo, yo, r.c, 1.5, [5, 5], 0.85);
        if (blocked(r.yh)) {
          const tt = Math.max(0, 1 - 18 / Math.max(1, Math.abs(r.xh - xo)));
          drawRay(ctx, xo, yo, lerp(xo, r.xh, tt), lerp(yo, r.yh, tt), r.c, { width: 2 });
          continue;
        }
        drawRay(ctx, xo, yo, r.xh, r.yh, r.c, { width: 2 });
        if (r.post) line(ctx, r.xh, r.yh, r.post[0], r.post[1], r.c, 1.5, [5, 5], 0.85);
        const [ex, ey] = toEdge(r.xh, r.yh, r.dir[0], r.dir[1], edgeX1, H, edgeX0, 0);
        drawRay(ctx, r.xh, r.yh, ex, ey, r.c, { width: 2 });
        if (r.extra) line(ctx, r.xh, r.yh, r.extra[0], r.extra[1], r.c, 1.5, [5, 5], 0.85);
        if (!st.atInf && !st.real) line(ctx, r.xh, r.yh, xi, yi, r.c, 1.5, [5, 5], 0.85);
      }
      // more rays through the lower half when the upper half is covered
      if (!isMirror && show.cover) {
        [0.3, 0.55, 0.8].forEach(k => {
          const yl = ay + k * E;
          drawRay(ctx, xo, yo, x0, yl, p.beam, { width: 1.8 });
          const dir = st.atInf ? [x0 - xo, ay - yo] : (st.real ? [xi - x0, yi - yl] : [x0 - xi, yl - yi]);
          const [ex, ey] = toEdge(x0, yl, dir[0], dir[1], edgeX1, H, edgeX0, 0);
          drawRay(ctx, x0, yl, ex, ey, p.beam, { width: 1.8 });
          if (!st.atInf && !st.real) line(ctx, x0, yl, xi, yi, p.beam, 1.2, [5, 5], 0.8);
        });
      }
      list.forEach(r => drawn.push([r.c, names[r.name]]));
      if (!isMirror && show.cover) drawn.push([p.beam, "Rays through the lower half"]);
      skipped.forEach((t, j) => label(ctx, t, 10, (show.sign ? 140 : 14) + j * 20, { color: p.soft, size: small, align: "left", bg: p.surface2 }));

      // object
      vArrow(ctx, xo, ay, yo, p.obj, { width: 3.5 });
      labelIn("Object", xo, yo - 12, { color: p.obj, size: 13 });
      // image
      if (st.atInf) {
        label(ctx, "Image at infinity (rays come out parallel)", W - 10, ay + (H / 2) * 0.82, { color: p.img, size: 13, align: "right", bg: p.surface2 });
      } else {
        const alpha = !isMirror && show.cover ? 0.55 : 1;
        if (xi > 2 && xi < W - 2) {
          const yClip = clamp(yi, 4, H - 4);
          vArrow(ctx, xi, ay, yClip, p.img, { width: 3.5, dash: st.real ? null : [6, 4], alpha });
          const ly = clamp(st.m > 0 ? yClip - 12 : yClip + 14, 10, H - 10);
          labelIn(st.real ? "Image" : "Image (virtual)", xi, ly, { color: p.img, size: 13, bg: p.surface2 });
        } else {
          const atLeft = xi <= 2;
          const where = `Image is ${fmt(Math.abs(st.v), 1)} cm from ${isMirror ? "P" : "O"}`, fF = isMirror ? "F" : "F₁";
          const msg = W < 760 ? [`${where}, off the screen`, `Move the object away from ${fF} to see it`]
            : [`${where}, too far to fit. Move the object away from ${fF} to bring it back.`];
          msg.forEach((t, j) => label(ctx, j === 0 ? (atLeft ? "← " : "") + t + (atLeft ? "" : " →") : t, atLeft ? 10 : W - 10, H - 36 - (msg.length - 1 - j) * 19,
            { color: p.img, size: W < 560 ? 11 : 13, weight: 700, align: atLeft ? "left" : "right", bg: p.surface2 }));
        }
      }
    }

    /* ---- names of points ---- */
    if (show.labels) {
      const lc = p.accent;
      if (isMirror) {
        label(ctx, "Pole (P)", x0 + 8, ay - 12, { color: lc, size: small, align: "left", weight: 700, bg: p.surface2 });
        const Fx = X(st.f), Cc = X(2 * st.f);
        if (Fx > 6 && Fx < W - 6) label(ctx, "Principal focus (F)", Fx, ay + 34, { color: lc, size: small, weight: 700, bg: p.surface2 });
        if (Cc > 6 && Cc < W - 6) label(ctx, "Centre of curvature (C)", Cc, ay - 14, { color: lc, size: small, weight: 700, bg: p.surface2 });
        label(ctx, "Principal axis", 8, ay - 10, { color: lc, size: small, align: "left", weight: 700 });
        const yd = ay + 52, yd2 = ay + 70;
        if (Fx > 6 && Fx < W - 6) { line(ctx, Fx, yd, x0, yd, lc, 1.3); head(ctx, Fx, yd, Fx < x0 ? Math.PI : 0, 7, lc); head(ctx, x0, yd, Fx < x0 ? 0 : Math.PI, 7, lc); label(ctx, "focal length f", (Fx + x0) / 2, yd - 9, { color: lc, size: small }); }
        if (Cc > 6 && Cc < W - 6) { line(ctx, Cc, yd2, x0, yd2, lc, 1.3); head(ctx, Cc, yd2, Cc < x0 ? Math.PI : 0, 7, lc); head(ctx, x0, yd2, Cc < x0 ? 0 : Math.PI, 7, lc); label(ctx, "radius of curvature R = 2f", (Cc + x0) / 2, yd2 + 11, { color: lc, size: small }); }
        const ax = x0 + 26;
        line(ctx, ax, ay - E, ax, ay + E, lc, 1.3); head(ctx, ax, ay - E, -Math.PI / 2, 7, lc); head(ctx, ax, ay + E, Math.PI / 2, 7, lc);
        label(ctx, "aperture", ax + 6, ay - E * 0.6, { color: lc, size: small, align: "left" });
      } else {
        label(ctx, "Optical centre (O)", x0 + 8, ay - 12, { color: lc, size: small, align: "left", weight: 700, bg: p.surface2 });
        label(ctx, "Principal axis", 8, ay - 10, { color: lc, size: small, align: "left", weight: 700 });
        const F2x = X(F), F1x = X(-F), yd = ay + 52;
        label(ctx, "Principal focus", F1x, ay + 34, { color: lc, size: small, weight: 700, bg: p.surface2 });
        label(ctx, "Principal focus", F2x, ay + 34, { color: lc, size: small, weight: 700, bg: p.surface2 });
        line(ctx, x0, yd, F2x, yd, lc, 1.3); head(ctx, F2x, yd, 0, 7, lc); head(ctx, x0, yd, Math.PI, 7, lc);
        label(ctx, "focal length f", (x0 + F2x) / 2, yd + 11, { color: lc, size: small });
        const ax = x0 + 24;
        line(ctx, ax, ay - E, ax, ay + E, lc, 1.3); head(ctx, ax, ay - E, -Math.PI / 2, 7, lc); head(ctx, ax, ay + E, Math.PI / 2, 7, lc);
        label(ctx, "aperture", ax + 6, ay - E * 0.6, { color: lc, size: small, align: "left" });
      }
    }

    /* ---- sign convention (as in NCERT Fig. 9.9) ---- */
    if (show.sign) {
      const c = p.accent, org = isMirror ? "P" : "O";
      const bw = 214, bh = 118, bx = 8, by = 8, cxo = bx + bw / 2, cyo = by + 58, L = 62;
      ctx.save(); ctx.globalAlpha = 0.94; roundRect(ctx, bx, by, bw, bh, 8); ctx.fillStyle = p.surface2; ctx.fill(); ctx.restore();
      ctx.save(); roundRect(ctx, bx, by, bw, bh, 8); ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      line(ctx, cxo - L, cyo, cxo + L, cyo, c, 2); head(ctx, cxo + L + 2, cyo, 0, 9, c); head(ctx, cxo - L - 2, cyo, Math.PI, 9, c);
      line(ctx, cxo, cyo - 38, cxo, cyo + 38, c, 2); head(ctx, cxo, cyo - 40, -Math.PI / 2, 9, c); head(ctx, cxo, cyo + 40, Math.PI / 2, 9, c);
      circle(ctx, cxo, cyo, 3.5, c);
      label(ctx, `${org} (origin)`, cxo + 6, cyo + 11, { color: c, size: 11, align: "left", weight: 700 });
      label(ctx, "+ right", cxo + L - 4, cyo - 11, { color: c, size: 11, align: "center", weight: 700 });
      label(ctx, "− left", cxo - L + 4, cyo - 11, { color: c, size: 11, align: "center", weight: 700 });
      label(ctx, "+ up", cxo + 8, cyo - 32, { color: c, size: 11, align: "left", weight: 700 });
      label(ctx, "− down", cxo + 8, cyo + 32, { color: c, size: 11, align: "left", weight: 700 });
      label(ctx, `Distances from ${org}`, cxo, by + 12, { color: c, size: 11, weight: 700 });
      label(ctx, "Incident light: left to right →", cxo, by + bh - 10, { color: c, size: 11, weight: 700 });
      if (!inf) {
        const yd = ay + E * 0.78;
        line(ctx, xo, yd, x0, yd, c, 1.3); head(ctx, xo, yd, Math.PI, 7, c);
        label(ctx, `u = ${fmt(st.u, 1)} cm`, (xo + x0) / 2, yd - 10, { color: c, size: small, weight: 700, bg: p.surface2 });
        const t1 = `h = +${fmt(hObj, 1)} cm`, leftOk = xo - 8 - textWidth(ctx, t1, small, 700) - 8 > 0;
        label(ctx, t1, leftOk ? xo - 8 : xo + 8, (ay + yo) / 2, { color: c, size: small, weight: 700, align: leftOk ? "right" : "left", bg: p.surface2 });
        if (!st.atInf && xi > 2 && xi < W - 2) {
          const yd2 = ay + E * 0.94;
          line(ctx, x0, yd2, xi, yd2, c, 1.3); head(ctx, xi, yd2, xi < x0 ? Math.PI : 0, 7, c);
          label(ctx, `v = ${sgnf(st.v, 1)} cm`, (xi + x0) / 2, yd2 - 10, { color: c, size: small, weight: 700, bg: p.surface2 });
          const t2 = `h′ = ${sgnf(st.m * hObj, 2)} cm`, tw2 = textWidth(ctx, t2, small, 700) + 12;
          const right = xi + 8 + tw2 < W;
          label(ctx, t2, right ? xi + 8 : xi - 8, (ay + clamp(yi, 4, H - 4)) / 2, { color: c, size: small, weight: 700, align: right ? "left" : "right", bg: p.surface2 });
        }
      }
    }

    /* ---- headline: NCERT table row ---- */
    const headline = `Image: ${row[1]} · ${row[2]} · ${row[3]}`;
    if (W >= 700) label(ctx, headline, W - 10, 14, { color: st.real ? p.r1 : p.r3, size: 13, align: "right", weight: 700, bg: p.surface2 });
    // legend
    if (drawn.length) {
      const widths = drawn.map(([, t]) => textWidth(ctx, t, small));
      const total = widths.reduce((a, b) => a + b + 37, 0) - 14 + 12;
      const ly0 = H - 13;
      if (total < W - 8) {
        roundRect(ctx, 4, ly0 - 10, total, 20, 6); ctx.fillStyle = p.surface2; ctx.fill();
        let lx = 10;
        drawn.forEach(([c, t], j) => { line(ctx, lx, ly0, lx + 18, ly0, c, 3); label(ctx, t, lx + 23, ly0, { color: p.soft, size: small, align: "left" }); lx += 23 + widths[j] + 14; });
      }
    }

    /* ---- readouts ---- */
    if (tbl) tbl.highlight(reg);
    const items = [];
    const P = 100 / st.f;
    if (inf) {
      items.push({ k: "Object distance u", v: "−∞ (at infinity)" });
      items.push({ k: "Image distance v", v: `${sgnf(st.v)} cm (= f)` });
      items.push({ k: "Focal length f", v: `${sgnf(st.f)} cm` });
      items.push({ k: "Magnification m", v: "≈ 0 (point-sized image)" });
    } else {
      items.push({ k: "Object distance u", v: `${fmt(st.u)} cm` });
      items.push({ k: "Image distance v", v: st.atInf ? "Infinity" : `${sgnf(st.v)} cm` });
      items.push({ k: "Focal length f", v: `${sgnf(st.f)} cm` });
      items.push({ k: "Magnification m", v: st.atInf ? "Very large" : sgnf(st.m, 2) });
      items.push({ k: "Object height h", v: `+${fmt(hObj, 1)} cm` });
      items.push({ k: "Image height h′ = m × h", v: st.atInf ? "Very large" : `${sgnf(st.m * hObj, 2)} cm` });
    }
    items.push(isMirror ? { k: "Radius of curvature R = 2f", v: `${sgnf(2 * st.f)} cm` } : { k: "Power P = 1/f (f in metres)", v: `${sgnf(P, 2)} D` });
    items.push({ k: "Position of the image (NCERT)", v: row[1] + (inf || st.atInf ? "" : `  (v = ${sgnf(st.v)} cm)`), wide: true });
    items.push({ k: "Size and nature (NCERT)", v: `${row[2]}; ${row[3]}`, wide: true });
    let work;
    const fstr = br(st.f), ustr = br(st.u);
    // 4 significant figures, so that the working reproduces v to the shown precision
    const sig = x => { if (Math.abs(x) < 1e-12) return "0"; let t = x.toPrecision(4); if (t.includes("e")) t = String(+t); return t.replace("-", CR.MINUS); };
    const sgb = x => (x < 0 ? `(${sig(x)})` : sig(x));
    if (inf) work = `Object at infinity: 1/u = 0, so 1/v = 1/f and v = f = ${sgnf(st.f)} cm.`;
    else if (isMirror) {
      work = `1/v + 1/u = 1/f  ⇒  1/v = 1/f − 1/u = 1/${fstr} − 1/${ustr} = ${sig(1 / st.f)} + ${sgb(-1 / st.u)} = ${st.atInf ? "0" : sig(st.inv)}`;
      work += st.atInf ? "  ⇒  1/v = 0, the image is at infinity." : `  ⇒  v = ${sgnf(st.v)} cm.   m = −v/u = −${br(st.v)}/${ustr} = ${sgnf(st.m, 2)}`;
    } else {
      work = `1/v − 1/u = 1/f  ⇒  1/v = 1/f + 1/u = 1/${fstr} + 1/${ustr} = ${sig(1 / st.f)} + ${sgb(1 / st.u)} = ${st.atInf ? "0" : sig(st.inv)}`;
      work += st.atInf ? "  ⇒  1/v = 0, the image is at infinity." : `  ⇒  v = ${sgnf(st.v)} cm.   m = v/u = ${br(st.v)}/${ustr} = ${sgnf(st.m, 2)}`;
    }
    items.push({ k: isMirror ? "Working (mirror formula)" : "Working (lens formula)", v: work, wide: true });
    if (!isMirror && show.cover) items.push({ k: "Half the lens covered", v: "A complete image is still formed by the rays through the uncovered half, but it is less bright.", wide: true });
    ro(items);
    last = { W, H, ay, E, ho, xo, yo, xi, yi, x0, reg, inf, v: st.v, m: st.m, atInf: st.atInf, real: st.real,
      offscreen: !inf && !st.atInf && !(xi > 2 && xi < W - 2) };
  }

  onType();
  syncU();
  return {
    info: () => last,
    set(o) {
      if (o.type) { type = o.type; typeSeg.set(type); onType(); }
      if (o.F != null) { F = o.F; sF.value = F; }
      if (o.inf) inf = true;
      else if (o.U != null) { inf = false; U = o.U; }
      if (o.h != null) { hObj = o.h; nH.set(hObj); }
      if (o.rays) { Object.assign(rays, o.rays); rayT.sync(); }
      ["labels", "sign", "cover"].forEach(k => { if (o[k] != null) show[k] = !!o[k]; });
      showT.sync();
      syncU();
      draw();
    }
  };
};

/* =================================================================
   9.3 Refraction: two media, rectangular glass slab, coin in water
   ================================================================= */
CR.sims.refraction = function (stage, opt = {}) {
  let mode = opt.mode || "interface", n1 = opt.n1 ?? 1.0003, n2 = opt.n2 ?? 1.52, nS = opt.nS ?? 1.52, iDeg = opt.i ?? 40;
  let level = opt.level ?? 0, nL = opt.nL ?? 1.33;
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.9, alt: "Refraction of light" });
  const ctl = controls(stage);
  const modeSeg = seg(ctl, { label: "Show", value: mode, options: [["interface", "Two media"], ["slab", "Rectangular glass slab"], ["coin", "Coin in water (Activities 9.7, 9.8)"]] }, v => { mode = v; sync(); draw(); });
  const opts = T93.map(([nm, n]) => [String(n), `${nm} (${nTxt(n)})`]);
  const s1 = select(ctl, { label: "Light goes from", options: opts, value: String(n1) }, v => { n1 = +v; draw(); });
  const s2 = select(ctl, { label: "into", options: opts, value: String(n2) }, v => { n2 = +v; draw(); });
  const s3 = select(ctl, { label: "Slab material", options: opts.slice(1), value: String(nS) }, v => { nS = +v; draw(); });
  const sI = slider(ctl, { label: "Angle of incidence i", min: 0, max: 85, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
  const sLev = slider(ctl, { label: "Water poured in", min: 0, max: 100, step: 1, value: level, unit: "%" }, v => { level = v; draw(); });
  const sLiq = select(ctl, { label: "Liquid", options: [["1.33", "Water (1.33)"], ["1.44", "Kerosene (1.44)"], ["1.47", "Turpentine oil (1.47)"]], value: String(nL) }, v => { nL = +v; draw(); });
  const ro = readouts(stage);
  const tblWrap = h("div");
  stage.append(tblWrap);
  const tbl = ncertTable(tblWrap, {
    caption: "Table 9.3  Absolute refractive index of some material media",
    head: ["Material medium", "Refractive index", "Speed of light in it (c/n)"],
    rows: T93.map(([nm, n]) => [nm, nTxt(n), `${(3 / n).toFixed(2)} × 10⁸ m/s`]),
    note: "The speed column is worked out here as v = c/n with c = 3 × 10⁸ m/s; it is not part of the NCERT table."
  });
  function sync() {
    const coin = mode === "coin";
    s1.el.style.display = s2.el.style.display = mode === "interface" ? "" : "none";
    s3.el.style.display = mode === "slab" ? "" : "none";
    sI.el.style.display = coin ? "none" : "";
    sLev.el.style.display = sLiq.el.style.display = coin ? "" : "none";
    tblWrap.style.display = coin ? "none" : "";
  }
  sync();
  const tint = n => `rgba(70,150,215,${(0.03 + 0.3 * (n - 1) / 1.42).toFixed(3)})`;
  const nameOf = n => (T93.find(r => r[1] === n) || ["Medium"])[0];

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const i = iDeg * DEG;
    if (mode === "interface") {
      const a = n1, b = n2, ox = w / 2, oy = H / 2;
      ctx.fillStyle = tint(a); ctx.fillRect(0, 0, w, oy);
      ctx.fillStyle = tint(b); ctx.fillRect(0, oy, w, H - oy);
      line(ctx, 0, oy, w, oy, p.glassEdge, 2);
      label(ctx, `${nameOf(a)}   n₁ = ${nTxt(a)}`, 12, 16, { color: p.text, size: 14, align: "left" });
      label(ctx, `${nameOf(b)}   n₂ = ${nTxt(b)}`, 12, H - 16, { color: p.text, size: 14, align: "left" });
      line(ctx, ox, oy - H * 0.46, ox, oy + H * 0.46, p.soft, 1.5, [6, 5]);
      label(ctx, "Normal", ox + 6, 14, { color: p.soft, size: 12, align: "left" });
      const L = Math.min(w * 0.45, H * 0.46);
      drawRay(ctx, ox - L * Math.sin(i), oy - L * Math.cos(i), ox, oy, p.beam, { width: 3.5 });
      const sr = a * Math.sin(i) / b;
      const tir = sr > 1;
      drawRay(ctx, ox, oy, ox + L * Math.sin(i), oy - L * Math.cos(i), p.beam, { width: tir ? 3.5 : 1.5, alpha: tir ? 1 : 0.35 });
      arcAngle(ctx, ox, oy, 40, -Math.PI / 2 - i, -Math.PI / 2, p.text, "i");
      let r = null;
      if (!tir) {
        r = Math.asin(sr);
        drawRay(ctx, ox, oy, ox + L * Math.sin(r), oy + L * Math.cos(r), p.beam, { width: 3.5 });
        arcAngle(ctx, ox, oy, 40, Math.PI / 2 - r, Math.PI / 2, p.text, "r");
        if (iDeg > 0 && Math.abs(r - i) > 0.002) line(ctx, ox, oy, ox + L * 0.7 * Math.sin(i), oy + L * 0.7 * Math.cos(i), p.soft, 1.3, [4, 5]);
      } else {
        label(ctx, "No refracted ray: total internal reflection (Class 12 topic)", w / 2, oy + H * 0.25, { color: p.warn, size: 13, bg: p.surface });
      }
      const bend = iDeg === 0 ? "Goes straight along the normal (no bending)"
        : a === b ? "Same medium: no bending"
        : b > a ? "Rarer to denser: it slows down and bends towards the normal" : "Denser to rarer: it speeds up and bends away from the normal";
      tbl.highlight([T93.findIndex(r2 => r2[1] === a), T93.findIndex(r2 => r2[1] === b)]);
      ro([
        { k: "Angle of incidence i", v: `${iDeg}°` },
        { k: "Angle of refraction r", v: tir ? "—" : `${fmt(r / DEG, 1)}°` },
        { k: "n₂₁ = n₂ / n₁ = v₁ / v₂", v: fmt(b / a, 3) },
        { k: "sin i / sin r", v: iDeg === 0 || tir ? "—" : fmt(Math.sin(i) / Math.sin(r), 3) },
        { k: "Speed in medium 1 = c / n₁", v: `${fmt(3 / a, 2)} × 10⁸ m/s` },
        { k: "Speed in medium 2 = c / n₂", v: `${fmt(3 / b, 2)} × 10⁸ m/s` },
        { k: "What happens", v: tir ? "Light is totally reflected back into medium 1" : bend, wide: true }
      ]);
    } else if (mode === "slab") {
      const n = nS, y1 = H * 0.34, y2 = H * 0.68, T = y2 - y1, sxL = w * 0.06, sxR = w * 0.94;
      ctx.fillStyle = tint(n); ctx.fillRect(sxL, y1, sxR - sxL, T);
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.strokeRect(sxL, y1, sxR - sxL, T);
      label(ctx, `${nameOf(n)} slab  (n = ${nTxt(n)})`, sxR - 8, y1 + 16, { color: p.text, size: 13, align: "right" });
      label(ctx, "Air", 12, 16, { color: p.soft, size: 13, align: "left" });
      label(ctx, "Air", 12, H - 16, { color: p.soft, size: 13, align: "left" });
      const ox = w * 0.34, oy = y1, r = Math.asin(Math.sin(i) / n), bx = ox + T * Math.tan(r), by = y2;
      line(ctx, ox, oy - H * 0.2, ox, oy + H * 0.16, p.soft, 1.3, [5, 5]);
      line(ctx, bx, by - H * 0.16, bx, by + H * 0.2, p.soft, 1.3, [5, 5]);
      const L = H * 0.3, ext = L + T / Math.max(Math.cos(i), 0.15);
      line(ctx, ox, oy, ox + ext * Math.sin(i), oy + ext * Math.cos(i), p.soft, 1.5, [4, 5]);
      drawRay(ctx, ox - L * Math.sin(i), oy - L * Math.cos(i), ox, oy, p.beam, { width: 3.5 });
      drawRay(ctx, ox, oy, bx, by, p.beam, { width: 3.5 });
      const [ex, ey] = toEdge(bx, by, Math.sin(i), Math.cos(i), w, H);
      drawRay(ctx, bx, by, ex, ey, p.beam, { width: 3.5 });
      label(ctx, "Incident ray", ox - L * Math.sin(i) * 0.6 - 8, oy - L * Math.cos(i) * 0.6, { color: p.text, size: 12, align: "right" });
      label(ctx, "Emergent ray", lerp(bx, ex, 0.5) + 10, lerp(by, ey, 0.5), { color: p.text, size: 12, align: "left" });
      const u0 = Math.sin(i), u1 = Math.cos(i), tt = (bx - ox) * u0 + (by - oy) * u1, qx = ox + u0 * tt, qy = oy + u1 * tt;
      if (iDeg > 2) {
        line(ctx, bx, by, qx, qy, p.accent, 3);
        label(ctx, "lateral shift", (bx + qx) / 2 + 12, (by + qy) / 2 + 2, { color: p.accent, size: 12, weight: 700, align: "left" });
      }
      arcAngle(ctx, ox, oy, 36, -Math.PI / 2 - i, -Math.PI / 2, p.text, "i");
      arcAngle(ctx, ox, oy, 36, Math.PI / 2 - r, Math.PI / 2, p.text, "r");
      arcAngle(ctx, bx, by, 36, Math.PI / 2 - i, Math.PI / 2, p.text, "e");
      const d = 5 * Math.sin(i - r) / Math.cos(r);
      tbl.highlight([0, T93.findIndex(r2 => r2[1] === n)]);
      ro([
        { k: "Angle of incidence i", v: `${iDeg}°` },
        { k: "Angle of refraction r", v: `${fmt(r / DEG, 1)}°` },
        { k: "Angle of emergence e", v: `${iDeg}° (equal to i)` },
        { k: "Lateral shift (slab 5 cm thick)", v: `${fmt(d, 2)} cm` },
        { k: "Key idea", v: "At the air-glass face the ray bends towards the normal; at the glass-air face it bends away from the normal by an equal amount. So the emergent ray is parallel to the incident ray, shifted sideways.", wide: true }
      ]);
    } else {
      drawCoin(ctx, w, H, p);
    }
  }

  function drawCoin(ctx, w, H, p) {
    const xL = w * 0.16, xR = w * 0.6, yT = H * 0.32, yB = H * 0.8;
    const xc = xL + (xR - xL) * 0.16, yc = yB - 6;
    const rimX = xR, rimY = yT;
    const t = 0.42, eyeX = Math.min(w - 30, rimX + t * (rimX - xc)), eyeY = Math.max(24, rimY + t * (rimY - yc)) + 9;
    const yW = yB - (level / 100) * (yB - yT) * 0.96;
    // bowl
    if (level > 0) { ctx.fillStyle = "rgba(70,150,215,0.30)"; ctx.fillRect(xL, yW, xR - xL, yB - yW); line(ctx, xL, yW, xR, yW, p.glassEdge, 1.5); }
    ctx.save(); ctx.strokeStyle = p.text; ctx.lineWidth = 4; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(xL, yT); ctx.lineTo(xL, yB); ctx.lineTo(xR, yB); ctx.lineTo(xR, yT); ctx.stroke(); ctx.restore();
    // coin
    ctx.fillStyle = "#d4a017"; roundRect(ctx, xc - 14, yc - 3, 28, 6, 3); ctx.fill();
    label(ctx, "Coin", xc, yB + 14, { color: p.text, size: 12 });
    // eye
    ctx.save(); ctx.translate(eyeX, eyeY); ctx.rotate(Math.atan2(yc - eyeY, xc - eyeX) + Math.PI);
    ctx.strokeStyle = p.text; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, -4, 0, 3.2, p.text); ctx.restore();
    label(ctx, "Eye", eyeX, eyeY - 18, { color: p.soft, size: 12 });
    let visible = false, xs = 0, yApp = yc;
    if (level <= 0 || yW >= yc - 4) {
      const yAtRim = yc + (rimX - xc) * (eyeY - yc) / (eyeX - xc);
      visible = yAtRim <= rimY;
      drawRay(ctx, xc, yc - 3, rimX, Math.max(yAtRim, rimY - 1), p.r1, { width: 2, alpha: 0.9 });
      if (!visible) { line(ctx, rimX - 6, rimY - 6, rimX + 6, rimY + 6, p.warn, 3); line(ctx, rimX - 6, rimY + 6, rimX + 6, rimY - 6, p.warn, 3); }
      else drawRay(ctx, rimX, yAtRim, eyeX, eyeY, p.r1, { width: 2 });
    } else {
      // refracted path coin → surface point → eye (Snell's law, solved by bisection)
      let a = xc + 0.01, b = eyeX - 0.01;
      const f = x => nL * (x - xc) / Math.hypot(x - xc, yW - yc) - (eyeX - x) / Math.hypot(eyeX - x, eyeY - yW);
      for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (f(m) > 0) b = m; else a = m; }
      xs = (a + b) / 2;
      const yAtRim = yW + (rimX - xs) * (eyeY - yW) / (eyeX - xs);
      visible = xs <= rimX && yAtRim <= rimY;
      const tt = (xc - xs) / (xs - eyeX);
      yApp = yW + tt * (yW - eyeY);
      if (xs <= rimX) {
        drawRay(ctx, xc, yc - 3, xs, yW, p.r1, { width: 2 });
        if (visible) {
          drawRay(ctx, xs, yW, eyeX, eyeY, p.r1, { width: 2 });
          line(ctx, xs, yW, xc, yApp, p.r1, 1.5, [5, 5], 0.85);
          line(ctx, xs, yW - 40, xs, yW + 40, p.soft, 1.2, [4, 4]);
          ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = "#d4a017"; roundRect(ctx, xc - 14, yApp - 3, 28, 6, 3); ctx.fill(); ctx.restore();
          label(ctx, "Coin appears here (raised)", xc + 20, yApp - 12, { color: p.img, size: 12, align: "left", bg: p.surface2 });
        } else {
          drawRay(ctx, xs, yW, rimX, Math.max(yAtRim, rimY), p.r1, { width: 2, alpha: 0.9 });
          line(ctx, rimX - 6, rimY - 6, rimX + 6, rimY + 6, p.warn, 3); line(ctx, rimX - 6, rimY + 6, rimX + 6, rimY - 6, p.warn, 3);
        }
      } else {
        drawRay(ctx, xc, yc - 3, rimX, yc - 3 + (rimX - xc) * (yW - yc) / (xs - xc), p.r1, { width: 2, alpha: 0.9 });
      }
    }
    label(ctx, visible ? "The coin can be seen" : "The coin is hidden by the edge of the bowl", w - 10, H - 14,
      { color: visible ? p.ok : p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    ro([
      { k: "Liquid poured in", v: level ? `${level}% (n = ${nL.toFixed(2)})` : "None yet" },
      { k: "Can the eye see the coin?", v: visible ? "Yes" : "No", tone: visible ? "good" : "bad" },
      { k: "Why", v: level ? "Light from the coin bends away from the normal as it passes from water into air. The eye sees it coming from a point higher up, so the coin appears raised and comes into view." : "Light travels in straight lines, so the edge of the bowl blocks the light from the coin. Now pour water slowly.", wide: true },
      { k: "Try", v: "Compare water, kerosene and turpentine oil: the higher the refractive index, the more the coin appears raised.", wide: true }
    ]);
  }

  return {
    set(o) {
      if (o.mode) { mode = o.mode; modeSeg.set(mode); sync(); }
      if (o.n1 != null) { n1 = o.n1; s1.set(String(n1)); }
      if (o.n2 != null) { n2 = o.n2; s2.set(String(n2)); }
      if (o.nS != null) { nS = o.nS; s3.set(String(nS)); }
      if (o.i != null) { iDeg = o.i; sI.value = iDeg; }
      if (o.level != null) { level = o.level; sLev.value = level; }
      if (o.nL != null) { nL = o.nL; sLiq.set(String(nL)); }
      draw();
    }
  };
};

/* =================================================================
   9.3.8 Power of a lens, and lenses in contact
   ================================================================= */
CR.sims.lensPower = function (stage, opt = {}) {
  let P = opt.P ?? 2;
  const frame = (opt.frame || [2, 0.25]).slice();
  const cv = makeCanvas(stage, { ratio: 0.38, mratio: 0.7, min: 200, alt: "Power of a lens" });
  const ctl = controls(stage);
  const sP = slider(ctl, { label: "Power of the lens P", min: -5, max: 5, step: 0.25, value: P, unit: "D", fmt: v => (v > 0 ? "+" : "") + fmt(v, 2) }, v => { P = v; draw(); });
  const ro = readouts(stage);
  const fr = h("div", { class: "calc" });
  stage.append(fr);
  fr.append(h("h3", {}, "Lenses in contact: the optician's trial frame"));
  const listEl = h("p", { class: "calc-out" });
  const addRow = chipRow(fr, "Add a lens");
  [0.25, 0.5, 1, 2, -0.25, -0.5, -1, -2].forEach(v => chip(addRow, `${v > 0 ? "+" : "−"}${Math.abs(v)} D`, () => { frame.push(v); upd(); }));
  chip(addRow, "Remove last", () => { frame.pop(); upd(); });
  chip(addRow, "Clear", () => { frame.length = 0; upd(); });
  chip(addRow, "Show this lens above", () => { const t = frame.reduce((a, b) => a + b, 0); if (t !== 0) { P = clamp(t, -5, 5); sP.value = P; draw(); } });
  fr.append(listEl);
  function upd() {
    const t = frame.reduce((a, b) => a + b, 0);
    const parts = frame.map(v => `${v > 0 ? "+" : "−"}${Math.abs(v)} D`);
    listEl.textContent = frame.length
      ? `${parts.join("  +  ")}  =  ${t > 0 ? "+" : t < 0 ? "−" : ""}${fmt(Math.abs(t), 2)} D` + (t !== 0 ? `   →   f = 1/P = ${sgnf(1 / t, 2)} m, a ${t > 0 ? "convex (converging)" : "concave (diverging)"} lens` : "   →   no net power")
      : "No lenses in the frame yet.";
  }
  upd();
  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const ay = H / 2, x0 = w * 0.5, E = H * 0.38;
    line(ctx, 0, ay, w, ay, p.soft, 1, [6, 5]);
    if (P === 0) {
      label(ctx, "P = 0: no lens power", w / 2, ay - 20, { color: p.soft, size: 14 });
      ro([{ k: "Power", v: "0 D" }]);
      return;
    }
    const f = 1 / P;                                   // metres
    const s = (w * 0.42) / 2;                          // px per metre (2 m fits on one side)
    const conv = P > 0, t = 12;
    ctx.save(); ctx.beginPath();
    if (conv) { ctx.moveTo(x0, ay - E); ctx.quadraticCurveTo(x0 + t * 2, ay, x0, ay + E); ctx.quadraticCurveTo(x0 - t * 2, ay, x0, ay - E); }
    else { ctx.moveTo(x0 - t, ay - E); ctx.lineTo(x0 + t, ay - E); ctx.quadraticCurveTo(x0 - t * 0.5, ay, x0 + t, ay + E); ctx.lineTo(x0 - t, ay + E); ctx.quadraticCurveTo(x0 + t * 0.5, ay, x0 - t, ay - E); }
    ctx.closePath(); ctx.fillStyle = p.dark ? "rgba(110,180,240,0.18)" : "rgba(70,150,215,0.16)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    const Fx = x0 + f * s;
    [-0.6, -0.3, 0.3, 0.6].forEach(k => {
      const y = ay + k * E;
      drawRay(ctx, 0, y, x0, y, p.r1, { width: 2 });
      const dir = conv ? [Fx - x0, ay - y] : [x0 - Fx, y - ay];
      const [ex, ey] = toEdge(x0, y, dir[0], dir[1], w, H);
      drawRay(ctx, x0, y, ex, ey, p.r1, { width: 2 });
      if (!conv) line(ctx, x0, y, Fx, ay, p.r1, 1.4, [5, 5], 0.8);
    });
    line(ctx, Fx, ay - 6, Fx, ay + 6, p.text, 2);
    label(ctx, "F", Fx, ay + 18, { color: p.text, size: 13 });
    const yd = ay + E + 12;
    line(ctx, x0, yd, Fx, yd, p.accent, 1.4); head(ctx, Fx, yd, Fx > x0 ? 0 : Math.PI, 7, p.accent); head(ctx, x0, yd, Fx > x0 ? Math.PI : 0, 7, p.accent);
    label(ctx, `f = ${sgnf(f, 2)} m`, (x0 + Fx) / 2, yd - 10, { color: p.accent, size: 13, weight: 700, bg: p.surface2 });
    label(ctx, "Not to scale vertically", 10, H - 12, { color: p.soft, size: 11, align: "left" });
    ro([
      { k: "Power P", v: `${sgnf(P, 2)} D` },
      { k: "Focal length f = 1/P", v: `${sgnf(f, 2)} m = ${sgnf(f * 100, 1)} cm` },
      { k: "Type of lens", v: conv ? "Convex (converging): positive power" : "Concave (diverging): negative power" },
      { k: "Remember", v: "Power is the reciprocal of focal length in metres. 1 dioptre (1 D = 1 m⁻¹) is the power of a lens of focal length 1 m.", wide: true }
    ]);
  }
  return {
    set(o) {
      if (o.P != null) { P = o.P; sP.value = P; }
      if (o.frame) { frame.length = 0; frame.push(...o.frame); upd(); }
      draw();
    }
  };
};
})();
