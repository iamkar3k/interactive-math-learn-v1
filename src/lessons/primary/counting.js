// Primary: place value with hundreds flats, tens rods and ones cubes.
import { colors, setupCanvas, runLesson, text } from '../../lib/stage.js';

export const counting = {
  id: 'counting',
  title: 'Counting & place value',
  level: 'Primary · Grades 1–5',
  heading: 'Hundreds, tens and ones',
  canvasLabel: 'Place value blocks showing hundreds, tens and ones',
  intro: 'Every number is built from groups of ten. Ten <b class="c-ones">ones</b> make one <b class="c-b">ten</b>, and ten tens make one <b class="c-a">hundred</b>. Press play and watch the blocks swap for a bigger block each time you reach ten.',
  tips: [
    'Watch what happens when the ones reach 10.',
    'Count by 10s. Which blocks change, and which stay the same?',
    'Make 305 with the slider. Why do we need the 0?',
  ],
  formula: '345 = 300 + 40 + 5',
  controls: `
    <label>Number <input type="range" id="counting-n" min="0" max="999" step="1" value="128" /></label>
    <label>Count by
      <select id="counting-step"><option value="1">1s</option><option value="10">10s</option><option value="100">100s</option></select>
    </label>`,
  readouts: [
    ['counting-h', 'Hundreds', 'c-a'],
    ['counting-t', 'Tens', 'c-b'],
    ['counting-o', 'Ones', 'c-ones'],
    ['counting-x', 'Expanded form'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const nInput = section.querySelector('#counting-n');
    const stepInput = section.querySelector('#counting-step');
    const out = ['h', 't', 'o', 'x'].map((k) => section.querySelector(`#counting-${k}`));
    const view = setupCanvas(canvas);
    let timer = 0;
    let flash = 0; // seconds left on the "new block" highlight

    const step = (dt) => {
      timer += dt;
      flash = Math.max(0, flash - dt);
      if (timer < 0.7) return;
      timer = 0;
      const next = Number(nInput.value) + Number(stepInput.value);
      nInput.value = next > 999 ? 0 : next;
      flash = 0.45;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const n = Number(nInput.value);
      const H = Math.floor(n / 100);
      const T = Math.floor(n / 10) % 10;
      const O = n % 10;
      ctx.clearRect(0, 0, w, h);

      const top = 64;
      const bottom = 34;
      const u = Math.max(3, Math.min((h - top - bottom) / 31.2, w / 62));
      const gap = 0.6 * u;
      const colGap = 3 * u;
      const total = 31.2 * u + 15.4 * u + 4.2 * u + 2 * colGap;
      let x = (w - total) / 2;
      const y0 = top + Math.max(0, (h - top - bottom - 31.2 * u) / 2);
      const glow = flash > 0;

      text(ctx, String(n), w / 2, 30, { color: colors.text, size: 30, weight: 700, mono: true });

      const cube = (cx, cy, size, fill) => {
        ctx.fillStyle = fill;
        ctx.fillRect(cx, cy, size, size);
      };

      // Hundreds: 10 × 10 flats in a 3 × 3 grid
      const hundX = x;
      for (let i = 0; i < H; i++) {
        const fx = x + (i % 3) * (10 * u + gap);
        const fy = y0 + Math.floor(i / 3) * (10 * u + gap);
        cube(fx, fy, 10 * u, 'rgba(255, 214, 10, 0.85)');
        ctx.strokeStyle = 'rgba(10, 10, 10, 0.35)';
        ctx.lineWidth = 1;
        for (let k = 1; k < 10; k++) {
          ctx.beginPath();
          ctx.moveTo(fx + k * u, fy);
          ctx.lineTo(fx + k * u, fy + 10 * u);
          ctx.moveTo(fx, fy + k * u);
          ctx.lineTo(fx + 10 * u, fy + k * u);
          ctx.stroke();
        }
        if (glow && i === H - 1 && T === 0 && O === 0) outline(ctx, fx, fy, 10 * u, 10 * u);
      }
      x += 31.2 * u + colGap;

      // Tens: rods of 10 cubes
      const tensX = x;
      for (let i = 0; i < T; i++) {
        const rx = x + i * 1.8 * u;
        ctx.fillStyle = colors.orange;
        ctx.fillRect(rx, y0, u, 10 * u);
        ctx.strokeStyle = 'rgba(10, 10, 10, 0.35)';
        for (let k = 1; k < 10; k++) {
          ctx.beginPath();
          ctx.moveTo(rx, y0 + k * u);
          ctx.lineTo(rx + u, y0 + k * u);
          ctx.stroke();
        }
        if (glow && i === T - 1 && O === 0) outline(ctx, rx, y0, u, 10 * u);
      }
      x += 15.4 * u + colGap;

      // Ones: single cubes in a 3 × 3 grid
      const onesX = x;
      for (let i = 0; i < O; i++) {
        const cx = x + (i % 3) * 1.6 * u;
        const cy = y0 + Math.floor(i / 3) * 1.6 * u;
        cube(cx, cy, u, colors.soft);
        if (glow && i === O - 1) outline(ctx, cx, cy, u, u);
      }

      const labelY = h - 16;
      text(ctx, `Hundreds: ${H}`, hundX + 15.6 * u, labelY, { color: colors.yellow, size: 13, weight: 600 });
      text(ctx, `Tens: ${T}`, tensX + 7.7 * u, labelY, { color: colors.orange, size: 13, weight: 600 });
      text(ctx, `Ones: ${O}`, onesX + 2.1 * u, labelY, { color: colors.soft, size: 13, weight: 600 });

      out[0].value = H;
      out[1].value = T;
      out[2].value = O;
      out[3].value = expanded(H, T, O);
    };

    const lesson = runLesson(section, { step, draw });
    nInput.addEventListener('input', () => {
      lesson.pause();
      lesson.redraw();
    });
    stepInput.addEventListener('change', lesson.redraw);
    view.onResize = lesson.redraw;
  },
};

function outline(ctx, x, y, w, h) {
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
}

function expanded(H, T, O) {
  const parts = [H && H * 100, T && T * 10, O].filter(Boolean);
  return parts.length ? parts.join(' + ') : '0';
}
