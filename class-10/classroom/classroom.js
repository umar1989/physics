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

function makeCanvas(parent, { ratio = 0.5, mratio = null, min = 220, max = 640, touch = false } = {}) {
  const wrap = h("div", { class: "canvas-wrap" + (touch ? " touch" : "") });
  const cv = h("canvas");
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
function opticsSim(stage, kind) {
  const isMirror = kind === "mirror";
  let type = isMirror ? "concave" : "convex";
  let F = 10, U = 25;

  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.82 });
  const ctl = controls(stage);
  seg(ctl, {
    label: isMirror ? "Mirror" : "Lens", value: type,
    options: isMirror ? [["concave", "Concave"], ["convex", "Convex"]] : [["convex", "Convex"], ["concave", "Concave"]]
  }, v => { type = v; buildPresets(); draw(); });
  slider(ctl, { label: "Focal length |f|", min: 5, max: 20, step: 1, value: F, unit: "cm" }, v => { F = v; draw(); });
  const sU = slider(ctl, { label: "Object distance |u|", min: 2, max: 60, step: 0.5, value: U, unit: "cm" }, v => { U = v; draw(); });
  const pre = chipRow(stage);
  const ro = readouts(stage);

  const converging = () => (isMirror ? type === "concave" : type === "convex");

  function buildPresets() {
    pre.replaceChildren(h("span", { class: "presets-label" }, "Place object"));
    const c2 = isMirror ? "C" : "2F₁", c1 = isMirror ? "F" : "F₁", o = isMirror ? "P" : "O";
    const list = converging()
      ? [[`Beyond ${c2}`, 2.6], [`At ${c2}`, 2], [`Between ${c1} and ${c2}`, 1.5], [`At ${c1}`, 1], [`Between ${c1} and ${o}`, 0.5]]
      : [["Far away", 4], ["Middle distance", 1.5], ["Very close", 0.4]];
    for (const [t, k] of list) chip(pre, t, () => { U = clamp(Math.round(F * k * 2) / 2, 2, 60); sU.value = U; draw(); });
  }
  buildPresets();

  function solve() {
    const f = converging() ? (isMirror ? -F : F) : (isMirror ? F : -F);   // NCERT sign convention
    const u = -U;
    const inv = isMirror ? 1 / f - 1 / u : 1 / f + 1 / u;                 // mirror: 1/v + 1/u = 1/f ; lens: 1/v − 1/u = 1/f
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
    const s = (x0 - 18) / 62;                       // pixels per cm
    const { f, u, v, m, atInf, real } = solve();

    label(ctx, "Incident light →  (+ve direction)", 10, 14, { color: p.soft, size: 12, align: "left" });
    line(ctx, 0, ay, w, ay, p.soft, 1, [6, 5]);

    // Optical element
    if (isMirror) {
      const Rpx = 2 * F * s;
      const hm = Math.min(H * 0.42, Rpx * 0.92);
      const a = Math.asin(hm / Rpx);
      const cx = type === "concave" ? x0 - Rpx : x0 + Rpx;
      const a0 = type === "concave" ? -a : Math.PI - a, a1 = type === "concave" ? a : Math.PI + a;
      ctx.save();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.arc(cx, ay, Rpx, a0, a1); ctx.stroke();
      ctx.lineWidth = 1.2;
      for (let k = 0; k <= 14; k++) {
        const th = lerp(a0, a1, k / 14);
        const px = cx + Rpx * Math.cos(th), py = ay + Rpx * Math.sin(th);
        ctx.beginPath(); ctx.moveTo(px + 1, py); ctx.lineTo(px + 8, py - 7); ctx.stroke();
      }
      ctx.restore();
    } else {
      const hl = H * 0.42, t = 13;
      ctx.save();
      ctx.beginPath();
      if (type === "convex") {
        ctx.moveTo(x0, ay - hl);
        ctx.quadraticCurveTo(x0 + t * 2, ay, x0, ay + hl);
        ctx.quadraticCurveTo(x0 - t * 2, ay, x0, ay - hl);
      } else {
        ctx.moveTo(x0 - t, ay - hl); ctx.lineTo(x0 + t, ay - hl);
        ctx.quadraticCurveTo(x0 - t * 0.5, ay, x0 + t, ay + hl);
        ctx.lineTo(x0 - t, ay + hl);
        ctx.quadraticCurveTo(x0 + t * 0.5, ay, x0 - t, ay - hl);
      }
      ctx.closePath();
      ctx.fillStyle = p.dark ? "rgba(110,180,240,0.18)" : "rgba(70,150,215,0.16)";
      ctx.fill();
      ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }

    // Marks on principal axis
    const marks = isMirror
      ? [[x0 + f * s, "F"], [x0 + 2 * f * s, "C"]]
      : [[x0 - F * s, "F₁"], [x0 - 2 * F * s, "2F₁"], [x0 + F * s, "F₂"], [x0 + 2 * F * s, "2F₂"]];
    for (const [x, t] of marks) {
      if (x > 6 && x < w - 6) { line(ctx, x, ay - 5, x, ay + 5, p.text, 2); label(ctx, t, x, ay + 17, { color: p.text, size: 13 }); }
    }
    label(ctx, isMirror ? "P" : "O", x0 + 12, ay + 17, { color: p.text, size: 13 });

    // Object and rays
    const ho = Math.min(H * 0.17, 54);
    const xo = x0 + u * s, yo = ay - ho;
    const rays = [];
    {
      const sg = converging() ? 1 : -1;
      rays.push({ hy: yo, dx: (isMirror ? -1 : 1) * F * s, dy: sg * (ay - yo), c: p.r1, name: "parallel" });
    }
    {
      const fx = isMirror ? x0 + f * s : x0 - f * s;
      if (Math.abs(fx - xo) > 0.5) {
        const hy = yo + (x0 - xo) * (ay - yo) / (fx - xo);
        if (Math.abs(hy - ay) < H * 0.46) rays.push({ hy, dx: isMirror ? -1 : 1, dy: 0, c: p.r2, name: "focus" });
      }
    }
    {
      const dx0 = x0 - xo, dy0 = ay - yo;
      rays.push({ hy: ay, dx: isMirror ? -dx0 : dx0, dy: dy0, c: p.r3, name: "centre" });
    }
    const xi = x0 + v * s, yi = ay - m * ho;
    for (const r of rays) {
      drawRay(ctx, xo, yo, x0, r.hy, r.c, { width: 2 });
      const [ex, ey] = toEdge(x0, r.hy, r.dx, r.dy, w, H);
      drawRay(ctx, x0, r.hy, ex, ey, r.c, { width: 2 });
      if (!atInf && !real) line(ctx, x0, r.hy, xi, yi, r.c, 1.5, [5, 5], 0.8);
    }

    vArrow(ctx, xo, ay, yo, p.obj, { width: 3.5 });
    label(ctx, "Object", xo, yo - 12, { color: p.obj, size: 13 });

    const nature = atInf
      ? "Image at infinity (rays come out parallel)"
      : `${real ? "Real" : "Virtual"}, ${m < 0 ? "inverted" : "erect"}, ${Math.abs(m) > 1.02 ? "magnified" : Math.abs(m) < 0.98 ? "diminished" : "same size"}`;
    if (!atInf) {
      vArrow(ctx, xi, ay, yi, p.img, { width: 3.5, dash: real ? null : [6, 4] });
      if (xi > 0 && xi < w) {
        const ly = clamp(m > 0 ? yi - 12 : yi + 14, 10, H - 10);
        label(ctx, "Image", xi, ly, { color: p.img, size: 13, bg: p.surface2 });
      } else {
        label(ctx, xi < 0 ? "← image is off-screen" : "image is off-screen →", xi < 0 ? 10 : w - 10, H - 14,
          { color: p.img, size: 12, align: xi < 0 ? "left" : "right" });
      }
    }
    label(ctx, nature, w - 10, 14, { color: atInf ? p.soft : real ? p.r1 : p.r3, size: 14, align: "right", weight: 700 });

    const items = [
      { k: "Object distance u", v: `${fmt(u)} cm` },
      { k: "Image distance v", v: atInf ? "∞" : `${sgnf(v)} cm` },
      { k: "Focal length f", v: `${sgnf(f, 0)} cm` },
      { k: "Magnification m", v: atInf ? "∞" : sgnf(m, 2) }
    ];
    if (isMirror) items.push({ k: "Radius R = 2f", v: `${sgnf(2 * f, 0)} cm` });
    else items.push({ k: "Power P = 1/f", v: `${sgnf(100 / f, 2)} D` });
    items.push({ k: "Image", v: nature, wide: true });
    ro(items);
  }
}

/* ---------- 5.2 Refraction: two media and glass slab ---------- */
function refractionSim(stage) {
  const MEDIA = [["1.00", "Air (1.00)"], ["1.33", "Water (1.33)"], ["1.44", "Kerosene (1.44)"], ["1.52", "Crown glass (1.52)"], ["2.42", "Diamond (2.42)"]];
  const NAME = { "1.00": "Air", "1.33": "Water", "1.44": "Kerosene", "1.52": "Crown glass", "2.42": "Diamond" };
  let mode = "interface", n1 = "1.00", n2 = "1.52", nS = "1.52", iDeg = 40;

  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.85 });
  const ctl = controls(stage);
  seg(ctl, { label: "Show", value: mode, options: [["interface", "Two media"], ["slab", "Glass slab"]] }, v => { mode = v; sync(); draw(); });
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
      const sx = ox - L * Math.sin(i), sy = oy - L * Math.cos(i);
      drawRay(ctx, sx, sy, ox, oy, p.beam, { width: 3.5 });
      const sr = a * Math.sin(i) / b;
      const tir = sr > 1;
      drawRay(ctx, ox, oy, ox + L * Math.sin(i), oy - L * Math.cos(i), p.beam, { width: tir ? 3.5 : 1.5, alpha: tir ? 1 : 0.35 });
      angleArc(ctx, ox, oy, 40, -Math.PI / 2 - i, -Math.PI / 2, p.text, "i");
      let r = null;
      if (!tir) {
        r = Math.asin(sr);
        drawRay(ctx, ox, oy, ox + L * Math.sin(r), oy + L * Math.cos(r), p.beam, { width: 3.5 });
        angleArc(ctx, ox, oy, 40, Math.PI / 2 - r, Math.PI / 2, p.text, "r");
      } else {
        label(ctx, "No refracted ray: total internal reflection (Class 12)", w / 2, oy + H * 0.25, { color: p.warn, size: 13, bg: p.surface });
      }
      const bend = a === b || iDeg === 0 ? "Goes straight (no bending)" : b > a ? "Bends towards the normal" : "Bends away from the normal";
      ro([
        { k: "Angle of incidence i", v: `${iDeg}°` },
        { k: "Angle of refraction r", v: tir ? "—" : `${fmt(r / DEG, 1)}°` },
        { k: "n₂₁ = n₂ / n₁", v: fmt(b / a, 2) },
        { k: "sin i / sin r", v: iDeg === 0 || tir ? "—" : fmt(Math.sin(i) / Math.sin(r), 2) },
        { k: "Speed in medium 1", v: `${fmt(3 / a, 2)} × 10⁸ m/s` },
        { k: "Speed in medium 2", v: `${fmt(3 / b, 2)} × 10⁸ m/s` },
        { k: "What happens", v: tir ? "Light is totally reflected back" : bend, wide: true }
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
      const sx = ox - L * Math.sin(i), sy = oy - L * Math.cos(i);
      const ext = L + T / Math.max(Math.cos(i), 0.15);
      line(ctx, ox, oy, ox + ext * Math.sin(i), oy + ext * Math.cos(i), p.soft, 1.5, [4, 5]);
      drawRay(ctx, sx, sy, ox, oy, p.beam, { width: 3.5 });
      drawRay(ctx, ox, oy, bx, by, p.beam, { width: 3.5 });
      const [ex, ey] = toEdge(bx, by, Math.sin(i), Math.cos(i), w, H);
      drawRay(ctx, bx, by, ex, ey, p.beam, { width: 3.5 });

      // lateral displacement
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
        { k: "Lateral shift d (5 cm slab)", v: `${fmt(d, 2)} cm` },
        { k: "Key idea", v: "The emergent ray is parallel to the incident ray (e = i); it is only shifted sideways.", wide: true }
      ]);
    }
  }
}

/* ---------- 5.3 Human eye: defects and correction ---------- */
function eyeSim(stage) {
  let cond = "myopia", obj = "far", fix = "off";
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.66 });
  const ctl = controls(stage);
  seg(ctl, { label: "Eye", value: cond, options: [["normal", "Normal"], ["myopia", "Myopia"], ["hyper", "Hypermetropia"]] }, v => { cond = v; draw(); });
  seg(ctl, { label: "Looking at", value: obj, options: [["far", "Distant object"], ["near", "Near object"]] }, v => { obj = v; draw(); });
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
    const xE = cx - 0.6 * r, xR = cx + r, D = xR - xE;
    const xC = cx - r - Math.max(24, w * 0.05);
    const xNear = xE - 1.37 * D;
    const uN = xNear - xE;
    const fN = 1 / (1 / D - 1 / uN);
    const fH = 1 / (1 / (1.3 * D) - 1 / uN);
    const fM = 0.68 * D;
    // Accommodation range in power (1/f). A defective eye keeps the same span as a normal eye, shifted:
    // myopia has too much power, hypermetropia too little.
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

    // eyeball
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
    ctx.save();
    ctx.beginPath(); ctx.ellipse(xE, ay, rx, a * 1.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = p.dark ? "rgba(110,180,240,0.25)" : "rgba(70,150,215,0.22)"; ctx.fill();
    ctx.strokeStyle = p.glassEdge; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    label(ctx, "Eye lens", xE, ay + 0.62 * r + 14, { color: p.soft, size: 12 });

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
      label(ctx, fC > 0 ? "Convex (+)" : "Concave (−)", xC, ay - hl - 12, { color: p.glassEdge, size: 12, weight: 700 });
    }

    // rays (paraxial thin-lens tracing)
    const lenses = [];
    if (useLens) lenses.push({ x: xC, f: fC });
    lenses.push({ x: xE, f: fEye });
    const ends = [];
    for (let k = 0; k < 5; k++) {
      const t = k / 4 * 2 - 1;
      let x, y, sl;
      if (obj === "far") { x = 0; y = t * a * 0.85; sl = 0; }
      else { x = xNear; y = 0; sl = (t * a * 0.85) / (lenses[0].x - xNear); }
      const pts = [[x, y]];
      for (const Ln of lenses) { y += sl * (Ln.x - x); x = Ln.x; pts.push([x, y]); sl -= y / Ln.f; }
      const end = circleHit(x, y, sl, cx, r);
      pts.push(end);
      ends.push(end);
      ctx.save(); ctx.strokeStyle = p.beam; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, ay - py) : ctx.moveTo(px, ay - py))); ctx.stroke(); ctx.restore();
      if (obj === "far" && !useLens) head(ctx, xC - 30, ay - pts[0][1], 0, 9, p.beam);
    }

    const sharp = Math.abs(xImg - xR) < 4;
    if (sharp) {
      circle(ctx, xR, ay, 6, p.ok);
      label(ctx, "Sharp image on retina ✓", xR - 4, ay + r * 0.5 + 6, { color: p.ok, size: 13, weight: 700, align: "right", bg: p.surface });
    } else if (xImg > xR) {
      ends.forEach(([ex, ey]) => line(ctx, ex, ay - ey, xImg, ay, p.beam, 1.5, [4, 4], 0.75));
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Would focus behind retina ✗", xR - 6, ay + r * 0.5 + 6, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    } else {
      circle(ctx, xImg, ay, 5, p.warn);
      label(ctx, "Focus in front of retina ✗", xR - 6, ay + r * 0.5 + 6, { color: p.warn, size: 13, weight: 700, align: "right", bg: p.surface });
    }

    // object labels and special points
    if (obj === "far") label(ctx, "Parallel rays from a distant object", 10, 16, { color: p.soft, size: 13, align: "left" });
    else {
      circle(ctx, xNear, ay, 6, p.obj);
      label(ctx, "Near object", xNear, ay - 18, { color: p.obj, size: 13 });
    }
    if (cond === "myopia" && xFP > 8) {
      line(ctx, xFP, ay - 7, xFP, ay + 7, p.r3, 2);
      label(ctx, "Far point", xFP, ay + 20, { color: p.r3, size: 12 });
    }
    if (cond === "hyper" && obj === "near" && xNP > 8) {
      line(ctx, xNP, ay - 7, xNP, ay + 7, p.r3, 2);
      label(ctx, "Near point", xNP, ay + 20, { color: p.r3, size: 12 });
    }

    const msg = {
      "normal-far": "Normal eye, relaxed: parallel rays focus exactly on the retina.",
      "normal-near": "Accommodation: the ciliary muscles make the eye lens thicker (shorter focal length), so the near object is focused on the retina.",
      "myopia-far-off": "Myopia: the eye lens is too strong or the eyeball too long. Rays from a distant object meet in front of the retina, so the image is blurred.",
      "myopia-far-on": "A concave (diverging) lens spreads the rays so they seem to come from the far point. Now the image falls on the retina.",
      "myopia-near": "A short-sighted (myopic) eye sees near objects clearly.",
      "hyper-near-off": "Hypermetropia: the eye lens cannot become strong enough or the eyeball is too short. Rays from a near object would meet behind the retina, so it looks blurred.",
      "hyper-near-on": "A convex (converging) lens makes the rays seem to come from the eye's near point. Now the image falls on the retina.",
      "hyper-far": "A long-sighted (hypermetropic) eye sees distant objects clearly."
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
  const cv = makeCanvas(stage, { ratio: 0.52, mratio: 0.85 });
  const ctl = controls(stage);
  slider(ctl, { label: "Angle of incidence i", min: 25, max: 75, step: 1, value: iDeg, unit: "°" }, v => { iDeg = v; draw(); });
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
      if (Math.abs(end[0] - screenX) < 1) circle(ctx, screenX, end[1], 4, col);
    }
    drawRay(ctx, start[0], start[1], P0[0], P0[1], p.text, { width: 4.5 });
    label(ctx, "White light", start[0] + 8, start[1] + 18, { color: p.text, size: 13, align: "left" });
    label(ctx, "A", A[0], A[1] - 12, { color: p.soft, size: 12 });

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
      { k: "Angle of incidence", v: `${iDeg}°` },
      { k: "Deviation of red", v: `${fmt(dr, 1)}°` },
      { k: "Deviation of violet", v: `${fmt(dv, 1)}°` },
      { k: "Order on screen", v: "V I B G Y O R", wide: false },
      { k: "Why", v: "Each colour travels at a different speed in glass, so each bends by a different angle. Violet bends most, red least.", wide: true }
    ] : [
      { k: "Net deviation (red)", v: `${fmt(dr, 1)}°` },
      { k: "Net deviation (violet)", v: `${fmt(dv, 1)}°` },
      { k: "Newton's conclusion", v: "The inverted prism undoes the spreading, and white light comes out. So white light is a mixture of the seven colours.", wide: true }
    ]);
  }
}

/* ---------- 5.5 Scattering: why the sky is blue and sunsets are red ---------- */
function scatterSim(stage) {
  let t = 0.5, air = "on";
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.8 });
  const ctl = controls(stage);
  const timeStr = v => {
    const mins = Math.round((6 + 12 * v) * 60);
    let hr = Math.floor(mins / 60), mn = mins % 60;
    const ap = hr >= 12 ? "pm" : "am";
    hr = hr > 12 ? hr - 12 : hr;
    return `${hr}:${String(mn).padStart(2, "0")} ${ap}`;
  };
  const sT = slider(ctl, { label: "Time of day", min: 0, max: 1, step: 0.005, value: t, fmt: timeStr }, v => { t = v; draw(); });
  seg(ctl, { label: "Atmosphere", value: air, options: [["on", "Earth (with air)"], ["off", "No air (space)"]] }, v => { air = v; draw(); });
  const pre = chipRow(stage, "Jump to");
  [["Sunrise", 0.01], ["Morning", 0.22], ["Noon", 0.5], ["Evening", 0.8], ["Sunset", 0.99]].forEach(([n, v]) =>
    chip(pre, n, () => { t = v; sT.value = v; draw(); }));
  const ro = readouts(stage);
  const K = [0.06, 0.13, 0.3];      // scattering strength for red, green, blue (blue scatters ~4–5× more than red)

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    const gy = H * 0.82, ox = w / 2;
    const theta = Math.PI * t;
    const eDeg = Math.max(0.5, t <= 0.5 ? 180 * t : 180 * (1 - t));
    const AM = 1 / (Math.sin(eDeg * DEG) + 0.50572 * Math.pow(eDeg + 6.07995, -1.6364));
    const T = K.map(k => Math.exp(-k * AM));
    const mx = Math.max(...T);
    let sun = T.map(x => 255 * Math.pow(x / mx, 0.6));
    const dayness = clamp(Math.sin(eDeg * DEG) * 2.5, 0, 1);
    let zen, hor;
    if (air === "on") {
      zen = mix([22, 32, 74], [64, 132, 228], dayness);
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
    // atmosphere layer
    const top = gy - H * 0.38;
    if (air === "on") {
      line(ctx, 0, top, w, top, "rgba(255,255,255,0.55)", 1.2, [6, 6]);
      label(ctx, "Top of the atmosphere", 10, top - 10, { color: "rgba(255,255,255,0.9)", size: 12, align: "left" });
    }
    // sun
    const Rs = Math.min(w * 0.46, gy * 0.95);
    const sx = ox - Rs * Math.cos(theta), sy = gy - Rs * Math.sin(theta);
    const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, 60);
    glow.addColorStop(0, rgb(sun, 0.9)); glow.addColorStop(1, rgb(sun, 0));
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 60, 0, Math.PI * 2); ctx.fill();
    circle(ctx, sx, sy, 17, rgb(sun));
    // light path through air
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
          drawRay(ctx, px + Math.cos(a) * 4, py + Math.sin(a) * 4, px + Math.cos(a) * 16, py + Math.sin(a) * 16, "rgb(120,170,255)", { width: 2, arrow: false });
          head(ctx, px + Math.cos(a) * 18, py + Math.sin(a) * 18, a, 6, "rgb(120,170,255)");
        }
      }
    }
    // ground and observer
    ctx.fillStyle = p.dark ? "#26331f" : "#7b9a5a"; ctx.fillRect(0, gy, w, H - gy);
    ctx.save(); ctx.strokeStyle = p.dark ? "#e6e9f2" : "#1c2233"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(ox, gy - 26, 5, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, gy - 21); ctx.lineTo(ox, gy - 9); ctx.moveTo(ox, gy - 9); ctx.lineTo(ox - 5, gy);
    ctx.moveTo(ox, gy - 9); ctx.lineTo(ox + 5, gy); ctx.moveTo(ox - 6, gy - 17); ctx.lineTo(ox + 6, gy - 17); ctx.stroke(); ctx.restore();
    label(ctx, "You", ox + 12, gy - 18, { color: "#fff", size: 12, align: "left" });

    const sunWord = air === "off" ? "White" : AM > 12 ? "Red / orange" : AM > 3.5 ? "Yellow-orange" : "White-yellow";
    const skyWord = air === "off" ? "Black: no air to scatter light" : dayness < 0.35 ? "Reddish near the horizon" : "Blue";
    ro(air === "on" ? [
      { k: "Sun's height", v: `${fmt(eDeg, 0)}° above horizon` },
      { k: "Air crossed", v: `${fmt(AM, 1)} × the noon path` },
      { k: "Blue light reaching you", v: `${fmt(T[2] * 100, 0)}%` },
      { k: "Red light reaching you", v: `${fmt(T[0] * 100, 0)}%` },
      { k: "Sun looks", v: sunWord },
      { k: "Sky looks", v: skyWord },
      { k: "Why", v: "Tiny particles of air scatter blue light much more than red. Blue scattered from all directions makes the sky blue. Near sunrise and sunset, light crosses so much air that most blue is scattered away before it reaches you, leaving red.", wide: true }
    ] : [
      { k: "Sun looks", v: sunWord },
      { k: "Sky looks", v: skyWord },
      { k: "Why", v: "With no atmosphere nothing scatters sunlight towards you, so the sky is dark even in daytime. Astronauts see a black sky.", wide: true }
    ]);
  }
}

/* ---------- 5.6 Ohm's law with V–I graph ---------- */
function ohmSim(stage) {
  let cells = 2, R = 4, closed = "on", show = "current";
  let phase = 0;
  const readings = [];
  const twin = h("div", { class: "twin" });
  stage.append(twin);
  const left = h("div"), right = h("div");
  twin.append(left, right);
  const cv = makeCanvas(left, { ratio: 0.62, mratio: 0.78 });
  const gv = makeCanvas(right, { ratio: 0.85, mratio: 0.8, max: 460 });
  const ctl = controls(stage);
  slider(ctl, { label: "Cells (1.5 V each)", min: 1, max: 4, step: 1, value: cells, fmt: v => `${v} → ${fmt(v * 1.5, 1)} V` }, v => { cells = v; drawGraph(); });
  slider(ctl, { label: "Resistance R", min: 1, max: 10, step: 0.5, value: R, unit: "Ω" }, v => { R = v; drawGraph(); });
  seg(ctl, { label: "Key (switch)", value: closed, options: [["on", "Closed"], ["off", "Open"]] }, v => { closed = v; drawGraph(); });
  seg(ctl, { label: "Show moving", value: show, options: [["current", "Conventional current"], ["e", "Electrons"]] }, v => { show = v; });
  const row = chipRow(stage, "Lab record");
  chip(row, "Record this reading", () => {
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
    const btop = ym - cells * 9, bbot = ym + cells * 9;
    const xa = cxm - w * 0.12, xb = cxm + w * 0.12;
    const wc = p.text;
    line(ctx, x1, btop, x1, y1, wc, 2.5);
    line(ctx, x1, y1, xa, y1, wc, 2.5);
    line(ctx, xb, y1, x2, y1, wc, 2.5);
    line(ctx, x2, y1, x2, ym - 14, wc, 2.5);
    line(ctx, x2, ym + 14, x2, y2, wc, 2.5);
    line(ctx, x2, y2, x1, y2, wc, 2.5);
    line(ctx, x1, y2, x1, bbot, wc, 2.5);
    // cells
    for (let j = 0; j < cells; j++) {
      const yy = btop + j * 18 + 4;
      line(ctx, x1 - 16, yy, x1 + 16, yy, wc, 2.5);
      line(ctx, x1 - 8, yy + 9, x1 + 8, yy + 9, wc, 5);
      if (j < cells - 1) line(ctx, x1, yy + 9, x1, yy + 18 + 4, wc, 2);
    }
    label(ctx, "+", x1 - 24, btop + 4, { color: p.r1, size: 16, weight: 700 });
    label(ctx, "−", x1 - 24, bbot - 4, { color: p.r3, size: 16, weight: 700 });
    label(ctx, `${fmt(V, 1)} V`, x1 + 22, ym, { color: p.text, size: 13, align: "left" });
    // resistor
    ctx.save(); ctx.strokeStyle = p.img; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(xa, y1);
    const nz = 8;
    for (let k = 0; k < nz; k++) ctx.lineTo(lerp(xa, xb, (k + 0.5) / nz), y1 + (k % 2 ? 9 : -9));
    ctx.lineTo(xb, y1); ctx.stroke(); ctx.restore();
    label(ctx, `R = ${fmt(R, 1)} Ω`, cxm, y1 - 20, { color: p.img, size: 13, weight: 700 });
    // switch
    if (closed === "on") line(ctx, x2, ym - 14, x2, ym + 14, wc, 2.5);
    else line(ctx, x2, ym + 14, x2 + 15, ym - 10, wc, 2.5);
    circle(ctx, x2, ym - 14, 3, wc); circle(ctx, x2, ym + 14, 3, wc);
    label(ctx, "Key", x2 + 10, ym + 24, { color: p.soft, size: 12, align: "left" });
    // voltmeter across R
    const yv = y1 + (y2 - y1) * 0.36;
    line(ctx, xa, y1, xa, yv, p.soft, 1.8);
    line(ctx, xb, y1, xb, yv, p.soft, 1.8);
    line(ctx, xa, yv, cxm - 17, yv, p.soft, 1.8);
    line(ctx, cxm + 17, yv, xb, yv, p.soft, 1.8);
    circle(ctx, cxm, yv, 17, p.surface, p.text, 2);
    label(ctx, "V", cxm, yv + 1, { color: p.text, size: 15, weight: 700 });
    label(ctx, `${fmt(VR, 2)} V`, cxm, yv + 30, { color: p.accent, size: 14, weight: 700 });
    // ammeter
    circle(ctx, cxm, y2, 17, p.surface, p.text, 2);
    label(ctx, "A", cxm, y2 + 1, { color: p.text, size: 15, weight: 700 });
    label(ctx, `${fmt(I, 2)} A`, cxm, y2 - 30, { color: p.accent, size: 14, weight: 700 });
    // moving charges
    const info = pathInfo([[x1, btop], [x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, bbot]]);
    if (I > 0) drawFlow(ctx, info, phase, 26, show === "e" ? "e" : "c", show === "e" ? p.r3 : p.r1);
    label(ctx, show === "e" ? "Electrons flow − → + (outside the cell)" : "Current flows + → − (outside the cell)",
      w / 2, H - 10, { color: p.soft, size: 12 });

    ro([
      { k: "Potential difference V", v: `${fmt(VR, 2)} V` },
      { k: "Current I", v: `${fmt(I, 2)} A` },
      { k: "V ÷ I", v: I > 0 ? `${fmt(VR / I, 2)} Ω` : "—" },
      { k: "Readings recorded", v: String(readings.length) },
      { k: "Ohm's law", v: "Double the cells and the current doubles: V ∝ I, so V/I stays equal to R.", wide: true }
    ]);
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
    label(ctx, "V–I graph  (slope = R)", ml, 14, { color: p.text, size: 13, align: "left", weight: 700 });
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
    label(ctx, "Current I (A) →", ml + pw, H - 6, { color: p.soft, size: 12, align: "right", base: "bottom" });
    ctx.save(); ctx.translate(12, mt + ph / 2); ctx.rotate(-Math.PI / 2);
    label(ctx, "V (volt) →", 0, 0, { color: p.soft, size: 12 }); ctx.restore();

    const groups = [...new Set(readings.map(r => r.R))];
    groups.forEach((Rg, gi) => {
      const col = p[GCOL[gi % GCOL.length]];
      const pts = readings.filter(r => r.R === Rg);
      if (pts.length >= 2) {
        const iEnd = Math.min(Imax, Vmax / Rg);
        line(ctx, X(0), Y(0), X(iEnd), Y(Rg * iEnd), col, 2);
        label(ctx, `R = ${fmt(Rg, 1)} Ω`, X(iEnd) - 4, Y(Rg * iEnd) + 12, { color: col, size: 12, align: "right", weight: 700, bg: p.surface });
      }
      pts.forEach(r => circle(ctx, X(r.I), Y(r.V), 5, col, p.surface, 1.5));
    });
    if (Inow > 0) circle(ctx, X(Inow), Y(Vnow), 7, null, p.text, 2);
    if (!readings.length) label(ctx, "Press “Record this reading”", ml + pw / 2, mt + 16, { color: p.soft, size: 13, bg: p.surface2 });
  }
}

/* ---------- 5.7 Series and parallel ---------- */
function circuitsSim(stage) {
  let mode = "series", V = 6;
  const Rs = [4, 6, 12], broken = [false, false, false];
  const phases = [0, 0, 0, 0];
  const cv = makeCanvas(stage, { ratio: 0.42, mratio: 0.85 });
  const ctl = controls(stage);
  seg(ctl, { label: "Connection", value: mode, options: [["series", "Series"], ["parallel", "Parallel"]] }, v => { mode = v; });
  slider(ctl, { label: "Battery voltage", min: 1.5, max: 12, step: 1.5, value: V, unit: "V", fmt: v => fmt(v, 1) }, v => { V = v; });
  Rs.forEach((r, k) => slider(ctl, { label: `R${k + 1}`, min: 1, max: 30, step: 1, value: r, unit: "Ω" }, v => { Rs[k] = v; }));
  const row = chipRow(stage, "Unscrew a bulb");
  const bbtn = [0, 1, 2].map(k => chip(row, `Bulb ${k + 1}`, () => { broken[k] = !broken[k]; bbtn[k].setAttribute("aria-pressed", String(broken[k])); }, false));
  const ro = readouts(stage);

  function solve() {
    const br = Rs.map((r, k) => ({ R: r, on: !broken[k], I: 0, V: 0, P: 0 }));
    let Req, I;
    if (mode === "series") {
      Req = Rs.reduce((a, b) => a + b, 0);
      I = broken.some(b => b) ? 0 : V / Req;
      br.forEach(b => { b.I = I; b.V = I * b.R; b.P = I * I * b.R; });
    } else {
      const act = br.filter(b => b.on);
      Req = act.length ? 1 / act.reduce((a, b) => a + 1 / b.R, 0) : Infinity;
      br.forEach(b => { if (b.on) { b.V = V; b.I = V / b.R; b.P = V * V / b.R; } });
      I = br.reduce((a, b) => a + b.I, 0);
    }
    return { Req, I, br };
  }

  let last = null;
  onFrame(dt => {
    const s = solve();
    last = s;
    if (mode === "series") phases[0] += dt * 26 * s.I;
    else s.br.forEach((b, k) => (phases[k + 1] += dt * 26 * b.I));
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
    circle(ctx, x, y, rb, `rgba(255,${Math.round(235 - 40 * br)},${Math.round(160 - 110 * br)},${0.35 + 0.6 * br})`, p.text, 2);
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
    const bx = w * 0.08, yT = H * 0.18, yB = H * 0.82, ym = (yT + yB) / 2;
    const btop = ym - 22, bbot = ym + 22;
    const wc = p.text;
    const rb = clamp(H * 0.06, 13, 22);
    // battery
    line(ctx, bx, yT, bx, btop, wc, 2.5);
    line(ctx, bx, bbot, bx, yB, wc, 2.5);
    for (let j = 0; j < 2; j++) {
      const yy = btop + j * 22 + 4;
      line(ctx, bx - 16, yy, bx + 16, yy, wc, 2.5);
      line(ctx, bx - 8, yy + 10, bx + 8, yy + 10, wc, 5);
      if (j === 0) line(ctx, bx, yy + 10, bx, yy + 26, wc, 2);
    }
    label(ctx, `${fmt(V, 1)} V`, bx + 22, ym, { color: wc, size: 13, align: "left", weight: 700 });
    const fontSmall = w < 560 ? 11 : 12;

    if (mode === "series") {
      const xs = [0.33, 0.55, 0.77].map(f => f * w), xR = w * 0.93;
      line(ctx, bx, yT, xR, yT, wc, 2.5); line(ctx, xR, yT, xR, yB, wc, 2.5); line(ctx, xR, yB, bx, yB, wc, 2.5);
      const info = pathInfo([[bx, btop], [bx, yT], [xR, yT], [xR, yB], [bx, yB], [bx, bbot]]);
      if (s.I > 0) drawFlow(ctx, info, phases[0], 28, "c", p.r1);
      s.br.forEach((b, k) => {
        bulb(ctx, xs[k], yT, rb, b, p);
        label(ctx, `R${k + 1} = ${b.R} Ω`, xs[k], yT + rb + 14, { color: p.text, size: fontSmall, weight: 700 });
        label(ctx, `${fmt(b.V, 1)} V · ${fmt(b.I, 2)} A`, xs[k], yT + rb + 30, { color: p.soft, size: fontSmall });
      });
      label(ctx, `Same current everywhere: ${fmt(s.I, 2)} A`, (bx + xR) / 2, yB - 16, { color: p.accent, size: 13, weight: 700 });
    } else {
      const xs = [0.36, 0.6, 0.84].map(f => f * w);
      line(ctx, bx, yT, xs[2], yT, wc, 2.5); line(ctx, bx, yB, xs[2], yB, wc, 2.5);
      xs.forEach(x => line(ctx, x, yT, x, yB, wc, 2.5));
      s.br.forEach((b, k) => {
        if (b.I > 0) drawFlow(ctx, pathInfo([[bx, btop], [bx, yT], [xs[k], yT], [xs[k], yB], [bx, yB], [bx, bbot]]), phases[k + 1], 28, "c", p.r1);
      });
      s.br.forEach((b, k) => {
        bulb(ctx, xs[k], ym, rb, b, p);
        label(ctx, `R${k + 1} = ${b.R} Ω`, xs[k] - rb - 6, ym - 10, { color: p.text, size: fontSmall, weight: 700, align: "right" });
        label(ctx, `${fmt(b.I, 2)} A`, xs[k] - rb - 6, ym + 8, { color: p.soft, size: fontSmall, align: "right" });
      });
      label(ctx, `Same voltage across each bulb: ${fmt(V, 1)} V`, (bx + xs[2]) / 2, yT - 14, { color: p.accent, size: 13, weight: 700 });
    }

    const reqTxt = mode === "series"
      ? `Rs = ${Rs.join(" + ")} = ${nice(s.Req)} Ω`
      : (isFinite(s.Req) ? `1/Rp = ${s.br.filter(b => b.on).map(b => `1/${b.R}`).join(" + ")} → Rp = ${nice(s.Req)} Ω` : "All bulbs removed: open circuit");
    const items = [
      { k: "Equivalent resistance", v: reqTxt, wide: true },
      { k: "Current from battery", v: `${fmt(s.I, 2)} A` },
      { k: "Power from battery", v: `${fmt(V * s.I, 2)} W` }
    ];
    s.br.forEach((b, k) => items.push({ k: `Bulb ${k + 1}`, v: b.on ? `${fmt(b.V, 1)} V, ${fmt(b.I, 2)} A, ${fmt(b.P, 1)} W` : "Removed" }));
    if (mode === "series" && broken.some(b => b)) items.push({ k: "Notice", v: "One bulb removed breaks the only path, so every bulb goes off.", wide: true, tone: "bad" });
    if (mode === "parallel" && broken.some(b => b) && broken.some(b => !b)) items.push({ k: "Notice", v: "The other bulbs stay on: each has its own path. This is why houses are wired in parallel.", wide: true, tone: "good" });
    ro(items);
  }
}

/* ---------- 5.8 Resistance and resistivity ---------- */
function resistivitySim(stage) {
  const MATS = [["cu", "Copper", 1.62e-8, "#c8743c"], ["al", "Aluminium", 2.63e-8, "#a9b2bc"], ["w", "Tungsten", 5.2e-8, "#80889a"],
    ["fe", "Iron", 10.0e-8, "#77706a"], ["con", "Constantan", 49e-8, "#b8935a"], ["ni", "Nichrome", 100e-8, "#938d82"]];
  let mat = "ni", L = 1, d = 0.5, note = "";
  const cv = makeCanvas(stage, { ratio: 0.24, mratio: 0.55, min: 170 });
  const ctl = controls(stage);
  seg(ctl, { label: "Material", value: mat, options: MATS.map(m => [m[0], m[1]]) }, v => { mat = v; note = ""; draw(); });
  const sL = slider(ctl, { label: "Length l", min: 0.5, max: 5, step: 0.1, value: L, unit: "m", fmt: v => fmt(v, 1) }, v => { L = v; note = ""; draw(); });
  const sD = slider(ctl, { label: "Diameter d", min: 0.1, max: 1, step: 0.05, value: d, unit: "mm", fmt: v => fmt(v, 2) }, v => { d = v; note = ""; draw(); });
  const row = chipRow(stage, "Try");
  const quick = (txt, fn) => chip(row, txt, () => {
    const before = res();
    fn();
    sL.value = L; sD.value = d;
    const ratio = res() / before;
    note = `${txt}: R becomes ${fmt(ratio, 2)} × what it was.`;
    draw();
  });
  quick("Double the length", () => { L = clamp(+(L * 2).toFixed(1), 0.5, 5); });
  quick("Halve the length", () => { L = clamp(+(L / 2).toFixed(1), 0.5, 5); });
  quick("Double the diameter", () => { d = clamp(+(d * 2).toFixed(2), 0.1, 1); });
  quick("Halve the diameter", () => { d = clamp(+(d / 2).toFixed(2), 0.1, 1); });
  const ro = readouts(stage);

  const M = () => MATS.find(m => m[0] === mat);
  const area = () => Math.PI * Math.pow(d * 1e-3, 2) / 4;
  const res = () => M()[2] * L / area();

  cv.draw = draw;
  function draw() {
    const { ctx, w, h: H } = cv;
    if (!w) return;
    const p = pal();
    ctx.clearRect(0, 0, w, H);
    const m = M();
    const x0 = w * 0.08, len = 30 + (L / 5) * (w * 0.8), th = 4 + d * 34, y = H * 0.5;
    const g = ctx.createLinearGradient(0, y - th / 2, 0, y + th / 2);
    g.addColorStop(0, shade(m[3], -0.35)); g.addColorStop(0.35, shade(m[3], 0.45)); g.addColorStop(0.6, m[3]); g.addColorStop(1, shade(m[3], -0.45));
    ctx.fillStyle = g;
    ctx.fillRect(x0, y - th / 2, len, th);
    ctx.beginPath(); ctx.ellipse(x0 + len, y, Math.max(2, th * 0.18), th / 2, 0, 0, Math.PI * 2); ctx.fillStyle = shade(m[3], 0.2); ctx.fill();
    ctx.fillStyle = p.text;
    ctx.fillRect(x0 - 12, y - 10, 12, 20);
    ctx.fillRect(x0 + len, y - 10, 12, 20);
    line(ctx, x0, y + th / 2 + 18, x0 + len, y + th / 2 + 18, p.soft, 1.5);
    head(ctx, x0 + len, y + th / 2 + 18, 0, 8, p.soft);
    head(ctx, x0, y + th / 2 + 18, Math.PI, 8, p.soft);
    label(ctx, `l = ${fmt(L, 1)} m`, x0 + len / 2, y + th / 2 + 32, { color: p.text, size: 13, weight: 700 });
    label(ctx, `d = ${fmt(d, 2)} mm`, x0 + len + 18, y - th / 2 - 12, { color: p.text, size: 13, align: "left" });
    label(ctx, `${m[1]} wire`, x0, y - th / 2 - 14, { color: p.soft, size: 13, align: "left" });
    const R = res();
    label(ctx, `R = ${nice(R)} Ω`, w - 12, 18, { color: p.accent, size: 18, weight: 700, align: "right" });

    const I = 1.5 / R;
    ro([
      { k: "Resistivity ρ", v: `${sci(m[2], 2)} Ω m` },
      { k: "Area A = πd²/4", v: `${sci(area(), 2)} m²` },
      { k: "R = ρl / A", v: `${nice(R)} Ω` },
      { k: "Current from a 1.5 V cell", v: `${nice(I)} A` },
      { k: note ? "Result" : "Remember", v: note || "R ∝ l and R ∝ 1/A. ρ depends only on the material (and temperature), not on the shape of the wire.", wide: true }
    ]);
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
  const cv = makeCanvas(stage, { ratio: 0.56, mratio: 0.95, touch: true });
  const ctl = controls(stage);
  seg(ctl, { label: "Conductor", value: cfg, options: [["wire", "Straight wire"], ["loop", "Circular loop"], ["solenoid", "Solenoid"], ["magnet", "Bar magnet"]] },
    v => { cfg = v; draw(); });
  slider(ctl, { label: "Current I", min: 1, max: 10, step: 1, value: I, unit: "A" }, v => { I = v; draw(); });
  seg(ctl, { label: "Show", value: view, options: [["lines", "Field lines"], ["grid", "Compass grid"], ["both", "Both"]] }, v => { view = v; draw(); });
  const row = chipRow(stage, "");
  chip(row, "⇄ Reverse current", () => { dir = -dir; draw(); });
  row.append(h("span", { class: "presets-label", style: "text-transform:none;letter-spacing:0;font-weight:600" }, "Drag the compass, or tap anywhere to move it."));
  const ro = readouts(stage);

  function wires(w, H) {
    const cx = w / 2, cy = H / 2;
    if (cfg === "wire") return [{ x: cx, y: cy, I: dir }];
    if (cfg === "loop") { const a = Math.min(H * 0.2, 64); return [{ x: cx, y: cy - a, I: dir }, { x: cx, y: cy + a, I: -dir }]; }
    const n = 7, sp = Math.min(26, w * 0.05), a = Math.min(H * 0.13, 40), arr = [];
    for (let k = 0; k < n; k++) { const x = cx + (k - (n - 1) / 2) * sp; arr.push({ x, y: cy - a, I: dir }, { x, y: cy + a, I: -dir }); }
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
      for (const e of (cfg === "loop" ? [16, 34, 60] : cfg === "magnet" ? [40, 75] : [16, 34])) seeds.push([cx, yTop - e], [cx, yBot + e]);
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
      : cfg === "loop" ? `Inside the loop the lines are nearly straight and point to the ${dir > 0 ? "right" : "left"}. The loop behaves like a thin magnet.`
      : cfg === "solenoid" ? `Inside, the field is uniform (parallel lines). The ${dir > 0 ? "right" : "left"} end acts as a North pole.`
      : "Outside the magnet the lines go from N to S. Inside, they go from S to N, so each line is a closed loop.";
    label(ctx, cfg === "magnet" ? "Field of a bar magnet" : "⊙ current out of screen   ⊗ current into screen", 10, 14, { color: p.soft, size: 12, align: "left" });
    const dist = cfg === "wire" ? Math.hypot(comp.x - cx, comp.y - cy) * 0.05 : null;
    ro([
      { k: cfg === "wire" ? "Distance from wire" : "Compass position", v: cfg === "wire" ? `${fmt(dist, 1)} cm` : "Drag to explore" },
      { k: cfg === "magnet" ? "Field strength" : "Field at compass", v: cfg === "magnet" ? "Strongest near the poles" : `≈ ${nice(B)} µT` },
      { k: "Compare", v: "Earth's field ≈ 50 µT" },
      { k: "Right-hand thumb rule", v: rule, wide: true }
    ]);
  }
}

/* ---------- 5.11 Force on a conductor: Fleming's left-hand rule ---------- */
function flemingSim(stage) {
  let Iamp = 3, idir = 1, bdir = 1, comb = "off", off = 0;
  let cache = { key: "", lines: [] };
  const cv = makeCanvas(stage, { ratio: 0.6, mratio: 1.0 });
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
        drawRay(ctx, xL + 4, y, xR - 4, y, p.accent, { width: 1.5, alpha: 0.55 });
      }
    }
    label(ctx, "Magnetic field B →", xL + 8, yT + 12, { color: p.accent, size: 12, bg: p.surface, align: "left" });

    // thread and rod
    line(ctx, cx - 40, 4, cx + 40, 4, p.text, 4);
    line(ctx, cx, 4, cx, ry - 15, p.soft, 1.5);
    circle(ctx, cx, ry, 15, p.surface, p.text, 2.5);
    if (idir > 0) circle(ctx, cx, ry, 4, p.text);
    else { line(ctx, cx - 7, ry - 7, cx + 7, ry + 7, p.text, 2.5); line(ctx, cx - 7, ry + 7, cx + 7, ry - 7, p.text, 2.5); }
    const Fup = idir * bdir;
    if (Iamp > 0) {
      const L = 22 + Iamp * 9;
      const y2 = ry - Fup * (L + 18);
      line(ctx, cx + 30, ry - Fup * 18, cx + 30, y2 + Fup * 6, p.r1, 4);
      head(ctx, cx + 30, y2, Fup > 0 ? -Math.PI / 2 : Math.PI / 2, 14, p.r1);
      label(ctx, "Force F", cx + 42, y2 + Fup * 10, { color: p.r1, size: 14, align: "left", weight: 700 });
    }

    // left-hand gizmo
    const gy = H * 0.84, gx = w * 0.5, s = Math.min(70, w * 0.12);
    label(ctx, "Fleming's left-hand rule", gx, H * 0.69, { color: p.text, size: 13, weight: 700 });
    circle(ctx, gx, gy, 4, p.text);
    drawRay(ctx, gx, gy, gx + bdir * s, gy, p.accent, { width: 3, at: 0.95 });
    label(ctx, "First finger: Field", gx + bdir * (s + 6), gy, { color: p.accent, size: 12, align: bdir > 0 ? "left" : "right", weight: 700 });
    const cxv = idir > 0 ? -0.6 : 0.6, cyv = idir > 0 ? 0.55 : -0.55;
    drawRay(ctx, gx, gy, gx + cxv * s, gy + cyv * s, p.r2, { width: 3, at: 0.95 });
    label(ctx, `Second finger: Current (${idir > 0 ? "out" : "in"})`, gx + cxv * (s + 6), gy + cyv * (s + 4),
      { color: p.r2, size: 12, align: idir > 0 ? "right" : "left", weight: 700 });
    if (Iamp > 0) {
      drawRay(ctx, gx, gy, gx, gy - Fup * s * 0.75, p.r1, { width: 3, at: 0.95 });
      label(ctx, "Thumb: Force", gx + 8, gy - Fup * s * 0.75, { color: p.r1, size: 12, align: "left", weight: 700 });
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
function domesticSim(stage) {
  const APPS = [["LED bulb", 10], ["Fan", 75], ["TV", 120], ["Fridge", 250], ["Iron", 1000], ["Heater", 2000]];
  const counts = [2, 1, 0, 0, 0, 0];
  let rating = 5, blown = false, cause = "", flashT = 0, phase = 0, again = false;
  const cv = makeCanvas(stage, { ratio: 0.5, mratio: 0.9 });
  const ctl = controls(stage);
  seg(ctl, { label: "Circuit and fuse", value: "5", options: [["5", "5 A (lights, fans)"], ["15", "15 A (heavy appliances)"]] }, v => { rating = +v; check(); });
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
  void cntEls;

  const power = () => APPS.reduce((a, [, pw], k) => a + pw * counts[k], 0);
  function check(fromReplace = false) {
    const I = power() / 220;
    if (!blown && I > rating) { blown = true; cause = "overload"; flashT = 1; again = fromReplace; }
  }

  let lastKey = "";
  onFrame(dt => {
    const I = blown ? 0 : power() / 220;
    phase += dt * Math.min(140, 12 + I * 14);
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
    label(ctx, "Live (red)", fx1 + 6, yL - 11, { color: p.live, size: 12, align: "left" });
    label(ctx, "Neutral (black)", fx1 + 6, yN - 11, { color: p.neutral, size: 12, align: "left" });
    label(ctx, "Earth (green)", (bx0 + bx1) / 2 + 8, yE - 11, { color: p.earth, size: 12, align: "left" });
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
    // moving charges
    if (!blown && act.length) {
      const lx = xs[xs.length - 1] - bw * 0.25;
      drawFlow(ctx, pathInfo([[fx1, yL], [lx, yL]]), phase, 24, "c", p.live);
      drawFlow(ctx, pathInfo([[xs[xs.length - 1] + bw * 0.25, yN], [bx1, yN]]), phase, 24, "c", p.neutral);
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
        { k: "Current I = P / V", v: `${fmt(I, 2)} A` },
        { k: "Fuse rating", v: `${rating} A` },
        { k: "Status", v: status, wide: true, tone: blown ? "bad" : I > rating * 0.8 ? "" : "good" }
      ]);
    }
  }
}

/* ===============================================================
   6. CHAPTER CONTENT
   =============================================================== */
const CHAPTERS = [
  {
    id: "light", num: 9, short: "Light", title: "Light – Reflection and Refraction", notes: "../light-reflection-refraction.html",
    topics: [
      {
        id: "mirrors", title: "Spherical mirrors",
        lead: "Move the object and watch the image change. Use the buttons to jump to each position in the NCERT table.",
        build: s => opticsSim(s, "mirror"),
        points: [
          "A concave mirror converges light; a convex mirror diverges it.",
          "Pole P, centre of curvature C and principal focus F lie on the principal axis. R = 2f.",
          "Two rays are enough to find the image: a ray parallel to the axis passes through F after reflection, and a ray through F comes back parallel. A ray to P reflects symmetrically.",
          "Concave mirror: only an object between F and P gives a virtual, erect, magnified image (shaving and dentist's mirrors).",
          "A convex mirror always gives a virtual, erect, diminished image, with a wide field of view, so it is used as a rear-view mirror.",
          "Sign convention: measure from P; distances along the incident light are positive, against it negative."
        ],
        formulas: [["Mirror formula", "1/v + 1/u = 1/f"], ["Magnification", "m = h′/h = −v/u"], ["Radius and focal length", "R = 2f"]],
        questions: [
          ["Where should an object be placed in front of a concave mirror to get a real image of the same size?", "At C. The image is also at C: real, inverted and the same size (m = −1)."],
          ["A concave mirror has f = 15 cm. An object is at 10 cm. Describe the image.", "Object is between F and P. 1/v = 1/f − 1/u = −1/15 + 1/10 = 1/30, so v = +30 cm (behind the mirror). m = −v/u = +3: virtual, erect, 3 times magnified."],
          ["Why are convex mirrors used as rear-view mirrors in vehicles?", "They always give an erect, diminished image and cover a much wider field of view."],
          ["Find the focal length of a convex mirror whose radius of curvature is 32 cm.", "f = R/2 = +16 cm."],
          ["The magnification of a mirror is +0.5. What can you say about the image and the mirror?", "Positive m means virtual and erect; |m| < 1 means diminished. Such an image is formed by a convex mirror."]
        ]
      },
      {
        id: "lenses", title: "Lenses",
        lead: "Switch between convex and concave lenses. The power of the lens is shown in dioptres.",
        build: s => opticsSim(s, "lens"),
        points: [
          "A convex lens converges light; a concave lens diverges it. A ray through the optical centre O goes straight.",
          "A ray parallel to the axis passes through F₂ (convex) or appears to come from F₁ (concave). A ray through F₁ comes out parallel.",
          "Convex lens: object beyond 2F₁ gives a small real image (camera, eye). Object between F₁ and O gives a virtual, magnified image (magnifying glass).",
          "A concave lens always gives a virtual, erect, diminished image between F₁ and O.",
          "Power P = 1/f with f in metres. Unit: dioptre (D). Convex lens: positive power; concave lens: negative.",
          "For lenses in contact, powers add: P = P₁ + P₂ + …"
        ],
        formulas: [["Lens formula", "1/v − 1/u = 1/f"], ["Magnification", "m = h′/h = v/u"], ["Power", "P = 1/f  (f in m)"], ["Lenses in contact", "P = P₁ + P₂ + …"]],
        questions: [
          ["A concave lens has focal length 15 cm. Where should the object be placed so the image forms 10 cm from the lens?", "f = −15 cm, v = −10 cm. 1/u = 1/v − 1/f = −1/10 + 1/15 = −1/30, so u = −30 cm."],
          ["The power of a lens is −2.0 D. What kind of lens is it, and what is its focal length?", "Concave (negative power). f = 1/P = −0.5 m = −50 cm."],
          ["Where must the object be placed for a convex lens to work as a magnifying glass?", "Between F₁ and the optical centre O."],
          ["Why can a convex lens form an image on a screen but a concave lens cannot?", "A convex lens makes rays actually meet (real image). After a concave lens the rays spread out and only appear to meet (virtual image)."],
          ["Two lenses of power +3 D and −1 D are kept in contact. Find the total power and focal length.", "P = +3 − 1 = +2 D, so f = 1/2 m = 50 cm (converging)."]
        ]
      },
      {
        id: "refraction", title: "Refraction and glass slab",
        lead: "Change the media and the angle. Then switch to the glass slab to see the sideways shift.",
        build: refractionSim,
        points: [
          "Light bends when it crosses from one medium to another because its speed changes.",
          "Rarer to denser: bends towards the normal. Denser to rarer: bends away from the normal.",
          "Snell's law: sin i / sin r is constant for a given pair of media. This constant is the refractive index n₂₁.",
          "Absolute refractive index n = c/v. A higher n means optically denser, which is not the same as higher mass density (kerosene is lighter than water but optically denser).",
          "In a glass slab the emergent ray is parallel to the incident ray, only shifted sideways (lateral displacement).",
          "A ray along the normal (i = 0) goes straight through."
        ],
        formulas: [["Snell's law", "sin i / sin r = n₂₁"], ["Refractive index", "n = c / v"], ["Relative index", "n₂₁ = n₂ / n₁ = v₁ / v₂"]],
        questions: [
          ["A ray of light in air enters water at an angle. Does it bend towards or away from the normal? Why?", "Towards the normal, because water is optically denser and light slows down in it."],
          ["Light enters glass of refractive index 1.50 from air. Find its speed in glass. (c = 3 × 10⁸ m/s)", "v = c/n = 3 × 10⁸ / 1.5 = 2 × 10⁸ m/s."],
          ["Kerosene 1.44, turpentine 1.47, water 1.33. Which is optically densest? In which does light travel fastest?", "Turpentine is optically densest. Light is fastest in water (lowest n)."],
          ["What does “the refractive index of diamond is 2.42” mean?", "Light travels 2.42 times faster in vacuum than in diamond."],
          ["Why does a pencil partly dipped in water look bent at the surface?", "Light from the part under water bends away from the normal as it leaves the water, so that part appears raised."]
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
          "The eye lens forms a real, inverted image on the retina. The ciliary muscles change the lens's focal length: this is accommodation.",
          "A normal eye sees clearly from 25 cm (near point) to infinity (far point).",
          "Myopia (short-sightedness): distant objects look blurred. The image forms in front of the retina. Causes: lens too curved, or eyeball too long. Correct with a concave lens.",
          "Hypermetropia (long-sightedness): near objects look blurred; the near point is beyond 25 cm. The image would form behind the retina. Causes: focal length too long, or eyeball too short. Correct with a convex lens.",
          "Presbyopia: with age the ciliary muscles weaken and the near point moves away. Bifocal lenses help.",
          "Cataract: the lens becomes cloudy. It is treated by surgery."
        ],
        formulas: [["Normal near point", "D = 25 cm"], ["Myopia lens", "f = −(far point)"], ["Power", "P = 1/f  (f in m)"]],
        questions: [
          ["A person cannot see clearly beyond 1.2 m. Name the defect and the lens needed.", "Myopia. A concave lens of f = −1.2 m, so P = 1/f ≈ −0.83 D."],
          ["What is accommodation of the eye?", "The ability of the eye lens to change its focal length so that both near and far objects are focused on the retina."],
          ["The near point of a hypermetropic eye is 1 m. What lens corrects it? (Normal near point = 25 cm)", "u = −25 cm, v = −100 cm. 1/f = 1/v − 1/u = −1/100 + 1/25 = 3/100, so f ≈ +33.3 cm and P = +3.0 D (convex)."],
          ["Why can't we see an object clearly when it is closer than 25 cm?", "The ciliary muscles cannot make the eye lens any thicker, so its focal length cannot get shorter."],
          ["The distance from eye lens to retina is fixed. How do we see objects at different distances?", "The eye lens changes its focal length (accommodation) instead of the image distance changing."]
        ]
      },
      {
        id: "prism", title: "Prism and dispersion",
        lead: "Change the angle of incidence, then repeat Newton's experiment with a second, inverted prism.",
        build: prismSim,
        points: [
          "A glass prism has two triangular bases and three rectangular faces. The angle between two refracting faces is the angle of the prism.",
          "Light bends twice, both times towards the base. The angle between the incident and emergent rays is the angle of deviation.",
          "White light splits into seven colours, VIBGYOR. This is dispersion.",
          "Each colour has a different speed in glass, so each bends by a different amount: red least, violet most.",
          "Newton put a second, inverted prism after the first and got white light back. So white light is a mixture of colours.",
          "A rainbow forms when sunlight is dispersed by raindrops (refraction, dispersion, internal reflection, refraction). It is seen with the Sun behind you."
        ],
        formulas: [["Order of colours", "V I B G Y O R"], ["Deviation", "violet > … > red"], ["Speed in glass", "red fastest, violet slowest"]],
        questions: [
          ["Why do different colours deviate by different amounts in a prism?", "They travel at different speeds in glass, so the refractive index is different for each colour. Violet slows most and bends most."],
          ["Which colour deviates least, and which most?", "Red least, violet most."],
          ["What do you see if an identical prism is placed upside down after the first?", "The colours recombine and white light comes out (Newton's experiment)."],
          ["Explain how a rainbow is formed.", "Raindrops act like tiny prisms: sunlight is refracted and dispersed on entering, reflected inside the drop, and refracted again on leaving."]
        ]
      },
      {
        id: "scattering", title: "Atmospheric refraction and scattering",
        lead: "Move the Sun across the sky. Watch how much air the light crosses and how its colour changes.",
        build: scatterSim,
        points: [
          "Atmospheric refraction: hot air is optically rarer than cool air, so light bends gradually as it passes through layers of air.",
          "Stars twinkle because the moving air keeps changing their apparent position and brightness. Planets are closer and look like discs, so the changes average out and they do not twinkle.",
          "Because of refraction we see the Sun about 2 minutes before actual sunrise and about 2 minutes after actual sunset.",
          "Tyndall effect: colloidal particles scatter light, so a beam becomes visible (sunlight in a dusty room or through a forest canopy).",
          "Very small particles scatter short wavelengths (blue) far more than long ones (red). Scattered blue light makes the sky blue.",
          "At sunrise and sunset, light crosses much more air. Most blue is scattered away, so the Sun looks red. Danger signals are red because red is scattered least.",
          "With no atmosphere, as in space, nothing scatters light and the sky looks dark."
        ],
        formulas: [["Scattering", "blue ≫ red (short λ scatters more)"], ["Advance sunrise / delayed sunset", "≈ 2 minutes each"]],
        questions: [
          ["Why is the clear sky blue?", "Air molecules scatter blue light much more than red. Scattered blue reaches our eyes from every direction."],
          ["Why does the Sun look reddish at sunrise and sunset?", "Its light passes through a much thicker layer of air. Most of the blue is scattered away, and mainly red reaches us."],
          ["Why do stars twinkle but planets do not?", "Stars are point sources; changing air bends their light by varying amounts, so their brightness flickers. Planets are extended sources, so the variations average out."],
          ["Why are danger signal lights red?", "Red light is scattered least by fog and smoke, so it can be seen from far away."],
          ["Why does the sky look dark to an astronaut?", "There is no atmosphere to scatter sunlight towards the eye."]
        ]
      }
    ]
  },
  {
    id: "electricity", num: 11, short: "Electricity", title: "Electricity", notes: "../electricity.html",
    topics: [
      {
        id: "ohm", title: "Ohm's law",
        lead: "This is NCERT Activity 11.1. Change the number of cells, record readings, and see the straight-line graph.",
        build: ohmSim,
        points: [
          "Electric current is the rate of flow of charge: I = Q/t. Unit: ampere (A).",
          "Conventional current flows from + to − outside the cell. Electrons actually move the other way.",
          "Potential difference is the work done per unit charge: V = W/Q. Unit: volt (V). The cell maintains it.",
          "An ammeter (low resistance) goes in series; a voltmeter (high resistance) goes in parallel.",
          "Ohm's law: at constant temperature V ∝ I, so V = IR.",
          "The V–I graph is a straight line through the origin; its slope is R. 1 ohm: 1 A flows when V = 1 V."
        ],
        formulas: [["Current", "I = Q / t"], ["Potential difference", "V = W / Q"], ["Ohm's law", "V = IR"], ["Charge", "Q = ne,  e = 1.6 × 10⁻¹⁹ C"]],
        questions: [
          ["How much current does a 100 Ω heater draw from a 220 V supply?", "I = V/R = 220/100 = 2.2 A."],
          ["How many electrons make up 1 coulomb of charge?", "n = Q/e = 1/(1.6 × 10⁻¹⁹) = 6.25 × 10¹⁸ electrons."],
          ["How much work is done in moving 2 C of charge across a potential difference of 12 V?", "W = VQ = 12 × 2 = 24 J."],
          ["On a V–I graph (V on the y-axis), one line is steeper than another. What does it tell you?", "The steeper line has the higher resistance, because slope = V/I = R."],
          ["Define 1 volt.", "1 volt is the potential difference between two points when 1 joule of work is done to move 1 coulomb of charge between them."]
        ]
      },
      {
        id: "combinations", title: "Series and parallel",
        lead: "Change the resistances and the connection. Unscrew a bulb and see what happens to the others.",
        build: circuitsSim,
        points: [
          "Series: the same current flows through each resistor. Voltages add up. Rs = R₁ + R₂ + R₃, which is more than the largest resistor.",
          "Parallel: each resistor has the same voltage. Currents add up. 1/Rp = 1/R₁ + 1/R₂ + 1/R₃, which is less than the smallest resistor.",
          "In series, if one bulb fails the whole circuit breaks. In parallel, the others keep working.",
          "Houses are wired in parallel so each appliance gets the full voltage, draws its own current and can be switched separately.",
          "Brightness check: in series the bulb with higher R glows more (P = I²R). In parallel the bulb with lower R glows more (P = V²/R)."
        ],
        formulas: [["Series", "Rs = R₁ + R₂ + R₃"], ["Parallel", "1/Rp = 1/R₁ + 1/R₂ + 1/R₃"], ["Series voltages", "V = V₁ + V₂ + V₃"], ["Parallel currents", "I = I₁ + I₂ + I₃"]],
        questions: [
          ["Resistors of 5 Ω, 10 Ω and 30 Ω are in parallel across 12 V. Find the current in each and the total.", "12/5 = 2.4 A, 12/10 = 1.2 A, 12/30 = 0.4 A. Total 4 A. Rp = 12/4 = 3 Ω."],
          ["How can 2 Ω, 3 Ω and 6 Ω resistors be connected to give (a) 4 Ω (b) 1 Ω?", "(a) 3 Ω and 6 Ω in parallel (= 2 Ω), then in series with 2 Ω: 4 Ω. (b) All three in parallel: 1/2 + 1/3 + 1/6 = 1, so 1 Ω."],
          ["Why are household appliances connected in parallel, not in series?", "Each gets the full 220 V, draws only the current it needs, and can be switched on or off without affecting the others."],
          ["Two 4 Ω resistors: what total resistances can you make?", "Series: 8 Ω. Parallel: 2 Ω."],
          ["In series, which bulb glows brighter: higher R or lower R? And in parallel?", "Series: higher R (same I, P = I²R). Parallel: lower R (same V, P = V²/R). Check it in the simulation."]
        ]
      },
      {
        id: "resistivity", title: "Resistance and resistivity",
        lead: "Change the wire's length, thickness and material. Use the buttons to test R ∝ l and R ∝ 1/A.",
        build: resistivitySim,
        points: [
          "The resistance of a wire depends on its length, its area of cross-section, its material and its temperature.",
          "R ∝ l and R ∝ 1/A, so R = ρl/A. ρ is the resistivity, in Ω m.",
          "Resistivity is a property of the material. It does not change when you cut or stretch the wire.",
          "Copper and aluminium have low ρ, so they are used for connecting wires.",
          "Alloys such as nichrome have high ρ and do not oxidise easily when hot, so they are used in heaters, irons and toasters.",
          "Doubling the diameter makes the area 4 times, so R becomes one-fourth."
        ],
        formulas: [["Resistance", "R = ρl / A"], ["Area of a wire", "A = πr² = πd²/4"], ["Unit of resistivity", "Ω m"]],
        questions: [
          ["The length of a wire is doubled with the same area. What happens to R?", "R doubles. (If the wire is stretched to double length, its area halves too, so R becomes 4 times.)"],
          ["Why are the coils of toasters and electric irons made of an alloy instead of a pure metal?", "Alloys have higher resistivity and do not oxidise (burn) readily at high temperatures."],
          ["Why is tungsten used for bulb filaments?", "It has a very high melting point (about 3380 °C), so it can glow white-hot without melting."],
          ["A 1 m wire of diameter 0.3 mm has resistance 26 Ω. Find its resistivity.", "A = π(0.15 × 10⁻³)² = 7.07 × 10⁻⁸ m². ρ = RA/l = 26 × 7.07 × 10⁻⁸ ≈ 1.84 × 10⁻⁶ Ω m."]
        ]
      },
      {
        id: "power", title: "Heating effect and power",
        lead: "Fill in a home's appliances to estimate the monthly bill. Then use the heater calculator below it.",
        build: powerSim,
        points: [
          "Joule's law of heating: H = I²Rt. Heat is proportional to I², to R and to time.",
          "Uses: electric heater, iron, toaster, bulb filament, and the fuse.",
          "Electric power is the rate of using energy: P = VI = I²R = V²/R. Unit: watt (W).",
          "Commercial unit of energy: 1 kilowatt hour (kWh) = 3.6 × 10⁶ J. This is one “unit” on the electricity bill.",
          "Energy used = power × time. A 1000 W iron used for 1 hour uses 1 unit."
        ],
        formulas: [["Joule's law", "H = I²Rt"], ["Power", "P = VI = I²R = V²/R"], ["Energy", "E = P × t"], ["Commercial unit", "1 kWh = 3.6 × 10⁶ J"]],
        questions: [
          ["A 1000 W iron is used 2 hours a day for 30 days. How many units does it use?", "1 kW × 2 h × 30 = 60 kWh = 60 units."],
          ["Find the heat produced when 96000 C of charge is moved through 50 V in one hour.", "H = VQ = 50 × 96000 = 4.8 × 10⁶ J."],
          ["Lamps of 100 W and 60 W are connected in parallel to 220 V. How much current is drawn from the line?", "I = P/V = 160/220 ≈ 0.73 A."],
          ["Which uses more energy: a 250 W TV for 1 hour, or a 1200 W toaster for 10 minutes?", "TV: 250 Wh. Toaster: 1200 × 1/6 = 200 Wh. The TV uses more."],
          ["Why does the cord of a heater stay cool while the heating element glows?", "The cord is copper with very low resistance; the element has high resistance, so far more heat (I²R) is produced in it."]
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
          "Oersted found that a current in a wire deflects a compass needle: electricity produces magnetism.",
          "Field lines come out of N and go into S outside a magnet; inside they go from S to N. They are closed curves.",
          "The tangent to a field line gives the field direction. Lines never cross. Where they are crowded, the field is strong.",
          "Straight wire: concentric circles. Use the right-hand thumb rule: thumb along the current, fingers curl along the field. B increases with I and decreases with distance.",
          "Circular loop: at the centre the lines are nearly straight. More turns give a stronger field.",
          "Solenoid: the field inside is uniform, like a bar magnet. With a soft-iron core it becomes an electromagnet."
        ],
        formulas: [["Straight wire", "B ∝ I / r"], ["Circular loop (centre)", "B ∝ nI"], ["Solenoid (inside)", "uniform, B ∝ nI"]],
        questions: [
          ["Why do two magnetic field lines never cross?", "At the crossing point the compass needle would have to point in two directions at once, which is impossible."],
          ["Current flows vertically upwards in a wire. Seen from above, which way does the field go round it?", "Anticlockwise (right-hand thumb rule)."],
          ["How does the field near a straight wire change if (a) the current doubles (b) the distance doubles?", "(a) It doubles. (b) It halves."],
          ["What is the field inside a long solenoid like?", "Uniform: the same strength and direction everywhere, shown by parallel lines."],
          ["Give two ways to make an electromagnet stronger.", "Increase the number of turns, increase the current, or use a soft-iron core."]
        ]
      },
      {
        id: "force", title: "Force on a conductor",
        lead: "This is NCERT Activity 12.7, seen along the rod. Reverse the current or the magnet and watch the rod.",
        build: flemingSim,
        points: [
          "A current-carrying conductor placed in a magnetic field feels a force.",
          "The force is largest when the current is perpendicular to the field, and zero when they are parallel.",
          "Reversing either the current or the field reverses the force.",
          "Fleming's left-hand rule: stretch the first finger along the field, the second finger along the current; the thumb gives the force (motion). All three are mutually perpendicular.",
          "This force drives electric motors and loudspeakers."
        ],
        formulas: [["Direction", "F ⟂ I and F ⟂ B"], ["Largest force", "when I ⟂ B"], ["No force", "when I ∥ B"]],
        questions: [
          ["A positively charged particle moving west is deflected north by a magnetic field. What is the direction of the field?", "Upwards. With the second finger west (current) and thumb north (force), the first finger points up."],
          ["When is the force on a current-carrying conductor in a magnetic field largest?", "When the current is perpendicular to the magnetic field."],
          ["What happens to the force if both the current and the field are reversed?", "The force stays in the same direction."],
          ["Name two devices that use the force on a current in a magnetic field.", "Electric motor and loudspeaker."]
        ]
      },
      {
        id: "domestic", title: "Domestic circuits and the fuse",
        lead: "Add appliances until the fuse blows. Try the 15 A circuit, and try a short circuit.",
        build: domesticSim,
        points: [
          "Mains supply in India: 220 V, 50 Hz AC, through a live wire (red), a neutral wire (black) and an earth wire (green).",
          "Appliances are connected in parallel. There are usually two circuits: 15 A for heavy appliances (geyser, AC) and 5 A for bulbs and fans.",
          "Earthing: the metal body of an appliance is connected to the earth wire, so leaking current goes to earth instead of through a person.",
          "The fuse is placed in series in the live wire. It melts when the current is too large, cutting off the supply.",
          "Overloading: too many appliances on one circuit, or a voltage surge.",
          "Short circuit: live and neutral touch directly, the resistance becomes almost zero, and a huge current flows.",
          "Modern homes use MCBs (miniature circuit breakers), which can be reset."
        ],
        formulas: [["Current drawn", "I = P / V"], ["Total power (parallel)", "P = P₁ + P₂ + …"]],
        questions: [
          ["A 2 kW oven is connected to a 220 V line with a 5 A fuse. What happens?", "I = 2000/220 ≈ 9.1 A, which is more than 5 A, so the fuse blows."],
          ["Why is earthing necessary for metal appliances?", "If the live wire touches the metal body, the current flows to earth instead of through the person touching it, preventing a shock."],
          ["What is a short circuit?", "When the live and neutral wires touch directly. Resistance becomes nearly zero, so a very large current flows."],
          ["Why must the fuse be in the live wire and not the neutral?", "So that when it blows, the appliance is cut off from the high-potential live wire and is safe to touch."],
          ["Why shouldn't many appliances be connected to one socket?", "Their currents add up, which overloads the circuit and can overheat the wires or cause a fire."]
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

function show(ci, ti) {
  cleanup.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
  cleanup = [];
  redrawers = [];
  cur = { c: ci, t: ti };
  const ch = CHAPTERS[ci], tp = ch.topics[ti];
  if (typeof clearInk === "function" && !ink.classList.contains("board")) clearInk(); else pageLayer = null;

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
  tp.build(stageEl);

  $("#points").replaceChildren(...tp.points.map(t => h("li", {}, t)));
  $("#formulas").replaceChildren(...tp.formulas.map(([n, e]) => h("div", { class: "formula" }, h("div", { class: "f-n" }, n), h("div", { class: "f-e" }, e))));
  allOpen = false;
  $("#revealAll").textContent = "Show all answers";
  $("#questions").replaceChildren(...tp.questions.map(([q, a], i) => {
    const card = h("div", { class: "q" });
    const btn = h("button", { type: "button", class: "chip small" }, "Show answer");
    btn.addEventListener("click", () => { card.classList.toggle("open"); btn.textContent = card.classList.contains("open") ? "Hide answer" : "Show answer"; });
    card.append(h("p", {}, h("strong", {}, `Q${i + 1}. `), q), h("div", { class: "ans" }, a), btn);
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

/* ---------- Pen and whiteboard ---------- */
const ink = $("#ink"), ictx = ink.getContext("2d"), inkbar = $("#inkbar");
const COLORS = ["#e53935", "#1e66f5", "#2e9d4f", "#f2b705", "#ffffff", "#111111"];
let penOn = false, penColor = COLORS[0], penW = 6, erasing = false, drawingInk = false, lastPt = null;
function sizeInk() {
  const dpr = window.devicePixelRatio || 1;
  let tmp = null;
  if (ink.width && ink.height) { tmp = document.createElement("canvas"); tmp.width = ink.width; tmp.height = ink.height; tmp.getContext("2d").drawImage(ink, 0, 0); }
  ink.width = Math.round(window.innerWidth * dpr);
  ink.height = Math.round(window.innerHeight * dpr);
  ictx.setTransform(1, 0, 0, 1, 0, 0);
  if (tmp) ictx.drawImage(tmp, 0, 0);
  ictx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeInk();
window.addEventListener("resize", sizeInk);
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
$("#inkClear").addEventListener("click", () => clearInk());
$("#inkBoard").addEventListener("click", () => setBoard(!ink.classList.contains("board")));
$("#inkDone").addEventListener("click", () => { setBoard(false); setPen(false); });
function setPen(on) {
  penOn = on;
  ink.classList.toggle("active", on);
  inkbar.classList.toggle("show", on);
  $("#tPen").setAttribute("aria-pressed", String(on));
}
let pageLayer = null, boardLayer = null;
function snapInk() {
  const c = document.createElement("canvas");
  c.width = ink.width; c.height = ink.height;
  c.getContext("2d").drawImage(ink, 0, 0);
  return c;
}
function clearInk() { ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.clearRect(0, 0, ink.width, ink.height); ictx.restore(); }
function restoreInk(c) { clearInk(); if (c) { ictx.save(); ictx.setTransform(1, 0, 0, 1, 0, 0); ictx.drawImage(c, 0, 0); ictx.restore(); } }
function setBoard(on) {
  const was = ink.classList.contains("board");
  if (on && !was) { pageLayer = snapInk(); restoreInk(boardLayer); }
  if (!on && was) { boardLayer = snapInk(); restoreInk(pageLayer); }
  ink.classList.toggle("board", on);
  $("#tBoard").setAttribute("aria-pressed", String(on));
  $("#inkBoard").setAttribute("aria-pressed", String(on));
  if (on) {
    setPen(true);
    if (penColor === "#111111") sw.querySelector(".swatch").click();
  }
}
$("#tPen").addEventListener("click", () => { if (penOn) { setBoard(false); setPen(false); } else setPen(true); });
$("#tBoard").addEventListener("click", () => setBoard(!ink.classList.contains("board")));
ink.addEventListener("pointerdown", e => {
  if (!penOn) return;
  drawingInk = true; lastPt = [e.clientX, e.clientY];
  ink.setPointerCapture(e.pointerId);
  strokeTo(e.clientX + 0.01, e.clientY + 0.01);
});
ink.addEventListener("pointermove", e => { if (drawingInk) strokeTo(e.clientX, e.clientY); });
["pointerup", "pointercancel"].forEach(t => ink.addEventListener(t, () => { drawingInk = false; }));
function strokeTo(x, y) {
  ictx.save();
  ictx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
  ictx.strokeStyle = penColor;
  ictx.lineWidth = erasing ? penW * 5 : penW;
  ictx.lineCap = "round"; ictx.lineJoin = "round";
  ictx.beginPath(); ictx.moveTo(lastPt[0], lastPt[1]); ictx.lineTo(x, y); ictx.stroke();
  ictx.restore();
  lastPt = [x, y];
}

/* ---------- Timer ---------- */
const tp = $("#timerPanel"), tDisp = $("#timerDisplay"), tGo = $("#timerGo");
let tTotal = 120, tLeft = 120, tRun = false, tLast = 0, tTimer = null;
const mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
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
      pNote.textContent = `Picked ${picked.size} of ${N}. Nobody is picked twice until everyone has had a turn.`;
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
