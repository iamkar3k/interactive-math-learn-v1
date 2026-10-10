// High school: parabolas y = ax² + bx + c, vertex, axis of symmetry and roots.
import { colors, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';
import { drawGrid, plot, num } from './graph.js';

export const quadratics = {
  id: 'quadratics',
  title: 'Quadratics & parabolas',
  level: 'High school · Grades 9–12',
  heading: 'Bend the parabola',
  canvasLabel: 'A parabola with its vertex, axis of symmetry and roots marked',
  intro: 'A quadratic y = <b class="c-a">a</b>x² + <b>b</b>x + <b class="c-b">c</b> makes a U-shaped curve called a <b>parabola</b>. <b class="c-a">a</b> sets which way it opens and how narrow it is. <b class="c-b">c</b> slides it up and down. The <b>roots</b> are where it crosses the x-axis. The discriminant b² − 4ac tells you how many roots there are before you draw anything.',
  tips: [
    'Make a negative. What happens to the shape?',
    'Slide c until the parabola just touches the x-axis. What is the discriminant then?',
    'Change b. What path does the vertex follow?',
  ],
  formula: 'x = (−b ± √(b² − 4ac)) ÷ 2a',
  controls: `
    <label>a <input type="range" id="quad-a" min="-3" max="3" step="0.25" value="1" /></label>
    <label>b <input type="range" id="quad-b" min="-6" max="6" step="0.5" value="-2" /></label>
    <label>c <input type="range" id="quad-c" min="-8" max="8" step="0.5" value="-3" /></label>`,
  readouts: [
    ['quad-eq', 'Equation'],
    ['quad-v', 'Vertex', 'c-a'],
    ['quad-d', 'b² − 4ac'],
    ['quad-r', 'Roots', 'c-b'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const [aInput, bInput, cInput] = ['a', 'b', 'c'].map((k) => section.querySelector(`#quad-${k}`));
    const out = ['eq', 'v', 'd', 'r'].map((k) => section.querySelector(`#quad-${k}`));
    const view = setupCanvas(canvas);
    let clock = 0;

    // Slide c up and down so the roots appear, touch and disappear.
    const step = (dt) => {
      clock += dt * 0.6;
      cInput.value = Math.round((-3 + 5 * Math.sin(clock)) * 2) / 2;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const a = Number(aInput.value);
      const b = Number(bInput.value);
      const c = Number(cInput.value);
      ctx.clearRect(0, 0, w, h);
      const g = drawGrid(ctx, w, h, { xMax: 8, yMax: 10, label: 2 });
      const { X, Y } = g;
      plot(ctx, g, (x) => a * x * x + b * x + c, colors.text, 3);

      const signed = (v, s) => (v === 0 ? '' : ` ${v < 0 ? '−' : '+'} ${num(Math.abs(v))}${s}`);
      const lead = a === 1 ? '' : a === -1 ? '−' : num(a);
      const eq = `y = ${lead}x²${signed(b, 'x')}${signed(c, '')}`;
      out[0].value = eq;
      text(ctx, eq, 16, 20, { align: 'left', color: colors.text, size: 18, weight: 700, mono: true });

      if (a === 0) {
        text(ctx, 'a = 0: this is a straight line, not a parabola', w / 2, h - 16, { color: colors.orange, size: 13, weight: 600 });
        out[1].value = '—';
        out[2].value = '—';
        out[3].value = b ? `x = ${num(-c / b)}` : 'none';
        return;
      }

      const vx = -b / (2 * a);
      const vy = c - (b * b) / (4 * a);
      const D = b * b - 4 * a * c;
      line(ctx, X(vx), Y(-g.yMax), X(vx), Y(g.yMax), 'rgba(255, 214, 10, 0.5)', 1.5, [6, 5]);
      dot(ctx, X(vx), Y(vy), 7, colors.yellow);
      text(ctx, `vertex (${num(vx)}, ${num(vy)})`, X(vx) + 10, Y(vy) + (a > 0 ? 16 : -16), { size: 12, align: 'left', color: colors.yellow });

      let roots = [];
      if (D > 1e-9) roots = [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q);
      else if (Math.abs(D) <= 1e-9) roots = [vx];
      for (const r of roots) {
        dot(ctx, X(r), Y(0), 10, 'rgba(255, 159, 28, 0.3)');
        dot(ctx, X(r), Y(0), 6, colors.orange);
      }
      const rootText = D > 1e-9 ? 'two roots' : roots.length ? 'one root (it touches)' : 'no real roots';
      text(ctx, `b² − 4ac = ${num(D)} → ${rootText}`, w - 16, 20, { align: 'right', size: 13, color: colors.orange, weight: 600 });

      out[1].value = `(${num(vx)}, ${num(vy)})`;
      out[2].value = num(D);
      out[3].value = roots.length ? roots.map((r) => `x = ${num(r)}`).join(', ') : 'none';
    };

    const lesson = runLesson(section, { step, draw });
    aInput.addEventListener('input', lesson.redraw);
    bInput.addEventListener('input', lesson.redraw);
    cInput.addEventListener('input', () => {
      lesson.pause();
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};
