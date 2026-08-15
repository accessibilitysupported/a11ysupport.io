/**
 * T098: FR-012 — the preserved public URLs from app.js's static mounts (public/, build/, data/)
 * MUST keep resolving exactly where they are today, independent of the new /api namespace.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';

const app = createApp();

describe('preserved public URLs (FR-012)', () => {
  it.each([
    '/ATBrowsers.json',
    '/latest_versions.json',
    '/features.json',
    '/tech.json',
    '/tests.json',
    '/test_map.json',
    '/support_points.json',
    '/command_matrix.json',
    '/recent_updates.json',
  ])('%s still 200s', async (url) => {
    const res = await request(app).get(url);
    expect(res.status).toBe(200);
  });

  it('/tests/html/*.html resolves to the static fixture', async () => {
    const res = await request(app).get('/tests/html/html/buttons.html');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
