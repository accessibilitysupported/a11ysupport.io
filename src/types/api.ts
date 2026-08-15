/**
 * Hand-written contracts for the view-shaped `/api/*` and `build/api/*.json` payloads (Phase 3).
 * These don't come from data/schema/*.json — they're a new, deliberately smaller slice of the
 * full Feature/Test shapes, split out because the browser can't receive build/tech.json (6.5MB)
 * or build/features.json (5.5MB) whole. Field lists match contracts/api.md and data-model.md
 * exactly; keep both in sync if either changes.
 */
import type { AtType } from './at-browsers';

export interface SupportString {
  class: string;
  string: string;
}

/** The subset of Feature fields index.pug actually reads (data-model.md, "Derived/API-only shapes"). */
export interface HomeFeature {
  id: string;
  techId: string;
  title: string;
  keywords_string: string;
  possible_backend_expectations?: boolean;
  supports_at: AtType[];
  core_support: Record<AtType, string[]>;
  core_support_string: Record<AtType, SupportString>;
  core_must_support_string: Record<AtType, SupportString>;
  core_should_support_string: Record<AtType, SupportString>;
  core_may_support_string: Record<AtType, SupportString>;
  core_support_by_at_browser: Record<string, Record<string, { string: SupportString; onlyNegativeSupport?: boolean }>>;
  total_test_count: number;
  all_dates: { all: string[]; min: string | null; max: string | null };
  failing_dates: { all: string[]; min: string | null; max: string | null };
  allTests: Array<{ title: string; id: string; versions: Record<string, unknown> }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assertions: any[];
}

export type HomePayload = HomeFeature[];

export interface TechIndexEntry {
  id: string;
  description: string;
}

export type TechIndexPayload = TechIndexEntry[];

/** The subset /tech/:techId needs — id, core_support_string, failing_tests per feature, not the
 * full nested tree (data-model.md). */
export interface TechFeatureSummary {
  id: string;
  core_support_string: SupportString;
  failing_tests: Array<{ id: string; title: string }>;
}

export interface TechPayload {
  id: string;
  description: string;
  references?: Array<{ title: string; url: string }>;
  features: TechFeatureSummary[];
}

/** Support points pre-filtered to priority 0-3 and pre-grouped by priority (spec.md's run-tests
 * edge case: lower priorities are intentionally never shown). */
export interface RunTestsEntry {
  testId: string;
  test_title: string;
  ATId: string;
  id: string;
  priority: 0 | 1 | 2 | 3;
}

export type RunTestsPayload = Record<'0' | '1' | '2' | '3', RunTestsEntry[]>;

export interface TestsIndexEntry {
  id: string;
  title: string;
  keywords_string: string;
  last_update: { date: string; message: string };
}

export type TestsIndexPayload = TestsIndexEntry[];

export interface UpdateEntry {
  testID: string;
  title: string;
  date: string;
  message: string;
}

export type UpdatesPayload = UpdateEntry[];

export type CommandsPayload = Record<AtType, Record<string, string[]>>;

/** FAQ/CONTRIBUTING/learn docs, pre-rendered to HTML at build time (markdown-it +
 * markdown-it-anchor) instead of re-rendered per request. */
export interface MarkdownPagePayload {
  title: string;
  html: string;
}
