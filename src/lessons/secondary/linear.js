// High school: straight-line graphs y = mx + c, slope as rise over run.
import { colors, setupCanvas, runLesson, text, line, dot, canvasPoint, clamp } from '../../lib/stage.js';
import { drawGrid, plot, num } from './graph.js';

const RUN = 2;

export const linear = {
  id: 'linear',
  title: 'Linear functions & slope',
  level: 'High school · Grades 9–12',
  heading: 'Rise over run',
  canvasLabel: 'A straight line graph with its slope triangle and intercept',
  intro: 'Every straight line can be written as <b>y = <span class="c-a">m</span>x + <span class="c-b">c</span></b>. The <b class="c-a">slope m</b> says how steep it is: how far it rises for each 1 you move right. The <b class="c-b">intercept c</b> is where the line crosses the y-axis.',
  tips: [
    'Drag the orange dot to move the line up and down. Does the slope change?',
    'Drag the yellow dot to change the slope. What does a negative slope look like?',
    'What happens when m = 0?',
  ],
  formula: 'm = rise ÷ run   ·   y = mx + c',
  controls: `
    <label>Slope m <input type="range" id="lin-m" min="-4" max="4" step="0.25" value="1.5" /></label>
    <label>Intercept c <input type="range" id="lin-c" min="-6" max="6" step="0.5" value="-2" /></label>`,
  readouts: [
    ['lin-eq', 'Equation'],
    ['lin-m-out', 'Slope', 'c-a'],
    ['lin-c-out', 'y-intercept', 'c-b'],
    ['lin-x', 'x-intercept'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const mInput = section.querySelector('#lin-m');
    const cInput = section.querySelector('#lin-c');
    const out = ['eq', 'm-out', 'c-out', 'x'].map((k) => section.querySelector(`#lin-${k}`));
    const view = setupCanvas(canvas);
    let clock = Math.asin(0.5);
    let grid = null;
    let drag = null;

    const step = (dt) => {
      clock += dt * 0.5;
      mInput.value = Math.round(3 * Math.sin(clock) * 4) / 4;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const m = Number(mInput.value);
      const c = Number(cInput.value);
      ctx.clearRect(0, 0, w, h);
      grid = drawGrid(ctx, w, h, { xMax: 10, yMax: 8 });
      const { X, Y } = grid;

      plot(ctx, grid, (x) => m * x + c, colors.text, 3);

      // Slope triangle from the intercept
      const rise = m * RUN;
      line(ctx, X(0), Y(c), X(RUN), Y(c), colors.yellow, 2, [5, 4]);
      line(ctx, X(RUN), Y(c), X(RUN), Y(c + rise), colors.yellow, 2, [5, 4]);
      text(ctx, `run ${RUN}`, X(RUN / 2), Y(c) + (rise >= 0 ? 14 : -14), { size: 12, color: colors.yellow });
      text(ctx, `rise ${num(rise)}`, X(RUN) + 8, Y(c + rise / 2), { size: 12, color: colors.yellow, align: 'left' });

      dot(ctx, X(0), Y(c), 8, colors.orange);
      dot(ctx, X(RUN), Y(c + rise), 8, colors.yellow);

      const sign = c < 0 ? '−' : '+';
      const eq = `y = ${num(m)}x ${sign} ${num(Math.abs(c))}`;
      text(ctx, eq, 16, 20, { align: 'left', color: colors.text, size: 18, weight: 700, mono: true });

      out[0].value = eq;
      out[1].value = `${num(rise)} ÷ ${RUN} = ${num(m)}`;
      out[2].value = `(0, ${num(c)})`;
      out[3].value = m === 0 ? (c === 0 ? 'every x' : 'none') : `(${num(-c / m)}, 0)`;
    };

    const lesson = runLesson(section, { step, draw });
    mInput.addEventListener('input', () => {
      lesson.pause();
      lesson.redraw();
    });
    cInput.addEventListener('input', lesson.redraw);

    canvas.addEventListener('pointerdown', (e) => {
      if (!grid) return;
      const p = canvasPoint(canvas, e);
      const m = Number(mInput.value);
      const c = Number(cInput.value);
      if (Math.hypot(p.x - grid.X(0), p.y - grid.Y(c)) < 20) drag = 'c';
      else if (Math.hypot(p.x - grid.X(RUN), p.y - grid.Y(c + m * RUN)) < 20) drag = 'm';
      else return;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const y = grid.toY(canvasPoint(canvas, e).y);
      if (drag === 'c') cInput.value = clamp(Math.round(y * 2) / 2, -6, 6);
      else mInput.value = clamp(Math.round(((y - Number(cInput.value)) / RUN) * 4) / 4, -4, 4);
      lesson.redraw();
    });
    canvas.addEventListener('pointerup', () => (drag = null));
    canvas.addEventListener('pointercancel', () => (drag = null));
    view.onResize = lesson.redraw;
  },
};
