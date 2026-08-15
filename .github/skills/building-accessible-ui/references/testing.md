# Testing

Run automated accessibility tests as part of the deliverable. Writing or configuring a test is not enough — execute it, fix every non-best-practice violation, re-run, and report the result.

## 1. Opt-out gate

Skip testing only when the project explicitly opts out via `CONTRIBUTING`, `AGENTS.md`, `README`, a skill-local instruction, or the user saying to skip. Absence of existing tests is **not** an opt-out.

## 2. Strategy — pick the first that fits

1. **Existing a11y tests** (axe, Playwright + axe, jest-axe, pa11y, Lighthouse CI, Espresso `AccessibilityChecks`, `XCUIAccessibilityAudit`, etc.): extend that suite, matching its conventions. No further reading needed.
2. **Existing test framework, no a11y tests**: add accessibility tests to the runner in use, matching its conventions. No further reading needed.
3. **No framework**: run the UI in a rendered browser and call `axe.run()`. **Open `references/testing-rendered-browser.md`** for the runtime-probe order, install-avoidance rules, and a working example — those mechanics only apply to this strategy.

## 3. Fix, re-run, report

- Fix every non-best-practice violation. Re-run until clean. Best-practice items are warnings, not failures.
- **Re-run after every post-test edit.** A passing run only certifies the bytes that were tested. If you change the artifact afterwards — even "just styling" or "just a rename" — the previous result is stale. Re-run the same probe against the final artifact before submitting. The submitted artifact and the last tested artifact must be byte-identical.
- In your summary include: pass/fail, violations list (`id`, `impact`, targets), which strategy + runtime you used, and any violation intentionally not fixed (with reason — e.g. pre-existing markup per `SKILL.md` rule 5).

## Common failure modes

- Declaring the environment unusable after one `pip list | grep` or `which node` — probe by importing/invoking.
- Writing tests but not running them. Configuring ≠ testing.
- Editing the artifact after the last passing run and submitting without re-testing. The clean result no longer applies.
- Flipping best-practice / WCAG severity.
