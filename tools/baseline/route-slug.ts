/**
 * Maps a route path to its `baseline/axe/<slug>.json` filename, matching the naming scheme the
 * (now-deleted) Phase 0 baseline capture used. Shared by tests/e2e/a11y.spec.ts.
 */
export function slugify(routePath: string): string {
  if (routePath === '/') return 'index';
  return routePath.replace(/^\//, '').replace(/[/:()]/g, '_');
}
