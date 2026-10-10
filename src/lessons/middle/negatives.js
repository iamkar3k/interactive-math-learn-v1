// Middle school: adding and subtracting negative numbers on a number line and thermometer.
import { colors, setupCanvas, runLesson, text, line, dot, ease } from '../../lib/stage.js';

const LIMIT = 10;
const STEP_TIME = 0.35;
const neg = (n) => (n < 0 ? `−${-n}` : String(n));
const wrap = (n) => (n < 0 ? `(${neg(n)})` : String(n));

export const negatives = {
  id: 'negatives',
  title: 'Negative numbers',
  level: 'Middle school · Grades 6–8',
  heading: 'Below zero',
  canvasLabel: 'A marker moving along a number line from −10 to 10, with a thermometer',
  intro: 'Numbers below zero are <b class="c-b">negative</b>. On a number line, adding a positive number moves you <b class="c-a">right</b>. Adding a negative number moves you <b class="c-b">left</b>, the same as subtracting. And subtracting a negative moves you right: two minuses make a plus.',
  tips: [
    'Compare 3 + (−5) with 3 − 5. Do they land in the same place?',
    'Try −2 − (−6). Which way does the marker move?',
    'The thermometer is −4° and it warms up by 7°. What is it now?',
  ],
  formula: 'a − (−b) = a + b',
  controls: `
    <label>Start <input type="range" id="neg-a" min="-10" max="10" step="1" value="3" /></label>
    <div class="seg" role="radiogroup" aria-label="Operation">
      <button data-op="+" role="radio" aria-checked="true" class="on">+</button>
      <button data-op="-" role="radio" aria-checked="false">−</button>
    </div>
    <label>Number <input type="range" id="neg-b" min="-10" max="10" step="1" value="-5" /></label>`,
  readouts: [
    ['neg-sum', 'Number sentence'],
    ['neg-move', 'Moves'],
    ['neg-rule', 'Same as'],
    ['neg-ans', 'Answer', 'c-a'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const aInput = section.querySelector('#neg-a');
    const bInput = section.querySelector('#neg-b');
    const opButtons = [...section.querySelectorAll('[data-op]')];
    const out = ['sum', 'move', 'rule', 'ans'].map((k) => section.querySelector(`#neg-${k}`));
    const view = setupCanvas(canvas);
    let op = '+';
    let t = 0; // seconds into the current move

    const setOp = (value) => {
      op = value;
      opButtons.forEach((b) => {
        b.classList.toggle('on', b.dataset.op === op);
        b.setAttribute('aria-checked', String(b.dataset.op === op));
      });
    };
    const delta = () => (op === '+' ? 1 : -1) * Number(bInput.value);

    // Keep the answer between −10 and 10.
    const fit = () => {
      const a = Number(aInput.value);
      const d = delta();
      if (a + d > LIMIT) bInput.value = (op === '+' ? 1 : -1) * (LIMIT - a);
      if (a + d < -LIMIT) bInput.value = (op === '+' ? 1 : -1) * (-LIMIT - a);
    };

    const newProblem = () => {
      setOp(Math.random() < 0.5 ? '+' : '-');
      aInput.value = Math.floor(Math.random() * 15) - 7;
      let b = 0;
      while (b === 0) b = Math.floor(Math.random() * 17) - 8;
      bInput.value = b;
      fit();
      t = 0;
    };

    const duration = () => Math.max(1, Math.abs(delta())) * STEP_TIME;
    const step = (dt) => {
      t += dt;
      if (t > duration() + 2.4) newProblem();
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const a = Number(aInput.value);
      const b = Number(bInput.value);
      const d = delta();
      const answer = a + d;
      const f = ease(Math.min(1, t / duration()));
      const pos = a + d * f;
      const done = f >= 1;
      ctx.clearRect(0, 0, w, h);

      const showThermo = w >= 480;
      const thermoW = showThermo ? Math.min(90, w * 0.16) : 0;
      const pad = 24;
      const right = w - thermoW - (showThermo ? 16 : 24);
      const X = (v) => pad + ((v + LIMIT) / (2 * LIMIT)) * (right - pad);
      const baseY = h * 0.62;

      // Number line
      ctx.fillStyle = 'rgba(255, 159, 28, 0.08)';
      ctx.fillRect(X(-LIMIT), baseY - 40, X(0) - X(-LIMIT), 80);
      line(ctx, pad - 8, baseY, right + 8, baseY, colors.axis, 2);
      for (let v = -LIMIT; v <= LIMIT; v++) {
        const big = v % 5 === 0;
        line(ctx, X(v), baseY - (big ? 9 : 5), X(v), baseY + (big ? 9 : 5), v === 0 ? colors.text : big ? colors.muted : colors.axis, v === 0 ? 2 : 1);
        if (w > 560 || big || v === a) text(ctx, neg(v), X(v), baseY + 24, { size: 11, color: v < 0 ? colors.orange : v > 0 ? colors.yellow : colors.text });
      }
      text(ctx, 'negative', X(-LIMIT / 2), baseY + 48, { size: 11, color: colors.orange });
      text(ctx, 'positive', X(LIMIT / 2), baseY + 48, { size: 11, color: colors.yellow });

      // Movement arrow
      if (d !== 0) {
        const y = baseY - 30;
        const color = d > 0 ? colors.yellow : colors.orange;
        line(ctx, X(a), y, X(pos), y, color, 3);
        if (Math.abs(X(pos) - X(a)) > 8) {
          const dir = Math.sign(d);
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(X(pos) + dir * 2, y);
          ctx.lineTo(X(pos) - dir * 8, y - 6);
          ctx.lineTo(X(pos) - dir * 8, y + 6);
          ctx.closePath();
          ctx.fill();
        }
        text(ctx, `${d > 0 ? 'right' : 'left'} ${Math.abs(d)}`, (X(a) + X(pos)) / 2, y - 16, { size: 12, color });
      }
      dot(ctx, X(a), baseY, 5, colors.text);
      dot(ctx, X(pos), baseY, 11, 'rgba(255, 214, 10, 0.25)');
      dot(ctx, X(pos), baseY, 7, done ? colors.yellow : colors.text);

      // Thermometer (hidden on narrow screens)
      if (showThermo) {
        const tx = w - thermoW / 2 - 8;
        const top = 30;
        const bottom = h - 46;
        const TY = (v) => bottom - ((v + LIMIT) / (2 * LIMIT)) * (bottom - top);
        ctx.fillStyle = '#1d1d1b';
        ctx.fillRect(tx - 9, top - 6, 18, bottom - top + 12);
        dot(ctx, tx, bottom + 16, 15, '#1d1d1b');
        const fill = pos < 0 ? colors.orange : colors.yellow;
        ctx.fillStyle = fill;
        ctx.fillRect(tx - 5, TY(pos), 10, bottom - TY(pos) + 10);
        dot(ctx, tx, bottom + 16, 11, fill);
        for (const v of [-10, -5, 0, 5, 10]) {
          line(ctx, tx + 10, TY(v), tx + 16, TY(v), colors.axis);
          text(ctx, `${neg(v)}°`, tx + 20, TY(v), { size: 10, align: 'left', color: v === 0 ? colors.text : colors.muted });
        }
      }

      const sentence = `${neg(a)} ${op === '+' ? '+' : '−'} ${wrap(b)}`;
      text(ctx, `${sentence} = ${done ? neg(answer) : '?'}`, (pad + right) / 2, 30, { color: colors.text, size: 24, weight: 700, mono: true });
      const rule = op === '+' ? (b < 0 ? 'Adding a negative moves left' : 'Adding a positive moves right') : b < 0 ? 'Subtracting a negative moves right' : 'Subtracting a positive moves left';
      text(ctx, rule, (pad + right) / 2, 58, { size: 13, color: d >= 0 ? colors.yellow : colors.orange, weight: 600 });

      out[0].value = sentence;
      out[1].value = d === 0 ? 'stays' : `${d > 0 ? 'right' : 'left'} ${Math.abs(d)}`;
      out[2].value = `${neg(a)} ${d >= 0 ? '+' : '−'} ${Math.abs(d)}`;
      out[3].value = done ? neg(answer) : '?';
    };

    const lesson = runLesson(section, { step, draw });
    const manual = () => {
      fit();
      t = lesson.playing ? 0 : duration();
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
