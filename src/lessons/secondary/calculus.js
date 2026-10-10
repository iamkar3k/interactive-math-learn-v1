// Lesson 2: Riemann sums converge to the exact area under a curve.
import { colors, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';

const CURVES = {
  sq: { f: (x) => x * x, a: 0, b: 2, exact: 8 / 3, yMin: 0, yMax: 4.2, label: 'f(x) = x²', ticks: [0, 1, 2] },
  sin: { f: Math.sin, a: 0, b: Math.PI, exact: 2, yMin: 0, yMax: 1.15, label: 'f(x) = sin x', ticks: [0, Math.PI / 2, Math.PI], tickLabels: ['0', 'π/2', 'π'] },
  cub: { f: (x) => x ** 3 - 3 * x ** 2 + 3, a: 0, b: 3, exact: 2.25, yMin: -1.4, yMax: 3.4, label: 'f(x) = x³ − 3x² + 3', ticks: [0, 1, 2, 3] },
};
const SAMPLE = { left: 0, mid: 0.5, right: 1 };
const MAX_N = 100;

export function initCalculus(section) {
  const canvas = section.querySelector('canvas');
  const nInput = section.querySelector('#calc-n');
  const fnInput = section.querySelector('#calc-fn');
  const methodButtons = [...section.querySelectorAll('[data-method]')];
  const out = {
    n: section.querySelector('#calc-nv'),
    sum: section.querySelector('#calc-sum'),
    exact: section.querySelector('#calc-exact'),
    err: section.querySelector('#calc-err'),
  };
  const view = setupCanvas(canvas);
  let method = 'mid';
  let logN = Math.log(Number(nInput.value));
  let hold = 0;

  // Grow n on a log scale so the early steps (1, 2, 3...) are easy to follow,
  // then hold at the maximum and start again.
  const step = (dt) => {
    if (hold > 0) {
      hold -= dt;
      if (hold <= 0) logN = 0;
    } else {
      logN += dt * 0.55;
      if (logN >= Math.log(MAX_N)) {
        logN = Math.log(MAX_N);
        hold = 1.6;
      }
    }
    nInput.value = Math.round(Math.exp(logN));
  };

  const draw = () => {
    const { ctx, w, h } = view;
    const curve = CURVES[fnInput.value];
    const n = Number(nInput.value);
    const pad = { l: 44, r: 20, t: 34, b: 34 };
    const X = (x) => pad.l + ((x - curve.a) / (curve.b - curve.a)) * (w - pad.l - pad.r);
    const Y = (y) => pad.t + ((curve.yMax - y) / (curve.yMax - curve.yMin)) * (h - pad.t - pad.b);

    ctx.clearRect(0, 0, w, h);

    // Grid and axes
    for (let y = Math.ceil(curve.yMin); y <= curve.yMax; y++) {
      line(ctx, pad.l, Y(y), w - pad.r, Y(y), y === 0 ? colors.axis : colors.grid, 1);
      text(ctx, String(y), pad.l - 10, Y(y), { align: 'right', size: 11 });
    }
    curve.ticks.forEach((t, i) => {
      line(ctx, X(t), Y(0) - 4, X(t), Y(0) + 4, colors.axis);
      text(ctx, curve.tickLabels?.[i] ?? String(t), X(t), Math.min(Y(0) + 16, h - 12), { size: 11 });
    });

    // Rectangles
    const dx = (curve.b - curve.a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const xs = curve.a + (i + SAMPLE[method]) * dx;
      const fy = curve.f(xs);
      sum += fy * dx;
      const left = X(curve.a + i * dx);
      const right = X(curve.a + (i + 1) * dx);
      const top = Math.min(Y(fy), Y(0));
      const height = Math.abs(Y(fy) - Y(0));
      const color = fy >= 0 ? '255, 214, 10' : '255, 159, 28';
      ctx.fillStyle = `rgba(${color}, ${fy >= 0 ? 0.32 : 0.36})`;
      ctx.fillRect(left, top, right - left, height);
      if (n <= 60) {
        ctx.strokeStyle = `rgba(${color}, 0.9)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(left, top, right - left, height);
      }
      if (n <= 24) dot(ctx, X(xs), Y(fy), 3.5, colors.text);
    }

    // The curve
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const x = curve.a + ((curve.b - curve.a) * i) / 240;
      i ? ctx.lineTo(X(x), Y(curve.f(x))) : ctx.moveTo(X(x), Y(curve.f(x)));
    }
    ctx.stroke();

    text(ctx, curve.label, pad.l + 4, 16, { align: 'left', color: colors.text, weight: 600, size: 13 });
    text(ctx, `n = ${n}`, w - pad.r, 16, { align: 'right', color: colors.yellow, weight: 600, size: 13, mono: true });

    const err = sum - curve.exact;
    out.n.value = n;
    out.sum.value = sum.toFixed(4);
    out.exact.value = curve.exact.toFixed(4);
    out.err.value = (err >= 0 ? '+' : '') + err.toFixed(4);
  };

  const lesson = runLesson(section, { step, draw });

  nInput.addEventListener('input', () => {
    lesson.pause();
    logN = Math.log(Number(nInput.value));
    hold = 0;
    lesson.redraw();
  });
  fnInput.addEventListener('change', lesson.redraw);
  methodButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      method = btn.dataset.method;
      methodButtons.forEach((b) => {
        b.classList.toggle('on', b === btn);
        b.setAttribute('aria-checked', String(b === btn));
      });
      lesson.redraw();
    }),
  );
  view.onResize = lesson.redraw;
}

export const calculus = {
  id: 'calculus',
  title: 'Calculus: area under a curve',
  level: 'High school · Grades 9–12',
  heading: 'Area under a curve, one rectangle at a time',
  canvasLabel: 'Riemann sum rectangles approximating the area under a curve',
  intro: 'Curved shapes are hard to measure, but rectangles are easy. Fill the area under a curve with thin rectangles and add up their areas. This is a <b>Riemann sum</b>. As you add more rectangles the error shrinks toward zero, and the limit is the <b>integral</b>.',
  tips: [
    'Press play and watch the error shrink as <i>n</i> grows.',
    'Compare left, midpoint and right sums. Which one gets close fastest?',
    'Pick the cubic: rectangles below the x-axis count as negative area.',
  ],
  formula: '∫ₐᵇ f(x) dx = lim<sub>n→∞</sub> Σ f(xᵢ) Δx',
  controls: `
    <label>Rectangles <input type="range" id="calc-n" min="1" max="100" step="1" value="4" /></label>
    <label>Curve
      <select id="calc-fn">
        <option value="sq">f(x) = x² on [0, 2]</option>
        <option value="sin">f(x) = sin x on [0, π]</option>
        <option value="cub">f(x) = x³ − 3x² + 3 on [0, 3]</option>
      </select>
    </label>
    <div class="seg" role="radiogroup" aria-label="Sample point">
      <button data-method="left" role="radio" aria-checked="false">Left</button>
      <button data-method="mid" role="radio" aria-checked="true" class="on">Mid</button>
      <button data-method="right" role="radio" aria-checked="false">Right</button>
    </div>`,
  readouts: [
    ['calc-nv', 'n'],
    ['calc-sum', 'Riemann sum'],
    ['calc-exact', 'Exact area'],
    ['calc-err', 'Error'],
  ],
  init: initCalculus,
};
