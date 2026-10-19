/* ============================================================
   Class 10 Physics Classroom — core helpers shared by all chapters.
   Exposes window.CR. Plain JavaScript, no libraries.
   ============================================================ */
"use strict";
window.CR = (function () {
const CR = { sims: {}, chapters: [], cleanup: [], redrawers: [], fontScale: 1 };

/* ---------- small helpers ---------- */
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
const supNum = n => String(n).split("").map(c => SUP[c]).join("");
function sci(x, d = 2) {
  if (x === 0) return "0";
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / Math.pow(10, e);
  if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; e += 1; }
  return `${fmt(m, d)} × 10${supNum(e)}`;
}
function nice(x, p = 3) {
  if (!isFinite(x)) return "∞";
  const a = Math.abs(x);
  if (a === 0) return "0";
  if (a >= 0.01 && a < 1e5) return String(+x.toPrecision(p)).replace("-", MINUS);
  return sci(x, p - 1);
}
/* a signed number in brackets for substitutions, e.g. (−25) */
const br = (x, d = 1) => (x < 0 ? `(${fmt(x, d)})` : fmt(x, d));

/* ---------- colours ---------- */
const FONT = '"Source Sans 3", system-ui, sans-serif';
function isDark() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t) return t === "dark";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
}
function pal() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  return {
    text: g("--text"), soft: g("--text-soft"), border: g("--border"), surface: g("--surface"),
    surface2: g("--surface-2"), accent: g("--accent"), r1: g("--ray1"), r2: g("--ray2"), r3: g("--ray3"), r4: g("--ray4"),
    beam: g("--beam"), obj: g("--object"), img: g("--image"), glassEdge: g("--glass-edge"),
    live: g("--live"), neutral: g("--neutral"), earth: g("--earth"), ok: g("--ok"), warn: g("--warn"),
    dark: isDark()
  };
}

/* ---------- canvas drawing ---------- */
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
function vArrow(ctx, x, yFrom, yTo, color, { width = 3, dash = null, alpha = 1 } = {}) {
  const len = Math.abs(yTo - yFrom);
  if (len < 2) return;
  const dirn = Math.sign(yTo - yFrom);
  const hs = Math.min(12, len * 0.6);
  line(ctx, x, yFrom, x, yTo - dirn * hs * 0.6, color, width, dash, alpha);
  head(ctx, x, yTo, dirn > 0 ? Math.PI / 2 : -Math.PI / 2, hs, color, alpha);
}
function label(ctx, str, x, y, { color = "#000", size = 13, align = "center", base = "middle", weight = 600, bg = null, pad = 4, italic = false } = {}) {
  ctx.save();
  ctx.font = `${italic ? "italic " : ""}${weight} ${Math.round(size * CR.fontScale)}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (bg) {
    const tw = ctx.measureText(str).width + pad * 2;
    const th = size * CR.fontScale + pad * 2;
    const bx = align === "center" ? x - tw / 2 : align === "right" ? x - tw + pad : x - pad;
    const by = base === "middle" ? y - th / 2 : base === "top" ? y - pad : y - th + pad;
    ctx.fillStyle = bg;
    roundRect(ctx, bx, by, tw, th, 5);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}
function textWidth(ctx, str, size = 13, weight = 600) {
  ctx.save(); ctx.font = `${weight} ${Math.round(size * CR.fontScale)}px ${FONT}`;
  const w = ctx.measureText(str).width; ctx.restore();
  return w;
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
function arcAngle(ctx, x, y, r, a1, a2, color, txt, { size = 14, off = 13 } = {}) {
  if (Math.abs(a2 - a1) < 0.02) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x, y, r, Math.min(a1, a2), Math.max(a1, a2)); ctx.stroke(); ctx.restore();
  if (txt) {
    const am = (a1 + a2) / 2;
    label(ctx, txt, x + Math.cos(am) * (r + off), y + Math.sin(am) * (r + off), { color, size, weight: 700 });
  }
}
/* extend a ray from (x, y) along (dx, dy) to the edge of the box [x0,w]×[y0,h] */
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
function polyline(ctx, pts, color, width = 1.6, alpha = 1, dash = null) {
  if (pts.length < 2) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
function arrowsAlong(ctx, pts, color, every = 130, first = 55, size = 9) {
  let acc = 0, next = first;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    acc += Math.hypot(x2 - x1, y2 - y1);
    if (acc >= next) { head(ctx, x2, y2, Math.atan2(y2 - y1, x2 - x1), size, color); next += every; }
  }
}
function hatch(ctx, x1, y1, x2, y2, color, side = 1, gap = 9, len = 7) {
  // short slanted lines along a segment, on one side (the back of a mirror)
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  const nx = -uy * side, ny = ux * side;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.2;
  for (let d = gap / 2; d < L; d += gap) {
    const px = x1 + ux * d, py = y1 + uy * d;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + nx * len + ux * len * 0.8, py + ny * len + uy * len * 0.8); ctx.stroke();
  }
  ctx.restore();
}

/* moving charges along a polyline */
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

/* ---------- lifecycle ---------- */
function resetLifecycle() {
  CR.cleanup.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
  CR.cleanup = [];
  CR.redrawers = [];
}
function onFrame(fn) {
  let id, last = performance.now();
  const loop = t => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    fn(dt, t);
    id = requestAnimationFrame(loop);
  };
  id = requestAnimationFrame(loop);
  CR.cleanup.push(() => cancelAnimationFrame(id));
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
  CR.cleanup.push(() => ro.disconnect());
  CR.redrawers.push(() => api.draw());
  api.resize = resize;
  api.pos = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  return api;
}

/* ---------- control widgets ---------- */
function controls(parent) { const c = h("div", { class: "controls" }); parent.append(c); return c; }
function slider(parent, { label: lab, min, max, step, value, unit = "", fmt: f }, onInput) {
  const out = h("output");
  const inp = h("input", { type: "range", min, max, step, value, "aria-label": lab });
  let shown = null;
  const set = () => { out.textContent = shown !== null ? shown : (f ? f(+inp.value) : String(+inp.value)) + (unit ? " " + unit : ""); };
  inp.addEventListener("input", () => { shown = null; set(); onInput(+inp.value); });
  set();
  const el = h("label", { class: "ctl slider" }, h("span", { class: "ctl-label" }, lab), h("div", { class: "row" }, inp, out));
  parent.append(el);
  return {
    el, inp,
    get value() { return +inp.value; },
    set value(v) { shown = null; inp.value = v; set(); },
    show(text) { shown = text; set(); }   // override the displayed value (e.g. "∞")
  };
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
  return { el: wrap, set, btns };
}
function select(parent, { label: lab, options, value }, onChange) {
  const s = h("select", { "aria-label": lab });
  options.forEach(([v, t]) => s.append(h("option", { value: v }, t)));
  s.value = value;
  s.addEventListener("change", () => onChange(s.value));
  const el = h("label", { class: "ctl" }, h("span", { class: "ctl-label" }, lab), s);
  parent.append(el);
  return { el, sel: s, set(v) { s.value = v; } };
}
function numInput(parent, { label: lab, value, min, max, step = "any", unit = "" }, onChange) {
  const inp = h("input", { type: "number", min, max, step, value, "aria-label": lab });
  const read = () => { const v = parseFloat(inp.value); return isFinite(v) ? clamp(v, min, max) : null; };
  inp.addEventListener("input", () => { const v = read(); if (v !== null) onChange(v); });
  inp.addEventListener("change", () => { const v = read(); if (v === null) inp.value = value; else inp.value = v; });
  const el = h("label", { class: "ctl num" }, h("span", { class: "ctl-label" }, lab), h("span", { class: "num-row" }, inp, unit ? h("span", { class: "unit" }, unit) : null));
  parent.append(el);
  return { el, inp, set(v) { inp.value = v; } };
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
/* on/off chips; state is an object keyed by item id */
function toggles(row, items, state, onChange) {
  const btns = {};
  items.forEach(([id, text]) => {
    btns[id] = chip(row, text, () => {
      state[id] = !state[id];
      btns[id].setAttribute("aria-pressed", String(!!state[id]));
      onChange(id);
    }, !!state[id]);
  });
  return {
    btns,
    sync() { for (const id in btns) btns[id].setAttribute("aria-pressed", String(!!state[id])); },
    show(id, on) { if (btns[id]) btns[id].style.display = on ? "" : "none"; }
  };
}
function readouts(parent) {
  const el = h("div", { class: "readouts" });
  parent.append(el);
  let lastKey = "";
  return items => {
    const key = JSON.stringify(items.map(it => [it.k, it.v, it.wide, it.tone]));
    if (key === lastKey) return;
    lastKey = key;
    el.replaceChildren(...items.map(it => h("div", { class: "ro" + (it.wide ? " wide" : "") + (it.tone ? " " + it.tone : "") },
      h("span", { class: "ro-k" }, it.k), h("span", { class: "ro-v" }, it.v))));
  };
}
/* an NCERT table with an optional highlighted row */
function ncertTable(parent, { caption, head: hd, rows, note }) {
  const tbody = h("tbody");
  const trs = rows.map(r => {
    const tr = h("tr", {}, r.map((c, j) => h(j === 0 ? "th" : "td", j === 0 ? { scope: "row" } : null, c)));
    tbody.append(tr);
    return tr;
  });
  const wrap = h("div", { class: "ncert-wrap" },
    h("table", { class: "ncert" }, h("caption", {}, caption),
      h("thead", {}, h("tr", {}, hd.map(c => h("th", { scope: "col" }, c)))), tbody),
    note ? h("p", { class: "table-note" }, note) : null);
  parent.append(wrap);
  return {
    el: wrap,
    highlight(i) { const set = Array.isArray(i) ? i : [i]; trs.forEach((tr, k) => tr.classList.toggle("hl", set.includes(k))); }
  };
}

Object.assign(CR, {
  $, h, clamp, lerp, DEG, MINUS, store, fmt, sgnf, sci, nice, br, supNum,
  FONT, isDark, pal,
  line, head, drawRay, vArrow, label, textWidth, roundRect, circle, arcAngle, toEdge, shade, rgb, mix, polyline, arrowsAlong, hatch,
  pathInfo, pointAt, drawFlow,
  resetLifecycle, onFrame, makeCanvas,
  controls, slider, seg, select, numInput, chipRow, chip, toggles, readouts, ncertTable
});
return CR;
})();
