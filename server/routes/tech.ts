/**
 * T042: port of routes/tech.js. Keeps the `sanitize-filename` guard on `:techId`/`:featureId`
 * from routes/tech.js:46 — path-traversal-relevant, since both are interpolated into a file
 * path.
 */
import express from 'express';
import sanitize from 'sanitize-filename';
import { loadApiFile, loadBuildFile } from '../lib/load-build';
import { notFound } from '../lib/errors';
import type { TechPayload } from '../../src/types/api';

const router = express.Router();

router.get('/', (_req, res) => {
  const techIndex = loadApiFile('tech-index.json');
  res.json(techIndex);
});

router.get('/:techId', (req, res, next) => {
  let tech: TechPayload;
  try {
    tech = loadApiFile<TechPayload>(`tech/${sanitize(req.params.techId!)}.json`);
  } catch {
    next(notFound());
    return;
  }
  res.json(tech);
});

router.get('/:techId/:featureId', (req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let feature: any;
  try {
    feature = loadBuildFile(
      `tech/${sanitize(req.params.techId!)}/${sanitize(req.params.featureId!)}.json`
    );
  } catch {
    next(notFound());
    return;
  }

  const relatedFeatures: unknown[] = [];
  if (feature.related_features) {
    const features = loadBuildFile<any[]>('features.json'); // eslint-disable-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    feature.related_features.forEach((id: string) => {
      const techId = id.split('/')[0];
      const featureId = id.split('/')[1];
      const found = features.find((obj) => obj.techId === techId && obj.id === featureId);
      if (found) {
        relatedFeatures.push(found);
      }
    });
  }

  res.json({ feature, relatedFeatures });
});

export default router;
