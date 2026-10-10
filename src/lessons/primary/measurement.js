// Primary: measuring length with a ruler in centimetres and millimetres.
import { colors, setupCanvas, runLesson, text, line, canvasPoint, ease, clamp } from '../../lib/stage.js';

const RULER_CM = 15;
const MOVE = 1.2;
const HOLD = 1.8;

export const measurement = {
  id: 'measurement',
  title: 'Measurement',
  level: 'Primary · Grades 1–5',
  heading: 'Measure with a ruler',
  canvasLabel: 'A pencil lying above a ruler marked in centimetres and millimetres',
  intro: 'Each numbered mark on a ruler is 1 <b class="c-a">centimetre</b> (cm). Each centimetre is split into 10 tiny <b class="c-b">millimetres</b> (mm). If the pencil doesn\'t start at 0, subtract: length = end − start.',
  tips: [
    'Drag the pencil\'s tip to make it exactly 8 cm long.',
    'Untick "Start at 0" and slide the pencil along. Does its length change?',
    'How many millimetres are in 5 cm?',
  ],
  formula: 'length = end − start   ·   1 cm = 10 mm',
  controls: `<label class="check"><input type="checkbox" id="meas-zero" checked /> Start at 0</label>`,
  readouts: [
    ['meas-start', 'Starts at'],
    ['meas-end', 'Ends at'],
    ['meas-len', 'Length', 'c-a'],
    ['meas-mm', 'In millimetres', 'c-b'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const zeroInput = section.querySelector('#meas-zero');
    const out = ['start', 'end', 'len', 'mm'].map((k) => section.querySelector(`#meas-${k}`));
    const view = setupCanvas(canvas);
    // Lengths in millimetres.
    let start = 0;
    let len = 74;
    let from = { start, len };
    let to = { start, len };
    let clock = 0;
    let drag = null;

    const layout = () => {
      const pad = Math.max(22, view.w * 0.04);
      const scale = (view.w - 2 * pad) / (RULER_CM * 10); // px per mm
      return { pad, scale, rulerY: view.h * 0.56, pencilY: view.h * 0.3 };
    };

    const pickTarget = () => {
      const s = zeroInput.checked ? 0 : 10 * Math.floor(Math.random() * 5);
      const l = 20 + Math.floor(Math.random() * (RULER_CM * 10 - s - 30));
      return { start: s, len: l };
    };

    const step = (dt) => {
      clock += dt;
      if (clock < MOVE) {
        const t = ease(clock / MOVE);
        start = Math.round(from.start + (to.start - from.start) * t);
        len = Math.round(from.len + (to.len - from.len) * t);
      } else if (clock > MOVE + HOLD) {
        from = { start, len };
        to = pickTarget();
        clock = 0;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { pad, scale, rulerY, pencilY } = layout();
      const X = (mm) => pad + mm * scale;
      ctx.clearRect(0, 0, w, h);

      // Ruler
      const rh = Math.min(70, h * 0.2);
      ctx.fillStyle = colors.yellow;
      ctx.fillRect(pad - 12, rulerY, (RULER_CM * 10) * scale + 24, rh);
      for (let mm = 0; mm <= RULER_CM * 10; mm++) {
        const cm = mm % 10 === 0;
        const half = mm % 5 === 0;
        const len = cm ? rh * 0.45 : half ? rh * 0.3 : rh * 0.17;
        if (!cm && scale < 2.2 && !half) continue;
        line(ctx, X(mm), rulerY, X(mm), rulerY + len, '#0a0a0a', cm ? 1.6 : 1);
        if (cm) text(ctx, String(mm / 10), X(mm), rulerY + rh * 0.68, { color: '#0a0a0a', size: 12, weight: 700 });
      }
      text(ctx, 'numbers = cm · small marks = mm', pad - 12, rulerY + rh + 18, { size: 12, align: 'left' });

      // Guides from the pencil ends down to the ruler
      line(ctx, X(start), pencilY, X(start), rulerY, colors.soft, 1, [4, 4]);
      line(ctx, X(start + len), pencilY, X(start + len), rulerY, colors.soft, 1, [4, 4]);

      // Pencil: eraser, body, wood, graphite tip
      const ph = Math.min(26, h * 0.08);
      const x0 = X(start);
      const x1 = X(start + len);
      const tip = Math.min(ph * 1.4, (x1 - x0) * 0.3);
      const eraser = Math.min(ph * 0.8, (x1 - x0) * 0.15);
      ctx.fillStyle = '#f2a7b8';
      ctx.fillRect(x0, pencilY - ph / 2, eraser, ph);
      ctx.fillStyle = colors.orange;
      ctx.fillRect(x0 + eraser, pencilY - ph / 2, x1 - x0 - eraser - tip, ph);
      ctx.fillStyle = '#e8c9a0';
      ctx.beginPath();
      ctx.moveTo(x1 - tip, pencilY - ph / 2);
      ctx.lineTo(x1, pencilY);
      ctx.lineTo(x1 - tip, pencilY + ph / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(x1 - tip * 0.35, pencilY - ph * 0.175);
      ctx.lineTo(x1, pencilY);
      ctx.lineTo(x1 - tip * 0.35, pencilY + ph * 0.175);
      ctx.closePath();
      ctx.fill();

      // Length bracket
      const by = pencilY - ph / 2 - 16;
      line(ctx, x0, by, x1, by, colors.text, 1.5);
      line(ctx, x0, by - 5, x0, by + 5, colors.text, 1.5);
      line(ctx, x1, by - 5, x1, by + 5, colors.text, 1.5);
      text(ctx, cmText(len), (x0 + x1) / 2, by - 14, { color: colors.text, size: 15, weight: 700 });

      text(ctx, 'Drag the pencil or its tip', w / 2, h - 16, { size: 12 });

      out[0].value = cmText(start, true);
      out[1].value = cmText(start + len, true);
      out[2].value = cmText(len);
      out[3].value = `${len} mm`;
    };

    const lesson = runLesson(section, { step, draw });

    canvas.addEventListener('pointerdown', (e) => {
      const { pad, scale, pencilY } = layout();
      const p = canvasPoint(canvas, e);
      const mm = (p.x - pad) / scale;
      if (Math.abs(p.y - pencilY) > 30) return;
      if (Math.abs(mm - (start + len)) * scale < 22) drag = { type: 'tip' };
      else if (mm > start && mm < start + len && !zeroInput.checked) drag = { type: 'move', offset: mm - start };
      else return;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const { pad, scale } = layout();
      const mm = Math.round((canvasPoint(canvas, e).x - pad) / scale);
      if (drag.type === 'tip') len = clamp(mm - start, 10, RULER_CM * 10 - start);
      else start = clamp(Math.round(mm - drag.offset), 0, RULER_CM * 10 - len);
      from = to = { start, len };
      lesson.redraw();
    });
    const end = () => (drag = null);
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    zeroInput.addEventListener('change', () => {
      if (zeroInput.checked) start = 0;
      from = to = { start, len };
      clock = MOVE;
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};

function cmText(mm, short = false) {
  const cm = Math.floor(mm / 10);
  const rest = mm % 10;
  if (short) return `${(mm / 10).toFixed(1).replace(/\.0$/, '')} cm`;
  if (rest === 0) return `${cm} cm`;
  return `${cm} cm ${rest} mm`;
}
