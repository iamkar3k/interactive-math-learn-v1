// Middle school: measuring and naming angles with a protractor.
import { colors, TAU, setupCanvas, runLesson, text, line, dot, canvasPoint } from '../../lib/stage.js';

const rad = (d) => (d * Math.PI) / 180;

function angleType(a) {
  if (a === 0) return 'zero angle';
  if (a < 90) return 'acute';
  if (a === 90) return 'right angle';
  if (a < 180) return 'obtuse';
  if (a === 180) return 'straight angle';
  if (a < 360) return 'reflex';
  return 'full turn';
}

export const angles = {
  id: 'angles',
  title: 'Angles',
  level: 'Middle school · Grades 6–8',
  heading: 'How far did it turn?',
  canvasLabel: 'A protractor measuring the angle between two rays',
  intro: 'An angle measures an amount of turn, in <b class="c-a">degrees</b>. A full turn is 360°. Angles smaller than 90° are <b>acute</b>, exactly 90° is a <b>right angle</b>, between 90° and 180° is <b>obtuse</b>, 180° is a <b>straight</b> line, and anything bigger is <b>reflex</b>.',
  tips: [
    'Drag the yellow arm to exactly 90°. What mark appears?',
    'Two angles that add to 90° are complementary. What is the complement of 35°?',
    'Make a reflex angle. How many degrees is the angle on the other side?',
  ],
  formula: 'complement = 90° − a  ·  supplement = 180° − a',
  controls: `<label>Speed <input type="range" id="ang-speed" min="5" max="90" step="5" value="30" /></label>`,
  readouts: [
    ['ang-a', 'Angle', 'c-a'],
    ['ang-type', 'Type'],
    ['ang-comp', 'Complement'],
    ['ang-supp', 'Supplement'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const speedInput = section.querySelector('#ang-speed');
    const out = ['a', 'type', 'comp', 'supp'].map((k) => section.querySelector(`#ang-${k}`));
    const view = setupCanvas(canvas);
    let angle = 40;
    let hold = 0;
    let dragging = false;

    const layout = () => {
      const R = Math.min(view.w * 0.36, view.h * 0.38);
      return { R, cx: view.w / 2, cy: view.h * 0.6 };
    };

    // Sweep all the way round, pausing briefly at the key angles.
    const step = (dt) => {
      if (hold > 0) {
        hold -= dt;
        return;
      }
      const before = angle;
      angle += dt * Number(speedInput.value);
      for (const k of [90, 180, 270]) {
        if (before < k && angle >= k) {
          angle = k;
          hold = 1;
        }
      }
      if (angle >= 360) {
        angle = 0;
        hold = 1;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { R, cx, cy } = layout();
      const a = Math.round(angle);
      ctx.clearRect(0, 0, w, h);

      // Protractor
      ctx.fillStyle = 'rgba(255, 214, 10, 0.06)';
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 214, 10, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, R, Math.PI, TAU);
      ctx.stroke();
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI);
      ctx.stroke();
      for (let d = 0; d <= 180; d += 5) {
        const big = d % 10 === 0;
        const r1 = R - (d % 30 === 0 ? 14 : big ? 9 : 5);
        line(ctx, cx + Math.cos(-rad(d)) * r1, cy + Math.sin(-rad(d)) * r1, cx + Math.cos(-rad(d)) * R, cy + Math.sin(-rad(d)) * R, 'rgba(255, 214, 10, 0.6)', 1);
        if (d % 30 === 0) text(ctx, String(d), cx + Math.cos(-rad(d)) * (R + 14), cy + Math.sin(-rad(d)) * (R + 14), { size: 11 });
      }

      // Angle sector
      const type = angleType(a);
      const fill = a > 180 ? 'rgba(255, 159, 28, 0.3)' : 'rgba(255, 214, 10, 0.3)';
      const r = R * 0.32;
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, 0, -rad(a), true);
      ctx.closePath();
      ctx.fill();
      if (a === 90) {
        const s = r * 0.45;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx, cy - s, s, s);
      }

      // Arms
      line(ctx, cx, cy, cx + R * 1.05, cy, colors.text, 3);
      const ex = cx + Math.cos(-rad(angle)) * R * 1.05;
      const ey = cy + Math.sin(-rad(angle)) * R * 1.05;
      line(ctx, cx, cy, ex, ey, colors.yellow, 3);
      dot(ctx, ex, ey, 9, 'rgba(255, 214, 10, 0.35)');
      dot(ctx, ex, ey, 5, colors.yellow);
      dot(ctx, cx, cy, 5, colors.text);

      const mid = -rad(a / 2);
      text(ctx, `${a}°`, cx + Math.cos(mid) * (r + 22), cy + Math.sin(mid) * (r + 22), { color: colors.text, size: 15, weight: 700 });
      text(ctx, `${a}° is ${/^[aeiou]/.test(type) ? 'an' : 'a'} ${type}`, w / 2, 22, { color: a > 180 ? colors.orange : colors.yellow, size: 16, weight: 600 });

      out[0].value = `${a}°`;
      out[1].value = type;
      out[2].value = a < 90 ? `${90 - a}°` : '—';
      out[3].value = a < 180 ? `${180 - a}°` : '—';
    };

    const lesson = runLesson(section, { step, draw });

    const setFromPointer = (e) => {
      const { cx, cy } = layout();
      const p = canvasPoint(canvas, e);
      let d = (Math.atan2(cy - p.y, p.x - cx) * 180) / Math.PI;
      if (d < 0) d += 360;
      d = Math.round(d);
      for (const k of [0, 90, 180, 270, 360]) if (Math.abs(d - k) <= 2) d = k % 360;
      angle = d;
      lesson.redraw();
    };
    canvas.addEventListener('pointerdown', (e) => {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
      setFromPointer(e);
    });
    canvas.addEventListener('pointermove', (e) => dragging && setFromPointer(e));
    canvas.addEventListener('pointerup', () => (dragging = false));
    canvas.addEventListener('pointercancel', () => (dragging = false));
    view.onResize = lesson.redraw;
  },
};
