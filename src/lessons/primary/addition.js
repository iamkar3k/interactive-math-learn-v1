// Primary: addition and subtraction as hops along a number line.
import { colors, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';

const MAX = 20;
const HOP_TIME = 0.55;

export const addition = {
  id: 'addition',
  title: 'Addition & subtraction',
  level: 'Primary · Grades 1–5',
  heading: 'Hop along the number line',
  canvasLabel: 'A frog hopping along a number line to add or subtract',
  intro: 'Adding means hopping <b class="c-a">to the right</b> on the number line. Subtracting means hopping <b class="c-b">to the left</b>. Count the hops and see where you land. That number is the answer.',
  tips: [
    'Press play and count the hops out loud.',
    'Try 8 + 5 and then 5 + 8. Do you land in the same place?',
    'Take away: start at 12 and hop back 4. Where do you land?',
  ],
  formula: 'start ± hops = answer',
  controls: `
    <label>Start <input type="range" id="add-a" min="0" max="20" step="1" value="7" /></label>
    <label>Hops <input type="range" id="add-b" min="0" max="10" step="1" value="5" /></label>
    <div class="seg" role="radiogroup" aria-label="Operation">
      <button data-op="+" role="radio" aria-checked="true" class="on">+ Add</button>
      <button data-op="-" role="radio" aria-checked="false">− Take away</button>
    </div>`,
  readouts: [
    ['add-start', 'Start'],
    ['add-hops', 'Hops'],
    ['add-sum', 'Number sentence'],
    ['add-ans', 'Answer', 'c-a'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const aInput = section.querySelector('#add-a');
    const bInput = section.querySelector('#add-b');
    const opButtons = [...section.querySelectorAll('[data-op]')];
    const out = ['start', 'hops', 'sum', 'ans'].map((k) => section.querySelector(`#add-${k}`));
    const view = setupCanvas(canvas);
    let op = '+';
    let t = 0; // hops completed (fractional while hopping)

    const setOp = (value) => {
      op = value;
      opButtons.forEach((b) => {
        b.classList.toggle('on', b.dataset.op === op);
        b.setAttribute('aria-checked', String(b.dataset.op === op));
      });
    };

    // Keep the answer on the 0–20 line.
    const fit = () => {
      const a = Number(aInput.value);
      const maxB = op === '+' ? MAX - a : a;
      if (Number(bInput.value) > maxB) bInput.value = Math.min(maxB, 10);
    };

    const newProblem = () => {
      setOp(Math.random() < 0.5 ? '+' : '-');
      const a = op === '+' ? Math.floor(Math.random() * 13) : 5 + Math.floor(Math.random() * 16);
      aInput.value = a;
      bInput.value = 1 + Math.floor(Math.random() * Math.min(9, op === '+' ? MAX - a : a));
      fit();
      t = 0;
    };

    const step = (dt) => {
      t += dt / HOP_TIME;
      if (t > Number(bInput.value) + 2.5) newProblem();
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const a = Number(aInput.value);
      const b = Number(bInput.value);
      const dir = op === '+' ? 1 : -1;
      const answer = a + dir * b;
      const done = t >= b;
      const pad = 26;
      const X = (v) => pad + (v / MAX) * (w - 2 * pad);
      const baseY = h * 0.72;
      const hopH = Math.min(70, h * 0.28);
      const hopColor = op === '+' ? colors.yellow : colors.orange;

      ctx.clearRect(0, 0, w, h);

      // Number line
      line(ctx, pad - 10, baseY, w - pad + 10, baseY, colors.axis, 2);
      for (let v = 0; v <= MAX; v++) {
        const big = v % 5 === 0;
        line(ctx, X(v), baseY - (big ? 9 : 5), X(v), baseY + (big ? 9 : 5), big ? colors.muted : colors.axis, big ? 2 : 1);
        text(ctx, String(v), X(v), baseY + 24, { size: w < 500 ? 10 : 12, color: v === a ? colors.text : colors.muted, weight: v === a ? 700 : 500 });
      }

      // Hops so far
      const whole = Math.min(Math.floor(t), b);
      for (let i = 0; i < whole; i++) {
        const x1 = X(a + dir * i);
        const x2 = X(a + dir * (i + 1));
        ctx.strokeStyle = hopColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, baseY);
        ctx.quadraticCurveTo((x1 + x2) / 2, baseY - hopH * 1.3, x2, baseY);
        ctx.stroke();
        if (Math.abs(x2 - x1) > 18) text(ctx, op === '+' ? '+1' : '−1', (x1 + x2) / 2, baseY - hopH * 0.8, { size: 10, color: hopColor });
      }

      // Frog position
      let fx;
      let fy = baseY;
      if (done || b === 0) {
        fx = X(answer);
      } else {
        const k = Math.floor(t);
        const f = t - k;
        fx = X(a + dir * (k + f));
        fy = baseY - Math.sin(Math.PI * f) * hopH;
      }
      dot(ctx, X(a), baseY, 5, colors.text);
      if (done) {
        dot(ctx, X(answer), baseY, 14, 'rgba(255, 214, 10, 0.25)');
        dot(ctx, X(answer), baseY, 6, hopColor);
      }
      frog(ctx, fx, fy - 12, dir);

      const sign = op === '+' ? '+' : '−';
      text(ctx, `${a} ${sign} ${b} = ${done ? answer : '?'}`, w / 2, 34, { color: colors.text, size: 28, weight: 700, mono: true });
      text(ctx, `Hops counted: ${Math.min(Math.floor(t), b)}`, w / 2, 64, { size: 13, color: colors.muted });

      out[0].value = a;
      out[1].value = b;
      out[2].value = `${a} ${sign} ${b}`;
      out[3].value = done ? answer : '?';
    };

    const lesson = runLesson(section, { step, draw });
    // While playing, replay the hops; while paused, show the finished jump.
    const manual = () => {
      fit();
      t = lesson.playing ? 0 : Number(bInput.value);
      lesson.redraw();
    };
    aInput.addEventListener('input', manual);
    bInput.addEventListener('input', manual);
    opButtons.forEach((btn) => btn.addEventListener('click', () => {
      setOp(btn.dataset.op);
      manual();
    }));
    view.onResize = lesson.redraw;
  },
};

function frog(ctx, x, y, dir) {
  ctx.fillStyle = '#7bd389';
  ctx.beginPath();
  ctx.ellipse(x, y, 14, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const ex of [-6, 6]) {
    dot(ctx, x + ex + dir * 2, y - 9, 4.5, '#7bd389');
    dot(ctx, x + ex + dir * 3, y - 10, 2, '#0a0a0a');
  }
}
