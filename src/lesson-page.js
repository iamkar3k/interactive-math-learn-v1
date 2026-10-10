// Renders one lesson on lesson.html, chosen by ?id=<lesson id>.
import './style.css';
import { LESSONS } from './lessons/primary/index.js';

const root = document.querySelector('#lesson-root');
const id = new URLSearchParams(location.search).get('id');
const index = LESSONS.findIndex((l) => l.id === id);
const lesson = LESSONS[index];

if (!lesson) {
  root.innerHTML = `<section class="lesson-missing">
    <h1>Lesson not found</h1>
    <p>That lesson doesn't exist yet.</p>
    <a class="btn btn-primary" href="./#topics">Browse all topics</a>
  </section>`;
} else {
  document.title = `${lesson.title} · MathMotion`;
  const prev = LESSONS[index - 1];
  const next = LESSONS[index + 1];
  const link = (l, dir) =>
    l ? `<a class="lesson-link ${dir}" href="lesson.html?id=${l.id}"><small>${dir === 'prev' ? '← Previous' : 'Next →'}</small>${l.title}</a>` : '<span></span>';

  root.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="./#topics">Topics</a> / <span>${lesson.level}</span></nav>
    <section class="lesson lesson-page" data-lesson="${lesson.id}">
      <div class="lesson-text">
        <p class="tag">${lesson.level}</p>
        <h1>${lesson.heading}</h1>
        <p>${lesson.intro}</p>
        <ul class="tips">${lesson.tips.map((t) => `<li>${t}</li>`).join('')}</ul>
        <div class="formula">${lesson.formula}</div>
      </div>
      <div class="lesson-stage">
        <canvas id="${lesson.id}-canvas" aria-label="${lesson.canvasLabel}"></canvas>
        <div class="controls">
          <button class="play" data-action="play" aria-label="Pause">❚❚</button>
          ${lesson.controls}
        </div>
        <div class="readouts">
          ${lesson.readouts.map(([rid, label, cls]) => `<div><span${cls ? ` class="${cls}"` : ''}>${label}</span><output id="${rid}"></output></div>`).join('')}
        </div>
      </div>
    </section>
    <nav class="lesson-nav" aria-label="More lessons">${link(prev, 'prev')}${link(next, 'next')}</nav>`;

  lesson.init(root.querySelector('.lesson'));
}
