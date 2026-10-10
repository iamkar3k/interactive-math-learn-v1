// Lesson 1: a point on the unit circle traces out sin θ and cos θ.
import { colors, TAU, setupCanvas, runLesson, text, line, dot, canvasPoint } from '../lib/stage.js';

export function initTrig(section) {
  const canvas = section.querySelector('#trig-canvas');
  const speedInput = section.querySelector('#trig-speed');
  const cosInput = section.querySelector('#trig-cos');
  const out = {
    theta: section.querySelector('#trig-theta'),
    sin: section.querySelector('#trig-sin'),
    cos: section.querySelector('#trig-cosv'),
    id: section.querySelector('#trig-id'),
  };
  const view = setupCanvas(canvas);
  let theta = 0;
  let dragging = null;

  const layout = () => {
    const { w, h } = view;
    const R = Math.min(h * 0.36, w * 0.17);
    const cx = R + Math.max(24, w * 0.05);
    const cy = h / 2;
    const x0 = cx + R + Math.max(28, w * 0.06);
    const x1 = w - Math.max(20, w * 0.03);
    return { R, cx, cy, x0, x1, waveW: x1 - x0 };
  };

  const step = (dt) => {
    theta = (theta + dt * Number(speedInput.value) * 1.1) % TAU;
  };

  const draw = () => {
    const { ctx, w, h } = view;
    const { R, cx, cy, x0, x1, waveW } = layout();
    const showCos = cosInput.checked;
    const s = Math.sin(theta);
    const c = Math.cos(theta);
    const px = cx + R * c;
    const py = cy - R * s;
    const waveX = (t) => x0 + (t / TAU) * waveW;

    ctx.clearRect(0, 0, w, h);

    // Axes and guides
    line(ctx, cx - R - 14, cy, x1, cy, colors.axis);
    line(ctx, cx, cy - R - 14, cx, cy + R + 14, colors.axis);
    line(ctx, x0, cy - R - 10, x0, cy + R + 10, colors.axis);
    for (const v of [1, -1]) {
      line(ctx, x0, cy - v * R, x1, cy - v * R, colors.grid, 1, [4, 4]);
      text(ctx, String(v), x0 - 8, cy - v * R, { align: 'right', size: 11 });
    }
    const ticks = ['π/2', 'π', '3π/2', '2π'];
    ticks.forEach((label, i) => {
      const x = waveX(((i + 1) * TAU) / 4);
      line(ctx, x, cy - 4, x, cy + 4, colors.axis);
      text(ctx, label, x, cy + 16, { size: 11 });
    });

    // Unit circle
    ctx.strokeStyle = colors.text;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Full curves (faint) and traced part (bright)
    const curve = (fn, color, upTo, width, alpha) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const steps = 160;
      for (let i = 0; i <= steps; i++) {
        const t = (upTo * i) / steps;
        const x = waveX(t);
        const y = cy - R * fn(t);
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    };
    if (showCos) {
      curve(Math.cos, colors.orange, TAU, 1.5, 0.18);
      curve(Math.cos, colors.orange, theta, 2.5, 1);
    }
    curve(Math.sin, colors.yellow, TAU, 1.5, 0.18);
    curve(Math.sin, colors.yellow, theta, 3, 1);

    // Angle arc
    ctx.strokeStyle = colors.soft;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.22, 0, -theta, true);
    ctx.stroke();
    text(ctx, 'θ', cx + R * 0.32 * Math.cos(theta / 2), cy - R * 0.32 * Math.sin(theta / 2), { color: colors.soft, size: 13, weight: 600 });

    // Radius, sin and cos segments
    line(ctx, cx, cy, px, py, colors.text, 1.5);
    if (showCos) line(ctx, cx, cy, px, cy, colors.orange, 4);
    line(ctx, px, cy, px, py, colors.yellow, 4);

    // Connector to the wave
    const wx = waveX(theta);
    line(ctx, px, py, wx, py, colors.yellow, 1, [3, 5]);
    if (showCos) dot(ctx, wx, cy - R * c, 5, colors.orange);
    dot(ctx, wx, py, 6, colors.yellow);

    // Moving point
    dot(ctx, px, py, 10, 'rgba(255, 214, 10, 0.25)');
    dot(ctx, px, py, 6, colors.text);

    text(ctx, 'sin θ', x1, cy - R - 22, { align: 'right', color: colors.yellow, weight: 600 });
    if (showCos) text(ctx, 'cos θ', x1 - 52, cy - R - 22, { align: 'right', color: colors.orange, weight: 600 });

    const deg = (theta * 180) / Math.PI;
    out.theta.value = `${deg.toFixed(0)}°`;
    out.sin.value = s.toFixed(3);
    out.cos.value = c.toFixed(3);
    out.id.value = (s * s + c * c).toFixed(3);
  };

  const lesson = runLesson(section, { step, draw });

  // Drag on the circle or along the wave to set θ by hand.
  canvas.addEventListener('pointerdown', (e) => {
    const { R, cx, cy, x0, x1 } = layout();
    const p = canvasPoint(canvas, e);
    if (Math.hypot(p.x - cx, p.y - cy) < R + 30) dragging = 'circle';
    else if (p.x >= x0 && p.x <= x1) dragging = 'wave';
    else return;
    canvas.setPointerCapture(e.pointerId);
    lesson.pause();
    move(e);
  });
  const move = (e) => {
    if (!dragging) return;
    const { cx, cy, x0, waveW } = layout();
    const p = canvasPoint(canvas, e);
    if (dragging === 'circle') theta = (Math.atan2(cy - p.y, p.x - cx) + TAU) % TAU;
    else theta = Math.min(Math.max((p.x - x0) / waveW, 0), 0.9999) * TAU;
    lesson.redraw();
  };
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', () => (dragging = null));
  canvas.addEventListener('pointercancel', () => (dragging = null));
  cosInput.addEventListener('change', lesson.redraw);
  view.onResize = lesson.redraw;
}
