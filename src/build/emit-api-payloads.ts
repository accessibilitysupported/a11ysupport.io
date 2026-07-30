/**
 * T037 (Phase 3): emits the view-shaped `build/api/*.json` payloads the SPA fetches, so the
 * browser never has to receive `build/tech.json` (6.5MB raw) or `build/support_points.json`
 * (12MB raw) whole for a page that only needs a slice of it.
 *
 * `home.json` and `tests-index.json` are straight copies of `features.json`/`tests.json` — those
 * are already the right shape and, measured for real, gzip to ~230KB and ~60KB respectively
 * (well under the ~500KB budget in plan.md's Performance Goals), so splitting them further would
 * be optimization with no measured problem to solve. The real wins are `tech/<id>.json` (a
 * client on /tech/:techId shouldn't fetch all 4 technologies), `run-tests.json` (only priority
 * 0-3 of the 24,080 support points are ever rendered, per spec.md's edge case), and
 * `updates.json` (only the first 6 of ~128 entries are ever rendered, per updates.pug's own
 * `if (index > 5) break`).
 */
import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { readJson, writeJson, ensureDir } from './load-data';

const ROOT = path.resolve(__dirname, '../..');

const MARKDOWN_PAGES: Record<string, { title: string; source: string }> = {
  faq: { title: 'FAQ | Accessibility Support', source: 'FAQ.md' },
  contribute: { title: 'Contributing | Accessibility Support', source: 'CONTRIBUTING.md' },
  learn: { title: 'Learn | Accessibility Support', source: 'documentation/learn.md' },
  vc_differences: {
    title: 'Voice Control differences | Accessibility Support',
    source: 'documentation/vc_differences.md',
  },
};

export function emitApiPayloads(buildDir: string): void {
  const apiDir = path.join(buildDir, 'api');
  ensureDir(apiDir);

  // home.json / tests-index.json: already the right shape (see module comment) — copy as-is.
  fs.copyFileSync(path.join(buildDir, 'features.json'), path.join(apiDir, 'home.json'));
  fs.copyFileSync(path.join(buildDir, 'tests.json'), path.join(apiDir, 'tests-index.json'));
  fs.copyFileSync(path.join(buildDir, 'command_matrix.json'), path.join(apiDir, 'commands.json'));

  // tech-index.json + tech/<id>.json: split the monolithic tech.json per technology.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tech: Record<string, any> = readJson(path.join(buildDir, 'tech.json'));
  const techIndex = Object.keys(tech).map((id) => ({
    id,
    description: tech[id].description,
  }));
  writeJson(path.join(apiDir, 'tech-index.json'), techIndex);

  const techApiDir = path.join(apiDir, 'tech');
  ensureDir(techApiDir);
  for (const [id, entry] of Object.entries(tech)) {
    writeJson(path.join(techApiDir, `${id}.json`), entry);
  }

  // run-tests.json: priority 0-3 only, pre-grouped (spec.md's run-tests edge case).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supportPoints: any[] = readJson(path.join(buildDir, 'support_points.json'));
  const runTests: Record<'0' | '1' | '2' | '3', unknown[]> = { '0': [], '1': [], '2': [], '3': [] };
  for (const point of supportPoints) {
    if (point.priority === 0 || point.priority === 1 || point.priority === 2 || point.priority === 3) {
      runTests[String(point.priority) as '0' | '1' | '2' | '3'].push(point);
    }
  }
  writeJson(path.join(apiDir, 'run-tests.json'), runTests);

  // updates.json: only the first 6 entries are ever rendered (updates.pug).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentUpdates: any[] = readJson(path.join(buildDir, 'recent_updates.json'));
  writeJson(path.join(apiDir, 'updates.json'), recentUpdates.slice(0, 6));

  // markdown/<page>.json: pre-rendered HTML, so the client never re-renders markdown or ships
  // markdown-it to the browser. `tabIndex: false` matches the pinned markdown-it-anchor
  // configuration from Phase 1 (preserves byte-identical heading output).
  const markdownApiDir = path.join(apiDir, 'markdown');
  ensureDir(markdownApiDir);
  const md = new MarkdownIt().use(markdownItAnchor, { tabIndex: false });
  for (const [slug, { title, source }] of Object.entries(MARKDOWN_PAGES)) {
    const markdown = fs.readFileSync(path.join(ROOT, source), 'utf8');
    const html = md.render(markdown);
    writeJson(path.join(markdownApiDir, `${slug}.json`), { title, html });
  }

  // markdown/at/<id>.json: the 14 per-AT "how to use" docs (documentation/at/*.md), same
  // treatment — pre-rendered so /api/learn/at/:id doesn't re-parse markdown per request.
  const markdownAtApiDir = path.join(markdownApiDir, 'at');
  ensureDir(markdownAtApiDir);
  const atDocsDir = path.join(ROOT, 'documentation/at');
  for (const file of fs.readdirSync(atDocsDir)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.slice(0, -3);
    const markdown = fs.readFileSync(path.join(atDocsDir, file), 'utf8');
    const html = md.render(markdown);
    writeJson(path.join(markdownAtApiDir, `${slug}.json`), { html });
  }
}
