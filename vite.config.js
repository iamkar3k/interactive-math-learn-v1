import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Relative asset paths so the build works from any sub-path,
// e.g. https://<user>.github.io/interactive-math-learn-v1/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lesson: resolve(import.meta.dirname, 'lesson.html'),
      },
    },
  },
});
