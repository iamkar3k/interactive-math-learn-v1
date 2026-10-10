// Primary: multiplication as an array of dots, skip counted by rows,
// then turned a quarter turn to show r × c = c × r.
import { colors, setupCanvas, runLesson, text, dot, ease } from '../../lib/stage.js';

const BEAT = 0.6;
const TURN = 1.3;

export const multiplication = {
  id: 'multiplication',
  title: 'Multiplication arrays',
  level: 'Primary · Grades 1–5',
  heading: 'Rows times columns',
  canvasLabel: 'An array of dots counted row by row and then turned',
  intro: 'Multiplication is a quick way to count equal groups. Put the dots in rows. The number of rows × the number of dots in each row gives the total. Then turn the array on its side: the total stays the same, so <b class="c-a">3 × 4</b> = <b class="c-b">4 × 3</b>.',
  tips: [
    'Skip count along with the rows: 4, 8, 12…',
    'Watch the array turn. Did any dots appear or disappear?',
    'Find two different arrays that both make 12.',
  ],
  formula: 'rows × columns = total',
  controls: `
    <label>Rows <input type="range" id="mul-r" min="1" max="10" step="1" value="3" /></label>
    <label>Columns <input type="range" id="mul-c" min="1" max="10" step="1" value="4" /></label>`,
  readouts: [
    ['mul-rows', 'Rows', 'c-a'],
    ['mul-cols', 'Columns', 'c-b'],
    ['mul-rc', 'Rows × Columns'],
    ['mul-cr', 'Columns × Rows'],
  ],

  init(section) {
    const canvas = section.querySelector('canvas');
    const rInput = section.querySelector('#mul-r');
    const cInput = section.querySelector('#mul-c');
    const out = ['rows', 'cols', 'rc', 'cr'].map((k) => section.querySelector(`#mul-${k}`));
    const view = setupCanvas(canvas);
    let clock = 0;

    // Timeline: count rows → turn → count again → turn back.
    const timeline = (r, c) => {
      const countA = r * BEAT + 1;
      const countB = c * BEAT + 1.2;
      return { countA, countB, total: countA + TURN + countB + TURN };
    };

    const state = (r, c) => {
      const tl = timeline(r, c);
      let t = clock % tl.total;
      if (t < tl.countA) return { angle: 0, lit: Math.min(r, Math.floor(t / BEAT) + 1), turned: false };
      t -= tl.countA;
      if (t < TURN) return { angle: ease(t / TURN) * Math.PI / 2, lit: 0, turned: false };
      t -= TURN;
      if (t < tl.countB) return { angle: Math.PI / 2, lit: Math.min(c, Math.floor(t / BEAT) + 1), turned: true };
      t -= tl.countB;
      return { angle: (1 - ease(t / TURN)) * Math.PI / 2, lit: 0, turned: false };
    };

    const step = (dt) => {
      clock += dt;
    };

    const draw = () => {
      const { ctx, w, h } = view;
      const r = Number(rInput.value);
      const c = Number(cInput.value);
      const s = state(r, c);
      ctx.clearRect(0, 0, w, h);

      const area = Math.min(w * 0.9, h - 100);
      const gap = area / Math.max(r, c, 4);
      const radius = Math.min(gap * 0.32, 14);
      const cx = w / 2;
      const cy = 64 + (h - 64) / 2;
      const cos = Math.cos(s.angle);
      const sin = Math.sin(s.angle);

      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          const x = (j - (c - 1) / 2) * gap;
          const y = (i - (r - 1) / 2) * gap;
          const px = cx + x * cos - y * sin;
          const py = cy + x * sin + y * cos;
          const lit = s.turned ? j < s.lit : i < s.lit;
          const color = lit ? (s.turned ? colors.orange : colors.yellow) : '#3a3a36';
          dot(ctx, px, py, radius, color);
        }
      }

      // Skip-count caption
      const groups = s.turned ? c : r;
      const per = s.turned ? r : c;
      if (s.lit > 0) {
        const counts = Array.from({ length: s.lit }, (_, k) => (k + 1) * per).join(', ');
        const label = `${groups} ${groups === 1 ? 'row' : 'rows'} of ${per}: ${counts}`;
        text(ctx, label, w / 2, 24, { color: s.turned ? colors.orange : colors.yellow, size: 15, weight: 600 });
        const finished = s.lit === groups;
        text(ctx, finished ? `${groups} × ${per} = ${r * c}` : `${groups} × ${per} = ?`, w / 2, 50, { color: colors.text, size: 22, weight: 700, mono: true });
      } else {
        text(ctx, 'Turning the array…', w / 2, 24, { size: 15 });
        text(ctx, `${r} × ${c} = ${c} × ${r}`, w / 2, 50, { color: colors.text, size: 22, weight: 700, mono: true });
      }

      out[0].value = r;
      out[1].value = c;
      out[2].value = `${r} × ${c} = ${r * c}`;
      out[3].value = `${c} × ${r} = ${r * c}`;
    };

    const lesson = runLesson(section, { step, draw });
    const reset = () => {
      clock = 0;
      lesson.redraw();
    };
    rInput.addEventListener('input', reset);
    cInput.addEventListener('input', reset);
    view.onResize = lesson.redraw;
  },
};
