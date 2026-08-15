/**
 * Thin fetch wrapper for the /api/* surface (contracts/api.md). Each function throws on a
 * non-2xx response so TanStack Query's error state does the rest.
 */
import type {
  HomePayload,
  TechIndexPayload,
  TechPayload,
  RunTestsPayload,
  UpdatesPayload,
  CommandsPayload,
  MarkdownPagePayload,
} from '../../src/types/api';
import type { ATBrowsers } from '../../src/types/at-browsers';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  return res.json();
}

export const api = {
  home: () => getJson<HomePayload>('/api/home'),
  atBrowsers: () => getJson<ATBrowsers>('/api/at-browsers'),
  updates: () => getJson<UpdatesPayload>('/api/updates'),
  commands: () => getJson<CommandsPayload>('/api/commands'),
  runTests: () => getJson<RunTestsPayload>('/api/run-tests'),
  content: (page: string) => getJson<MarkdownPagePayload>(`/api/content/${page}`),
  techIndex: () => getJson<TechIndexPayload>('/api/tech-index'),
  tech: (techId: string) => getJson<TechPayload>(`/api/tech/${techId}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feature: (techId: string, featureId: string) => getJson<any>(`/api/tech/${techId}/${featureId}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testsIndex: () => getJson<any>('/api/tests'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test: (testId: string) => getJson<any>(`/api/tests/${testId}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testRun: (testId: string) => getJson<any>(`/api/tests/${testId}/run`),
  supportPoint: (testId: string, featureId: string, assertionId: string, atId: string, browserId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getJson<any>(`/api/tests/${testId}/${featureId}/${assertionId}/${atId}/${browserId}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  learnAt: (id: string) => getJson<any>(`/api/learn/at/${id}`),
};
