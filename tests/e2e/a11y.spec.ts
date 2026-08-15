/**
 * T101: axe-core over the same route inventory as routes.spec.ts, gated against the Phase 0
 * baseline (baseline/axe/) — fails only on violations NOT present in the baseline for that
 * route, reporting pre-existing ones as warnings. axe catches roughly a third of WCAG issues and
 * is blind to `headers=` wiring, live-region timing, and focus order (baseline/README.md,
 * plan.md's "what axe can and cannot prove") — this is a regression tripwire, not the full
 * accessibility proof. Gated by rule id per route, not exact node match, since node target
 * selectors can shift harmlessly between a Pug render and a React render of equivalent markup.
 */
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { buildRouteInventory } from '../../tools/baseline/routes';
import { slugify } from '../../tools/baseline/route-slug';

const routes = buildRouteInventory();
const AXE_DIR = path.resolve(__dirname, '../../baseline/axe');

function baselineViolationIds(routePath: string): Set<string> {
  const file = path.join(AXE_DIR, `${slugify(routePath)}.json`);
  if (!fs.existsSync(file)) return new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = JSON.parse(fs.readFileSync(file, 'utf8'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Set((data.violations ?? []).map((v: any) => v.id as string));
}

test.describe('accessibility regression check (axe, baseline-gated)', () => {
  for (const route of routes) {
    test(`${route.path} (${route.label}) has no NEW axe violations`, async ({ page }, testInfo) => {
      await page.goto(route.path, { waitUntil: 'networkidle' });

      const results = await new AxeBuilder({ page }).analyze();
      const baseline = baselineViolationIds(route.path);
      const newViolations = results.violations.filter((v) => !baseline.has(v.id));
      const preExisting = results.violations.filter((v) => baseline.has(v.id));

      if (preExisting.length > 0) {
        testInfo.annotations.push({
          type: 'pre-existing-axe-violations',
          description: preExisting.map((v) => v.id).join(', '),
        });
      }

      expect(
        newViolations,
        newViolations.map((v) => `${v.id}: ${v.description}`).join('\n')
      ).toEqual([]);
    });
  }
});
