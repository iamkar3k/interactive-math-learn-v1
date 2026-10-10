// High school: circle theorems shown with draggable points on a circle.
import { colors, TAU, setupCanvas, runLesson, text, line, dot, canvasPoint } from '../../lib/stage.js';

const deg = (r) => (r * 180) / Math.PI;
const rad = (d) => (d * Math.PI) / 180;

const MODES = {
  centre: 'Angle at the centre',
  semicircle: 'Angle in a semicircle',
  segment: 'Angles in the same segment',
};

// Angle at vertex v between rays to p and q, in degrees.
const angleAt = (v, p, q) => {
  const a = Math.atan2(p[1] - v[1], p[0] - v[0]);
  const b = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let d = Math.abs(a - b);
  if (d > Math.PI) d = TAU - d;
  return deg(d);
};

export const circles = {
  id: 'circles',
  title: 'Circle theorems',
  level: 'High school · Grades 9–12',
  heading: 'Angles that never change',
  canvasLabel: 'A circle with points A, B and P showing a circle theorem',
  intro: 'Pick two points <b>A</b> and <b>B</b> on a circle. The angle they make at the <b class="c-b">centre O</b> is always exactly <b>twice</b> the angle they make at any point <b class="c-a">P</b> on the far side of the circle. Move P around and the angle at P stays the same. When AB is a diameter, the angle at P is always 90°.',
  tips: [
    'Drag P around the circle. Does ∠APB change?',
    'Drag A or B. Is ∠AOB still twice ∠APB?',
    'Pick "Angle in a semicircle". Why must ∠APB be 90°?',
  ],
  formula: '∠AOB = 2 × ∠APB',
  controls: `
    <label>Theorem
      <select id="circ-mode">${Object.entries(MODES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
    </label>`,
  readouts: [
    ['circ-o', '∠AOB (centre)', 'c-b'],
    ['circ-p', '∠APB', 'c-a'],
    ['circ-q', '∠AQB'],
    ['circ-check', 'Check'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const modeInput = section.querySelector('#circ-mode');
    const out = ['o', 'p', 'q', 'check'].map((k) => section.querySelector(`#circ-${k}`));
    const view = setupCanvas(canvas);
    // Point positions as angles in degrees (maths direction, 0° = right).
    const pts = { A: 210, B: 330, P: 90, Q: 140 };
    let clock = 0;
    let drag = null;

    const layout = () => {
      const R = Math.min(view.w * 0.3, view.h * 0.4);
      return { R, cx: view.w < 520 ? view.w / 2 : view.w * 0.42, cy: view.h / 2 + 10 };
    };
    const pos = (a) => {
      const { R, cx, cy } = layout();
      return [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
    };

    const applyMode = () => {
      if (modeInput.value === 'semicircle') pts.B = (pts.A + 180) % 360;
    };

    // P (and Q) sweep the major arc, the side away from the minor arc AB.
    const majorArc = () => {
      let span = (pts.B - pts.A + 360) % 360; // anticlockwise A → B
      const start = span <= 180 ? pts.B : pts.A;
      const len = span <= 180 ? 360 - span : span;
      return { start, len };
    };
    const step = (dt) => {
      clock += dt * 0.5;
      const { start, len } = majorArc();
      pts.P = (start + len * (0.5 + 0.4 * Math.sin(clock))) % 360;
      pts.Q = (start + len * (0.5 + 0.4 * Math.sin(clock + 2.2))) % 360;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { R, cx, cy } = layout();
      const mode = modeInput.value;
      applyMode();
      const O = [cx, cy];
      const A = pos(pts.A);
      const B = pos(pts.B);
      const P = pos(pts.P);
      const Q = pos(pts.Q);
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = colors.muted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();

      const sector = (v, p, q, r, fill) => {
        const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]);
        const a2 = Math.atan2(q[1] - v[1], q[0] - v[0]);
        let d = a2 - a1;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(...v);
        ctx.arc(v[0], v[1], r, a1, a1 + d, d < 0);
        ctx.closePath();
        ctx.fill();
      };

      const angO = angleAt(O, A, B);
      const angP = angleAt(P, A, B);
      const angQ = angleAt(Q, A, B);

      if (mode !== 'segment') {
        line(ctx, ...O, ...A, colors.orange, 2);
        line(ctx, ...O, ...B, colors.orange, 2);
        if (mode === 'centre') sector(O, A, B, 30, 'rgba(255, 159, 28, 0.35)');
      }
      if (mode === 'semicircle') line(ctx, ...A, ...B, colors.orange, 2);
      line(ctx, ...P, ...A, colors.yellow, 2);
      line(ctx, ...P, ...B, colors.yellow, 2);
      sector(P, A, B, 26, 'rgba(255, 214, 10, 0.35)');
      if (mode === 'segment') {
        line(ctx, ...Q, ...A, colors.soft, 2);
        line(ctx, ...Q, ...B, colors.soft, 2);
        sector(Q, A, B, 26, 'rgba(255, 243, 176, 0.3)');
      }

      const label = (pt, name, color, dx = 0) => {
        const vx = pt[0] - cx;
        const vy = pt[1] - cy;
        const len = Math.hypot(vx, vy) || 1;
        text(ctx, name, pt[0] + (vx / len) * 18 + dx, pt[1] + (vy / len) * 18, { color, size: 15, weight: 700 });
      };
      for (const [name, pt, color] of [['A', A, colors.text], ['B', B, colors.text], ['P', P, colors.yellow]]) {
        dot(ctx, ...pt, 7, color);
        label(pt, name, color);
      }
      if (mode === 'segment') {
        dot(ctx, ...Q, 7, colors.soft);
        label(Q, 'Q', colors.soft);
      }
      dot(ctx, ...O, 4, colors.orange);
      text(ctx, 'O', cx + 12, cy + 12, { color: colors.orange, size: 13, weight: 700 });

      // Side panel
      const tx = cx + R + 30;
      if (w - tx > 140) {
        const lines = mode === 'centre'
          ? [[`∠AOB = ${angO.toFixed(1)}°`, colors.orange], [`∠APB = ${angP.toFixed(1)}°`, colors.yellow], [`${angO.toFixed(1)} = 2 × ${angP.toFixed(1)}`, colors.text]]
          : mode === 'semicircle'
            ? [['AB is a diameter', colors.orange], [`∠APB = ${angP.toFixed(1)}°`, colors.yellow], ['always a right angle', colors.text]]
            : [[`∠APB = ${angP.toFixed(1)}°`, colors.yellow], [`∠AQB = ${angQ.toFixed(1)}°`, colors.soft], ['same segment, same angle', colors.text]];
        lines.forEach(([s, color], i) => text(ctx, s, tx, cy - 30 + i * 28, { align: 'left', color, size: 15, weight: 600, mono: i < 2 }));
      }
      text(ctx, 'Drag A, B or P', 16, h - 16, { align: 'left', size: 12 });

      out[0].value = `${angO.toFixed(1)}°`;
      out[1].value = `${angP.toFixed(1)}°`;
      out[2].value = mode === 'segment' ? `${angQ.toFixed(1)}°` : '—';
      out[3].value = mode === 'centre' ? `2 × ${angP.toFixed(1)} = ${(2 * angP).toFixed(1)}` : mode === 'semicircle' ? `${angP.toFixed(1)}° = 90°` : `${angP.toFixed(1)}° = ${angQ.toFixed(1)}°`;
    };

    const lesson = runLesson(section, { step, draw });
    modeInput.addEventListener('change', () => {
      if (modeInput.value !== 'semicircle') pts.B = (pts.A + 120) % 360;
      clock = 0;
      lesson.redraw();
    });

    canvas.addEventListener('pointerdown', (e) => {
      const p = canvasPoint(canvas, e);
      const names = modeInput.value === 'segment' ? ['P', 'Q', 'A', 'B'] : ['P', 'A', 'B'];
      drag = names.find((n) => Math.hypot(p.x - pos(pts[n])[0], p.y - pos(pts[n])[1]) < 22) || null;
      if (!drag) return;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const { cx, cy } = layout();
      const p = canvasPoint(canvas, e);
      const a = (deg(Math.atan2(cy - p.y, p.x - cx)) + 360) % 360;
      if (modeInput.value === 'semicircle' && drag === 'B') pts.A = (a + 180) % 360;
      else pts[drag] = a;
      lesson.redraw();
    });
    canvas.addEventListener('pointerup', () => (drag = null));
    canvas.addEventListener('pointercancel', () => (drag = null));
    view.onResize = lesson.redraw;
  },
};
