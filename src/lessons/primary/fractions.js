// Primary: fractions as slices of a pizza, parts of a bar and a point on 0–1.
import { colors, TAU, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

export const fractions = {
  id: 'fractions',
  title: 'Fractions',
  level: 'Primary · Grades 1–5',
  heading: 'Parts of a whole',
  canvasLabel: 'A pizza and a bar split into equal parts with some shaded',
  intro: 'A fraction tells you how many <b class="c-a">equal parts</b> you have out of the whole. The bottom number (the <b>denominator</b>) says how many parts the whole is cut into. The top number (the <b>numerator</b>) says how many of those parts are shaded.',
  tips: [
    'Make 1/2, then 2/4, then 4/8. What do you notice about the shaded part?',
    'Which is bigger: 1/3 or 1/4? Check the pizza.',
    'When the top and bottom numbers are the same, how much is shaded?',
  ],
  formula: 'fraction = shaded parts ÷ equal parts',
  controls: `
    <label>Shaded parts <input type="range" id="frac-n" min="0" max="4" step="1" value="1" /></label>
    <label>Equal parts <input type="range" id="frac-d" min="1" max="12" step="1" value="4" /></label>`,
  readouts: [
    ['frac-f', 'Fraction', 'c-a'],
    ['frac-s', 'Simplest form'],
    ['frac-dec', 'Decimal'],
    ['frac-pct', 'Percent'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const nInput = section.querySelector('#frac-n');
    const dInput = section.querySelector('#frac-d');
    const out = ['f', 's', 'dec', 'pct'].map((k) => section.querySelector(`#frac-${k}`));
    const view = setupCanvas(canvas);
    const sequence = [2, 3, 4, 6, 8];
    let timer = 0;

    const syncMax = () => {
      nInput.max = dInput.value;
      if (Number(nInput.value) > Number(dInput.value)) nInput.value = dInput.value;
    };

    // Fill one slice at a time, pause on the whole, then move to the next denominator.
    const step = (dt) => {
      timer += dt;
      const n = Number(nInput.value);
      const d = Number(dInput.value);
      if (n < d && timer > 0.6) {
        nInput.value = n + 1;
        timer = 0;
      } else if (n >= d && timer > 1.4) {
        const i = sequence.indexOf(d);
        dInput.value = sequence[(i + 1) % sequence.length];
        syncMax();
        nInput.value = 0;
        timer = 0;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const n = Number(nInput.value);
      const d = Number(dInput.value);
      ctx.clearRect(0, 0, w, h);

      // Pizza
      const R = Math.min(h * 0.36, w * 0.2);
      const px = R + Math.max(24, w * 0.06);
      const py = h / 2 + 6;
      dot(ctx, px, py, R + 6, '#3b2f12');
      for (let i = 0; i < d; i++) {
        const a0 = -Math.PI / 2 + (i / d) * TAU;
        const a1 = -Math.PI / 2 + ((i + 1) / d) * TAU;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, R, a0, a1);
        ctx.closePath();
        ctx.fillStyle = i < n ? colors.yellow : '#2a2a26';
        ctx.fill();
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      text(ctx, 'Pizza', px, py + R + 22, { size: 12 });

      // Bar and number line
      const bx = px + R + Math.max(36, w * 0.07);
      const bw = w - bx - Math.max(20, w * 0.04);
      const bh = Math.min(56, h * 0.16);
      const by = h * 0.3;
      for (let i = 0; i < d; i++) {
        const x = bx + (i / d) * bw;
        ctx.fillStyle = i < n ? colors.orange : '#2a2a26';
        ctx.fillRect(x, by, bw / d, bh);
        ctx.strokeStyle = colors.bg;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, by, bw / d, bh);
      }

      const ly = by + bh + 64;
      line(ctx, bx, ly, bx + bw, ly, colors.axis, 2);
      for (let i = 0; i <= d; i++) {
        const x = bx + (i / d) * bw;
        line(ctx, x, ly - 6, x, ly + 6, colors.axis);
        if (d <= 8 || i === 0 || i === d) {
          text(ctx, i === 0 ? '0' : i === d ? '1' : `${i}/${d}`, x, ly + 20, { size: 11 });
        }
      }
      const mx = bx + (n / d) * bw;
      dot(ctx, mx, ly, 7, colors.yellow);
      text(ctx, 'Number line', bx, ly - 22, { size: 12, align: 'left' });

      // Big fraction above the bar
      text(ctx, `${n} / ${d}`, bx + bw / 2, by - 30, { color: colors.text, size: 26, weight: 700, mono: true });

      const g = gcd(n, d) || 1;
      out[0].value = `${n}/${d}`;
      out[1].value = n === 0 ? '0' : n === d ? '1 (a whole)' : `${n / g}/${d / g}`;
      out[2].value = (n / d).toFixed(3).replace(/\.?0+$/, '') || '0';
      out[3].value = `${Math.round((n / d) * 1000) / 10}%`;
    };

    const lesson = runLesson(section, { step, draw });
    const manual = () => {
      lesson.pause();
      syncMax();
      lesson.redraw();
    };
    nInput.addEventListener('input', manual);
    dInput.addEventListener('input', manual);
    syncMax();
    view.onResize = lesson.redraw;
  },
};
