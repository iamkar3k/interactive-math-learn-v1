// Middle school: ratios as paint recipes that scale in proportion.
import { colors, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';

const MAX_K = 6;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const ratios = {
  id: 'ratios',
  title: 'Ratios & proportions',
  level: 'Middle school · Grades 6–8',
  heading: 'Keep the recipe the same',
  canvasLabel: 'Batches of yellow and orange paint cups and a graph of the totals',
  intro: 'A ratio compares two amounts. A paint recipe of <b class="c-a">2 yellow</b> to <b class="c-b">3 orange</b> is written 2 : 3. Make more batches and both amounts grow together, so the colour stays the same. On the graph, every batch lands on the same straight line through zero. That is what <b>proportional</b> means.',
  tips: [
    'Press play and watch the totals as batches are added.',
    'With 2 : 3, how much orange do you need for 10 yellow?',
    'Try 2 : 4 and 1 : 2. Why do their graphs make the same line?',
  ],
  formula: 'a : b = (k × a) : (k × b)',
  controls: `
    <label>Yellow <input type="range" id="rat-a" min="1" max="5" step="1" value="2" /></label>
    <label>Orange <input type="range" id="rat-b" min="1" max="5" step="1" value="3" /></label>
    <label>Batches <input type="range" id="rat-k" min="1" max="6" step="1" value="1" /></label>`,
  readouts: [
    ['rat-r', 'Recipe'],
    ['rat-y', 'Yellow cups', 'c-a'],
    ['rat-o', 'Orange cups', 'c-b'],
    ['rat-s', 'Simplest ratio'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const [aInput, bInput, kInput] = ['a', 'b', 'k'].map((k) => section.querySelector(`#rat-${k}`));
    const out = ['r', 'y', 'o', 's'].map((k) => section.querySelector(`#rat-${k}`));
    const view = setupCanvas(canvas);
    let timer = 0;

    const step = (dt) => {
      timer += dt;
      const k = Number(kInput.value);
      if (timer > (k === MAX_K ? 2 : 0.9)) {
        kInput.value = k === MAX_K ? 1 : k + 1;
        timer = 0;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const a = Number(aInput.value);
      const b = Number(bInput.value);
      const k = Number(kInput.value);
      ctx.clearRect(0, 0, w, h);

      // Batches of cups
      const leftW = w * 0.5;
      const rowH = (h - 50) / MAX_K;
      const r = Math.min(rowH * 0.36, (leftW - 70) / ((a + b) * 2.3 + 1.5));
      text(ctx, 'Batches', 16, 18, { align: 'left', size: 12 });
      for (let row = 0; row < k; row++) {
        const y = 40 + row * rowH + rowH / 2;
        text(ctx, `${row + 1}`, 22, y, { size: 12, color: colors.muted });
        for (let i = 0; i < a + b; i++) {
          const x = 44 + r + i * r * 2.3 + (i >= a ? r * 1.2 : 0);
          dot(ctx, x, y, r, i < a ? colors.yellow : colors.orange);
        }
      }

      // Graph of totals
      const gx = leftW + 30;
      const gw = w - gx - 20;
      const gy = h - 34;
      const gh = h - 64;
      const maxV = 5 * MAX_K;
      const X = (v) => gx + (v / maxV) * gw;
      const Y = (v) => gy - (v / maxV) * gh;
      for (let v = 0; v <= maxV; v += 5) {
        line(ctx, X(v), gy, X(v), Y(maxV), colors.grid);
        line(ctx, gx, Y(v), X(maxV), Y(v), colors.grid);
        text(ctx, String(v), X(v), gy + 14, { size: 10 });
        if (v) text(ctx, String(v), gx - 10, Y(v), { size: 10, align: 'right' });
      }
      line(ctx, gx, gy, X(maxV), gy, colors.axis, 1.5);
      line(ctx, gx, gy, gx, Y(maxV), colors.axis, 1.5);
      text(ctx, 'yellow →', X(maxV), gy - 10, { size: 11, align: 'right', color: colors.yellow });
      text(ctx, 'orange ↑', gx + 6, Y(maxV) + 4, { size: 11, align: 'left', color: colors.orange });
      const end = Math.min(maxV / a, maxV / b);
      line(ctx, X(0), Y(0), X(a * end), Y(b * end), 'rgba(255, 243, 176, 0.4)', 1.5, [5, 5]);
      for (let i = 1; i <= k; i++) dot(ctx, X(a * i), Y(b * i), i === k ? 7 : 5, i === k ? colors.text : colors.yellow);
      text(ctx, `(${a * k}, ${b * k})`, X(a * k) + 10, Y(b * k) - 12, { size: 12, align: 'left', color: colors.text, weight: 600 });

      const g = gcd(a, b);
      out[0].value = `${a} : ${b}`;
      out[1].value = a * k;
      out[2].value = b * k;
      out[3].value = `${a * k} : ${b * k} = ${a / g} : ${b / g}`;
    };

    const lesson = runLesson(section, { step, draw });
    for (const input of [aInput, bInput]) input.addEventListener('input', lesson.redraw);
    kInput.addEventListener('input', () => {
      lesson.pause();
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};
