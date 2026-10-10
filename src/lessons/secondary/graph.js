// Shared x–y grid for the high-school graphing lessons.
import { colors, text, line } from '../../lib/stage.js';

const neg = (n) => (n < 0 ? `−${-n}` : String(n));

// Draws a grid for [-xMax, xMax] × [-yMax, yMax] and returns the mapping.
export function drawGrid(ctx, w, h, { xMax, yMax, step = 1, label = 2, pad = 18 }) {
  const u = Math.min((w - 2 * pad) / (2 * xMax), (h - 2 * pad) / (2 * yMax));
  const cx = w / 2;
  const cy = h / 2;
  const X = (x) => cx + x * u;
  const Y = (y) => cy - y * u;
  for (let x = -xMax; x <= xMax; x += step) {
    line(ctx, X(x), Y(-yMax), X(x), Y(yMax), x === 0 ? colors.muted : colors.grid, x === 0 ? 1.5 : 1);
    if (x !== 0 && x % label === 0) text(ctx, neg(x), X(x), Y(0) + 12, { size: 10 });
  }
  for (let y = -yMax; y <= yMax; y += step) {
    line(ctx, X(-xMax), Y(y), X(xMax), Y(y), y === 0 ? colors.muted : colors.grid, y === 0 ? 1.5 : 1);
    if (y !== 0 && y % label === 0) text(ctx, neg(y), X(0) - 8, Y(y), { size: 10, align: 'right' });
  }
  return { X, Y, u, xMax, yMax, toX: (px) => (px - cx) / u, toY: (py) => (cy - py) / u };
}

// Plots y = f(x) across the grid, clipped to the grid area.
export function plot(ctx, g, f, color, width = 2.5) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(g.X(-g.xMax), g.Y(g.yMax), 2 * g.xMax * g.u, 2 * g.yMax * g.u);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  let pen = false;
  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const x = -g.xMax + (2 * g.xMax * i) / steps;
    const y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > g.yMax * 3) {
      pen = false;
      continue;
    }
    pen ? ctx.lineTo(g.X(x), g.Y(y)) : ctx.moveTo(g.X(x), g.Y(y));
    pen = true;
  }
  ctx.stroke();
  ctx.restore();
}

export const num = (x, d = 2) => {
  const r = Math.round(x * 10 ** d) / 10 ** d;
  return (r < 0 ? `−${-r}` : String(r === 0 ? 0 : r));
};
