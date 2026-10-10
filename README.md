# interactive-math-learn-v1

Learn maths through interactive visuals. **MathMotion** is a landing page with three lessons you can play with:

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

## Project structure

```
index.html              Landing page markup
src/main.js             Entry point, mounts the three lessons
src/style.css           Black & yellow theme
src/lib/stage.js        Shared canvas helpers (HiDPI sizing, play/pause loop, drawing)
src/lessons/trig.js     Lesson 1: unit circle → sine wave
src/lessons/calculus.js Lesson 2: Riemann sums
src/lessons/geometry.js Lesson 3: Pythagorean rearrangement proof
```

Animations pause when they scroll off screen. If the visitor has reduced motion turned on, they start paused.
