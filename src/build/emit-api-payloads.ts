/**
 * T028 (stub — fully implemented in Phase 3, T037): emits the view-shaped `build/api/*.json`
 * payloads the SPA fetches (home.json, tech-index.json, run-tests.json, etc. — see
 * contracts/api.md and data-model.md). Stubbed here as a no-op so src/build/index.ts's
 * orchestration is complete and callable ahead of Phase 3, without affecting any of the
 * existing `build/*.json` artifacts Gate 1 compares byte-for-byte.
 */
export function emitApiPayloads(_buildDir: string): void {
  // Intentionally empty until Phase 3 (T037).
}
