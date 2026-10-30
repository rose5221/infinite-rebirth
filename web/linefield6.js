'use strict';

/* Quantized Line Field, used inside the game.
   Every world gets its own procedural sigil; the same 60x30 segment field renders
   it as four line weights, drifts with fixed-seed noise, and reacts to the pointer
   with a damped spring, drawing blue detection boxes from the live luminance. */

const LF = {
  GRID: 60,
  SEG_ROWS: 30,
  WIDTHS: [0.38, 1.12, 2.28, 3.80],
  ALPHAS: [0.15, 0.64, 0.93, 1],
  THRESH: [0.12, 0.42, 0.89]
};

/* shared 128x128 value noise, seed 7319, built once */
const LF_NOISE = (function () {
  const N = 128, out = new Float32Array(N * N);
  let s = 7319 >>> 0;
  for (let i = 0; i < out.length; i++) {
    s ^= (s << 13); s >>>= 0;
    s ^= (s >>> 17); s >>>= 0;
    s ^= (s << 5); s >>>= 0;
    out[i] = (s / 4294967295) * 2 - 1;
  }
  return out;
})();
function lfNoise(x, y) {
  const N = 128;
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = smooth01(x - xi), ty = smooth01(y - yi);
  const x0 = ((xi % N) + N) % N, y0 = ((yi % N) + N) % N;
  const x1 = (x0 + 1) % N, y1 = (y0 + 1) % N;
  const v00 = LF_NOISE[y0 * N + x0], v10 = LF_NOISE[y0 * N + x1];
  const v01 = LF_NOISE[y1 * N + x0], v11 = LF_NOISE[y1 * N + x1];
  const a = v00 + (v10 - v00) * tx, b = v01 + (v11 - v01) * tx;
  return a + (b - a) * ty;
}
function smooth01(t) { return t * t * (3 - 2 * t); }

/* ---------- per-world sigil, sampled once into a 60x60 table ---------- */
function worldSigilTable(worldIndex) {
  const G = LF.GRID, S = G * 5;
  const c = document.createElement('canvas');
  c.width = S; c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, S, S);

  /* deterministic per-world random */
  let s = (7919 * (worldIndex + 1) + 104729) >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s >>>= 0; s ^= s << 5; s >>>= 0; return s / 4294967296; };

  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  ctx.lineCap = 'butt';

  const cx = S / 2, cy = S / 2;
  const kind = worldIndex % 6;

  if (kind === 0) {
    /* concentric ring with a gap and a stem */
    ctx.lineWidth = S * 0.085;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.29, Math.PI * (0.12 + rnd() * 0.2), Math.PI * (1.55 + rnd() * 0.3));
    ctx.stroke();
    ctx.fillRect(cx - S * 0.028, cy - S * 0.34, S * 0.056, S * 0.68);
  } else if (kind === 1) {
    /* angular chevrons */
    ctx.lineWidth = S * 0.075;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - S * 0.3, cy + i * S * 0.18 - S * 0.05);
      ctx.lineTo(cx, cy + i * S * 0.18 - S * 0.2);
      ctx.lineTo(cx + S * 0.3, cy + i * S * 0.18 - S * 0.05);
      ctx.stroke();
    }
  } else if (kind === 2) {
    /* crescent */
    ctx.lineWidth = S * 0.11;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.31, Math.PI * 0.35, Math.PI * 1.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + S * 0.1, cy - S * 0.02, S * 0.2, Math.PI * 0.4, Math.PI * 1.6);
    ctx.stroke();
  } else if (kind === 3) {
    /* lattice / gate */
    ctx.lineWidth = S * 0.055;
    for (let i = 0; i < 3; i++) {
      const x = cx - S * 0.24 + i * S * 0.24;
      ctx.beginPath(); ctx.moveTo(x, cy - S * 0.3); ctx.lineTo(x, cy + S * 0.3); ctx.stroke();
    }
    ctx.lineWidth = S * 0.07;
    ctx.beginPath(); ctx.moveTo(cx - S * 0.31, cy - S * 0.06); ctx.lineTo(cx + S * 0.31, cy - S * 0.06); ctx.stroke();
  } else if (kind === 4) {
    /* orbit: circle plus a satellite dot */
    ctx.lineWidth = S * 0.06;
    ctx.beginPath(); ctx.arc(cx, cy, S * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + S * 0.2, cy - S * 0.19, S * 0.085, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - S * 0.03, cy - S * 0.035, S * 0.06, S * 0.07);
  } else {
    /* stepped ziggurat */
    ctx.lineWidth = S * 0.07;
    for (let i = 0; i < 4; i++) {
      const w = S * (0.62 - i * 0.12);
      const y = cy + S * 0.22 - i * S * 0.14;
      ctx.beginPath(); ctx.moveTo(cx - w / 2, y); ctx.lineTo(cx + w / 2, y); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(cx, cy - S * 0.32); ctx.lineTo(cx, cy + S * 0.24); ctx.stroke();
  }

  const data = ctx.getImageData(0, 0, S, S).data;
  const table = new Float32Array(G * G);
  for (let gy = 0; gy < G; gy++) {
    for (let gx = 0; gx < G; gx++) {
      let sum = 0;
      for (let sy = 0; sy < 5; sy++) {
        for (let sx = 0; sx < 5; sx++) {
          const i = ((gy * 5 + sy) * S + (gx * 5 + sx)) * 4;
          sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        }
      }
      table[gy * G + gx] = sum / 25;
    }
  }
  c.width = 0; c.height = 0;
  return table;
}

/* wide band: not the sigil stretched, but a field whose density is driven by the
   world's own column profile, so each world's strip looks different */
function worldWideTable(worldIndex) {
  const G = LF.GRID, out = new Float32Array(G * G);
  const tbl = lineField.sigilCache;
  /* column profile of the sigil = its "sound" */
  const prof = new Float32Array(G);
  let max = 0;
  for (let x = 0; x < G; x++) {
    let sum = 0;
    for (let y = 0; y < G; y++) sum += tbl[y * G + x];
    prof[x] = sum / G;
    if (prof[x] > max) max = prof[x];
  }
  if (max > 0) for (let x = 0; x < G; x++) prof[x] /= max;

  for (let y = 0; y < G; y++) {
    for (let x = 0; x < G; x++) {
      const nx = x / (G - 1);
      /* mirror the profile so the band reads as a soft wave, bright in the middle */
      const mirrored = prof[Math.min(G - 1, Math.round(Math.abs(nx - 0.5) * 2 * (G - 1)))];
      const envelope = 0.32 + 0.68 * Math.pow(1 - Math.abs(nx - 0.5) * 2, 0.8);
      const grain = 0.55 + 0.45 * Math.abs(lfNoise(x * 0.28 + worldIndex * 3.1, y * 0.22));
      out[y * G + x] = Math.min(1, (0.16 + 0.84 * mirrored) * envelope * grain);
    }
  }
  return out;
}

/* ---------- one live field bound to a canvas ---------- */
class LineField {
  constructor(canvas, opts) {
    this.canvas = canvas;
    this.table = opts.table;
    this.seed = opts.seed || 3;
    this.color = opts.color || '#202220';
    this.detectColor = opts.detectColor || '#2152e7';
    this.alpha = opts.alpha === undefined ? 1 : opts.alpha;
    this.time = 0;
    this.pulse = 0;
    this.overlay = false;
    this.visible = true;
    this.pointer = null;
    this.pointerClient = null;
    this.cssW = 0; this.cssH = 0; this.dpr = 1;
    this.geoW = 0; this.geoH = 0;
    this.scanTimer = 0;
    this.targets = [null, null, null];
    this.buf = new Float32Array(LF.GRID * LF.GRID);
    this.integral = new Float64Array((LF.GRID + 1) * (LF.GRID + 1));
    this.gx = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.gy = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.dx = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.dy = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.vx = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.vy = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.px = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.py = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.lum = new Float32Array(LF.GRID * LF.SEG_ROWS);
    this.level = new Uint8Array(LF.GRID * LF.SEG_ROWS);

    canvas.setAttribute('aria-hidden', 'true');
    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });
      parent.addEventListener('pointerdown', (e) => this.onMove(e), { passive: true });
      parent.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') { this.overlay = true; this.pulse = 1; this.pointerClient = [e.clientX, e.clientY]; } }, { passive: true });
      parent.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { this.overlay = false; this.pointerClient = null; this.targets = [null, null, null]; } }, { passive: true });
    }
  }
  onMove(e) {
    this.overlay = true;
    if (this.pointerClient) {
      const dx = e.clientX - this.pointerClient[0], dy = e.clientY - this.pointerClient[1];
      if (Math.sqrt(dx * dx + dy * dy) > 1.5) { this.pulse = 1; }
    }
    this.pointerClient = [e.clientX, e.clientY];
  }
  fit() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === this.cssW && h === this.cssH && dpr === this.dpr) return false;
    this.cssW = w; this.cssH = h; this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    const ctx = this.canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }
  geometry() {
    if (this.geoW === this.cssW && this.geoH === this.cssH) return false;
    this.geoW = this.cssW; this.geoH = this.cssH;
    const G = LF.GRID, R = LF.SEG_ROWS;
    this.cw = this.cssW / G; this.ch = this.cssH / G;
    for (let c = 0; c < G; c++) {
      for (let y = 0; y < R; y++) {
        const i = y * G + c;
        this.gx[i] = c * this.cw + this.cw / 2;
        this.gy[i] = y * 2 * this.ch + this.ch;
      }
    }
    return true;
  }
  lumAt(col, row) {
    const G = LF.GRID, t = this.table;
    const b = (t[(row * 2) * G + col] + t[(row * 2 + 1) * G + col]) * 0.5;
    const n = lfNoise(col * 0.15 + this.seed, row * 2 * 0.16 - this.time * 0.17);
    return b * 0.94 + n * 0.12 * (0.25 + b * 0.75);
  }
  levelOf(v) { return v < LF.THRESH[0] ? 0 : v < LF.THRESH[1] ? 1 : v < LF.THRESH[2] ? 2 : 3; }

  step(dt, animateDetection) {
    this.fit(); this.geometry();
    this.time += dt;
    this.pulse *= Math.exp(-dt * 5.5);
    if (this.pulse < 0.0005) this.pulse = 0;

    let px = null, py = null;
    if (this.overlay && this.pointerClient) {
      const r = this.canvas.getBoundingClientRect();
      px = this.pointerClient[0] - r.left;
      py = this.pointerClient[1] - r.top;
    }
    const radius = Math.max(16, this.canvas.clientWidth / 6);

    const G = LF.GRID, SEGS = G * LF.SEG_ROWS;
    const sub = 1 / 30, steps = Math.max(1, Math.ceil(dt / sub)), h = dt / steps;
    const K = 145, D = 19;
    for (let i = 0; i < SEGS; i++) {
      let tx = 0, ty = 0;
      if (px !== null && this.pulse > 0) {
        const ddx = this.gx[i] - px, ddy = this.gy[i] - py;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < radius && dist > 0.0001) {
          let infl = 1 - dist / radius; infl = infl * infl * this.pulse * 25;
          tx = (ddx / dist) * infl; ty = (ddy / dist) * infl * 0.58;
        }
      }
      for (let s = 0; s < steps; s++) {
        const ax = -K * (this.dx[i] - tx) - D * this.vx[i];
        const ay = -K * (this.dy[i] - ty) - D * this.vy[i];
        this.vx[i] += ax * h; this.vy[i] += ay * h;
        this.dx[i] += this.vx[i] * h; this.dy[i] += this.vy[i] * h;
      }
      this.px[i] = this.gx[i] + this.dx[i];
      this.py[i] = this.gy[i] + this.dy[i];
      const col = i % G, row = (i - col) / G;
      this.lum[i] = this.lumAt(col, row);
      this.level[i] = this.levelOf(this.lum[i]);
    }
    this.detect(dt, animateDetection);
  }

  draw() {
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    const G = LF.GRID, SEGS = G * LF.SEG_ROWS;
    const scale = this.cw / 5.25, gap = 0.7, segH = 2 * this.ch - gap;
    ctx.globalAlpha = this.alpha;
    for (let lv = 0; lv < 4; lv++) {
      ctx.beginPath();
      for (let i = 0; i < SEGS; i++) {
        if (this.level[i] !== lv) continue;
        const x = this.px[i], top = this.py[i] - segH / 2;
        ctx.moveTo(x, top); ctx.lineTo(x, top + segH);
      }
      ctx.lineWidth = Math.max(0.4, LF.WIDTHS[lv] * scale);
      ctx.lineCap = 'butt';
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = this.alpha * LF.ALPHAS[lv];
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    this.drawDetect(ctx);
  }

  still() {
    this.fit(); this.geometry(); this.time = 0; this.pulse = 0;
    const G = LF.GRID, SEGS = G * LF.SEG_ROWS;
    for (let i = 0; i < SEGS; i++) {
      this.dx[i] = this.dy[i] = this.vx[i] = this.vy[i] = 0;
      this.px[i] = this.gx[i]; this.py[i] = this.gy[i];
      const col = i % G, row = (i - col) / G;
      this.lum[i] = this.lumAt(col, row);
      this.level[i] = this.levelOf(this.lum[i]);
    }
    if (this.overlay) this.scan(); else this.targets = [null, null, null];
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    this.draw();
  }

  scan() {
    const G = LF.GRID, buf = this.buf;
    buf.fill(0);
    if (!this.cw || !this.ch) return;
    for (let i = 0; i < G * LF.SEG_ROWS; i++) {
      const v = this.lum[i];
      if (v <= 0.02) continue;
      const gx = this.px[i] / this.cw - 0.5, gy = this.py[i] / this.ch - 0.5;
      const x0 = Math.floor(gx), y0 = Math.floor(gy);
      const fx = gx - x0, fy = gy - y0;
      this.add(buf, x0, y0, v * (1 - fx) * (1 - fy));
      this.add(buf, x0 + 1, y0, v * fx * (1 - fy));
      this.add(buf, x0, y0 + 1, v * (1 - fx) * fy);
      this.add(buf, x0 + 1, y0 + 1, v * fx * fy);
    }
    const I = this.integral, W = G + 1;
    for (let y = 0; y <= G; y++) I[y * W] = 0;
    for (let x = 0; x <= G; x++) I[x] = 0;
    for (let y = 1; y <= G; y++) {
      let row = 0;
      for (let x = 1; x <= G; x++) {
        row += buf[(y - 1) * G + (x - 1)];
        I[y * W + x] = I[(y - 1) * W + x] + row;
      }
    }
    const win = (cx, cy) => {
      const x0 = cx - 3, y0 = cy - 3, x1 = cx + 4, y1 = cy + 4;
      if (x0 < 0 || y0 < 0 || x1 > G || y1 > G) return 0;
      return (I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0]) / 49;
    };
    const cand = [];
    let best = 0;
    for (let cy = 3; cy < G - 3; cy++) {
      for (let cx = 3; cx < G - 3; cx++) {
        const s = win(cx, cy);
        if (s > best) best = s;
        cand.push([s, cx, cy]);
      }
    }
    for (const t of this.targets) if (t) t.alphaTarget = 0;
    if (best < 0.04) return;

    const prev = this.targets.filter(Boolean);
    cand.sort((a, b) => {
      let ba = 0, bb = 0;
      for (const p of prev) {
        ba = Math.max(ba, 0.025 * Math.exp(-((a[1] - p.cx) ** 2 + (a[2] - p.cy) ** 2) / 128));
        bb = Math.max(bb, 0.025 * Math.exp(-((b[1] - p.cx) ** 2 + (b[2] - p.cy) ** 2) / 128));
      }
      return (b[0] + bb) - (a[0] + ba);
    });

    let minDist = 16, kept = [];
    for (let pass = 0; pass < 2 && kept.length < 2; pass++) {
      kept = [];
      for (const c of cand) {
        if (kept.length >= 3) break;
        if (c[0] < best * 0.48) continue;
        if (kept.every(k => Math.hypot(c[1] - k[1], c[2] - k[2]) >= minDist)) kept.push(c);
      }
      minDist = 12;
    }

    const used = new Set();
    for (const k of kept) {
      let slot = -1, bd = 1e9;
      this.targets.forEach((t, i) => {
        if (t && !used.has(i)) {
          const d = Math.hypot(t.cx - k[1], t.cy - k[2]);
          if (d <= 12 && d < bd) { bd = d; slot = i; }
        }
      });
      if (slot < 0) slot = this.targets.findIndex(t => t === null);
      if (slot < 0) continue;
      used.add(slot);
      const old = this.targets[slot];
      const p = [k[1] * this.cw + this.cw / 2, k[2] * this.ch + this.ch / 2];
      this.targets[slot] = old
        ? { cx: k[1], cy: k[2], px: old.px, py: old.py, vx: k[1] - old.cx, vy: k[2] - old.cy, alpha: old.alpha, alphaTarget: 1 }
        : { cx: k[1], cy: k[2], px: p[0], py: p[1], vx: 0, vy: 0, alpha: 0, alphaTarget: 1 };
    }
  }
  add(buf, x, y, v) {
    const G = LF.GRID;
    if (x < 0 || y < 0 || x >= G || y >= G) return;
    buf[y * G + x] += v;
  }
  detect(dt, animate) {
    if (!animate) return;
    if (this.overlay) {
      this.scanTimer += dt;
      if (this.scanTimer >= 0.1) { this.scanTimer = 0; this.scan(); }
    }
    const steps = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / steps;
    for (let i = 0; i < 3; i++) {
      const t = this.targets[i];
      if (!t) continue;
      const gx = t.cx * this.cw + this.cw / 2, gy = t.cy * this.ch + this.ch / 2;
      for (let s = 0; s < steps; s++) {
        const ax = -144 * (t.px - gx) - 24 * t.vx;
        const ay = -144 * (t.py - gy) - 24 * t.vy;
        t.vx += ax * h; t.vy += ay * h;
        t.px += t.vx * h; t.py += t.vy * h;
      }
      t.alpha += (t.alphaTarget - t.alpha) * (1 - Math.exp(-dt * 16));
      if (t.alphaTarget === 0 && t.alpha < 0.004) this.targets[i] = null;
      else if (t.alphaTarget === 1 && Math.abs(t.vx) < 0.02 && Math.abs(t.vy) < 0.02) { t.px = gx; t.py = gy; t.vx = t.vy = 0; }
    }
  }
  drawDetect(ctx) {
    const live = this.targets.filter(t => t && t.alpha > 0.004);
    if (!live.length) return;
    const size = 9 * this.cw;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < live.length - 1; i++) {
      ctx.globalAlpha = Math.min(live[i].alpha, live[i + 1].alpha) * 0.5;
      ctx.strokeStyle = this.detectColor;
      ctx.beginPath();
      ctx.moveTo(live[i].px, live[i].py);
      ctx.lineTo(live[i + 1].px, live[i + 1].py);
      ctx.stroke();
    }
    for (const t of live) {
      const x = t.px - size / 2, y = t.py - size / 2;
      ctx.globalAlpha = t.alpha * 0.07; ctx.fillStyle = this.detectColor;
      ctx.fillRect(x, y, size, size);
      ctx.globalAlpha = t.alpha * 0.85; ctx.strokeStyle = this.detectColor; ctx.lineWidth = 1;
      ctx.strokeRect(x, y, size, size);
      const m = Math.max(4, size * 0.24);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + m); ctx.lineTo(x, y); ctx.lineTo(x + m, y);
      ctx.moveTo(x + size - m, y); ctx.lineTo(x + size, y); ctx.lineTo(x + size, y + m);
      ctx.moveTo(x + size, y + size - m); ctx.lineTo(x + size, y + size); ctx.lineTo(x + size - m, y + size);
      ctx.moveTo(x + m, y + size); ctx.lineTo(x, y + size); ctx.lineTo(x, y + size - m);
      ctx.stroke();
      const moving = Math.abs(t.vx) > 0.05 || Math.abs(t.vy) > 0.05;
      ctx.globalAlpha = t.alpha * 0.8; ctx.fillStyle = this.detectColor;
      ctx.font = '9px ui-monospace,Menlo,monospace';
      ctx.fillText(moving ? t.px.toFixed(1) + '/' + t.py.toFixed(1) : (t.cx + 0.5) + '/' + (t.cy + 0.5), x, Math.max(9, y - 5));
    }
    ctx.globalAlpha = 1;
  }
}

/* ---------- registry: mount / pause / paint ---------- */
const LF_INSTANCES = [];
let LF_RAF = 0, LF_LAST = 0;

function mountFields() {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvases = document.querySelectorAll('canvas[data-field]');
  LF_INSTANCES.length = 0;
  canvases.forEach((cv, idx) => {
    let table, seed, color, detect;
    const kind = cv.dataset.field;
    if (kind === 'sigil') {
      table = lineField.sigilCache;
      seed = 3 + state.worldIndex * 7;
      color = '#202220';
      detect = '#2152e7';
    } else {
      table = lineField.wideCache;
      seed = 11 + state.worldIndex * 5;
      color = '#202220';
      detect = '#267dff';
    }
    const f = new LineField(cv, { table, seed, color, detectColor: detect });
    f.reduced = reduced;
    LF_INSTANCES.push(f);
    f.fit(); f.geometry(); f.still();
  });
  if (reduced) { paintAllStill(); return; }
  startFields();
}

function paintAllStill() {
  for (const f of LF_INSTANCES) f.still();
}

function startFields() {
  if (LF_RAF) return;
  LF_LAST = 0;
  LF_RAF = requestAnimationFrame(fieldLoop);
}
function stopFields() {
  if (LF_RAF) cancelAnimationFrame(LF_RAF);
  LF_RAF = 0;
  paintAllStill();
}
function fieldLoop(now) {
  LF_RAF = 0;
  const dt = LF_LAST ? Math.min(0.05, (now - LF_LAST) / 1000) : 1 / 60;
  LF_LAST = now;
  let any = false;
  for (const f of LF_INSTANCES) {
    if (!f.canvas.isConnected) continue;
    if (document.hidden) continue;
    f.step(dt, true);
    f.draw();
    any = true;
  }
  if (any) LF_RAF = requestAnimationFrame(fieldLoop);
}

/* ---------- caches ---------- */
const lineField = { sigilCache: null, wideCache: null, world: -1 };

function ensureFieldCaches() {
  if (lineField.world === state.worldIndex && lineField.sigilCache) return;
  lineField.world = state.worldIndex;
  const wi = state.worldIndex < 0 ? 0 : state.worldIndex;
  lineField.sigilCache = worldSigilTable(wi);
  /* the wide band reuses the same sigil, stretched wide by the geometry */
  lineField.wideCache = worldWideTable(wi);
}

/* patch the old painter so every render picks up the new engine */
function paintFields() {
  ensureFieldCaches();
  mountFields();
}

window.addEventListener('visibilitychange', () => {
  if (document.hidden) stopFields(); else if (!LF_INSTANCES.every(f => f.reduced)) startFields();
});
