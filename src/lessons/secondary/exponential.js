// High school: repeated adding (linear) versus repeated multiplying (exponential).
import { colors, setupCanvas, runLesson, text, line } from '../../lib/stage.js';

const STEPS = 12;
const big = (v) => (v >= 1e6 ? v.toExponential(2) : Math.round(v).toLocaleString());

export const exponential = {
  id: 'exponential',
  title: 'Exponential growth',
  level: 'High school · Grades 9–12',
  heading: 'Adding vs multiplying',
  canvasLabel: 'Bar chart comparing linear growth with exponential growth step by step',
  intro: 'Start with 1. <b class="c-b">Linear</b> growth adds the same amount every step. <b class="c-a">Exponential</b> growth multiplies by the same amount every step. At first, adding wins. But multiplying always catches up and then rockets past, which is why savings with interest, populations and viral videos grow so fast.',
  tips: [
    'Press play. At which step does multiplying overtake adding?',
    'Make the amount you add bigger. Does multiplying still win in the end?',
    'Try multiplying by 1.5. How much longer does it take to catch up?',
  ],
  formula: 'linear: 1 + d·n   ·   exponential: rⁿ',
  controls: `
    <label>Add each step <input type="range" id="ex-d" min="1" max="50" step="1" value="10" /></label>
    <label>Multiply by <input type="range" id="ex-r" min="1.5" max="3" step="0.5" value="2" /></label>
    <label>Step <input type="range" id="ex-n" min="0" max="12" step="1" value="0" /></label>`,
  readouts: [
    ['ex-step', 'Step'],
    ['ex-lin', 'Adding', 'c-b'],
    ['ex-exp', 'Multiplying', 'c-a'],
    ['ex-cross', 'Overtakes at'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const [dInput, rInput, nInput] = ['d', 'r', 'n'].map((k) => section.querySelector(`#ex-${k}`));
    const out = ['step', 'lin', 'exp', 'cross'].map((k) => section.querySelector(`#ex-${k}`));
    const view = setupCanvas(canvas);
    let timer = 0;

    const step = (dt) => {
      timer += dt;
      const n = Number(nInput.value);
      if (timer > (n === STEPS ? 2.2 : 0.8)) {
        nInput.value = n === STEPS ? 0 : n + 1;
        timer = 0;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const d = Number(dInput.value);
      const r = Number(rInput.value);
      const n = Number(nInput.value);
      const lin = (k) => 1 + d * k;
      const exp = (k) => r ** k;
      let cross = null;
      for (let k = 1; k <= 60 && cross === null; k++) if (exp(k) > lin(k)) cross = k;
      ctx.clearRect(0, 0, w, h);

      const pad = { l: 50, r: 16, t: 50, b: 30 };
      const maxV = Math.max(lin(n), exp(n), 10) * 1.1;
      const Y = (v) => h - pad.b - (v / maxV) * (h - pad.t - pad.b);
      const slot = (w - pad.l - pad.r) / (STEPS + 1);
      for (let k = 0; k <= 4; k++) {
        const v = (maxV * k) / 4;
        line(ctx, pad.l, Y(v), w - pad.r, Y(v), colors.grid);
        text(ctx, big(v), pad.l - 8, Y(v), { size: 10, align: 'right' });
      }
      for (let k = 0; k <= STEPS; k++) {
        const x = pad.l + k * slot;
        text(ctx, String(k), x + slot / 2, h - pad.b + 14, { size: 10, color: k === cross ? colors.yellow : colors.muted });
        if (k > n) continue;
        const bw = slot * 0.36;
        ctx.fillStyle = colors.orange;
        ctx.fillRect(x + slot * 0.12, Y(lin(k)), bw, h - pad.b - Y(lin(k)));
        ctx.fillStyle = colors.yellow;
        ctx.fillRect(x + slot * 0.12 + bw, Y(exp(k)), bw, h - pad.b - Y(exp(k)));
      }
      text(ctx, `adding ${d}: ${big(lin(n))}`, pad.l, 18, { align: 'left', color: colors.orange, size: 14, weight: 600 });
      text(ctx, `multiplying by ${r}: ${big(exp(n))}`, pad.l, 38, { align: 'left', color: colors.yellow, size: 14, weight: 600 });
      if (cross !== null && n >= cross) text(ctx, 'Multiplying is ahead!', w - pad.r, 18, { align: 'right', color: colors.text, size: 14, weight: 700 });

      out[0].value = n;
      out[1].value = `1 + ${d} × ${n} = ${big(lin(n))}`;
      out[2].value = `${r}^${n} = ${big(exp(n))}`;
      out[3].value = cross === null ? 'not within 60 steps' : `step ${cross}`;
    };

    const lesson = runLesson(section, { step, draw });
    dInput.addEventListener('input', lesson.redraw);
    rInput.addEventListener('input', lesson.redraw);
    nInput.addEventListener('input', () => {
      lesson.pause();
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};
