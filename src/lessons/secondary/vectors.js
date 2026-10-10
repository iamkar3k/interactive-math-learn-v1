// High school: adding, subtracting and scaling vectors.
import { colors, setupCanvas, runLesson, text, dot, canvasPoint, ease, clamp } from '../../lib/stage.js';
import { drawGrid, num } from './graph.js';

const MODES = { add: 'a + b', sub: 'a − b', scale: 'k × a' };

export const vectors = {
  id: 'vectors',
  title: 'Vectors',
  level: 'High school · Grades 9–12',
  heading: 'Arrows that add up',
  canvasLabel: 'Two vectors on a grid combined tip to tail',
  intro: 'A vector has a <b>size</b> and a <b>direction</b>, drawn as an arrow. To add <b class="c-a">a</b> and <b class="c-b">b</b>, slide b so it starts where a ends (tip to tail). The result goes from the start of a to the end of b. To subtract, add the arrow pointing the other way. Multiplying by a number k stretches the arrow.',
  tips: [
    'Drag the arrow tips to change a and b.',
    'Is a + b the same as b + a? Look at the parallelogram.',
    'Try k × a with a negative k. Which way does the arrow point?',
  ],
  formula: '(a₁, a₂) + (b₁, b₂) = (a₁ + b₁, a₂ + b₂)',
  controls: `
    <div class="seg" role="radiogroup" aria-label="Operation">
      ${Object.entries(MODES).map(([k, v], i) => `<button data-mode="${k}" role="radio" aria-checked="${i === 0}" class="${i === 0 ? 'on' : ''}">${v}</button>`).join('')}
    </div>
    <label>k <input type="range" id="vec-k" min="-3" max="3" step="0.5" value="2" /></label>`,
  readouts: [
    ['vec-a', 'a', 'c-a'],
    ['vec-b', 'b', 'c-b'],
    ['vec-r', 'Result'],
    ['vec-len', 'Length of result'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const kInput = section.querySelector('#vec-k');
    const modeButtons = [...section.querySelectorAll('[data-mode]')];
    const out = ['a', 'b', 'r', 'len'].map((k) => section.querySelector(`#vec-${k}`));
    const view = setupCanvas(canvas);
    const a = [4, 1];
    const b = [1, 3];
    let mode = 'add';
    let clock = 99;
    let grid = null;
    let drag = null;

    const step = (dt) => {
      clock += dt;
      if (clock > 4.5) clock = 0;
    };

    const arrow = (ctx, from, to, color, width = 3, dash = []) => {
      const [x1, y1] = [grid.X(from[0]), grid.Y(from[1])];
      const [x2, y2] = [grid.X(to[0]), grid.Y(to[1])];
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (len < 2) return;
      const ux = (x2 - x1) / len;
      const uy = (y2 - y1) / len;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2 - ux * 8, y2 - uy * 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ux * 12 - uy * 6, y2 - uy * 12 + ux * 6);
      ctx.lineTo(x2 - ux * 12 + uy * 6, y2 - uy * 12 - ux * 6);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const k = Number(kInput.value);
      ctx.clearRect(0, 0, w, h);
      grid = drawGrid(ctx, w, h, { xMax: 10, yMax: 7 });
      const O = [0, 0];
      const slide = ease(clamp(clock / 1.2, 0, 1));
      const reveal = clamp((clock - 1.4) / 0.8, 0, 1);

      let result;
      if (mode === 'scale') {
        result = [k * a[0], k * a[1]];
        const shown = [a[0] + (result[0] - a[0]) * slide, a[1] + (result[1] - a[1]) * slide];
        arrow(ctx, O, shown, colors.text, 5);
        arrow(ctx, O, a, colors.yellow, 3);
      } else {
        const sb = mode === 'add' ? b : [-b[0], -b[1]];
        result = [a[0] + sb[0], a[1] + sb[1]];
        if (mode === 'add') {
          // Parallelogram: the other route b then a.
          arrow(ctx, b, result, 'rgba(255, 214, 10, 0.3)', 2, [5, 5]);
        }
        arrow(ctx, O, a, colors.yellow);
        arrow(ctx, O, b, mode === 'add' ? colors.orange : 'rgba(255, 159, 28, 0.4)');
        const start = [a[0] * slide, a[1] * slide];
        arrow(ctx, start, [start[0] + sb[0], start[1] + sb[1]], colors.orange, 3, mode === 'sub' ? [6, 4] : []);
        if (reveal > 0) {
          ctx.globalAlpha = reveal;
          arrow(ctx, O, result, colors.text, 4);
          ctx.globalAlpha = 1;
        }
      }
      dot(ctx, grid.X(a[0]), grid.Y(a[1]), 7, colors.yellow);
      if (mode !== 'scale') dot(ctx, grid.X(b[0]), grid.Y(b[1]), 7, colors.orange);
      text(ctx, 'a', grid.X(a[0] / 2) - 10, grid.Y(a[1] / 2) - 10, { color: colors.yellow, size: 15, weight: 700 });
      if (mode !== 'scale') text(ctx, 'b', grid.X(b[0] / 2) - 10, grid.Y(b[1] / 2) - 10, { color: colors.orange, size: 15, weight: 700 });

      const v = (p) => `(${num(p[0])}, ${num(p[1])})`;
      const label = mode === 'scale' ? `${num(k)} × a = ${v(result)}` : `a ${mode === 'add' ? '+' : '−'} b = ${v(result)}`;
      text(ctx, label, 16, 20, { align: 'left', color: colors.text, size: 17, weight: 700, mono: true });
      text(ctx, 'Drag the arrow tips', w - 16, h - 14, { align: 'right', size: 12 });

      out[0].value = v(a);
      out[1].value = mode === 'scale' ? `k = ${num(k)}` : v(b);
      out[2].value = v(result);
      out[3].value = num(Math.hypot(...result));
    };

    const lesson = runLesson(section, { step, draw });
    modeButtons.forEach((btn) => btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      modeButtons.forEach((x) => {
        x.classList.toggle('on', x === btn);
        x.setAttribute('aria-checked', String(x === btn));
      });
      clock = 0;
      lesson.redraw();
    }));
    kInput.addEventListener('input', () => {
      clock = 99;
      lesson.redraw();
    });

    canvas.addEventListener('pointerdown', (e) => {
      if (!grid) return;
      const p = canvasPoint(canvas, e);
      const near = (v) => Math.hypot(p.x - grid.X(v[0]), p.y - grid.Y(v[1])) < 22;
      drag = near(a) ? a : mode !== 'scale' && near(b) ? b : null;
      if (!drag) return;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
      clock = 99;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = canvasPoint(canvas, e);
      drag[0] = clamp(Math.round(grid.toX(p.x)), -9, 9);
      drag[1] = clamp(Math.round(grid.toY(p.y)), -6, 6);
      lesson.redraw();
    });
    canvas.addEventListener('pointerup', () => (drag = null));
    canvas.addEventListener('pointercancel', () => (drag = null));
    view.onResize = lesson.redraw;
  },
};
