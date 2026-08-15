/**
 * T097: supertest coverage of every /api/* endpoint in contracts/api.md — response shape,
 * documented 404s, and path-traversal attempts on :techId/:featureId/:testId.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server/app';

const app = createApp();

describe('GET /api/home', () => {
  it('returns the home payload as an array of features', async () => {
    const res = await request(app).get('/api/home');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/at-browsers', () => {
  it('returns ATBrowsers.json verbatim', async () => {
    const res = await request(app).get('/api/at-browsers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('at');
    expect(res.body).toHaveProperty('core_at');
  });
});

describe('GET /api/updates', () => {
  it('returns the updates payload', async () => {
    const res = await request(app).get('/api/updates');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/commands', () => {
  it('returns the command matrix', async () => {
    const res = await request(app).get('/api/commands');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/run-tests', () => {
  it('returns priority 0-3 groups only', async () => {
    const res = await request(app).get('/api/run-tests');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(['0', '1', '2', '3']);
  });
});

describe('GET /api/content/:page', () => {
  it.each(['faq', 'contribute', 'learn', 'vc_differences'])('serves the %s markdown page', async (page) => {
    const res = await request(app).get(`/api/content/${page}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('html');
  });

  it('404s for any page not in the allow-list', async () => {
    const res = await request(app).get('/api/content/not-a-real-page');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tech-index', () => {
  it('returns the tech index', async () => {
    const res = await request(app).get('/api/tech-index');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/learn/at/:id', () => {
  it('returns AT documentation for an allow-listed id', async () => {
    const res = await request(app).get('/api/learn/at/nvda');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('html');
    expect(res.body).toHaveProperty('commands');
  });

  it('remaps "dragon" to the "dragon_win" AT id used in ATBrowsers.json', async () => {
    const res = await request(app).get('/api/learn/at/dragon');
    expect(res.status).toBe(200);
    expect(res.body.atId).toBe('dragon_win');
  });

  it('404s for an id not in the 14-entry allow-list', async () => {
    const res = await request(app).get('/api/learn/at/not-a-real-at');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tech', () => {
  // Express redirects a router's mount path to a trailing slash when the router itself has a
  // route for '/' — true of the original app.js/routes/tech.js mount too (verified against the
  // still-running legacy server: `/tech` also 301s there), so this is preserved behavior, not a
  // regression to fix.
  it('redirects the bare mount path to a trailing slash, matching pre-existing Express behavior', async () => {
    const res = await request(app).get('/api/tech');
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('/api/tech/');
  });

  it('returns the tech index at the trailing-slash path', async () => {
    const res = await request(app).get('/api/tech/');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/tech/:techId', () => {
  it('returns a technology by id', async () => {
    const res = await request(app).get('/api/tech/html');
    expect(res.status).toBe(200);
  });

  it('404s for an unknown techId', async () => {
    const res = await request(app).get('/api/tech/not-a-real-tech');
    expect(res.status).toBe(404);
  });

  it('404s (not 500) for a path-traversal attempt', async () => {
    const res = await request(app).get('/api/tech/..%2f..%2f..%2fetc%2fpasswd');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tech/:techId/:featureId', () => {
  it('returns the full feature object plus relatedFeatures', async () => {
    const res = await request(app).get('/api/tech/html/button_element');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('feature');
    expect(res.body).toHaveProperty('relatedFeatures');
    expect(res.body.feature.id).toBe('html/button_element');
  });

  it('404s for an unknown featureId', async () => {
    const res = await request(app).get('/api/tech/html/not-a-real-feature');
    expect(res.status).toBe(404);
  });

  it('404s (not 500) for a path-traversal attempt on featureId', async () => {
    const res = await request(app).get('/api/tech/html/..%2f..%2f..%2fetc%2fpasswd');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tests', () => {
  it('returns the tests index and test map', async () => {
    const res = await request(app).get('/api/tests');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tests');
    expect(res.body).toHaveProperty('testMap');
  });
});

describe('GET /api/tests/:testId', () => {
  it('returns the test, its features, and testHtml', async () => {
    const res = await request(app).get('/api/tests/tech__html__buttons');
    expect(res.status).toBe(200);
    expect(res.body.test.id).toBe('tech/html/buttons');
    expect(Array.isArray(res.body.features)).toBe(true);
  });

  it('404s for an unknown testId', async () => {
    const res = await request(app).get('/api/tests/not-a-real-test');
    expect(res.status).toBe(404);
  });

  it('404s (not 500) for a path-traversal attempt on testId', async () => {
    const res = await request(app).get('/api/tests/..%2f..%2f..%2fetc%2fpasswd');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/tests/:testId/run', () => {
  it('returns the test plus the authored devTest', async () => {
    const res = await request(app).get('/api/tests/tech__html__buttons/run');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('devTest');
    expect(res.body.test.id).toBe('tech/html/buttons');
  });

  it('404s for an unknown testId', async () => {
    const res = await request(app).get('/api/tests/not-a-real-test/run');
    expect(res.status).toBe(404);
  });

  it('does not crash for a test with a `references` assertion (corrected-defect #11)', async () => {
    const res = await request(app).get('/api/tests/tech__aria__aria-owns-multiple/run');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/tests/:testId/:featureId/:featureAssertionId/:atId/:browserId', () => {
  it('returns the single assertion result for a valid combination', async () => {
    const res = await request(app).get(
      '/api/tests/tech__html__buttons/html__button_element/convey_name/dragon_win/chrome'
    );
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('assertion');
    expect(res.body.atId).toBe('dragon_win');
    expect(res.body.browserId).toBe('chrome');
  });

  it('404s for an unknown assertion id', async () => {
    const res = await request(app).get(
      '/api/tests/tech__html__buttons/html__button_element/not_a_real_assertion/dragon_win/chrome'
    );
    expect(res.status).toBe(404);
  });

  it('404s for an unknown AT id', async () => {
    const res = await request(app).get(
      '/api/tests/tech__html__buttons/html__button_element/convey_name/not_a_real_at/chrome'
    );
    expect(res.status).toBe(404);
  });

  it('404s for an unknown browser id', async () => {
    const res = await request(app).get(
      '/api/tests/tech__html__buttons/html__button_element/convey_name/dragon_win/not_a_real_browser'
    );
    expect(res.status).toBe(404);
  });
});
