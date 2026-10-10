// Middle school: area (squares inside) and perimeter (distance around) of rectangles and triangles.
import { colors, setupCanvas, runLesson, text, dot, canvasPoint, clamp } from '../../lib/stage.js';

const COLS = 12;
const ROWS = 8;
const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

export const area = {
  id: 'area',
  title: 'Area & perimeter',
  level: 'Middle school · Grades 6–8',
  heading: 'Inside and around',
  canvasLabel: 'A rectangle on a grid with its squares counted and its edge traced',
  intro: '<b class="c-a">Area</b> is how much space is inside a shape: count the unit squares. <b class="c-b">Perimeter</b> is the distance around the edge: walk around and count. A triangle made by cutting a rectangle along its diagonal has exactly half the rectangle\'s area.',
  tips: [
    'Drag the corner. Can you find two rectangles with the same area but different perimeters?',
    'Make a square with area 36. What is its perimeter?',
    'Tick "Triangle". Why is its area half of the rectangle\'s?',
  ],
  formula: 'rectangle: A = w × h, P = 2(w + h)  ·  triangle: A = ½ × w × h',
  controls: `
    <label>Width <input type="range" id="ap-w" min="1" max="12" step="1" value="5" /></label>
    <label>Height <input type="range" id="ap-h" min="1" max="8" step="1" value="3" /></label>
    <label class="check"><input type="checkbox" id="ap-tri" /> Triangle</label>`,
  readouts: [
    ['ap-size', 'Size'],
    ['ap-area', 'Area', 'c-a'],
    ['ap-per', 'Perimeter', 'c-b'],
    ['ap-now', 'Counting'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const wInput = section.querySelector('#ap-w');
    const hInput = section.querySelector('#ap-h');
    const triInput = section.querySelector('#ap-tri');
    const out = ['size', 'area', 'per', 'now'].map((k) => section.querySelector(`#ap-${k}`));
    const view = setupCanvas(canvas);
    let clock = 0;
    let dragging = false;

    const layout = () => {
      const u = Math.min((view.w - 40) / COLS, (view.h - 64) / ROWS);
      return { u, ox: (view.w - COLS * u) / 2, oy: 44 };
    };

    // Phase 1 fills the area, phase 2 walks the perimeter.
    const phases = (W, H) => {
      const fill = (triInput.checked ? 1.5 : H * 0.45) + 0.8;
      const walk = 3.5;
      return { fill, walk, total: fill + walk + 1 };
    };

    const step = (dt) => {
      clock += dt;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const W = Number(wInput.value);
      const H = Number(hInput.value);
      const tri = triInput.checked;
      const { u, ox, oy } = layout();
      const P = (x, y) => [ox + x * u, oy + y * u];
      const ph = phases(W, H);
      const t = clock % ph.total;
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(...P(i, 0));
        ctx.lineTo(...P(i, ROWS));
        ctx.stroke();
      }
      for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(...P(0, j));
        ctx.lineTo(...P(COLS, j));
        ctx.stroke();
      }

      // Area fill
      const fillF = Math.min(1, t / (ph.fill - 0.8));
      const areaVal = tri ? (W * H) / 2 : W * H;
      if (tri) {
        ctx.globalAlpha = 0.25 + 0.5 * fillF;
        ctx.fillStyle = colors.yellow;
        ctx.beginPath();
        ctx.moveTo(...P(0, ROWS));
        ctx.lineTo(...P(W, ROWS));
        ctx.lineTo(...P(0, ROWS - H));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.shapeEdge;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(ox, oy + (ROWS - H) * u, W * u, H * u);
        ctx.setLineDash([]);
      } else {
        const rowsShown = Math.ceil(fillF * H);
        for (let r = 0; r < H; r++) {
          for (let c = 0; c < W; c++) {
            const [x, y] = P(c, ROWS - 1 - r);
            ctx.fillStyle = r < rowsShown ? 'rgba(255, 214, 10, 0.7)' : 'rgba(255, 214, 10, 0.12)';
            ctx.fillRect(x + 1.5, y + 1.5, u - 3, u - 3);
          }
        }
      }

      // Outline and perimeter walker
      const pts = tri ? [[0, ROWS], [W, ROWS], [0, ROWS - H]] : [[0, ROWS], [W, ROWS], [W, ROWS - H], [0, ROWS - H]];
      ctx.strokeStyle = colors.orange;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(...P(...p)) : ctx.moveTo(...P(...p))));
      ctx.closePath();
      ctx.stroke();

      const lens = pts.map((p, i) => Math.hypot(pts[(i + 1) % pts.length][0] - p[0], pts[(i + 1) % pts.length][1] - p[1]));
      const per = lens.reduce((s, l) => s + l, 0);
      let walked = 0;
      if (t > ph.fill) {
        walked = Math.min(1, (t - ph.fill) / ph.walk) * per;
        let left = walked;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          if (left <= lens[i]) {
            const f = left / lens[i];
            const [x, y] = P(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
            dot(ctx, x, y, 10, 'rgba(255, 159, 28, 0.3)');
            dot(ctx, x, y, 6, colors.orange);
            break;
          }
          left -= lens[i];
        }
      }

      // Side labels and drag handle
      const [bx, by] = P(W / 2, ROWS);
      text(ctx, `${W}`, bx, by + 14, { color: colors.text, size: 13, weight: 600 });
      const [lx, ly] = P(0, ROWS - H / 2);
      text(ctx, `${H}`, lx - 12, ly, { color: colors.text, size: 13, weight: 600 });
      const handle = P(W, ROWS - H);
      dot(ctx, ...handle, 7, colors.text);

      const counting = t < ph.fill ? 'area' : 'perimeter';
      const heading = counting === 'area'
        ? `Area = ${tri ? `½ × ${W} × ${H}` : `${W} × ${H}`} = ${fmt(areaVal)} square units`
        : `Perimeter: ${tri ? walked.toFixed(1) : Math.floor(walked)} of ${fmt(per)} units walked`;
      text(ctx, heading, w / 2, 20, { color: counting === 'area' ? colors.yellow : colors.orange, size: 15, weight: 600 });

      out[0].value = `${W} × ${H}`;
      out[1].value = `${fmt(areaVal)} sq units`;
      out[2].value = `${fmt(per)} units`;
      out[3].value = counting === 'area' ? 'Area' : 'Perimeter';
    };

    const lesson = runLesson(section, { step, draw });
    const reset = () => {
      clock = 0;
      lesson.redraw();
    };
    wInput.addEventListener('input', reset);
    hInput.addEventListener('input', reset);
    triInput.addEventListener('change', reset);

    // Drag the top-right corner to resize.
    canvas.addEventListener('pointerdown', (e) => {
      const { u, ox, oy } = layout();
      const p = canvasPoint(canvas, e);
      const hx = ox + Number(wInput.value) * u;
      const hy = oy + (ROWS - Number(hInput.value)) * u;
      if (Math.hypot(p.x - hx, p.y - hy) > 24) return;
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const { u, ox, oy } = layout();
      const p = canvasPoint(canvas, e);
      wInput.value = clamp(Math.round((p.x - ox) / u), 1, COLS);
      hInput.value = clamp(Math.round(ROWS - (p.y - oy) / u), 1, ROWS);
      reset();
    });
    canvas.addEventListener('pointerup', () => (dragging = false));
    canvas.addEventListener('pointercancel', () => (dragging = false));
    view.onResize = lesson.redraw;
  },
};
