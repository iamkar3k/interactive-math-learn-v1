# interactive-math-learn-v1

Learn maths through interactive visuals. **MathMotion** is a landing page with a topic picker covering primary school (grades 1–5), middle school (6–8) and high school (9–12), filterable by level and searchable. Ten topics have interactive lessons today. The seven primary-school lessons each have their own page (`lesson.html?id=…`): counting & place value, addition & subtraction, multiplication arrays, fractions, shapes & symmetry, telling time and measurement. The three on the home page are:

1. **Trigonometry: where sine waves come from.** A point on the unit circle traces sin θ and cos θ. Drag the point to set the angle.
2. **Calculus: Riemann sums.** Rectangles fill the area under a curve, and the error shrinks as the count grows. Switch between left, midpoint and right sums and between three curves.
3. **Geometry: a proof of Pythagoras by rearrangement.** Four triangles slide inside a square of side a + b, and the empty area c² becomes a² + b².

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
index.html              Landing page markup
lesson.html             Page that shows one lesson, chosen by ?id=
src/lesson-page.js      Renders a lesson page from its definition
src/lessons/primary/    Primary-school lessons (index.js lists them in order)
vite.config.js          Vite config (relative base for GitHub Pages)
src/main.js             Entry point, mounts the topic picker and the three lessons
src/topics.js           Topic catalog (add topics here; `lesson` links one to its interactive section)
src/catalog.js          Renders the level filters, search box and topic cards
src/style.css           Black & yellow theme
src/lib/stage.js        Shared canvas helpers (HiDPI sizing, play/pause loop, drawing)
src/lessons/trig.js     Lesson 1: unit circle → sine wave
src/lessons/calculus.js Lesson 2: Riemann sums
src/lessons/geometry.js Lesson 3: Pythagorean rearrangement proof
```

Animations pause when they scroll off screen. If the visitor has reduced motion turned on, they start paused.

Developed by [iamkar3k](https://github.com/iamkar3k).
