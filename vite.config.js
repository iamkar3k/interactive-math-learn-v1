import { defineConfig } from 'vite';

// Relative asset paths so the build works from any sub-path,
// e.g. https://<user>.github.io/interactive-math-learn-v1/
export default defineConfig({
  base: './',
});
