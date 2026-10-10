// Middle school: experimental vs theoretical probability with coins and dice.
import { colors, setupCanvas, runLesson, text, line } from '../../lib/stage.js';

const roll = () => 1 + Math.floor(Math.random() * 6);
const EXPERIMENTS = {
  coin: { label: 'Flip a coin', outcomes: ['Heads', 'Tails'], p: [1 / 2, 1 / 2], run: () => (Math.random() < 0.5 ? 0 : 1), watch: 0 },
  die: { label: 'Roll a die', outcomes: ['1', '2', '3', '4', '5', '6'], p: Array(6).fill(1 / 6), run: () => roll() - 1, watch: 5 },
  two: {
    label: 'Add two dice',
    outcomes: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    p: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((n) => n / 36),
    run: () => roll() + roll() - 2,
    watch: 5,
  },
};

export const probability = {
  id: 'probability',
  title: 'Probability',
  level: 'Middle school · Grades 6–8',
  heading: 'Chance settles down',
  canvasLabel: 'Bar chart of coin or dice results compared with the expected probabilities',
  intro: 'Probability says how likely something is, from 0 (impossible) to 1 (certain). A fair coin lands heads with probability ½. Over a few flips anything can happen, but after <b class="c-a">many trials</b> the share of each result gets close to its <b class="c-b">theoretical probability</b> (the dashed lines).',
  tips: [
    'Reset, then watch the first 10 trials. Are the bars even?',
    'Let it run to 1,000 trials. How close do the bars get to the dashed lines?',
    'Add two dice: why is 7 the most likely total?',
  ],
  formula: 'P(event) = favourable outcomes ÷ all outcomes',
  controls: `
    <label>Experiment
      <select id="pr-exp">${Object.entries(EXPERIMENTS).map(([k, e]) => `<option value="${k}">${e.label}</option>`).join('')}</select>
    </label>
    <label>Speed
      <select id="pr-speed"><option value="4">Slow</option><option value="40" selected>Fast</option><option value="400">Very fast</option></select>
    </label>
    <button type="button" class="btn-small" id="pr-reset">Reset</button>`,
  readouts: [
    ['pr-n', 'Trials'],
    ['pr-last', 'Last result'],
    ['pr-exp-p', 'Experimental', 'c-a'],
    ['pr-th-p', 'Theoretical', 'c-b'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const expInput = section.querySelector('#pr-exp');
    const speedInput = section.querySelector('#pr-speed');
    const resetBtn = section.querySelector('#pr-reset');
    const out = ['n', 'last', 'exp-p', 'th-p'].map((k) => section.querySelector(`#pr-${k}`));
    const view = setupCanvas(canvas);
    let counts = [];
    let trials = 0;
    let last = null;
    let budget = 0;

    const reset = () => {
      counts = Array(EXPERIMENTS[expInput.value].outcomes.length).fill(0);
      trials = 0;
      last = null;
      budget = 0;
    };
    reset();

    const step = (dt) => {
      const exp = EXPERIMENTS[expInput.value];
      budget += dt * Number(speedInput.value);
      while (budget >= 1 && trials < 100000) {
        last = exp.run();
        counts[last]++;
        trials++;
        budget--;
      }
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const exp = EXPERIMENTS[expInput.value];
      ctx.clearRect(0, 0, w, h);

      const pad = { l: 46, r: 16, t: 44, b: 34 };
      const n = exp.outcomes.length;
      const maxP = Math.max(...exp.p) * 1.6;
      const slot = (w - pad.l - pad.r) / n;
      const Y = (p) => h - pad.b - (p / maxP) * (h - pad.t - pad.b);

      for (let k = 0; k <= 4; k++) {
        const p = (maxP * k) / 4;
        line(ctx, pad.l, Y(p), w - pad.r, Y(p), colors.grid);
        text(ctx, p.toFixed(2), pad.l - 8, Y(p), { size: 10, align: 'right' });
      }

      exp.outcomes.forEach((label, i) => {
        const x = pad.l + i * slot + slot * 0.18;
        const bw = slot * 0.64;
        const share = trials ? counts[i] / trials : 0;
        ctx.fillStyle = i === last ? colors.text : i === exp.watch ? colors.yellow : 'rgba(255, 214, 10, 0.55)';
        ctx.fillRect(x, Y(Math.min(share, maxP)), bw, h - pad.b - Y(Math.min(share, maxP)));
        line(ctx, x - 3, Y(exp.p[i]), x + bw + 3, Y(exp.p[i]), colors.orange, 2, [5, 3]);
        text(ctx, label, x + bw / 2, h - pad.b + 14, { size: n > 6 ? 10 : 12, color: i === exp.watch ? colors.yellow : colors.muted });
        if (slot > 40) text(ctx, String(counts[i]), x + bw / 2, Y(Math.min(share, maxP)) - 10, { size: 10, color: colors.muted });
      });

      text(ctx, `${trials.toLocaleString()} trials`, pad.l, 20, { align: 'left', color: colors.text, size: 15, weight: 700 });
      if (w >= 480) text(ctx, 'bars = experimental   - - - = theoretical', w - pad.r, 20, { align: 'right', size: 11 });

      const watch = exp.watch;
      out[0].value = trials.toLocaleString();
      out[1].value = last === null ? '—' : exp.outcomes[last];
      out[2].value = `P(${exp.outcomes[watch]}) ≈ ${trials ? (counts[watch] / trials).toFixed(3) : '—'}`;
      out[3].value = `P(${exp.outcomes[watch]}) = ${exp.p[watch].toFixed(3)}`;
    };

    const lesson = runLesson(section, { step, draw });
    expInput.addEventListener('change', () => {
      reset();
      lesson.redraw();
    });
    resetBtn.addEventListener('click', () => {
      reset();
      lesson.redraw();
    });
    view.onResize = lesson.redraw;
  },
};
