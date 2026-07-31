/**
 * T099: FR-009/SC-008 — the SPA fallback must return an honest status code. Known routes 200,
 * unknown routes 404, even though both serve the same index.html body (the client router renders
 * the same ErrorPage either way).
 *
 * `/tech` and `/tests` are deliberately excluded from the plain "known route -> 200" checks: both
 * also happen to be real directory names under `build/` (served by the `express.static(build)`
 * mount, registered before the SPA fallback — same order as the original app.js), so a bare
 * request 301-redirects to add a trailing slash before the fallback logic ever runs. Verified
 * this is pre-existing, not a regression: the still-running legacy server 301s on `/tech` too.
 * Covered separately below instead of asserted as a plain 200.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';

const app = createApp();

describe('SPA fallback status codes', () => {
  it.each(['/', '/run-tests', '/updates', '/faq', '/contribute', '/learn', '/learn/vc_differences', '/learn/commands'])(
    'static route %s is 200',
    async (route) => {
      const res = await request(app).get(route);
      expect(res.status).toBe(200);
    }
  );

  it('/tech and /tests 301-redirect to a trailing slash (pre-existing express.static behavior, not a regression)', async () => {
    const tech = await request(app).get('/tech');
    expect(tech.status).toBe(301);
    expect(tech.headers.location).toBe('/tech/');

    const tests = await request(app).get('/tests');
    expect(tests.status).toBe(301);
    expect(tests.headers.location).toBe('/tests/');
  });

  it('a real /tech/:techId/:featureId is 200', async () => {
    const res = await request(app).get('/tech/html/button_element');
    expect(res.status).toBe(200);
  });

  it('a real /tests/:testId is 200', async () => {
    const res = await request(app).get('/tests/tech__html__buttons');
    expect(res.status).toBe(200);
  });

  it('a real /tests/:testId/run is 200', async () => {
    const res = await request(app).get('/tests/tech__html__buttons/run');
    expect(res.status).toBe(200);
  });

  it('a real /learn/at/:id is 200', async () => {
    const res = await request(app).get('/learn/at/nvda');
    expect(res.status).toBe(200);
  });

  it('an unknown top-level path is 404', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
  });

  it('an unknown featureId is 404', async () => {
    const res = await request(app).get('/tech/html/not-a-real-feature');
    expect(res.status).toBe(404);
  });

  it('an unknown testId is 404', async () => {
    const res = await request(app).get('/tests/not-a-real-test');
    expect(res.status).toBe(404);
  });

  it('an AT id outside the 14-entry allow-list is 404', async () => {
    const res = await request(app).get('/learn/at/not-a-real-at');
    expect(res.status).toBe(404);
  });

  it('every unknown route still serves the SPA shell as the body, not an error page', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.text).toContain('<div id="root">');
  });
});
