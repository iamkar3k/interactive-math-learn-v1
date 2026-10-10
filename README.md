# interactive-math-learn-v1

Learn maths through interactive visuals. **MathMotion** has a topic picker covering primary school (grades 1–5), middle school (6–8) and high school (9–12), filterable by level and searchable. All 23 topics have an interactive lesson on its own page (`lesson.html?id=…`):

- **Primary:** counting & place value, addition & subtraction, multiplication arrays, fractions, shapes & symmetry, telling time, measurement.
- **Middle school:** negative numbers, ratios & proportions, area & perimeter, angles, solving equations, coordinate plane, probability, Pythagoras' theorem.
- **High school:** linear functions, quadratics, trigonometry & sine waves, circle theorems, vectors, statistics, exponential growth, calculus (area under a curve).

Built with [Vite](https://vite.dev) and plain JavaScript using the Canvas 2D API. The theme is black and yellow.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). Pull requests run the build only. One-time setup: in the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.

The site is served at `https://iamkar3k.github.io/interactive-math-learn-v1/`.

## Project structure

```
index.html              Home page: hero and topic picker
lesson.html             Page that shows one lesson, chosen by ?id=
vite.config.js          Vite config (relative base for GitHub Pages, two pages)
src/main.js             Home page entry, mounts the topic picker
src/lesson-page.js      Renders a lesson page from its definition
src/topics.js           Topic catalog; `lesson` links a topic to its page
src/catalog.js          Renders the level filters, search box and topic cards
src/style.css           Black & yellow theme
src/lib/stage.js        Shared canvas helpers (HiDPI sizing, play/pause loop, drawing)
src/lessons/index.js    Every lesson, in previous/next order
src/lessons/primary/    Primary-school lessons
src/lessons/middle/     Middle-school lessons
src/lessons/secondary/  High-school lessons (graph.js is a shared x–y grid)
```

### Adding a lesson

Create a module in `src/lessons/<level>/` that exports an object with `id`, `title`, `level`, `heading`, `intro`, `tips`, `formula`, `controls` (HTML), `readouts` and an `init(section)` function. Add it to `src/lessons/index.js` and point its topic in `src/topics.js` at `lesson.html?id=<id>`.

Animations pause when they scroll off screen. If the visitor has reduced motion turned on, they start paused.

Developed by [iamkar3k](https://github.com/iamkar3k).
