/**
 * Discovered while building FeaturePage/TestCasePage: several fields (Feature.description,
 * Feature.recommendation, Assertion.notes, Test.description, Assertion.assertion_notes,
 * History.message) are rendered through markdown-it *at request time* in the original
 * routes/tech.js and routes/tests.js — not just the 18 standalone docs Phase 3 already
 * pre-renders at build time (src/build/emit-api-payloads.ts).
 *
 * These can't be baked into the core build files: build/tech/**.json and build/tests/**.json
 * must stay byte-identical to the original build (Gate 1) — the original build never rendered
 * markdown into these fields; that only ever happened per-request in the view layer. So this
 * matches the original's actual architecture: render at request time, in the route handler,
 * same `{ tabIndex: false }` pin as Phase 1/3's other markdown-it-anchor usage.
 */
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

const md = new MarkdownIt().use(markdownItAnchor, { tabIndex: false });

export function renderMarkdown(source: string): string {
  return md.render(source);
}

export function renderMarkdownInline(source: string): string {
  return md.renderInline(source);
}
