import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Client app root is client/ (plan.md, Project Structure); build output is dist/, served by
// server/app.ts alongside /api (single-process deployment — plan.md Technical Context).
export default defineConfig({
  root: 'client',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Dev-time convenience: client dev server proxies API calls to the Express server so
      // `npm run dev` doesn't require CORS configuration. Production serves both from one
      // process (server/app.ts) instead.
      '/api': 'http://localhost:3000',
      '/tests/html': 'http://localhost:3000',
    },
  },
});
