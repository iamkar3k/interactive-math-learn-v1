// Renders the topic picker: level filter chips, search box and topic cards.
import { LEVELS, TOPICS } from './topics.js';

export function initCatalog(section) {
  const levelsEl = section.querySelector('#topic-levels');
  const grid = section.querySelector('#topic-grid');
  const search = section.querySelector('#topic-search');
  const empty = section.querySelector('#topic-empty');
  let level = 'all';

  const levelLabel = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

  levelsEl.innerHTML = LEVELS.map((l) => {
    const count = l.id === 'all' ? TOPICS.length : TOPICS.filter((t) => t.level === l.id).length;
    return `<button type="button" data-level="${l.id}" aria-pressed="${l.id === level}">
      ${l.label}${l.grades ? ` <small>${l.grades}</small>` : ''} <span class="count">${count}</span>
    </button>`;
  }).join('');

  grid.innerHTML = TOPICS.map((t, i) => {
    const info = levelLabel[t.level];
    const tag = t.lesson ? 'a' : 'div';
    const attrs = t.lesson ? `href="${t.lesson}"` : 'aria-disabled="true"';
    return `<${tag} class="topic ${t.lesson ? 'live' : 'soon'}" data-i="${i}" data-level="${t.level}" ${attrs}>
      <span class="glyph" aria-hidden="true">${t.glyph}</span>
      <span class="topic-level">${info.label} · ${info.grades}</span>
      <h3>${t.title}</h3>
      <p>${t.blurb}</p>
      <span class="status">${t.lesson ? 'Play now →' : 'Coming soon'}</span>
    </${tag}>`;
  }).join('');

  const cards = [...grid.children];

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    cards.forEach((card) => {
      const t = TOPICS[card.dataset.i];
      const match = (level === 'all' || t.level === level) && (!q || `${t.title} ${t.blurb}`.toLowerCase().includes(q));
      card.hidden = !match;
      if (match) shown++;
    });
    empty.hidden = shown > 0;
    levelsEl.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === level)));
  };

  levelsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-level]');
    if (!btn) return;
    level = btn.dataset.level;
    apply();
  });
  search.addEventListener('input', apply);
  apply();
}
