/* ============================================================
   Class 10 Physics Classroom
   Interactive simulations for NCERT Class 10 physics
   (Chapters 9–12) with teaching tools.
   Plain JavaScript, no libraries.
   ============================================================ */
"use strict";
(function () {

/* ---------------------------------------------------------------
   1. Small helpers
   --------------------------------------------------------------- */
const $ = (s, el = document) => el.querySelector(s);

function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) {
    for (const k in props) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const DEG = Math.PI / 180;
const MINUS = "−";

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
};

function fmt(x, d = 1) {
  if (!isFinite(x)) return x > 0 ? "∞" : MINUS + "∞";
  let s = (Math.abs(x) < 0.5 * Math.pow(10, -d) ? 0 : x).toFixed(d);
  if (s[0] === "-") s = MINUS + s.slice(1);
  return s;
}
function sgnf(x, d = 1) {
  const s = fmt(x, d);
  return (x > 0 && isFinite(x) && s !== fmt(0, d) ? "+" : "") + s;
}
const SUP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function sci(x, d = 2) {
  if (x === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; e += 1; }
  return `${fmt(m, d)} × 10${String(e).split("").map(c => SUP[c]).join("")}`;
}
function nice(x) {
  if (!isFinite(x)) return "∞";
  const a = Math.abs(x);
  if (a === 0) return "0";
  if (a >= 0.01 && a < 1e5) return String(+x.toPrecision(3)).replace("-", MINUS);
  return sci(x, 2);
}

/* ---------------------------------------------------------------
   2. Theme colours and canvas drawing helpers
   --------------------------------------------------------------- */
const FONT = '"Source Sans 3", system-ui, sans-serif';
let fontScale = clamp(+store.get("cls-fs", 1) || 1, 0.8, 1.6);

function pal() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  return {
    text: g("--text"), soft: g("--text-soft"), border: g("--border"), surface: g("--surface"),
    surface2: g("--surface-2"), accent: g("--accent"), r1: g("--ray1"), r2: g("--ray2"), r3: g("--ray3"),
    beam: g("--beam"), obj: g("--object"), img: g("--image"), glassEdge: g("--glass-edge"),
    live: g("--live"), neutral: g("--neutral"), earth: g("--earth"), ok: g("--ok"), warn: g("--warn"),
    dark: isDark()
  };
}
function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t) return t === "dark";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
}

function line(ctx, x1, y1, x2, y2, color, width = 1, dash = null, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}
function head(ctx, x, y, ang, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(-size, size * 0.5); ctx.lineTo(-size * 0.75, 0); ctx.lineTo(-size, -size * 0.5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawRay(ctx, x1, y1, x2, y2, color, { width = 2, dash = null, arrow = true, alpha = 1, at = 0.5 } = {}) {
  line(ctx, x1, y1, x2, y2, color, width, dash, alpha);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (arrow && len > 34) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const mx = x1 + (x2 - x1) * at, my = y1 + (y2 - y1) * at;
    head(ctx, mx + Math.cos(ang) * 5, my + Math.sin(ang) * 5, ang, 8 + width * 1.5, color, alpha);
  }
}
function vArrow(ctx, x, yFrom, yTo, color, { width = 3, dash = null } = {}) {
  const len = Math.abs(yTo - yFrom);
  if (len < 2) return;
  const dirn = Math.sign(yTo - yFrom);
  const hs = Math.min(12, len * 0.6);
  line(ctx, x, yFrom, x, yTo - dirn * hs * 0.6, color, width, dash);
  head(ctx, x, yTo, dirn > 0 ? Math.PI / 2 : -Math.PI / 2, hs, color);
}
function label(ctx, str, x, y, { color = "#000", size = 13, align = "center", base = "middle", weight = 600, bg = null, pad = 4 } = {}) {
  ctx.save();
  ctx.font = `${weight} ${Math.round(size * fontScale)}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (bg) {
    const tw = ctx.measureText(str).width + pad * 2;
    const th = size * fontScale + pad * 2;
    const bx = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x;
    const by = base === "middle" ? y - th / 2 : base === "top" ? y - pad : y - th + pad;
    ctx.fillStyle = bg;
    roundRect(ctx, bx - (align === "left" ? pad : align === "right" ? -pad : 0), by, tw, th, 5);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}
function roundRect(ctx, x, y, w, hh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r);
  ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx, x, y, r, fill, stroke, width = 1.5) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
/* Extend a ray from (x, y) along (dx, dy) to the edge of the box [0,w]×[0,h]. */
function toEdge(x, y, dx, dy, w, hh, x0 = 0, y0 = 0) {
  let t = Infinity;
  if (dx > 1e-12) t = Math.min(t, (w - x) / dx);
  if (dx < -1e-12) t = Math.min(t, (x0 - x) / dx);
  if (dy > 1e-12) t = Math.min(t, (hh - y) / dy);
  if (dy < -1e-12) t = Math.min(t, (y0 - y) / dy);
  if (!isFinite(t) || t < 0) t = 0;
  return [x + dx * t, y + dy * t];
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const tgt = amt > 0 ? 255 : 0, a = Math.abs(amt);
  r = Math.round(r + (tgt - r) * a); g = Math.round(g + (tgt - g) * a); b = Math.round(b + (tgt - b) * a);
  return `rgb(${r},${g},${b})`;
}
const rgb = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/* Polyline path used for moving charges */
function pathInfo(pts) {
  const seg = []; let L = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const l = Math.hypot(x2 - x1, y2 - y1);
    if (l < 0.01) continue;
    seg.push({ x1, y1, x2, y2, l, s: L });
    L += l;
  }
  return { seg, L };
}
function pointAt(info, d) {
  d = ((d % info.L) + info.L) % info.L;
  for (const s of info.seg) {
    if (d <= s.s + s.l) {
      const t = (d - s.s) / s.l;
      return [s.x1 + (s.x2 - s.x1) * t, s.y1 + (s.y2 - s.y1) * t, Math.atan2(s.y2 - s.y1, s.x2 - s.x1)];
    }
  }
  const s = info.seg[info.seg.length - 1];
  return [s.x2, s.y2, 0];
}
function drawFlow(ctx, info, phase, spacing, style, color) {
  if (!info.L) return;
  for (let d = 0; d < info.L - 1; d += spacing) {
    const [x, y, a] = pointAt(info, d + phase);
    if (style === "e") circle(ctx, x, y, 3.2, color);
    else head(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 5, a, 9, color);
  }
}

/* ---------------------------------------------------------------
   3. Lifecycle: every topic registers its canvases, loops, cleanup
   --------------------------------------------------------------- */
let cleanup = [];
let redrawers = [];

function onFrame(fn) {
  let id, last = performance.now();
  const loop = t => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    fn(dt, t);
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  cleanup.push(() => cancelAnimationFrame(id));
}

function makeCanvas(parent, { ratio = 0.5, mratio = null, min = 220, max = 640, touch = false, alt = "Simulation" } = {}) {
  const wrap = h("div", { class: "canvas-wrap" + (touch ? " touch" : "") });
  const cv = h("canvas", { role: "img", "aria-label": alt });
  wrap.append(cv);
  parent.append(wrap);
  const api = { cv, ctx: cv.getContext("2d"), w: 0, h: 0, draw: () => {} };
  function resize() {
    const w = wrap.clientWidth;
    if (!w) return;
    const r = w < 640 ? (mratio || ratio * 1.35) : ratio;
    const hh = Math.round(clamp(w * r, min, max));
    const dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(hh * dpr);
    cv.style.height = hh + "px";
    api.w = w; api.h = hh;
    api.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    api.draw();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  cleanup.push(() => ro.disconnect());
  redrawers.push(() => api.draw());
  api.resize = resize;
  return api;
}

/* ---------------------------------------------------------------
   4. Control widgets
   --------------------------------------------------------------- */
function controls(parent) { const c = h("div", { class: "controls" }); parent.append(c); return c; }

function slider(parent, { label: lab, min, max, step, value, unit = "", fmt: f }, onInput) {
  const out = h("output");
  const inp = h("input", { type: "range", min, max, step, value, "aria-label": lab });
  const set = () => { out.textContent = (f ? f(+inp.value) : String(+inp.value)) + (unit ? " " + unit : ""); };
  inp.addEventListener("input", () => { set(); onInput(+inp.value); });
  set();
  const el = h("label", { class: "ctl slider" }, h("span", { class: "ctl-label" }, lab), h("div", { class: "row" }, inp, out));
  parent.append(el);
  return { el, get value() { return +inp.value; }, set value(v) { inp.value = v; set(); } };
}

function seg(parent, { label: lab, options, value }, onChange) {
  const wrap = h("div", { class: "ctl" });
  if (lab) wrap.append(h("span", { class: "ctl-label" }, lab));
  const g = h("div", { class: "seg", role: "group", "aria-label": lab || "options" });
  const btns = options.map(([v, t]) => {
    const b = h("button", { type: "button", "aria-pressed": String(String(v) === String(value)) }, t);
    b.dataset.v = String(v);
    b.addEventListener("click", () => { set(v); onChange(String(v)); });
    g.append(b);
    return b;
  });
  function set(v) { btns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === String(v)))); }
  wrap.append(g);
  parent.append(wrap);
  return { el: wrap, set };
}

function select(parent, { label: lab, options, value }, onChange) {
  const s = h("select", { "aria-label": lab });
  options.forEach(([v, t]) => s.append(h("option", { value: v }, t)));
  s.value = value;
  s.addEventListener("change", () => onChange(s.value));
  const el = h("label", { class: "ctl" }, h("span", { class: "ctl-label" }, lab), s);
  parent.append(el);
  return { el, sel: s };
}

function chipRow(parent, labelText) {
  const row = h("div", { class: "presets" });
  if (labelText) row.append(h("span", { class: "presets-label" }, labelText));
  parent.append(row);
  return row;
}
function chip(row, text, onClick, pressed = null) {
  const b = h("button", { type: "button", class: "chip" }, text);
  if (pressed !== null) b.setAttribute("aria-pressed", String(pressed));
  b.addEventListener("click", onClick);
  row.append(b);
  return b;
}

function readouts(parent) {
  const el = h("div", { class: "readouts" });
  parent.append(el);
  return items => {
    el.replaceChildren(...items.map(it => h("div", { class: "ro" + (it.wide ? " wide" : "") + (it.tone ? " " + it.tone : "") },
      h("span", { class: "ro-k" }, it.k), h("span", { class: "ro-v" }, it.v))));
  };
}

/* ===============================================================
   5. SIMULATIONS
   =============================================================== */

/* ---------- 5.1 Spherical mirrors and lenses (one engine) ---------- */
/* NCERT New Cartesian sign convention: distances from the pole P (mirror) or optical
   centre O (lens); measured along the incident light (left to right here) are positive.
   Mirror: 1/v + 1/u = 1/f, m = −v/u.  Lens: 1/v − 1/u = 1/f, m = v/u.
   Rays are drawn with the usual thin-mirror / thin-lens (paraxial) construction. */
function opticsSim(stage, kind) {
  const isMirror = kind === "mirror";
  let type = isMirror ? "concave" : "convex";
  let F = 10, U = 25;

  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.82, alt: isMirror ? "Ray diagram for a spherical mirror" : "Ray diagram for a lens" });
  const ctl = controls(stage);
  const typeSeg = seg(ctl, {
    label: isMirror ? "Mirror" : "Lens", value: type,
    options: isMirror ? [["concave", "Concave"], ["convex", "Convex"]] : [["convex", "Convex"], ["concave", "Concave"]]
  }, v => { type = v; buildPresets(); draw(); });
  const sF = slider(ctl, { label: "Focal length |f|", min: 5, max: 30, step: 0.5, value: F, unit: "cm", fmt: v => fmt(v, 1) },
    v => { F = v; buildPresets(); draw(); });
  const sU = slider(ctl, { label: "Object distance |u|", min: 2, max: 60, step: 0.5, value: U, unit: "cm", fmt: v => fmt(v, 1) },
    v => { U = v; draw(); });
  const pre = chipRow(stage);
  const ro = readouts(stage);

  const converging = () => (isMirror ? type === "concave" : type === "convex");

  // Which region of the NCERT table an object distance falls in (converging mirror/lens only).
  function region(u) {
    if (u > 2 * F + 1e-9) return 0;            // beyond C / 2F₁
    if (Math.abs(u - 2 * F) < 1e-9) return 1;  // at C / 2F₁
    if (u > F + 1e-9) return 2;                // between C and F / F₁ and 2F₁
    if (Math.abs(u - F) < 1e-9) return 3;      // at F / F₁
    return 4;                                  // between F and P / F₁ and O
  }
  function buildPresets() {
    pre.replaceChildren(h("span", { class: "presets-label" }, "Place object"));
    if (!converging()) {
      for (const [t, k] of [["Far away", 4], ["Middle distance", 1.5], ["Very close", 0.4]]) {
        chip(pre, t, () => { U = clamp(Math.round(F * k * 2) / 2, 2, 60); sU.value = U; draw(); });
      }
      return;
    }
    const names = isMirror
      ? ["Beyond C", "At C", "Between C and F", "At F", "Between F and P"]
      : ["Beyond 2F₁", "At 2F₁", "Between F₁ and 2F₁", "At F₁", "Between F₁ and O"];
    const k = [2.6, 2, 1.5, 1, 0.5];
    names.forEach((t, j) => {
      let target = clamp(Math.round(F * k[j] * 2) / 2, 2, 60);
      if (j === 0 && region(target) !== 0) target = clamp(Math.floor(2 * F) + 1, 2, 60); // keep "beyond" really beyond
      const ok = region(target) === j;
      const b = chip(pre, t, () => { U = target; sU.value = U; draw(); });
      if (!ok) { b.disabled = true; b.title = "Not possible with this focal length on the slider"; }
    });
  }
  buildPresets();

  function solve() {
    const f = converging() ? (isMirror ? -F : F) : (isMirror ? F : -F);
    const u = -U;
    const inv = isMirror ? 1 / f - 1 / u : 1 / f + 1 / u;
    const atInf = Math.abs(inv) < 1e-9;
    const v = atInf ? Infinity : 1 / inv;
    const m = atInf ? Infinity : (isMirror ? -v / u : v / u);
    const real = isMirror ? v < 0 : v > 0;
    return { f, u, v, m, atInf, real };
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const ay = H / 2;
    const x0 = isMirror ? w * 0.72 : w * 0.5;
    const s = (x0 - 18) / 62;                 // pixels per cm
    const E = H * 0.42;                       // half-height of the mirror or lens
    const { f, u, v, m, atInf, real } = solve();
    const small = w < 560 ? 11 : 12;

    label(ctx, "Incident light →  (+ve direction)", 10, 14, { color: p.soft, size: small, align: "left" });
    line(ctx, 0, ay, w, ay, p.soft, 1, [6, 5]);

    // The mirror is drawn as a shallow arc (not to scale) so that rays meet its surface where they
    // reflect. surf(y) is the horizontal distance of the surface from the pole plane at height y.
    const sag = isMirror ? Math.min(14, E * 0.08) : 0;
    const Rd = isMirror ? (E * E + sag * sag) / (2 * sag) : 0;
    const surf = y => (isMirror ? (type === "concave" ? -1 : 1) * (Rd - Math.sqrt(Math.max(0, Rd * Rd - (y - ay) * (y - ay)))) : 0);

    if (isMirror) {
      const a = Math.asin(E / Rd);
      const cxa = type === "concave" ? x0 - Rd : x0 + Rd;
      const a0 = type === "concave" ? -a : Math.PI - a, a1 = type === "concave" ? a : Math.PI + a;
      ctx.save();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 3.5;
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
      ctx.save();
      ctx.beginPath();
      if (type === "convex") {
        ctx.moveTo(x0, ay - E);
        ctx.quadraticCurveTo(x0 + t * 2, ay, x0, ay + E);
        ctx.quadraticCurveTo(x0 - t * 2, ay, x0, ay - E);
      } else {
        ctx.moveTo(x0 - t, ay - E); ctx.lineTo(x0 + t, ay - E);
        ctx.quadraticCurveTo(x0 - t * 0.5, ay, x0 + t, ay + E);
        ctx.lineTo(x0 - t, ay + E);
        ctx.quadraticCurveTo(x0 + t * 0.5, ay, x0 - t, ay - E);
      }
      ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(110,180,240,0.18)" : "rgba(70,150,215,0.16)";
      ctx.fill();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }

    // Marks on the principal axis
    const marks = isMirror
      ? [[x0 + f * s, "F"], [x0 + 2 * f * s, "C"]]
      : [[x0 - F * s, "F₁"], [x0 - 2 * F * s, "2F₁"], [x0 + F * s, "F₂"], [x0 + 2 * F * s, "2F₂"]];
    for (const [x, t] of marks) {
      if (x > 6 && x < w - 6) { line(ctx, x, ay - 5, x, ay + 5, p.text, 2); label(ctx, t, x, ay + 17, { color: p.text, size: 13 }); }
    }
    label(ctx, isMirror ? "P" : "O", x0 + 12, ay + 17, { color: p.text, size: 13 });

    // Object and the three construction rays
    const ho = Math.min(H * 0.17, 54);
    const xo = x0 + u * s, yo = ay - ho;
    const Fout = x0 + f * s;                         // focus linked to the parallel ray after the mirror/lens
    const Fin = isMirror ? x0 + f * s : x0 - f * s;  // focus the second ray passes through (or aims at) before it
    const back = isMirror ? -1 : 1;                  // direction of travel after the element
    const rays = [];
    {   // 1. parallel to the principal axis
      const xh = x0 + surf(yo);
      const dir = converging() ? [Fout - xh, ay - yo] : [xh - Fout, yo - ay];
      rays.push({ xh, hy: yo, dir, c: p.r1, toF: !converging() ? [Fout, ay] : null });
    }
    if (Math.abs(Fin - xo) > 0.5) {   // 2. through (or towards) the focus, comes out parallel
      let hy = yo + (x0 - xo) * (ay - yo) / (Fin - xo);
      const xh = x0 + surf(hy);
      hy = yo + (xh - xo) * (ay - yo) / (Fin - xo);
      if (Math.abs(hy - ay) <= E) {
        let pre2 = null, post2 = null;
        if (Fin < xo) pre2 = [Fin, ay];              // ray seems to come from F (object inside F)
        else if (Fin > x0) post2 = [Fin, ay];        // ray is aimed at F on the far side
        rays.push({ xh, hy, dir: [back, 0], c: p.r2, pre2, post2 });
      }
    }
    {   // 3. to the pole P / through the optical centre O
      const dx0 = x0 - xo, dy0 = ay - yo;
      rays.push({ xh: x0, hy: ay, dir: [isMirror ? -dx0 : dx0, dy0], c: p.r3 });
    }
    const xi = x0 + v * s, yi = ay - m * ho;
    for (const r of rays) {
      if (r.pre2) line(ctx, r.pre2[0], r.pre2[1], xo, yo, r.c, 1.5, [5, 5], 0.85);
      drawRay(ctx, xo, yo, r.xh, r.hy, r.c, { width: 2 });
      if (r.post2) line(ctx, r.xh, r.hy, r.post2[0], r.post2[1], r.c, 1.5, [5, 5], 0.85);
      const [ex, ey] = toEdge(r.xh, r.hy, r.dir[0], r.dir[1], w, H);
      drawRay(ctx, r.xh, r.hy, ex, ey, r.c, { width: 2 });
      if (r.toF) line(ctx, r.xh, r.hy, r.toF[0], r.toF[1], r.c, 1.5, [5, 5], 0.85);
      else if (!atInf && !real) line(ctx, r.xh, r.hy, xi, yi, r.c, 1.5, [5, 5], 0.85);
    }

    vArrow(ctx, xo, ay, yo, p.obj, { width: 3.5 });
    label(ctx, "Object", xo, yo - 12, { color: p.obj, size: 13 });

    const size = Math.abs(m) > 1.005 ? "magnified" : Math.abs(m) < 0.995 ? "diminished" : "same size";
    const nature = atInf
      ? "Image at infinity: real, inverted, highly enlarged"
      : `${real ? "Real" : "Virtual"}, ${m < 0 ? "inverted" : "erect"}, ${size}`;
    if (!atInf) {
      vArrow(ctx, xi, ay, yi, p.img, { width: 3.5, dash: real ? null : [6, 4] });
      if (xi > 0 && xi < w) {
        const ly = clamp(m > 0 ? yi - 12 : yi + 14, 10, H - 10);
        label(ctx, real ? "Image" : "Image (virtual)", xi, ly, { color: p.img, size: 13, bg: p.surface2 });
      } else {
        label(ctx, xi < 0 ? "← image is off-screen" : "image is off-screen →", xi < 0 ? 10 : w - 10, H - 30,
          { color: p.img, size: 12, align: xi < 0 ? "left" : "right" });
      }
    }
    label(ctx, nature, w - 10, w < 640 ? 34 : 14, { color: atInf ? p.soft : real ? p.r1 : p.r3, size: 14, align: "right", weight: 700, bg: w < 640 ? p.surface2 : null });

    // Legend for the rays that are drawn
    const names = isMirror
      ? { r1: "Parallel to axis", r2: converging() ? "Through F" : "Towards F", r3: "To pole P" }
      : { r1: "Parallel to axis", r2: converging() ? "Through F₁" : "Towards F₂", r3: "Through centre O" };
    const lg = rays.map(r => [r.c, names[r.c === p.r1 ? "r1" : r.c === p.r2 ? "r2" : "r3"]]);
    ctx.save(); ctx.font = `600 ${Math.round(small * fontScale)}px ${FONT}`;
    const widths = lg.map(([, t]) => ctx.measureText(t).width); ctx.restore();
    const total = widths.reduce((a, b) => a + b + 37, 0) - 14 + 12;
    const ly0 = H - 13;
    roundRect(ctx, 4, ly0 - 10, total, 20, 6); ctx.fillStyle = p.surface2; ctx.fill();
    let lx = 10;
    lg.forEach(([c, t], j) => {
      line(ctx, lx, ly0, lx + 18, ly0, c, 3);
      label(ctx, t, lx + 23, ly0, { color: p.soft, size: small, align: "left" });
      lx += 23 + widths[j] + 14;
    });

    ro([
      { k: "Object distance u", v: `${fmt(u)} cm` },
      { k: "Image distance v", v: atInf ? "Infinity" : `${sgnf(v)} cm` },
      { k: "Focal length f", v: `${sgnf(f)} cm` },
      { k: "Magnification m", v: atInf ? "Very large" : sgnf(m, 2) },
      isMirror ? { k: "Radius of curvature R = 2f", v: `${sgnf(2 * f)} cm` } : { k: "Power P = 1/f (f in metres)", v: `${sgnf(100 / f, 2)} D` },
      { k: "Image", v: nature, wide: true }
    ]);
  }

  return {
    set(o) {
      if (o.type) { type = o.type; typeSeg.set(type); }
      if (o.F) { F = o.F; sF.value = F; }
      if (o.U) { U = o.U; sU.value = U; }
      buildPresets();
      draw();
    }
  };
}

/* ---------- 5.2 Refraction: two media and glass slab ---------- */
/* Refractive indices are the values in NCERT Table 9.3. */
function refractionSim(stage) {
  const MEDIA = [["1.0003", "Air (1.0003)"], ["1.33", "Water (1.33)"], ["1.44", "Kerosene (1.44)"], ["1.52", "Crown glass (1.52)"], ["2.42", "Diamond (2.42)"]];
  const NAME = { "1.0003": "Air", "1.33": "Water", "1.44": "Kerosene", "1.52": "Crown glass", "2.42": "Diamond" };
  let mode = "interface", n1 = "1.0003", n2 = "1.52", nS = "1.52", iDeg = 40;

  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.85, alt: "Refraction of a ray of light" });
  const ctl = controls(stage);
  seg(ctl, { label: "Show", value: mode, options: [["interface", "Two media"], ["slab", "Rectangular slab"]] }, v => { mode = v; sync(); draw(); });
  const s1 = select(ctl, { label: "Light comes from", options: MEDIA, value: n1 }, v => { n1 = v; draw(); });
  const s2 = select(ctl, { label: "Into", options: MEDIA, value: n2 }, v => { n2 = v; draw(); });
  const s3 = select(ctl, { label: "Slab material", options: MEDIA.slice(1), value: nS }, v => { nS = v; draw(); });
  slider(ctl, { label: "Angle of incidence i", min: 0, max: 85, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
  const ro = readouts(stage);
  function sync() {
    s1.el.style.display = s2.el.style.display = mode === "interface" ? "" : "none";
    s3.el.style.display = mode === "slab" ? "" : "none";
  }
  sync();

  const tint = n => `rgba(70,150,215,${(0.03 + 0.3 * (n - 1) / 1.42).toFixed(3)})`;
  function angleArc(ctx, x, y, r, a1, a2, color, txt) {
    if (Math.abs(a2 - a1) < 0.02) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke(); ctx.restore();
    const am = (a1 + a2) / 2;
    label(ctx, txt, x + Math.cos(am) * (r + 13), y + Math.sin(am) * (r + 13), { color, size: 14, weight: 700 });
  }

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const i = iDeg * DEG;

    if (mode === "interface") {
      const a = +n1, b = +n2;
      const ox = w / 2, oy = H / 2;
      ctx.fillStyle = tint(a); ctx.fillRect(0, 0, w, oy);
      ctx.fillStyle = tint(b); ctx.fillRect(0, oy, w, H - oy);
      line(ctx, 0, oy, w, oy, p.glassEdge, 2);
      label(ctx, `${NAME[n1]}   n₁ = ${n1}`, 12, 16, { color: p.text, size: 14, align: "left" });
      label(ctx, `${NAME[n2]}   n₂ = ${n2}`, 12, H - 16, { color: p.text, size: 14, align: "left" });
      line(ctx, ox, oy - H * 0.46, ox, oy + H * 0.46, p.soft, 1.5, [6, 5]);
      label(ctx, "Normal", ox + 6, 14, { color: p.soft, size: 12, align: "left" });

      const L = Math.min(w * 0.45, H * 0.46);
      drawRay(ctx, ox - L * Math.sin(i), oy - L * Math.cos(i), ox, oy, p.beam, { width: 3.5 });
      const sr = a * Math.sin(i) / b;
      const tir = sr > 1;
      // a weak reflected ray is always present; it carries all the light only in total internal reflection
      drawRay(ctx, ox, oy, ox + L * Math.sin(i), oy - L * Math.cos(i), p.beam, { width: tir ? 3.5 : 1.5, alpha: tir ? 1 : 0.35 });
      angleArc(ctx, ox, oy, 40, -Math.PI / 2 - i, -Math.PI / 2, p.text, "i");
      let r = null;
      if (!tir) {
        r = Math.asin(sr);
        drawRay(ctx, ox, oy, ox + L * Math.sin(r), oy + L * Math.cos(r), p.beam, { width: 3.5 });
        angleArc(ctx, ox, oy, 40, Math.PI / 2 - r, Math.PI / 2, p.text, "r");
      } else {
        label(ctx, "No refracted ray: total internal reflection (Class 12 topic)", w / 2, oy + H * 0.25, { color: p.warn, size: 13, bg: p.surface });
      }
      const bend = iDeg === 0 ? "Goes straight along the normal (no bending)"
        : a === b ? "Same medium: no bending"
        : b > a ? "Slows down and bends towards the normal" : "Speeds up and bends away from the normal";
      ro([
        { k: "Angle of incidence i", v: `${iDeg}°` },
        { k: "Angle of refraction r", v: tir ? "—" : `${fmt(r / DEG, 1)}°` },
        { k: "n₂₁ = n₂ / n₁", v: fmt(b / a, 2) },
        { k: "sin i / sin r", v: iDeg === 0 || tir ? "—" : fmt(Math.sin(i) / Math.sin(r), 2) },
        { k: "Speed in medium 1 (c / n₁)", v: `${fmt(3 / a, 2)} × 10⁸ m/s` },
        { k: "Speed in medium 2 (c / n₂)", v: `${fmt(3 / b, 2)} × 10⁸ m/s` },
        { k: "What happens", v: tir ? "Light is totally reflected back into medium 1" : bend, wide: true }
      ]);
    } else {
      const n = +nS;
      const y1 = H * 0.34, y2 = H * 0.68, T = y2 - y1;
      const sxL = w * 0.06, sxR = w * 0.94;
      ctx.fillStyle = tint(n); ctx.fillRect(sxL, y1, sxR - sxL, T);
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.strokeRect(sxL, y1, sxR - sxL, T);
      label(ctx, `${NAME[nS]} slab  (n = ${nS})`, sxR - 8, y1 + 16, { color: p.text, size: 13, align: "right" });
      label(ctx, "Air", 12, 16, { color: p.soft, size: 13, align: "left" });
      label(ctx, "Air", 12, H - 16, { color: p.soft, size: 13, align: "left" });

      const ox = w * 0.34, oy = y1;
      const r = Math.asin(Math.sin(i) / n);
      const bx = ox + T * Math.tan(r), by = y2;
      line(ctx, ox, oy - H * 0.2, ox, oy + H * 0.16, p.soft, 1.3, [5, 5]);
      line(ctx, bx, by - H * 0.16, bx, by + H * 0.2, p.soft, 1.3, [5, 5]);

      const L = H * 0.3;
      const ext = L + T / Math.max(Math.cos(i), 0.15);
      line(ctx, ox, oy, ox + ext * Math.sin(i), oy + ext * Math.cos(i), p.soft, 1.5, [4, 5]);
      drawRay(ctx, ox - L * Math.sin(i), oy - L * Math.cos(i), ox, oy, p.beam, { width: 3.5 });
      drawRay(ctx, ox, oy, bx, by, p.beam, { width: 3.5 });
      const [ex, ey] = toEdge(bx, by, Math.sin(i), Math.cos(i), w, H);
      drawRay(ctx, bx, by, ex, ey, p.beam, { width: 3.5 });

      // lateral displacement: perpendicular distance between the emergent ray and the incident ray produced
      const u0 = Math.sin(i), u1 = Math.cos(i);
      const tt = (bx - ox) * u0 + (by - oy) * u1;
      const qx = ox + u0 * tt, qy = oy + u1 * tt;
      if (iDeg > 2) {
        line(ctx, bx, by, qx, qy, p.accent, 3);
        label(ctx, "d", (bx + qx) / 2 + 10, (by + qy) / 2 - 4, { color: p.accent, size: 15, weight: 700 });
      }
      angleArc(ctx, ox, oy, 36, -Math.PI / 2 - i, -Math.PI / 2, p.text, "i");
      angleArc(ctx, ox, oy, 36, Math.PI / 2 - r, Math.PI / 2, p.text, "r");
      angleArc(ctx, bx, by, 36, Math.PI / 2 - i, Math.PI / 2, p.text, "e");
      const d = 5 * Math.sin(i - r) / Math.cos(r);
      ro([
        { k: "Angle of incidence i", v: `${iDeg}°` },
        { k: "Angle of refraction r", v: `${fmt(r / DEG, 1)}°` },
        { k: "Angle of emergence e", v: `${iDeg}°` },
        { k: "Lateral shift d (slab 5 cm thick)", v: `${fmt(d, 2)} cm` },
        { k: "Key idea", v: "The emergent ray is parallel to the incident ray (e = i). It is only shifted sideways.", wide: true }
      ]);
    }
  }
}

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

/* ===============================================================
   6. CHAPTER CONTENT
   Each question is [question, answer] or [question, answer, setup]; a setup is passed to the
   topic's simulation so the teacher can show that exact case.
   =============================================================== */
const CHAPTERS = [
  {
    id: "light", num: 9, short: "Light", title: "Light – Reflection and Refraction", notes: "../light-reflection-refraction.html",
    topics: [
      {
        id: "mirrors", title: "Spherical mirrors",
        lead: "Move the object and watch the image change. The buttons place the object at each position in the NCERT table.",
        build: s => opticsSim(s, "mirror"),
        points: [
          "A concave mirror converges light; a convex mirror diverges it.",
          "Pole P, centre of curvature C and principal focus F lie on the principal axis. For spherical mirrors of small aperture, R = 2f.",
          "A ray parallel to the principal axis passes through F after reflection (concave mirror) or appears to diverge from F (convex mirror).",
          "A ray through F (concave), or directed towards F (convex), comes out parallel to the principal axis. A ray falling on the pole P is reflected at an equal angle to the axis. A ray through C (or towards C) comes back along the same path.",
          "Concave mirror: an object beyond F gives a real, inverted image. Only an object between P and F gives a virtual, erect, magnified image (shaving mirrors, dentists' mirrors).",
          "Convex mirror: the image is always virtual, erect and diminished, between P and F. Its wider field of view makes it the choice for rear-view mirrors.",
          "Sign convention: measure all distances from P. Distances in the direction of the incident light are positive, against it negative. Heights above the principal axis are positive."
        ],
        formulas: [["Mirror formula", "1/v + 1/u = 1/f"], ["Magnification", "m = h′/h = −v/u"], ["Radius and focal length", "R = 2f"]],
        questions: [
          ["Where should an object be placed in front of a concave mirror to get a real image of the same size as the object?",
            "At C. The image also forms at C: real, inverted and the same size (m = −1).", { type: "concave", F: 10, U: 20 }],
          ["An object 5.0 cm long is placed 20 cm in front of a convex mirror of radius of curvature 30 cm. Find the position, nature and size of the image.",
            "f = R/2 = +15 cm and u = −20 cm. 1/v = 1/f − 1/u = 1/15 + 1/20 = 7/60, so v = +8.6 cm (behind the mirror). m = −v/u = +0.43, so h′ = 0.43 × 5.0 = 2.1 cm. The image is virtual, erect and diminished.", { type: "convex", F: 15, U: 20 }],
          ["An object 7.0 cm tall is placed 27 cm in front of a concave mirror of focal length 18 cm. Where should a screen be placed to get a sharp image? Find the size and nature of the image.",
            "u = −27 cm, f = −18 cm. 1/v = 1/f − 1/u = −1/18 + 1/27 = −1/54, so v = −54 cm: put the screen 54 cm in front of the mirror. m = −v/u = −2, so h′ = −14 cm. The image is real, inverted and magnified.", { type: "concave", F: 18, U: 27 }],
          ["A concave mirror forms a real image three times the size of an object placed 10 cm in front of it. Where is the image?",
            "A real image is inverted, so m = −3. From m = −v/u, v = 3u = 3 × (−10 cm) = −30 cm: the image is 30 cm in front of the mirror. (The focal length works out to 7.5 cm.)", { type: "concave", F: 7.5, U: 10 }],
          ["Find the focal length of a convex mirror whose radius of curvature is 32 cm.", "f = R/2 = +16 cm."],
          ["Name the type of mirror used (a) as a rear-view mirror in vehicles (b) in a solar furnace. Give reasons.",
            "(a) Convex: it always gives an erect, diminished image and has a wider field of view. (b) Concave: it converges sunlight to its focus, producing a lot of heat there."]
        ]
      },
      {
        id: "lenses", title: "Lenses",
        lead: "Switch between convex and concave lenses. The power of the lens is shown in dioptres.",
        build: s => opticsSim(s, "lens"),
        points: [
          "A convex lens converges light; a concave lens diverges it.",
          "A ray parallel to the principal axis passes through F₂ after refraction (convex lens) or appears to diverge from F₁ (concave lens).",
          "A ray through F₁ (convex), or directed towards F₂ (concave), comes out parallel to the principal axis. A ray through the optical centre O goes straight on without deviation.",
          "Convex lens: an object beyond 2F₁ gives a real, inverted, diminished image. An object between F₁ and O gives a virtual, erect, magnified image (magnifying glass).",
          "A concave lens always gives a virtual, erect, diminished image between F₁ and O.",
          "Power P = 1/f with f in metres. Its unit is the dioptre (D): 1 D is the power of a lens of focal length 1 m. Convex lenses have positive power, concave lenses negative.",
          "For lenses in contact, the powers add: P = P₁ + P₂ + …"
        ],
        formulas: [["Lens formula", "1/v − 1/u = 1/f"], ["Magnification", "m = h′/h = v/u"], ["Power", "P = 1/f  (f in metres)"], ["Lenses in contact", "P = P₁ + P₂ + …"]],
        questions: [
          ["A concave lens of focal length 15 cm forms an image 10 cm from the lens. How far is the object from the lens?",
            "f = −15 cm, v = −10 cm. 1/u = 1/v − 1/f = −1/10 + 1/15 = −1/30, so u = −30 cm: the object is 30 cm in front of the lens.", { type: "concave", F: 15, U: 30 }],
          ["A 2.0 cm tall object is placed 15 cm from a convex lens of focal length 10 cm. Find the nature, position and size of the image.",
            "u = −15 cm, f = +10 cm. 1/v = 1/f + 1/u = 1/10 − 1/15 = 1/30, so v = +30 cm (on the other side of the lens). m = v/u = −2, so h′ = −4.0 cm. The image is real, inverted and magnified.", { type: "convex", F: 10, U: 15 }],
          ["A convex lens forms a real, inverted image of a needle 50 cm from the lens. If the image is the same size as the needle, where is the needle? Find the power of the lens.",
            "A same-size image means the needle is at 2F₁, 50 cm in front of the lens (u = −50 cm). So 2f = 50 cm, f = 25 cm = 0.25 m, and P = 1/0.25 = +4 D.", { type: "convex", F: 25, U: 50 }],
          ["Find the power of a concave lens of focal length 2 m.", "P = 1/f = 1/(−2 m) = −0.5 D."],
          ["The power of a lens is −2.0 D. What kind of lens is it, and what is its focal length?", "Concave (negative power). f = 1/P = −0.5 m = −50 cm."],
          ["Where should an object be placed for a convex lens to act as a magnifying glass?",
            "Between F₁ and the optical centre O. The image is then virtual, erect and magnified.", { type: "convex", F: 10, U: 5 }]
        ]
      },
      {
        id: "refraction", title: "Refraction and glass slab",
        lead: "Change the media and the angle. Then switch to the rectangular slab to see the sideways shift.",
        build: refractionSim,
        points: [
          "Light bends when it passes from one medium into another because its speed changes.",
          "Going from a rarer to a denser medium, light slows down and bends towards the normal. Going from denser to rarer, it bends away from the normal.",
          "Laws of refraction: the incident ray, the refracted ray and the normal lie in the same plane, and sin i / sin r is constant for a given pair of media (Snell's law). This constant is the refractive index n₂₁.",
          "Absolute refractive index n = c/v. A higher n means optically denser. This is not the same as mass density: kerosene floats on water but is optically denser.",
          "In a rectangular glass slab, the emergent ray is parallel to the incident ray but shifted sideways (lateral displacement).",
          "A ray falling along the normal (i = 0) goes straight through without bending."
        ],
        formulas: [["Snell's law", "sin i / sin r = n₂₁"], ["Refractive index", "n = c / v"], ["Relative index", "n₂₁ = n₂ / n₁ = v₁ / v₂"]],
        questions: [
          ["A ray of light travelling in air enters water at an angle. Does it bend towards or away from the normal? Why?", "Towards the normal, because water is optically denser than air and light slows down in it."],
          ["Light enters glass of refractive index 1.50 from air. Find the speed of light in the glass. (c = 3 × 10⁸ m/s)", "v = c/n = (3 × 10⁸)/1.50 = 2 × 10⁸ m/s."],
          ["You are given kerosene (1.44), turpentine (1.47) and water (1.33). In which does light travel fastest?", "In water, because it has the lowest refractive index. Turpentine is the optically densest of the three."],
          ["What does “the refractive index of diamond is 2.42” mean?", "Light travels 2.42 times faster in vacuum than in diamond (n = c/v)."],
          ["From NCERT Table 9.3, which medium has the highest optical density and which the lowest?", "Highest: diamond (2.42). Lowest: air (1.0003)."],
          ["Why does a pencil partly dipped in water look bent at the water surface?", "Light from the part under water bends away from the normal as it leaves the water, so that part appears raised."]
        ]
      }
    ]
  },
  {
    id: "eye", num: 10, short: "Human Eye", title: "The Human Eye and the Colourful World", notes: "../human-eye.html",
    topics: [
      {
        id: "defects", title: "Defects of vision",
        lead: "Pick an eye and an object. Watch where the rays meet, then put on the spectacle lens.",
        build: eyeSim,
        points: [
          "The eye lens forms a real, inverted image on the retina. The ciliary muscles change the curvature, and so the focal length, of the eye lens. This ability is called accommodation.",
          "For a young adult with normal vision, the near point is about 25 cm and the far point is at infinity.",
          "Myopia (near-sightedness): distant objects look blurred because their image forms in front of the retina. Causes: excessive curvature of the eye lens, or elongation of the eyeball. Corrected with a concave lens of suitable power.",
          "Hypermetropia (far-sightedness): nearby objects look blurred because the near point is farther than 25 cm and the image would form behind the retina. Causes: the focal length of the eye lens is too long, or the eyeball is too small. Corrected with a convex lens of suitable power.",
          "Presbyopia: with age the ciliary muscles weaken and the eye lens becomes less flexible, so the near point moves away. Bifocal lenses are often needed.",
          "Cataract: in old age the eye lens may become milky and cloudy. Vision can be restored by cataract surgery."
        ],
        formulas: [["Normal near point", "about 25 cm"], ["Power of a lens", "P = 1/f  (f in metres)"], ["Lens for myopia", "concave, f = −(far point distance)"]],
        questions: [
          ["The far point of a myopic person is 80 cm in front of the eye. What is the nature and power of the lens needed?",
            "A concave lens that makes distant objects seem to be at the far point: f = −80 cm = −0.8 m, so P = 1/f = −1.25 D."],
          ["A person needs a lens of power −5.5 D to correct distant vision and +1.5 D to correct near vision. What are the focal lengths of these lenses?",
            "(i) f = 1/(−5.5) m = −0.18 m = −18.2 cm (concave). (ii) f = 1/1.5 m = +0.67 m = +66.7 cm (convex)."],
          ["The near point of a hypermetropic eye is 1 m. What is the power of the lens needed? (Near point of a normal eye = 25 cm.)",
            "The lens must make an object at 25 cm appear to be at 1 m: u = −25 cm, v = −100 cm. 1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100, so f = +33.3 cm = 0.333 m and P = +3.0 D (convex)."],
          ["Why is a normal eye not able to see clearly objects placed closer than 25 cm?",
            "The ciliary muscles cannot make the eye lens any more curved, so its focal length cannot get any shorter."],
          ["What happens to the image distance in the eye when we increase the distance of an object from the eye?",
            "It stays the same: the image still forms on the retina. Instead, the eye lens becomes thinner and its focal length increases."],
          ["The eye focuses on objects at different distances by adjusting the focal length of the eye lens. What is this called?", "Accommodation."]
        ]
      },
      {
        id: "prism", title: "Prism and dispersion",
        lead: "Change the angle of incidence, then repeat Newton's experiment with a second, inverted prism.",
        build: prismSim,
        points: [
          "A triangular glass prism has two triangular bases and three rectangular lateral surfaces. The angle between two lateral faces is the angle of the prism.",
          "Light bends twice, each time towards the base. The angle between the incident ray and the emergent ray is the angle of deviation.",
          "A prism splits white light into a band of seven colours, VIBGYOR: violet, indigo, blue, green, yellow, orange and red. This is dispersion, and the band is a spectrum.",
          "Different colours bend through different angles: red bends the least and violet the most.",
          "Newton placed a second, identical prism upside down after the first. The colours recombined into white light, showing that sunlight is made of seven colours.",
          "A rainbow is a natural spectrum. Raindrops act like small prisms: they refract and disperse sunlight, reflect it inside, and refract it again as it leaves. A rainbow always forms opposite the Sun."
        ],
        formulas: [["Colours of the spectrum", "V I B G Y O R"], ["Bending", "red least, violet most"], ["Angle of deviation", "between incident and emergent rays"]],
        questions: [
          ["Why do different colours bend through different angles in a prism?", "Each colour travels at a different speed in glass, so glass has a slightly different refractive index for each colour. Violet slows down most and bends most; red bends least."],
          ["Which colour bends the least, and which the most?", "Red the least, violet the most."],
          ["What is the angle of deviation?", "The angle between the direction of the incident ray and the direction of the emergent ray."],
          ["What did Newton see when he placed a second, identical prism upside down after the first?", "The colours recombined and white light came out, showing that white light is made of seven colours."],
          ["Explain how a rainbow is formed.", "Tiny raindrops act like prisms: they refract and disperse sunlight as it enters, reflect it inside the drop, and refract it again as it comes out. We see a rainbow when the Sun is behind us."]
        ]
      },
      {
        id: "scattering", title: "Atmospheric refraction and scattering",
        lead: "Compare the sky with and without air to see why the sky is blue. The sunrise and sunset buttons are extra: the colour of the Sun at sunrise and sunset is not in the CBSE syllabus.",
        build: scatterSim,
        points: [
          "Atmospheric refraction: hot air is lighter and has a slightly lower refractive index than cooler air. Light bends as it passes through layers of changing refractive index, so objects seen through hot air seem to waver.",
          "Stars twinkle because starlight is bent by the changing atmosphere, so the star's apparent position and brightness keep changing. Planets are much closer and act as extended sources, so the changes average out and they do not twinkle.",
          "Because of atmospheric refraction we see the Sun about 2 minutes before actual sunrise and about 2 minutes after actual sunset.",
          "Tyndall effect: fine particles scatter light and make a beam visible, as when sunlight enters a smoke-filled room through a small hole or passes through the canopy of a dense forest.",
          "The colour of scattered light depends on particle size. Very fine particles scatter mainly blue light, larger particles scatter longer wavelengths, and large enough particles scatter all colours, so the light looks white.",
          "The clear sky is blue because air molecules and fine particles scatter blue light (shorter wavelength) much more strongly than red.",
          "Danger signal lights are red because red is scattered the least by fog or smoke, so it can be seen from far away.",
          "With no atmosphere there would be no scattering and the sky would look dark, as it does to passengers flying at very high altitudes.",
          "Extra (not in the CBSE syllabus): at sunrise and sunset sunlight crosses much more air, most of the blue is scattered away, and the Sun looks reddish."
        ],
        formulas: [["Scattering by fine particles", "blue (short λ) ≫ red (long λ)"], ["Advance sunrise / delayed sunset", "about 2 minutes each"]],
        questions: [
          ["Why do stars twinkle?", "Starlight is refracted continuously as it passes through the atmosphere, whose conditions keep changing. So the apparent position of the star shifts slightly and the amount of light entering the eye flickers."],
          ["Explain why the planets do not twinkle.", "Planets are much closer to the Earth and are seen as extended sources, like a collection of many point sources. The flickering from all these points averages out."],
          ["Why does the sky appear dark instead of blue to an astronaut?", "At that height there is no atmosphere to scatter sunlight towards the eye."],
          ["Why is the colour of the clear sky blue?", "Air molecules and fine particles are smaller than the wavelength of visible light and scatter blue light much more than red. This scattered blue light reaches our eyes from all directions."],
          ["Why are danger signal lights red?", "Red light is scattered the least by fog or smoke, so it can be seen in the same colour from far away."],
          ["What is the Tyndall effect? Give an example.", "The scattering of light by fine particles, which makes the path of a beam visible, for example a beam of sunlight entering a smoke-filled room through a small hole."]
        ]
      }
    ]
  },
  {
    id: "electricity", num: 11, short: "Electricity", title: "Electricity", notes: "../electricity.html",
    topics: [
      {
        id: "ohm", title: "Ohm's law",
        lead: "Based on NCERT Activity 11.1. Use 1 to 4 cells, record each reading, and see the straight-line V–I graph.",
        build: ohmSim,
        points: [
          "Electric current is the rate of flow of charge: I = Q/t. Its SI unit is the ampere (A); 1 A = 1 C/s.",
          "Conventional current flows from + to − outside the cell. Electrons actually move the opposite way.",
          "Potential difference is the work done to move a unit charge between two points: V = W/Q. Its unit is the volt (V); 1 V = 1 J/C. A cell maintains the potential difference.",
          "An ammeter is connected in series in the circuit; a voltmeter is connected in parallel across the part being measured.",
          "Ohm's law: at constant temperature, the potential difference across a metallic wire is directly proportional to the current through it. V ∝ I, so V = IR.",
          "The V–I graph is a straight line through the origin, and V/I = R. A conductor has a resistance of 1 ohm when 1 A flows through it with 1 V across it."
        ],
        formulas: [["Current", "I = Q / t"], ["Potential difference", "V = W / Q"], ["Ohm's law", "V = IR"], ["Charge", "Q = ne,  e = 1.6 × 10⁻¹⁹ C"]],
        questions: [
          ["How much current will an electric heater coil draw from a 220 V source, if its resistance is 100 Ω?", "I = V/R = 220/100 = 2.2 A."],
          ["How many electrons make up a charge of 1 coulomb?", "n = Q/e = 1/(1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ electrons (NCERT rounds this to nearly 6 × 10¹⁸)."],
          ["How much work is done in moving a charge of 2 C across two points with a potential difference of 12 V?", "W = VQ = 12 V × 2 C = 24 J."],
          ["On a V–I graph (V on the y-axis), one straight line is steeper than another. What does that show?", "The steeper line belongs to the larger resistance, because the slope V/I equals R."],
          ["Define 1 volt.", "The potential difference between two points is 1 volt when 1 joule of work is done to move 1 coulomb of charge from one point to the other."]
        ]
      },
      {
        id: "combinations", title: "Series and parallel",
        lead: "Change the resistances and the connection. Remove a bulb and see what happens to the others.",
        build: circuitsSim,
        points: [
          "Series: the same current flows through every resistor, and the potential differences add up. Rs = R₁ + R₂ + R₃, which is more than the largest resistance.",
          "Parallel: every resistor has the same potential difference, and the currents add up. 1/Rp = 1/R₁ + 1/R₂ + 1/R₃, so Rp is less than the smallest resistance.",
          "In series, if one bulb fails or is removed the circuit breaks and every bulb goes off. In parallel, the others keep working.",
          "Houses are wired in parallel: each appliance gets the full voltage, draws the current it needs, and can be switched on or off by itself.",
          "Brightness check: in series the bulb with the larger R glows more (same I, P = I²R). In parallel the bulb with the smaller R glows more (same V, P = V²/R)."
        ],
        formulas: [["Series", "Rs = R₁ + R₂ + R₃"], ["Parallel", "1/Rp = 1/R₁ + 1/R₂ + 1/R₃"], ["Series: voltages add", "V = V₁ + V₂ + V₃"], ["Parallel: currents add", "I = I₁ + I₂ + I₃"]],
        questions: [
          ["Resistors of 5 Ω, 10 Ω and 30 Ω are connected in parallel to a 12 V battery. Find the current through each, the total current and the total resistance.",
            "I₁ = 12/5 = 2.4 A, I₂ = 12/10 = 1.2 A, I₃ = 12/30 = 0.4 A. Total I = 4.0 A. Rp = V/I = 12/4 = 3 Ω.", { mode: "parallel", V: 12, R: [5, 10, 30] }],
          ["How can three resistors of 2 Ω, 3 Ω and 6 Ω be connected to give a total resistance of (a) 4 Ω (b) 1 Ω?",
            "(a) 3 Ω and 6 Ω in parallel give 2 Ω; put this in series with 2 Ω to get 4 Ω. (b) All three in parallel: 1/2 + 1/3 + 1/6 = 1, so 1 Ω."],
          ["Judge the equivalent resistance when (a) 1 Ω and 10⁶ Ω (b) 1 Ω, 10³ Ω and 10⁶ Ω are connected in parallel.",
            "In both cases it is slightly less than 1 Ω, because a parallel combination is always less than its smallest resistance."],
          ["Why are household appliances connected in parallel and not in series?",
            "Each appliance gets the full 220 V, draws only the current it needs, and can be switched on or off without affecting the others. In series, one failure would switch everything off."],
          ["In series, which bulb glows brighter: the one with larger R or smaller R? And in parallel?",
            "Series: larger R (same current, P = I²R). Parallel: smaller R (same voltage, P = V²/R).", { mode: "series", V: 9, R: [4, 8, 16] }]
        ]
      },
      {
        id: "resistivity", title: "Resistance and resistivity",
        lead: "Change the wire's length, thickness and material. Use the buttons to test R ∝ l and R ∝ 1/A.",
        build: resistivitySim,
        points: [
          "The resistance of a wire depends on its length, its area of cross-section, the nature of its material and its temperature.",
          "R ∝ l and R ∝ 1/A, so R = ρl/A. ρ (rho) is the resistivity of the material; its SI unit is Ω m.",
          "Resistivity is a property of the material. It does not change if the wire is made longer, shorter, thicker or thinner (at the same temperature).",
          "Metals such as copper and aluminium have very low resistivity, so they are used for connecting wires.",
          "Alloys such as nichrome have higher resistivity than their metals and do not oxidise (burn) readily at high temperatures, so they are used in heaters, irons and toasters.",
          "Doubling the diameter makes the area 4 times, so R becomes one-fourth."
        ],
        formulas: [["Resistance", "R = ρl / A"], ["Area of a wire", "A = πr² = πd²/4"], ["Unit of resistivity", "Ω m"]],
        questions: [
          ["The length of a wire is doubled, keeping the same area of cross-section. What happens to its resistance?", "It doubles, because R ∝ l. (If the same wire is stretched to twice its length, its area also halves, so R becomes 4 times.)"],
          ["Why are the coils of electric toasters and irons made of an alloy rather than a pure metal?", "An alloy has a higher resistivity than its constituent metals and does not oxidise (burn) readily at high temperatures."],
          ["Why is tungsten used almost exclusively for the filaments of electric lamps?", "Tungsten has a very high melting point (3380 °C), so it can glow white-hot without melting."],
          ["A 1 m metal wire of diameter 0.3 mm has a resistance of 26 Ω at 20 °C. Find its resistivity. Which material is it, from NCERT Table 11.2?",
            "A = π(0.15 × 10⁻³ m)² = 7.07 × 10⁻⁸ m². ρ = RA/l = 26 × 7.07 × 10⁻⁸ / 1 ≈ 1.84 × 10⁻⁶ Ω m, which matches manganese in Table 11.2."],
          ["A copper wire has diameter 0.5 mm and resistivity 1.6 × 10⁻⁸ Ω m. What length gives a resistance of 10 Ω? How does the resistance change if the diameter is doubled?",
            "A = π(0.25 × 10⁻³ m)² = 1.96 × 10⁻⁷ m². l = RA/ρ = (10 × 1.96 × 10⁻⁷)/(1.6 × 10⁻⁸) ≈ 122.7 m. Doubling the diameter makes A four times, so R becomes one-fourth: 2.5 Ω."]
        ]
      },
      {
        id: "power", title: "Heating effect and power",
        lead: "Fill in a home's appliances to estimate the monthly bill. Then use the heater calculator below it.",
        build: powerSim,
        points: [
          "Joule's law of heating: H = I²Rt. The heat produced is proportional to the square of the current, to the resistance and to the time.",
          "The heating effect is used in electric heaters, irons, toasters, bulb filaments and fuses.",
          "Electric power is the rate at which electrical energy is used: P = VI = I²R = V²/R. Its unit is the watt (W); 1 W = 1 V × 1 A.",
          "The commercial unit of energy is the kilowatt hour (kWh): 1 kWh = 3.6 × 10⁶ J. One kWh is one “unit” on an electricity bill.",
          "Energy used = power × time. For example, a 1000 W iron used for 1 hour uses 1 kWh."
        ],
        formulas: [["Joule's law", "H = I²Rt"], ["Power", "P = VI = I²R = V²/R"], ["Energy", "E = P × t"], ["Commercial unit", "1 kWh = 3.6 × 10⁶ J"]],
        questions: [
          ["A refrigerator rated 400 W works 8 hours a day. What is the cost of running it for 30 days at ₹3.00 per kWh?", "Energy = 0.4 kW × 8 h × 30 = 96 kWh. Cost = 96 × ₹3.00 = ₹288."],
          ["Compute the heat produced when 96000 C of charge is transferred in one hour through a potential difference of 50 V.", "H = VQ = 50 V × 96000 C = 4.8 × 10⁶ J."],
          ["Two lamps rated 100 W and 60 W at 220 V are connected in parallel to the 220 V mains. What current is drawn from the line?", "Total power = 160 W, so I = P/V = 160/220 ≈ 0.73 A."],
          ["Which uses more energy: a 250 W TV set in 1 hour, or a 1200 W toaster in 10 minutes?", "TV: 250 W × 3600 s = 9.0 × 10⁵ J. Toaster: 1200 W × 600 s = 7.2 × 10⁵ J. The TV uses more."],
          ["An electric heater of resistance 8 Ω draws 15 A from the mains for 2 hours. At what rate is heat produced?", "P = I²R = 15² × 8 = 1800 W = 1.8 kW (1800 J every second)."],
          ["Why does the cord of an electric heater not glow while the heating element does?", "The cord is made of copper, which has very low resistance, while the element has high resistance, so far more heat (I²Rt) is produced in the element."]
        ]
      }
    ]
  },
  {
    id: "magnetism", num: 12, short: "Magnetic Effects", title: "Magnetic Effects of Electric Current", notes: "../magnetic-effects.html",
    topics: [
      {
        id: "field", title: "Field lines and the compass",
        lead: "Choose a conductor. Drag the compass around, reverse the current, and turn up the current to crowd the lines.",
        build: fieldSim,
        points: [
          "Oersted showed that a current in a wire deflects a compass needle: an electric current produces a magnetic field.",
          "Outside a magnet, field lines emerge from the north pole and merge at the south pole; inside, they go from south to north. So field lines are closed curves.",
          "The direction of the field at a point is the direction a compass's north pole points there (the tangent to the field line). Field lines never cross. Where they are crowded, the field is stronger.",
          "Straight wire: the field lines are concentric circles. Right-hand thumb rule: hold the wire with the thumb along the current; the fingers curl in the direction of the field. The field increases with current and decreases with distance from the wire.",
          "Circular loop: near the centre the field lines are almost straight. A coil of n turns gives a field n times as large as a single turn.",
          "Solenoid: the field inside is uniform (parallel lines), and the solenoid behaves like a bar magnet. A soft iron core inside makes an electromagnet."
        ],
        formulas: [["Straight wire", "B ∝ I and B ∝ 1/r"], ["Coil of n turns", "field n times that of one turn"], ["Inside a solenoid", "uniform field"]],
        questions: [
          ["Why don't two magnetic field lines ever cross?", "At a crossing point the compass needle would point in two directions at once, which is impossible."],
          ["A current in a horizontal power line flows from east to west. What is the direction of the magnetic field at a point directly below it and directly above it?", "Using the right-hand thumb rule: directly below the line the field points south; directly above it the field points north."],
          ["A circular loop of wire lies on a table and the current flows clockwise (seen from above). What is the direction of the field inside and outside the loop?", "Inside the loop the field points down into the table; outside the loop it points up out of the table."],
          ["How does the field near a long straight wire change if (a) the current doubles (b) the distance from the wire doubles?", "(a) It doubles. (b) It halves."],
          ["What is the magnetic field like inside a long solenoid carrying current?", "It is the same at all points (uniform), shown by parallel field lines."],
          ["Give two ways to make an electromagnet stronger.", "Increase the current, increase the number of turns, or use a soft iron core."]
        ]
      },
      {
        id: "force", title: "Force on a conductor",
        lead: "Based on NCERT Activity 12.7 (a current-carrying rod between the poles of a horseshoe magnet), seen end-on. Here the magnet lies on its side, so the field is horizontal.",
        build: flemingSim,
        points: [
          "A current-carrying conductor placed in a magnetic field experiences a force.",
          "The force is largest when the current is at right angles to the field, and zero when the current is along the field.",
          "Reversing the current, or reversing the field, reverses the direction of the force.",
          "Fleming's left-hand rule: stretch the thumb, forefinger and middle finger of the left hand so they are mutually perpendicular. If the forefinger points along the field and the middle finger along the current, the thumb points along the force (motion).",
          "Electric motors and loudspeakers use this force."
        ],
        formulas: [["Direction", "F ⟂ I and F ⟂ B"], ["Largest force", "when I ⟂ B"], ["No force", "when I is along B"]],
        questions: [
          ["A positively charged particle (alpha particle) moving towards the west is deflected towards the north by a magnetic field. What is the direction of the field?", "Upwards. With the middle finger west (current) and the thumb north (force), the forefinger points up."],
          ["When is the force on a current-carrying conductor in a magnetic field the largest?", "When the current is at right angles to the magnetic field."],
          ["What happens to the force if both the current and the field are reversed?", "Its direction stays the same."],
          ["A proton moves freely in a magnetic field. Which of these can change: its mass, speed, velocity or momentum?", "Its velocity and momentum (their direction changes). Its mass and speed do not change."],
          ["Name two devices that use the force on a current-carrying conductor in a magnetic field.", "An electric motor and a loudspeaker."]
        ]
      },
      {
        id: "domestic", title: "Domestic circuits and the fuse",
        lead: "Add appliances until the fuse blows. Try the 15 A circuit, and try a short circuit.",
        build: domesticSim,
        points: [
          "In India the mains supply is AC at 220 V and 50 Hz: the current changes direction every 1/100 second.",
          "An advantage of AC over DC: electric power can be transmitted over long distances without much loss of energy.",
          "The supply uses a live wire (usually red insulation), a neutral wire (black) and an earth wire (green). The potential difference between live and neutral is 220 V.",
          "Appliances are connected in parallel, so each gets 220 V and can be switched on or off independently. Usually there is a 15 A circuit for high-power appliances (geysers, air coolers) and a 5 A circuit for bulbs and fans.",
          "Earthing: the metal body of an appliance is connected to the earth wire, a low-resistance path. Any leakage current goes to earth and the body stays at the earth's potential, so the user does not get a severe shock.",
          "A fuse is connected in series in the live wire. If the current becomes too large it melts and breaks the circuit, protecting the wiring and appliances.",
          "Short circuit: the live and neutral wires touch directly (damaged insulation or a faulty appliance). The current suddenly becomes very large.",
          "Overloading: too many appliances on one socket, or a sudden rise in supply voltage, makes the current too large."
        ],
        formulas: [["Current drawn", "I = P / V"], ["Total power (parallel)", "P = P₁ + P₂ + …"], ["Mains in India", "220 V AC, 50 Hz"]],
        questions: [
          ["An electric oven of 2 kW is used in a domestic circuit (220 V) that has a current rating of 5 A. What result do you expect?", "I = P/V = 2000/220 ≈ 9.1 A, which is more than 5 A. The circuit is overloaded and the fuse blows.", { rating: 5, counts: [0, 0, 0, 0, 0, 1] }],
          ["What precautions should be taken to avoid overloading of domestic circuits?", "Do not connect too many appliances to one socket, use separate 15 A circuits for high-power appliances, and use a fuse of the correct rating in the live wire."],
          ["What is the function of an earth wire? Why should metal appliances be earthed?", "The earth wire gives a low-resistance path to the earth. If current leaks to the metal body, it flows to earth and the body stays at the earth's potential, so a person touching it does not get a severe shock."],
          ["What is a short circuit?", "When the live and neutral wires come into direct contact, the resistance of the circuit becomes almost zero and the current suddenly becomes very large."],
          ["Why is the fuse connected in the live wire?", "So that when it melts, the appliance is disconnected from the live wire and is safe to touch."],
          ["What is the frequency of AC in India, and what is one advantage of AC over DC?", "50 Hz. AC can be transmitted over long distances without much loss of energy."]
        ]
      }
    ]
  }
];

const FLAT = [];
CHAPTERS.forEach((ch, ci) => ch.topics.forEach((tp, ti) => FLAT.push([ci, ti])));

/* ===============================================================
   7. PAGE: navigation and side panels
   =============================================================== */
const chapNav = $("#chapters"), topicNav = $("#topics"), stageEl = $("#stage");
let cur = { c: 0, t: 0 };
let allOpen = false;
let simApi = {};

function show(ci, ti) {
  cleanup.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
  cleanup = [];
  redrawers = [];
  cur = { c: ci, t: ti };
  const ch = CHAPTERS[ci], tp = ch.topics[ti];
  clearPageInk();

  chapNav.replaceChildren(...CHAPTERS.map((c, k) => h("button", {
    type: "button", role: "tab", "aria-selected": String(k === ci), onclick: () => show(k, 0)
  }, h("span", { class: "chap-num" }, `Ch ${c.num}`), c.short)));
  topicNav.replaceChildren(...ch.topics.map((t, k) => h("button", {
    type: "button", "aria-current": String(k === ti), onclick: () => show(ci, k)
  }, `${k + 1}. ${t.title}`)));

  $("#chapLabel").textContent = `Chapter ${ch.num} · ${ch.title}`;
  $("#notesLink").href = ch.notes;
  $("#topicTitle").textContent = tp.title;
  $("#topicLead").textContent = tp.lead;
  stageEl.replaceChildren();
  simApi = tp.build(stageEl) || {};

  $("#points").replaceChildren(...tp.points.map(t => h("li", {}, t)));
  $("#formulas").replaceChildren(...tp.formulas.map(([n, e]) => h("div", { class: "formula" }, h("div", { class: "f-n" }, n), h("div", { class: "f-e" }, e))));
  allOpen = false;
  $("#revealAll").textContent = "Show all answers";
  $("#questions").replaceChildren(...tp.questions.map(([q, a, setup], i) => {
    const card = h("div", { class: "q" });
    const btn = h("button", { type: "button", class: "chip small" }, "Show answer");
    btn.addEventListener("click", () => { card.classList.toggle("open"); btn.textContent = card.classList.contains("open") ? "Hide answer" : "Show answer"; });
    card.append(h("p", {}, h("strong", {}, `Q${i + 1}. `), q), h("div", { class: "ans" }, a), btn);
    if (setup && simApi.set) {
      const sb = h("button", { type: "button", class: "chip small" }, "Show in simulation");
      sb.addEventListener("click", () => {
        simApi.set(setup);
        stageEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      card.append(" ", sb);
    }
    return card;
  }));

  const idx = FLAT.findIndex(([a, b]) => a === ci && b === ti);
  $("#pos").textContent = `${idx + 1} of ${FLAT.length}`;
  $("#prev").disabled = idx === 0;
  $("#next").disabled = idx === FLAT.length - 1;
  document.title = `${tp.title} – Class 10 Physics Classroom`;
  try { history.replaceState(null, "", `#${ch.id}/${tp.id}`); } catch (e) { /* file:// */ }
  const active = topicNav.querySelector('[aria-current="true"]');
  if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center" });
}
function step(dlt) {
  const idx = FLAT.findIndex(([a, b]) => a === cur.c && b === cur.t);
  const n = clamp(idx + dlt, 0, FLAT.length - 1);
  if (n !== idx) { show(...FLAT[n]); window.scrollTo({ top: 0, behavior: "smooth" }); }
}
$("#prev").addEventListener("click", () => step(-1));
$("#next").addEventListener("click", () => step(1));
$("#revealAll").addEventListener("click", () => {
  allOpen = !allOpen;
  document.querySelectorAll("#questions .q").forEach(q => {
    q.classList.toggle("open", allOpen);
    q.querySelector(".chip").textContent = allOpen ? "Hide answer" : "Show answer";
  });
  $("#revealAll").textContent = allOpen ? "Hide all answers" : "Show all answers";
});

function redrawAll() { requestAnimationFrame(() => redrawers.forEach(f => f())); }

/* ---------- Theme and text size ---------- */
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
  fontScale = clamp(Math.round(v * 10) / 10, 0.8, 1.6);
  document.documentElement.style.setProperty("--fs", fontScale);
  store.set("cls-fs", String(fontScale));
  redrawAll();
}
$("#tBigger").addEventListener("click", () => setFont(fontScale + 0.1));
$("#tSmaller").addEventListener("click", () => setFont(fontScale - 0.1));
$("#tFull").addEventListener("click", toggleFull);
function toggleFull() {
  const d = document;
  if (!d.fullscreenElement) { if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => {}); }
  else if (d.exitFullscreen) d.exitFullscreen();
}

/* ---------- Pen and whiteboard ----------
   Strokes are kept as lists of points. Pen strokes on the page are stored in page coordinates,
   so they stay with the content when the page scrolls. Board strokes belong to the board. */
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
  ictx.strokeStyle = s.color;
  ictx.lineWidth = s.width;
  ictx.lineCap = "round"; ictx.lineJoin = "round";
}
function redrawInk() {
  ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, ink.width, ink.height); ictx.restore();
  const [ox, oy] = inkOffset();
  for (const s of strokes[onBoard() ? "board" : "page"]) {
    ictx.save(); strokeStyle(s);
    ictx.beginPath();
    s.pts.forEach(([x, y], j) => (j ? ictx.lineTo(x - ox, y - oy) : ictx.moveTo(x - ox, y - oy)));
    if (s.pts.length === 1) ictx.lineTo(s.pts[0][0] - ox + 0.01, s.pts[0][1] - oy + 0.01);
    ictx.stroke(); ictx.restore();
  }
}
function clearPageInk() { strokes.page = []; if (!onBoard()) redrawInk(); }
sizeInk();
window.addEventListener("resize", sizeInk);
let inkScrollQueued = false;
window.addEventListener("scroll", () => {
  if (onBoard() || !strokes.page.length || inkScrollQueued) return;
  inkScrollQueued = true;
  requestAnimationFrame(() => { inkScrollQueued = false; redrawInk(); });
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
  if (on) {
    setPen(true);
    if (penColor === "#111111") sw.querySelector(".swatch").click();   // black would not show on the board
  }
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
  ictx.save(); strokeStyle(curStroke);
  ictx.beginPath(); ictx.moveTo(e.clientX, e.clientY); ictx.lineTo(e.clientX + 0.01, e.clientY + 0.01); ictx.stroke();
  ictx.restore();
});
ink.addEventListener("pointermove", e => {
  if (!curStroke) return;
  const [ox, oy] = inkOffset();
  const last = curStroke.pts[curStroke.pts.length - 1];
  curStroke.pts.push([e.clientX + ox, e.clientY + oy]);
  ictx.save(); strokeStyle(curStroke);
  ictx.beginPath(); ictx.moveTo(last[0] - ox, last[1] - oy); ictx.lineTo(e.clientX, e.clientY); ictx.stroke();
  ictx.restore();
});
["pointerup", "pointercancel"].forEach(t => ink.addEventListener(t, () => { curStroke = null; }));

/* ---------- Timer ---------- */
const tp = $("#timerPanel"), tDisp = $("#timerDisplay"), tGo = $("#timerGo");
let tTotal = 120, tLeft = 120, tRun = false, tLast = 0, tTimer = null;
const mmss = s => { s = Math.max(0, Math.ceil(s - 1e-6)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
function tRender() { tDisp.textContent = mmss(tLeft); }
[["1 min", 60], ["2 min", 120], ["3 min", 180], ["5 min", 300], ["+30 s", 30]].forEach(([t, s]) => {
  const b = h("button", { type: "button", class: "chip" }, t);
  b.addEventListener("click", () => {
    if (t[0] === "+") { tLeft += s; tTotal += s; } else { tTotal = s; tLeft = s; }
    tDisp.classList.remove("done");
    tRender();
  });
  $("#timerPresets").append(b);
});
function tTick() {
  if (!tRun) return;
  const now = performance.now();
  tLeft -= (now - tLast) / 1000;
  tLast = now;
  if (tLeft <= 0) {
    tLeft = 0; tRun = false; tGo.textContent = "Start";
    tDisp.classList.add("done");
    beep();
  }
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
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
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

/* ---------- Student picker ---------- */
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
      pNote.textContent = picked.size === N
        ? `Everyone (${N}) has been picked. The next pick starts a new round.`
        : `Picked ${picked.size} of ${N}. Nobody is picked twice until everyone has had a turn.`;
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

/* ---------- Keyboard ---------- */
document.addEventListener("keydown", e => {
  if (e.target.closest && e.target.closest("input, select, textarea")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  if (k === "ArrowRight") { step(1); e.preventDefault(); }
  else if (k === "ArrowLeft") { step(-1); e.preventDefault(); }
  else if (k >= "1" && k <= "4") show(+k - 1, 0);
  else if (k === "p" || k === "P") $("#tPen").click();
  else if (k === "b" || k === "B") $("#tBoard").click();
  else if (k === "t" || k === "T") $("#tTimer").click();
  else if (k === "r" || k === "R") $("#tPick").click();
  else if (k === "f" || k === "F") toggleFull();
  else if (k === "+" || k === "=") setFont(fontScale + 0.1);
  else if (k === "-" || k === "_") setFont(fontScale - 0.1);
  else if (k === "Escape") {
    if (penOn) { setBoard(false); setPen(false); }
    togglePanel(tp, $("#tTimer"), false);
    togglePanel(pp, $("#tPick"), false);
  }
});

/* ---------- Start ---------- */
function fromHash() {
  const [c, t] = decodeURIComponent(location.hash.slice(1)).split("/");
  const ci = CHAPTERS.findIndex(ch => ch.id === c);
  if (ci < 0) return [0, 0];
  const ti = CHAPTERS[ci].topics.findIndex(tp2 => tp2.id === t);
  return [ci, Math.max(0, ti)];
}
show(...fromHash());
window.addEventListener("hashchange", () => { const [a, b] = fromHash(); if (a !== cur.c || b !== cur.t) show(a, b); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(redrawAll);
})();
