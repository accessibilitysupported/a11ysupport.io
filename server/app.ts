/**
 * T044: port of the now-deleted app.js. No view engine (the SPA renders client-side), so
 * `cookie-parser`, `express.json()`, and `express.urlencoded()` are dropped — confirmed unused
 * anywhere in the app (`req.cookies`, `res.cookie`, `req.body` appeared nowhere in the legacy
 * routes/*.js or views/**), not carried forward speculatively.
 */
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import compression from 'compression';
import logger from 'morgan';
import contentRouter from './routes/content';
import techRouter from './routes/tech';
import testsRouter from './routes/tests';
import { isKnownRoute } from './lib/known-routes';

const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');

export function createApp() {
  const app = express();

  app.use(compression());
  app.use(logger('dev'));

  // Preserved public URLs (FR-012, contracts/api.md): other tools and the client itself fetch
  // these directly, and the npm package publishes build/*. (The old app also mounted `public/`
  // here — that directory only ever held the pre-migration static assets, now deleted, so there's
  // nothing left for it to serve.)
  app.use(express.static(path.join(ROOT, 'build')));
  app.use(express.static(path.join(ROOT, 'data')));

  app.use('/api', contentRouter);
  app.use('/api/tech', techRouter);
  app.use('/api/tests', testsRouter);

  // Everything else is the SPA shell. Serve dist/'s static assets (JS/CSS bundles, etc.)...
  if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR, { index: false }));
  }

  // ...then fall back to index.html for any non-API, non-static path, with an honest status
  // code: 200 for routes the SPA actually renders, 404 otherwise (FR-009/SC-008) — a naive
  // catch-all would return 200 for every unmatched path.
  app.get('*', (req, res) => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
      res.status(503).send('Build the client first: npm run build && vite build');
      return;
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    const gaPath = path.join(ROOT, 'ga.html');
    if (fs.existsSync(gaPath)) {
      const ga = fs.readFileSync(gaPath, 'utf8');
      html = html.replace('</head>', `${ga}</head>`);
    }

    res.status(isKnownRoute(req.path) ? 200 : 404).send(html);
  });

  return app;
}
