/**
 * Shared with tests/e2e/a11y.spec.ts and tests/e2e/visual.spec.ts, which need to map a route path
 * to its baseline/{png,axe}/<slug> filename without importing capture.ts itself — that file calls
 * its own `main()` unconditionally at module scope (it's meant to be run directly via
 * `tsx tools/baseline/capture.ts`), so importing it as a library would re-run the entire
 * baseline capture (spawn a server, drive a browser over all 32 routes) as a side effect of
 * loading a test file.
 */
export function slugify(routePath: string): string {
  if (routePath === '/') return 'index';
  return routePath.replace(/^\//, '').replace(/[/:()]/g, '_');
}

export const WIDTHS = [1920, 1441, 1280, 320] as const;
