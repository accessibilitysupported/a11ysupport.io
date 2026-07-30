/**
 * T019: the injectable build clock. Ported from the `BUILD_NOW` mechanism added to
 * src/feature-helper.js / build.js in Phase 0 — same behavior, now the canonical source instead
 * of a stopgap on the legacy JS.
 */
import moment from 'moment';

export function resolveBuildNow(): moment.Moment {
  return process.env.BUILD_NOW ? moment(process.env.BUILD_NOW) : moment();
}
