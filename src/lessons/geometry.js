// Lesson 3: rearrangement proof of the Pythagorean theorem.
// Four copies of a right triangle sit inside a square of side a + b. Moving them
// changes the empty space from one square (c²) into two squares (a² and b²).
import { colors, setupCanvas, runLesson, text } from '../lib/stage.js';

const HOLD = 1.1;
const MOVE = 1.4;
const CYCLE = 2 * (HOLD + MOVE);

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.?0+$/, ''));

export function initGeometry(section) {
  const canvas = section.querySelector('#geo-canvas');
  const aInput = section.querySelector('#geo-a');
  const bInput = section.querySelector('#geo-b');
  const tInput = section.querySelector('#geo-t');
  const out = {
    a2: section.querySelector('#geo-a2'),
    b2: section.querySelector('#geo-b2'),
    sum: section.querySelector('#geo-sum'),
    c2: section.querySelector('#geo-c2'),
  };
  const view = setupCanvas(canvas);
  let clock = 0;

  const progress = (time) => {
    if (time < HOLD) return 0;
    if (time < HOLD + MOVE) return ease((time - HOLD) / MOVE);
    if (time < 2 * HOLD + MOVE) return 1;
    return 1 - ease((time - 2 * HOLD - MOVE) / MOVE);
  };

  const step = (dt) => {
    clock = (clock + dt) % CYCLE;
    tInput.value = progress(clock);
  };

  const draw = () => {
    const { ctx, w, h } = view;
    const a = Number(aInput.value);
    const b = Number(bInput.value);
    const s = a + b;
    const t = Number(tInput.value);
    const c2 = a * a + b * b;

    ctx.clearRect(0, 0, w, h);

    const side = Math.min(h - 40, w * 0.56);
    const k = side / s;
    const ox = Math.max(20, w * 0.04);
    const oy = (h - side) / 2;
    const P = (x, y) => [ox + x * k, oy + y * k];

    const poly = (pts, fill, stroke, width = 1.5) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const [px, py] = P(x, y);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      });
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.stroke();
      }
    };

    // Empty regions of each arrangement, faded by progress.
    poly([[a, 0], [s, a], [b, s], [0, b]], `rgba(255, 243, 176, ${0.32 * (1 - t)})`);
    poly([[0, 0], [a, 0], [a, a], [0, a]], `rgba(255, 214, 10, ${0.55 * t})`);
    poly([[a, a], [s, a], [s, s], [a, s]], `rgba(255, 159, 28, ${0.55 * t})`);

    // The four triangles: canonical legs (a along x, b along y), rotated by 90° steps
    // and slid from arrangement A to arrangement B.
    const triangles = [
      { rot: 0, from: [0, 0], to: [0, a] },
      { rot: 1, from: [s, 0], to: [s, 0] },
      { rot: 2, from: [s, s], to: [a, s] },
      { rot: 3, from: [0, s], to: [a, a] },
    ];
    for (const tri of triangles) {
      const tx = tri.from[0] + (tri.to[0] - tri.from[0]) * t;
      const ty = tri.from[1] + (tri.to[1] - tri.from[1]) * t;
      const cos = Math.round(Math.cos((tri.rot * Math.PI) / 2));
      const sin = Math.round(Math.sin((tri.rot * Math.PI) / 2));
      const pts = [[0, 0], [a, 0], [0, b]].map(([x, y]) => [tx + x * cos - y * sin, ty + x * sin + y * cos]);
      poly(pts, colors.shape, colors.shapeEdge);
    }

    poly([[0, 0], [s, 0], [s, s], [0, s]], null, colors.text, 2);

    // Region labels
    const label = (str, x, y, alpha, color) => {
      if (alpha < 0.05) return;
      ctx.globalAlpha = alpha;
      const [px, py] = P(x, y);
      text(ctx, str, px, py, { color, size: Math.max(14, Math.min(26, side * 0.07)), weight: 700 });
      ctx.globalAlpha = 1;
    };
    label('c²', s / 2, s / 2, 1 - t, colors.text);
    label('a²', a / 2, a / 2, t, colors.yellow);
    label('b²', a + b / 2, a + b / 2, t, colors.orange);

    // Side panel: the triangle being used and the running equation.
    const panelX = ox + side + Math.max(20, w * 0.05);
    const panelW = w - panelX - 16;
    if (panelW > 90) {
      const tk = Math.min(panelW / (a + 0.6), (h * 0.42) / b) * 0.8;
      const bx = panelX + 14;
      const by = h * 0.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + a * tk, by);
      ctx.lineTo(bx, by - b * tk);
      ctx.closePath();
      ctx.fillStyle = colors.shape;
      ctx.fill();
      ctx.strokeStyle = colors.shapeEdge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = colors.muted;
      ctx.strokeRect(bx, by - 10, 10, 10);
      text(ctx, 'a', bx + (a * tk) / 2, by + 14, { color: colors.yellow, size: 15, weight: 700 });
      text(ctx, 'b', bx - 12, by - (b * tk) / 2, { color: colors.orange, size: 15, weight: 700 });
      text(ctx, 'c', bx + (a * tk) / 2 + 12, by - (b * tk) / 2 - 8, { color: colors.soft, size: 15, weight: 700 });

      const size = Math.max(12, Math.min(18, panelW / 11));
      text(ctx, `${fmt(a * a)} + ${fmt(b * b)} = ${fmt(c2)}`, panelX + 4, by + 50, { align: 'left', color: colors.text, size, mono: true });
      text(ctx, `c = √${fmt(c2)} ≈ ${fmt(Math.round(Math.sqrt(c2) * 100) / 100)}`, panelX + 4, by + 50 + size * 1.6, { align: 'left', color: colors.muted, size: size - 2, mono: true });
    }

    out.a2.value = fmt(a * a);
    out.b2.value = fmt(b * b);
    out.sum.value = fmt(c2);
    out.c2.value = fmt(c2);
  };

  const lesson = runLesson(section, { step, draw });

  tInput.addEventListener('input', () => {
    lesson.pause();
    lesson.redraw();
  });
  aInput.addEventListener('input', lesson.redraw);
  bInput.addEventListener('input', lesson.redraw);
  view.onResize = lesson.redraw;
}
