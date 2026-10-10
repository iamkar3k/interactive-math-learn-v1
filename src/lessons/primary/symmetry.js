// Primary: lines of symmetry, shown by folding one half of a shape onto the other.
import { colors, setupCanvas, runLesson, text, ease } from '../../lib/stage.js';

const deg = (d) => (d * Math.PI) / 180;

const regular = (n, rot) => Array.from({ length: n }, (_, k) => {
  const a = deg(rot) + (k * 2 * Math.PI) / n;
  return [Math.cos(a), Math.sin(a)];
});
const regularAxes = (n, rot) => Array.from({ length: n }, (_, k) => deg(rot) + (k * Math.PI) / n);

// Canvas y points down, so a vertex at -90° is at the top.
const SHAPES = {
  square: { label: 'Square', points: regular(4, 45), axes: regularAxes(4, 45) },
  rectangle: { label: 'Rectangle', points: [[-1.3, -0.8], [1.3, -0.8], [1.3, 0.8], [-1.3, 0.8]], axes: [0, Math.PI / 2] },
  triangle: { label: 'Equilateral triangle', points: regular(3, -90), axes: regularAxes(3, -90) },
  isosceles: { label: 'Isosceles triangle', points: [[0, -1.05], [0.75, 0.85], [-0.75, 0.85]], axes: [Math.PI / 2] },
  pentagon: { label: 'Regular pentagon', points: regular(5, -90), axes: regularAxes(5, -90) },
  hexagon: { label: 'Regular hexagon', points: regular(6, -90), axes: regularAxes(6, -90) },
  parallelogram: {
    label: 'Parallelogram',
    points: [[-1.25, 0.7], [0.55, 0.7], [1.25, -0.7], [-0.55, -0.7]],
    axes: [],
    tests: [Math.PI / 2, 0],
  },
};

const FOLD = 1.1;
const HOLD = 0.9;
const STEP = FOLD + HOLD + FOLD + 0.4;

export const symmetry = {
  id: 'symmetry',
  title: 'Shapes & symmetry',
  level: 'Primary · Grades 1–5',
  heading: 'Fold it in half',
  canvasLabel: 'A shape folding along its lines of symmetry',
  intro: 'A <b class="c-a">line of symmetry</b> splits a shape into two halves that match exactly. If you folded the shape along that line, one half would land perfectly on top of the other. Watch each fold and check whether the halves match.',
  tips: [
    'How many lines of symmetry does a square have? Does a rectangle have the same number?',
    'Try the parallelogram. Why don\'t the halves match?',
    'Look at the regular shapes. Do you see a pattern in how many lines each one has?',
  ],
  formula: 'regular shape with n sides → n lines of symmetry',
  controls: `
    <label>Shape
      <select id="sym-shape">
        ${Object.entries(SHAPES).map(([k, s]) => `<option value="${k}">${s.label}</option>`).join('')}
      </select>
    </label>
    <label class="check"><input type="checkbox" id="sym-all" checked /> Show all lines</label>`,
  readouts: [
    ['sym-name', 'Shape'],
    ['sym-count', 'Lines of symmetry', 'c-a'],
    ['sym-now', 'Folding along'],
    ['sym-match', 'Halves match?'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const shapeInput = section.querySelector('#sym-shape');
    const allInput = section.querySelector('#sym-all');
    const out = ['name', 'count', 'now', 'match'].map((k) => section.querySelector(`#sym-${k}`));
    const view = setupCanvas(canvas);
    let clock = 0;

    const step = (dt) => {
      clock += dt;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const shape = SHAPES[shapeInput.value];
      const folds = shape.axes.length ? shape.axes : shape.tests;
      const isTest = !shape.axes.length;
      const k = Math.floor(clock / STEP) % folds.length;
      const t0 = clock % STEP;
      const t = t0 < FOLD ? ease(t0 / FOLD) : t0 < FOLD + HOLD ? 1 : t0 < 2 * FOLD + HOLD ? 1 - ease((t0 - FOLD - HOLD) / FOLD) : 0;
      const axis = folds[k];

      ctx.clearRect(0, 0, w, h);
      const scale = Math.min(w * 0.28, h * 0.32);
      const cx = w / 2;
      const cy = h / 2 + 14;
      const P = ([x, y]) => [cx + x * scale, cy + y * scale];

      const path = (pts) => {
        ctx.beginPath();
        pts.forEach((p, i) => {
          const [x, y] = P(p);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
      };

      const u = [Math.cos(axis), Math.sin(axis)];
      const nrm = [-u[1], u[0]];
      const flapSrc = clipHalf(shape.points, nrm);
      const stay = clipHalf(shape.points, [-nrm[0], -nrm[1]]);

      // Full outline, the half that stays, and the folding flap.
      path(shape.points);
      ctx.strokeStyle = colors.shapeEdge;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      path(stay);
      ctx.fillStyle = '#2b2b27';
      ctx.fill();
      ctx.strokeStyle = colors.muted;
      ctx.stroke();

      const squash = Math.cos(Math.PI * t);
      const flap = flapSrc.map(([x, y]) => {
        const a = x * u[0] + y * u[1];
        const b = (x * nrm[0] + y * nrm[1]) * squash;
        return [a * u[0] + b * nrm[0], a * u[1] + b * nrm[1]];
      });
      path(flap);
      ctx.fillStyle = isTest && t > 0.5 ? 'rgba(255, 159, 28, 0.55)' : 'rgba(255, 214, 10, 0.6)';
      ctx.fill();
      ctx.strokeStyle = isTest ? colors.orange : colors.yellow;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Lines of symmetry
      const axisLine = (angle, color, width, dash) => {
        const L = 1.3;
        const [x1, y1] = P([-Math.cos(angle) * L, -Math.sin(angle) * L]);
        const [x2, y2] = P([Math.cos(angle) * L, Math.sin(angle) * L]);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
      };
      if (allInput.checked) shape.axes.forEach((a) => axisLine(a, 'rgba(255, 243, 176, 0.35)', 1.5, [6, 6]));
      axisLine(axis, isTest ? colors.orange : colors.soft, 2.5, [8, 6]);

      const caption = isTest
        ? t > 0.99 ? 'The halves don’t match: this is not a line of symmetry' : 'Testing a fold…'
        : t > 0.99 ? 'The halves match exactly!' : `Folding along line ${k + 1} of ${folds.length}`;
      text(ctx, caption, w / 2, 24, { color: isTest && t > 0.99 ? colors.orange : colors.text, size: 15, weight: 600 });

      out[0].value = shape.label;
      out[1].value = shape.axes.length;
      out[2].value = isTest ? 'Test fold' : `Line ${k + 1} of ${folds.length}`;
      out[3].value = isTest ? 'No' : 'Yes';
    };

    const lesson = runLesson(section, { step, draw });
    shapeInput.addEventListener('change', () => {
      clock = 0;
      lesson.redraw();
    });
    allInput.addEventListener('change', lesson.redraw);
    view.onResize = lesson.redraw;
  },
};

// Keep the part of a polygon where dot(p, n) >= 0 (Sutherland–Hodgman, one edge).
function clipHalf(points, n) {
  const side = ([x, y]) => x * n[0] + y * n[1];
  const result = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    const sp = side(p);
    const sq = side(q);
    if (sp >= 0) result.push(p);
    if ((sp >= 0) !== (sq >= 0)) {
      const f = sp / (sp - sq);
      result.push([p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]);
    }
  }
  return result;
}
