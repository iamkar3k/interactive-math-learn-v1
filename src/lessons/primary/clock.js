// Primary: reading an analogue clock.
import { colors, TAU, setupCanvas, runLesson, text, dot, canvasPoint } from '../../lib/stage.js';

const NAMES = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

export const clock = {
  id: 'clock',
  title: 'Telling time',
  level: 'Primary · Grades 1–5',
  heading: 'Read the clock',
  canvasLabel: 'An analogue clock with draggable hands and a digital readout',
  intro: 'The short <b class="c-a">hour hand</b> shows the hour. The long <b class="c-b">minute hand</b> goes all the way round once every hour, and each number it passes is 5 more minutes. Drag the minute hand and watch the hour hand creep along with it.',
  tips: [
    'Drag the minute hand to the 3. That\'s 15 minutes, or quarter past.',
    'Where is the hour hand at half past 4? It sits halfway between 4 and 5.',
    'Make the clock show 7:45. What is another way to say that time?',
  ],
  formula: 'minutes = number the minute hand points to × 5',
  controls: `
    <label>Speed
      <select id="clock-speed">
        <option value="1">1 minute / second</option>
        <option value="5" selected>5 minutes / second</option>
        <option value="30">30 minutes / second</option>
      </select>
    </label>`,
  readouts: [
    ['clock-digital', 'Digital time', 'c-a'],
    ['clock-words', 'In words'],
    ['clock-hour', 'Hour hand'],
    ['clock-min', 'Minute hand'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const speedInput = section.querySelector('#clock-speed');
    const out = ['digital', 'words', 'hour', 'min'].map((k) => section.querySelector(`#clock-${k}`));
    const view = setupCanvas(canvas);
    let minutes = 3 * 60 + 10; // 0–720, minutes after 12:00
    let dragging = false;

    const layout = () => {
      const R = Math.min(view.h * 0.42, view.w * 0.26);
      return { R, cx: R + Math.max(28, view.w * 0.08), cy: view.h / 2 };
    };

    const step = (dt) => {
      minutes = (minutes + dt * Number(speedInput.value)) % 720;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const { R, cx, cy } = layout();
      const total = Math.floor(minutes);
      const hour = Math.floor(total / 60) % 12 || 12;
      const min = total % 60;
      ctx.clearRect(0, 0, w, h);

      // Face
      dot(ctx, cx, cy, R + 6, '#1d1d1b');
      ctx.strokeStyle = colors.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 6, 0, TAU);
      ctx.stroke();
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * TAU - Math.PI / 2;
        const big = i % 5 === 0;
        const r1 = R - (big ? 12 : 6);
        ctx.strokeStyle = big ? colors.text : colors.axis;
        ctx.lineWidth = big ? 2.5 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }
      for (let n = 1; n <= 12; n++) {
        const a = (n / 12) * TAU - Math.PI / 2;
        text(ctx, String(n), cx + Math.cos(a) * (R - 28), cy + Math.sin(a) * (R - 28), { color: colors.text, size: Math.max(13, R * 0.13), weight: 600 });
        if (R > 110) text(ctx, String(n * 5 % 60).padStart(2, '0'), cx + Math.cos(a) * (R + 20), cy + Math.sin(a) * (R + 20), { size: 10 });
      }

      // Hands
      const hand = (angle, length, width, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
        ctx.stroke();
        ctx.lineCap = 'butt';
      };
      const hourAngle = (minutes / 720) * TAU - Math.PI / 2;
      const minAngle = ((minutes % 60) / 60) * TAU - Math.PI / 2;
      hand(hourAngle, R * 0.5, 8, colors.yellow);
      hand(minAngle, R * 0.82, 5, colors.orange);
      dot(ctx, cx + Math.cos(minAngle) * R * 0.82, cy + Math.sin(minAngle) * R * 0.82, 8, 'rgba(255, 159, 28, 0.35)');
      dot(ctx, cx, cy, 7, colors.text);

      // Digital readout
      const tx = cx + R + (w - cx - R) / 2;
      const digital = `${hour}:${String(min).padStart(2, '0')}`;
      const side = w - cx - R;
      if (side > 100) {
        text(ctx, digital, tx, cy - 18, { color: colors.text, size: Math.min(52, side * 0.3), weight: 700, mono: true });
        // Words only when they fit; the readout below always shows them.
        if (side > 230) text(ctx, words(hour, min), tx, cy + 26, { color: colors.yellow, size: 15, weight: 600 });
        if (side > 170) text(ctx, 'Drag the minute hand', tx, h - 18, { size: 12 });
      }

      const nextHour = hour % 12 + 1;
      out[0].value = digital;
      out[1].value = words(hour, min);
      out[2].value = min === 0 ? `on ${hour}` : `between ${hour} and ${nextHour}`;
      out[3].value = `${min} min`;
    };

    const lesson = runLesson(section, { step, draw });

    const setFromPointer = (e) => {
      const { cx, cy } = layout();
      const p = canvasPoint(canvas, e);
      const angle = Math.atan2(p.y - cy, p.x - cx) + Math.PI / 2;
      const target = Math.round((((angle / TAU) * 60) % 60 + 60) % 60) % 60;
      let delta = target - (Math.floor(minutes) % 60);
      if (delta > 30) delta -= 60;
      if (delta < -30) delta += 60;
      minutes = (Math.floor(minutes) + delta + 720) % 720;
      lesson.redraw();
    };
    canvas.addEventListener('pointerdown', (e) => {
      const { R, cx, cy } = layout();
      const p = canvasPoint(canvas, e);
      if (Math.hypot(p.x - cx, p.y - cy) > R + 20) return;
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
      lesson.pause();
      setFromPointer(e);
    });
    canvas.addEventListener('pointermove', (e) => dragging && setFromPointer(e));
    canvas.addEventListener('pointerup', () => (dragging = false));
    canvas.addEventListener('pointercancel', () => (dragging = false));
    speedInput.addEventListener('change', lesson.redraw);
    view.onResize = lesson.redraw;
  },
};

function words(hour, min) {
  const next = hour % 12 + 1;
  const name = (h) => NAMES[h % 12];
  if (min === 0) return `${name(hour)} o’clock`;
  if (min === 15) return `quarter past ${name(hour)}`;
  if (min === 30) return `half past ${name(hour)}`;
  if (min === 45) return `quarter to ${name(next)}`;
  if (min < 30) return `${min} minute${min === 1 ? '' : 's'} past ${name(hour)}`;
  const left = 60 - min;
  return `${left} minute${left === 1 ? '' : 's'} to ${name(next)}`;
}
