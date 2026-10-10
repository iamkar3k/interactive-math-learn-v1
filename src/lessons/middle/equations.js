// Middle school: solving a·x + b = c on a balance scale.
import { colors, setupCanvas, runLesson, text, line, dot } from '../../lib/stage.js';

const STEPS = [
  'The scale balances: both sides weigh the same.',
  'Take the same number of 1s off both sides.',
  'Share both sides into equal groups, one per x.',
  'One x balances one group, so we know x.',
];
const STEP_TIME = 2.6;

export const equations = {
  id: 'equations',
  title: 'Solving equations',
  level: 'Middle school · Grades 6–8',
  heading: 'Keep it balanced',
  canvasLabel: 'A balance scale with x boxes and unit weights solving an equation',
  intro: 'An equation is a balanced scale: the left side weighs the same as the right. You can do anything you like to it, as long as you do the <b class="c-a">same thing to both sides</b>. Take away the loose 1s, then share what is left equally between the <b class="c-b">x</b> boxes.',
  tips: [
    'Use "Next step" to go one move at a time.',
    'Why do we take the 1s away before sharing into groups?',
    'Check the answer: put x back into the equation. Does it balance?',
  ],
  formula: 'a·x + b = c  →  a·x = c − b  →  x = (c − b) ÷ a',
  controls: `
    <button type="button" class="btn-small" id="eq-next">Next step</button>
    <button type="button" class="btn-small" id="eq-new">New equation</button>`,
  readouts: [
    ['eq-eq', 'Equation'],
    ['eq-step', 'Step'],
    ['eq-now', 'Now'],
    ['eq-x', 'x', 'c-a'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const nextBtn = section.querySelector('#eq-next');
    const newBtn = section.querySelector('#eq-new');
    const out = ['eq', 'step', 'now', 'x'].map((k) => section.querySelector(`#eq-${k}`));
    const view = setupCanvas(canvas);
    let a = 2;
    let x = 4;
    let b = 3;
    let stage = 0;
    let timer = 0;

    const newEquation = () => {
      a = 1 + Math.floor(Math.random() * 3);
      x = 1 + Math.floor(Math.random() * 6);
      b = 1 + Math.floor(Math.random() * 6);
      stage = 0;
      timer = 0;
    };

    const step = (dt) => {
      timer += dt;
      if (timer < STEP_TIME + (stage === 3 ? 1.5 : 0)) return;
      timer = 0;
      if (stage === 3) newEquation();
      else stage++;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const c = a * x + b;
      const fade = stage === 1 ? Math.max(0, 1 - timer / 1.2) : stage >= 2 ? 0 : 1;
      ctx.clearRect(0, 0, w, h);

      // Scale
      const cx = w / 2;
      const beamY = h * 0.36;
      const panW = Math.min(w * 0.42, 300);
      const panY = h - 40;
      ctx.fillStyle = '#2a2a26';
      ctx.beginPath();
      ctx.moveTo(cx, beamY);
      ctx.lineTo(cx - 18, panY + 14);
      ctx.lineTo(cx + 18, panY + 14);
      ctx.closePath();
      ctx.fill();
      line(ctx, cx - panW - 12, beamY, cx + panW + 12, beamY, colors.muted, 4);
      dot(ctx, cx, beamY, 6, colors.text);
      const lx = cx - panW / 2 - 18;
      const rx = cx + panW / 2 + 18;
      for (const px of [lx, rx]) {
        line(ctx, px, beamY, px, panY - 4, colors.axis, 1.5);
        line(ctx, px - panW / 2, panY, px + panW / 2, panY, colors.text, 3);
      }

      // Item layout: fills upward from the pan.
      const size = Math.min(26, (panY - beamY - 30) / 6, panW / 9);
      const place = (px, i, perRow) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        return [px - ((perRow - 1) * size * 1.2) / 2 + col * size * 1.2, panY - size * 0.7 - row * size * 1.2];
      };
      const perRow = Math.max(1, Math.floor((panW - 10) / (size * 1.2)));

      // Left: a boxes of x, then b ones
      for (let i = 0; i < a; i++) {
        const [px, py] = place(lx, i, perRow);
        ctx.fillStyle = colors.yellow;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
        text(ctx, stage === 3 ? String(x) : 'x', px, py + 1, { color: '#0a0a0a', size: size * 0.55, weight: 700 });
      }
      ctx.globalAlpha = fade;
      for (let i = 0; i < b; i++) {
        const [px, py] = place(lx, a + i, perRow);
        dot(ctx, px, py, size * 0.4, colors.orange);
      }
      ctx.globalAlpha = 1;

      // Right: c ones; the last b fade out, the rest form a groups.
      for (let i = 0; i < c; i++) {
        const removed = i >= c - b;
        if (removed && fade === 0) continue;
        const [px, py] = place(rx, i, perRow);
        ctx.globalAlpha = removed ? fade : 1;
        const group = Math.floor(i / x);
        const color = stage >= 2 && !removed ? (group % 2 ? colors.soft : colors.orange) : colors.orange;
        dot(ctx, px, py, size * 0.4, color);
        ctx.globalAlpha = 1;
      }

      // Equation text for this stage
      const eqs = [
        `${a === 1 ? '' : a}x + ${b} = ${c}`,
        `${a === 1 ? '' : a}x + ${b} − ${b} = ${c} − ${b}`,
        `${a === 1 ? '' : a}x = ${c - b}${a > 1 ? `   →   x = ${c - b} ÷ ${a}` : ''}`,
        `x = ${x}`,
      ];
      text(ctx, eqs[stage], w / 2, 26, { color: colors.text, size: 22, weight: 700, mono: true });
      text(ctx, STEPS[stage], w / 2, 56, { color: colors.yellow, size: 14, weight: 600 });

      out[0].value = eqs[0];
      out[1].value = `${stage + 1} of 4`;
      out[2].value = eqs[stage];
      out[3].value = stage === 3 ? x : '?';
    };

    const lesson = runLesson(section, { step, draw });
    nextBtn.addEventListener('click', () => {
      lesson.pause();
      if (stage === 3) newEquation();
      else stage++;
      timer = 2; // finish any fade straight away
      lesson.redraw();
    });
    newBtn.addEventListener('click', () => {
      newEquation();
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};
