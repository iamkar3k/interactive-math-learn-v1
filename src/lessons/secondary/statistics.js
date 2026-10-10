// High school: mean, median, mode and range on a dot plot.
import { colors, setupCanvas, runLesson, text, line, dot, canvasPoint, clamp } from '../../lib/stage.js';

const MAX = 20;
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

function stats(values) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  const mean = s.reduce((t, v) => t + v, 0) / n;
  const median = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const counts = {};
  s.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
  const top = Math.max(...Object.values(counts));
  const modes = top > 1 ? Object.keys(counts).filter((k) => counts[k] === top).map(Number) : [];
  return { mean, median, modes, range: s[n - 1] - s[0], min: s[0], max: s[n - 1] };
}

export const statistics = {
  id: 'statistics',
  title: 'Statistics & data',
  level: 'High school · Grades 9–12',
  heading: 'Where is the middle?',
  canvasLabel: 'A dot plot of data with the mean and median marked',
  intro: 'There is more than one way to find the "middle" of a data set. The <b class="c-a">mean</b> is the balance point: add everything up and share it out equally. The <b class="c-b">median</b> is the middle value when the data is in order. Drag a dot far to one side and see which one moves more.',
  tips: [
    'Press "Add outlier". Which moves more, the mean or the median?',
    'Drag dots so the mean and median are equal. What does the data look like?',
    'Can the mean be a value nobody actually scored?',
  ],
  formula: 'mean = sum ÷ count   ·   range = max − min',
  controls: `
    <button type="button" class="btn-small" id="st-add">Add point</button>
    <button type="button" class="btn-small" id="st-remove">Remove point</button>
    <button type="button" class="btn-small" id="st-outlier">Add outlier</button>`,
  readouts: [
    ['st-mean', 'Mean', 'c-a'],
    ['st-median', 'Median', 'c-b'],
    ['st-mode', 'Mode'],
    ['st-range', 'Range'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const out = ['mean', 'median', 'mode', 'range'].map((k) => section.querySelector(`#st-${k}`));
    const view = setupCanvas(canvas);
    let values = [4, 6, 7, 7, 8, 9, 10, 12];
    let timer = 0;
    let moved = -1;
    let drag = -1;

    const layout = () => {
      const pad = 30;
      return { pad, X: (v) => pad + (v / MAX) * (view.w - 2 * pad), base: view.h - 60, gap: Math.min(18, (view.h - 150) / 8) };
    };

    // Positions of each dot, stacking equal values.
    const positions = () => {
      const { X, base, gap } = layout();
      const seen = {};
      return values.map((v) => {
        seen[v] = (seen[v] || 0) + 1;
        return [X(v), base - 12 - (seen[v] - 1) * gap];
      });
    };

    const step = (dt) => {
      timer += dt;
      if (timer < 1.6) return;
      timer = 0;
      moved = Math.floor(Math.random() * values.length);
      values[moved] = clamp(Math.round(values[moved] + (Math.random() - 0.5) * 8), 0, MAX);
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { X, base } = layout();
      const s = stats(values);
      ctx.clearRect(0, 0, w, h);

      line(ctx, X(0), base, X(MAX), base, colors.axis, 2);
      for (let v = 0; v <= MAX; v++) {
        line(ctx, X(v), base, X(v), base + (v % 5 ? 4 : 8), colors.axis);
        if (v % 5 === 0 || w > 520) text(ctx, String(v), X(v), base + 18, { size: 10 });
      }

      // Range bar
      const ry = base + 36;
      line(ctx, X(s.min), ry, X(s.max), ry, colors.muted, 2);
      line(ctx, X(s.min), ry - 5, X(s.min), ry + 5, colors.muted, 2);
      line(ctx, X(s.max), ry - 5, X(s.max), ry + 5, colors.muted, 2);
      text(ctx, `range ${fmt(s.range)}`, (X(s.min) + X(s.max)) / 2, ry + 12, { size: 11 });

      positions().forEach(([x, y], i) => {
        dot(ctx, x, y, 7, i === moved || i === drag ? colors.text : 'rgba(245, 245, 239, 0.75)');
      });

      // Mean as a balance point, median as a line
      const mx = X(s.mean);
      ctx.fillStyle = colors.yellow;
      ctx.beginPath();
      ctx.moveTo(mx, base + 2);
      ctx.lineTo(mx - 9, base + 16);
      ctx.lineTo(mx + 9, base + 16);
      ctx.closePath();
      ctx.fill();
      line(ctx, mx, 34, mx, base, colors.yellow, 2, [5, 4]);
      line(ctx, X(s.median), 54, X(s.median), base, colors.orange, 2);
      text(ctx, `mean ${fmt(s.mean)}`, mx, 22, { color: colors.yellow, size: 12, weight: 600 });
      text(ctx, `median ${fmt(s.median)}`, X(s.median), 44, { color: colors.orange, size: 12, weight: 600 });
      if (w >= 480) text(ctx, `${values.length} values · drag a dot`, 16, h - 12, { align: 'left', size: 11 });

      out[0].value = fmt(s.mean);
      out[1].value = fmt(s.median);
      out[2].value = s.modes.length ? s.modes.join(', ') : 'none';
      out[3].value = `${s.max} − ${s.min} = ${s.range}`;
    };

    const lesson = runLesson(section, { step, draw });
    const change = (fn) => () => {
      lesson.pause();
      fn();
      moved = values.length - 1;
      lesson.redraw();
    };
    section.querySelector('#st-add').addEventListener('click', change(() => values.length < 24 && values.push(3 + Math.floor(Math.random() * 12))));
    section.querySelector('#st-remove').addEventListener('click', change(() => values.length > 2 && values.pop()));
    section.querySelector('#st-outlier').addEventListener('click', change(() => values.length < 24 && values.push(MAX)));

    canvas.addEventListener('pointerdown', (e) => {
      const p = canvasPoint(canvas, e);
      drag = positions().findIndex(([x, y]) => Math.hypot(p.x - x, p.y - y) < 12);
      if (drag < 0) return;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (drag < 0) return;
      const { pad } = layout();
      const v = Math.round(((canvasPoint(canvas, e).x - pad) / (view.w - 2 * pad)) * MAX);
      values[drag] = clamp(v, 0, MAX);
      moved = drag;
      lesson.redraw();
    });
    const end = () => {
      drag = -1;
      lesson.redraw();
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    view.onResize = lesson.redraw;
  },
};
