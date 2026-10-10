// Middle school: plotting points on the coordinate plane.
import { colors, setupCanvas, runLesson, text, line, dot, canvasPoint, ease, clamp } from '../../lib/stage.js';

const N = 6;
const neg = (n) => (n < 0 ? `−${-n}` : String(n));

function quadrant(x, y) {
  if (x === 0 && y === 0) return 'origin';
  if (x === 0) return 'on the y-axis';
  if (y === 0) return 'on the x-axis';
  if (x > 0) return y > 0 ? 'Quadrant I' : 'Quadrant IV';
  return y > 0 ? 'Quadrant II' : 'Quadrant III';
}

export const coordinates = {
  id: 'coordinates',
  title: 'Coordinate plane',
  level: 'Middle school · Grades 6–8',
  heading: 'Along the corridor, then up the stairs',
  canvasLabel: 'A coordinate grid with a point being plotted from the origin',
  intro: 'A point is written as (<b class="c-a">x</b>, <b class="c-b">y</b>). Start at the origin (0, 0). Move <b class="c-a">across</b> by x first: right if it\'s positive, left if it\'s negative. Then move <b class="c-b">up or down</b> by y. The two axes split the plane into four quadrants.',
  tips: [
    'Click anywhere on the grid to plot a point there.',
    'Plot (3, −2) and (−2, 3). Are they the same point?',
    'Which quadrant has both numbers negative?',
  ],
  formula: '(x, y): across x, then up y',
  controls: `
    <label>x <input type="range" id="co-x" min="-6" max="6" step="1" value="3" /></label>
    <label>y <input type="range" id="co-y" min="-6" max="6" step="1" value="2" /></label>`,
  readouts: [
    ['co-p', 'Point', 'c-a'],
    ['co-q', 'Where'],
    ['co-across', 'Across'],
    ['co-up', 'Up / down'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const xInput = section.querySelector('#co-x');
    const yInput = section.querySelector('#co-y');
    const out = ['p', 'q', 'across', 'up'].map((k) => section.querySelector(`#co-${k}`));
    const view = setupCanvas(canvas);
    let clock = 99; // start with the walk finished

    const layout = () => {
      const u = Math.min((view.w - 40) / (2 * N + 1), (view.h - 30) / (2 * N + 1));
      return { u, cx: view.w / 2, cy: view.h / 2 + 4 };
    };

    const step = (dt) => {
      clock += dt;
      if (clock > 4.5) {
        xInput.value = Math.floor(Math.random() * (2 * N + 1)) - N;
        yInput.value = Math.floor(Math.random() * (2 * N + 1)) - N;
        clock = 0;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { u, cx, cy } = layout();
      const X = (v) => cx + v * u;
      const Y = (v) => cy - v * u;
      const px = Number(xInput.value);
      const py = Number(yInput.value);
      ctx.clearRect(0, 0, w, h);

      // Quadrant labels, grid and axes
      for (const [qx, qy, label] of [[1, 1, 'I'], [-1, 1, 'II'], [-1, -1, 'III'], [1, -1, 'IV']]) {
        text(ctx, label, X(qx * (N - 0.7)), Y(qy * (N - 0.5)), { size: 13, color: colors.axis, weight: 700 });
      }
      for (let v = -N; v <= N; v++) {
        line(ctx, X(v), Y(-N), X(v), Y(N), v === 0 ? colors.muted : colors.grid, v === 0 ? 1.5 : 1);
        line(ctx, X(-N), Y(v), X(N), Y(v), v === 0 ? colors.muted : colors.grid, v === 0 ? 1.5 : 1);
        if (v !== 0) {
          text(ctx, neg(v), X(v), Y(0) + 12, { size: 10 });
          text(ctx, neg(v), X(0) - 10, Y(v), { size: 10, align: 'right' });
        }
      }
      text(ctx, 'x', X(N) + 12, Y(0), { size: 13, color: colors.yellow, weight: 700 });
      text(ctx, 'y', X(0), Y(N) - 12, { size: 13, color: colors.orange, weight: 700 });

      // Walk: across first, then up/down.
      const fx = ease(clamp(clock / 1.4, 0, 1));
      const fy = ease(clamp((clock - 1.6) / 1.4, 0, 1));
      const wx = px * fx;
      const wy = py * fy;
      if (px !== 0) line(ctx, X(0), Y(0), X(wx), Y(0), colors.yellow, 3);
      if (py !== 0 && fy > 0) line(ctx, X(px), Y(0), X(px), Y(wy), colors.orange, 3);
      const done = fy >= 1;
      dot(ctx, X(0), Y(0), 4, colors.text);
      dot(ctx, X(wx), Y(wy), 12, 'rgba(255, 214, 10, 0.25)');
      dot(ctx, X(wx), Y(wy), 6, done ? colors.yellow : colors.text);
      if (done) {
        text(ctx, `(${neg(px)}, ${neg(py)})`, X(px) + (px >= 0 ? 12 : -12), Y(py) - 14, {
          size: 14, color: colors.text, weight: 700, align: px >= 0 ? 'left' : 'right',
        });
      }

      out[0].value = `(${neg(px)}, ${neg(py)})`;
      out[1].value = quadrant(px, py);
      out[2].value = px === 0 ? 'none' : `${px > 0 ? 'right' : 'left'} ${Math.abs(px)}`;
      out[3].value = py === 0 ? 'none' : `${py > 0 ? 'up' : 'down'} ${Math.abs(py)}`;
    };

    const lesson = runLesson(section, { step, draw });
    const replay = () => {
      clock = lesson.playing ? 0 : 99;
      lesson.redraw();
    };
    xInput.addEventListener('input', replay);
    yInput.addEventListener('input', replay);
    canvas.addEventListener('pointerdown', (e) => {
      const { u, cx, cy } = layout();
      const p = canvasPoint(canvas, e);
      xInput.value = clamp(Math.round((p.x - cx) / u), -N, N);
      yInput.value = clamp(Math.round((cy - p.y) / u), -N, N);
      lesson.pause();
      clock = 0;
      // Animate the walk once even while paused.
      const start = performance.now();
      const tick = (now) => {
        clock = (now - start) / 1000;
        lesson.redraw();
        if (clock < 3.2) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    view.onResize = lesson.redraw;
  },
};
