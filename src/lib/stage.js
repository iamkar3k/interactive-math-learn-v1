// Shared helpers for the canvas lessons: palette, HiDPI canvas sizing and a play/pause loop.

export const colors = {
  bg: '#0a0a0a',
  grid: '#222222',
  axis: '#5a5a55',
  text: '#f5f5ef',
  muted: '#a3a39a',
  yellow: '#ffd60a',
  orange: '#ff9f1c',
  soft: '#fff3b0',
  shape: '#262626',
  shapeEdge: '#4a4a44',
};

export const TAU = Math.PI * 2;

export function setupCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { ctx, w: 0, h: 0, onResize: null };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    view.w = rect.width;
    view.h = rect.height;
    view.onResize?.();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  return view;
}

// Runs step(dt) + draw() while the lesson is playing and on screen.
// Call redraw() after user input so a paused lesson still updates.
export function runLesson(section, { step, draw }) {
  const button = section.querySelector('[data-action="play"]');
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false;
  let raf = 0;
  let last = 0;

  const syncButton = () => {
    button.textContent = playing ? '❚❚' : '▶';
    button.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
  };

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (playing) step(dt);
    draw();
    raf = playing && visible ? requestAnimationFrame(frame) : 0;
  };

  const redraw = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const setPlaying = (value) => {
    playing = value;
    syncButton();
    redraw();
  };

  button.addEventListener('click', () => setPlaying(!playing));
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) redraw();
  }).observe(section);

  syncButton();
  return {
    redraw,
    pause: () => setPlaying(false),
    get playing() {
      return playing;
    },
  };
}

export function text(ctx, str, x, y, { color = colors.muted, size = 12, align = 'center', baseline = 'middle', weight = 500, mono = false } = {}) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${mono ? '"JetBrains Mono", monospace' : 'Inter, system-ui, sans-serif'}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

export function line(ctx, x1, y1, x2, y2, color, width = 1, dash = []) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function dot(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

export function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
