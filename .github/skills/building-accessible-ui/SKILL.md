---
name: building-accessible-ui
description: MUST BE USED for any UI work. Invoke this skill before generating, modifying, or reviewing any code that renders, styles, or wires up a user-facing interface — including markup, components, templates, styles, and the JavaScript/TypeScript that drives them. Also invoke this skill when writing or reviewing a spec, plan, design doc, PRD, RFC, ADR, ticket, or task list for a user-facing feature — the accessibility contract belongs in the spec, before implementation. This skill encodes the accessibility (WCAG 2.2 AA) requirements every UI change must satisfy; skipping it produces inaccessible output. Applies across web, mobile, and desktop. If the task touches the UI layer in any way, use this skill first. Already invoked earlier in this session? Don't invoke again — apply the checklist and any component/reference files you already loaded to the new task.
version: 1.0.0
source: in-repo (authored for weather-demo; not vendored from an external skill repository)
---

# building-accessible-ui

Checklist for producing and reviewing accessible UIs. Each rule leads with the platform-agnostic principle and, where relevant, the Web (HTML + ARIA + CSS) implementation. Apply the web guidance only when the output is web.

Detailed rationale lives in `references/`; widget-specific guidance in `components/`. **Open a file only when it's relevant to the current task.** Do not preload. Every file opened and every line a tool prints stays in context — don't re-read.

## Accessibility constitution

Ground rules. Use them to resolve conflicts and decide how much custom work is justified. The checklist below is their mechanical application.

### 1. Accessibility is a core outcome

A UI inaccessible to realistic users is not "done". Treat accessibility as a first-class criterion alongside correctness, performance, and security — not a finishing step. When scope must be cut, record the gap explicitly. Never claim output is "fully accessible"; state what was addressed and known limitations.

### 2. Build for real people

Evaluate designs against these personas; if a decision breaks one, justify it and offer an alternative:

- **Screen reader** — landmarks, headings, accessible name/role/state, reading order.
- **Keyboard-only** — Tab/arrows/Enter/Space/Escape, visible focus, no traps.
- **Low-vision** — zoom, reflow, contrast, Forced Colors.
- **Cognitive** — plain language, clear labels, actionable errors, forgiving interactions.
- **Deaf / hard of hearing** — captions/transcripts; no sound-only cues.
- **Motor / voice / switch** — large hit targets, named controls, no precise/timed gestures.
- **Situational** — sunlight, one-handed, noisy, flaky network.

### 3. Implementation priority

Use the highest option that fits:

1. Existing accessible component in this codebase / design system.
2. A component library.
3. Native platform semantics (`<button>`, `<a href>`, `<input>`, `<label>`, `<fieldset>`/`<legend>`, `<dialog>`, `<details>`, `<nav>`, `<main>`, headings).
4. Native element + minimum necessary ARIA (`aria-describedby`, `aria-expanded`, `aria-current`, etc.).
5. Fully custom ARIA widget — only when nothing above fits, and only if you implement the APG keyboard, focus, and state behavior end-to-end.

No ARIA is better than bad ARIA. Don't duplicate native semantics (no `role="button"` on `<button>`). Don't use `role="menu"` for site navigation. Don't invent new patterns when a standard one exists.

### 4. Balance, don't trade away

Accessibility, performance, security/privacy, and visual design are joint constraints — not dials to trade off. If an optimization removes a label, breaks focus, or hides content from AT, redesign the optimization. Accessible names must not leak secrets, but security is not a reason to ship an unlabeled control — find a labeling approach that doesn't leak data. Visual polish doesn't justify removing focus indicators or semantic structure. Under schedule pressure, prefer cutting scope over shipping an inaccessible feature. When constraints genuinely conflict, surface it explicitly.

### 5. Respect existing code

Don't rewrite an existing component or shared utility just because it could be more accessible — other code depends on it. When you see issues outside the current task's scope: note them (issue, affected persona, suggested fix) and ask before changing. Fix in place only when the change is required by the task, localized, and low-risk. Inside scope, fix real issues; never silently remove existing affordances (labels, landmarks, focus management, live regions) without an equal-or-better replacement.

## How to use this checklist

Identify which components the request involves (form, checkbox group, radio group, disclosure, modal, full view, etc.) and open the matching `components/<name>.md` once. Then work the checklist below. Open a `references/*.md` only when an item is unclear or you need the concrete fix pattern.

Do not claim the output is "fully accessible". State what was addressed and known limitations.

**Do NOT use this skill for:** backend-only changes, data migrations, build/CI configuration, non-UI tests, or tasks that do not touch the UI layer. Planning or specifying a user-facing feature *is* in scope, even though no UI code is written yet.

## Spec-driven work

**Writing a spec/plan for UI work?** The accessibility contract is part of the spec, not a follow-up.
Specify at minimum: components used, accessible name for every interactive element, keyboard and
focus behavior (including where focus moves and restores), ARIA state attributes and their triggers,
live regions, and the automated test that proves it. → `references/spec-driven-development.md`.

**Implementing from a spec?** Read its accessibility section first and treat it as the contract.
**If it has none, write that contract into the spec before writing code.** Do not start from a spec
that leaves accessible names, keyboard behavior, or live regions unspecified — implementing first and
documenting after produces guesses the reviewer cannot check.

## Checklist

- **Prefer existing components.** If available, reuse existing UI components rather than creating new ones from scratch or custom implementations.
- **Platform-native semantics.** Prefer native platform controls and structures over custom constructs; add accessibility overrides only when a native control genuinely can't be used. → `references/structure.md`.
  - **Web:** Prefer semantic HTML (`<button>`, `<a>`, `<input>`, `<label>`, `<fieldset>`/`<legend>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<h1>`–`<h6>`) over `<div>`/`<span>` with ARIA. Use ARIA only when no native element fits.
- **Regions / landmarks.** View structure is exposed via semantic regions/landmarks; duplicated landmarks have unique accessible names.
  - **Web:** Exactly one `<main>`; `<header>`, `<nav>`, `<footer>` used when applicable.
- **Headings.** Logical outline labels sections without skipping levels; one top-level heading per view. → `references/structure.md`.
  - **Web:** One `<h1>`, typically the first heading in `<main>`. Set a descriptive `<title>`.
- **Bypass blocks on web pages.** Provide a mechanism to skip repeated navigation when delivering traditional web pages. (Not required for Electron or non-web surfaces.) → `references/keyboard-focus.md`.
  - **Web:** A "Skip to main content" link as the first focusable element
- **Name / role / value.** Every interactive element exposes an accurate accessible name; role matches purpose; dynamic states (pressed, expanded, selected, checked, disabled, invalid) stay in sync with visuals.
  - **Web:** Prefer native attributes over ARIA. If necessary, use the minimum ARIA needed and update state attributes alongside DOM/visual changes.
- **Name-label match.** The accessible name of each interactive element contains the visible label text.
  - **Web:** If `aria-label` is used, include the visible label text. For multiple controls that share a label (e.g., "Remove"), add context ("Remove item: Socks").
- **Labels and help text.** Every form control has a programmatic label describing its purpose; help/error text is programmatically associated with its control. → `components/forms.md`.
  - **Web:** `<label for>` or wrapping `<label>`; never placeholder alone. Associate help/error via `aria-describedby` / `aria-errormessage`.
- **Grouping.** Related options (checkboxes, radios) are grouped so their shared name is part of the accessible name of each option. Group-level help/error text is associated with the group itself — not with each option and not with an intermediate wrapper.
  - **Web:** `<fieldset>` with a `<legend>`. Put `aria-describedby` on the `<fieldset>` (not on a child `<div>`, and never on an extra `<div role="group">` inside the fieldset — `<fieldset>` already is the group).
- **Required fields.** Marked both visually and programmatically; not indicated by color alone.
  - **Web:** Use an asterisk to indicate required fields. Native `required` on the control or `aria-required="true"`.
- **Keyboard operability.** Every interactive element is keyboard operable; tab order matches reading/visual order; expected keys work (activation, arrow keys inside composite widgets, Escape closes overlays); no keyboard traps; static content is not sequentially focusable.
  - **Web:** Do not remove focus outlines without equal-or-better replacement. Use `tabindex="-1"` only for elements that need programmatic (not sequential) focus. → `references/keyboard-focus.md`.
- **Focus management.** Focus is always visible. Overlays/dialogs/disclosures move focus appropriately and restore it on close; no focus traps outside modals.
- **Hidden content.** Content hidden from assistive technology is not focusable and is hidden consistently across visual, semantic, and focus layers.
  - **Web:** `hidden` / `display: none` / `aria-hidden="true"` used consistently.
- **Graphics.** Informative graphics have meaningful text alternatives; decorative graphics are hidden from AT. → `references/images-graphics.md`.
  - **Web:** `<img>` informative → `alt`; decorative → `alt=""`. Informative `<svg>` → `role="img"` + accessible name. Other decorative → `aria-hidden="true"`. 
- **Contrast.** Text ≥ 4.5:1 (3:1 large); focus indicators and key boundaries ≥ 3:1. Never color-only cues. → `references/contrast-forced-colors.md`.
- **Respect OS accessibility settings.** Never override OS high contrast, reduced-motion, or color-scheme preferences; adapt to forced-colors / high-contrast. → `references/contrast-forced-colors.md`.
- **Reflow.** Content adapts to narrow viewports (target 320 CSS px) without two-dimensional scrolling for multi-line text; controls remain operable. → `references/reflow.md`.
- **Navigation.** Uses semantic navigation grouping with state-exposing toggles for expandable menus. → `references/navigation.md`.
  - **Web:** `<nav>`, not `role="menu"`; `aria-expanded` on triggers.
- **Tables / grids.** Static tabular data uses table semantics with header/cell associations; interactive grids only when truly warranted. → `references/tables-grids.md`.
- **Status messages.** Provide status messages for dynamic content updates that are relevant to the user (loading indicators, form submission results, etc.). → `references/status-messages.md`
  - **Web:** Use `aria-live="polite"` or `aria-live="assertive"`.
- **Testing.** Add and run automated accessibility tests unless the project explicitly opts out. Writing or configuring a test is not enough — execution, fixes, and a result report are part of the deliverable. **The final automated test run must be on the exact artifact you submit: any edit after a passing test invalidates that test, so re-run before submitting.** **Open `references/testing.md` before writing any test code** for the opt-out signals, strategy precedence, and reporting rules.
  - **Web:** Prefer `@axe-core/*` bindings that match the existing test runner; render the component/page fully so interactive state, focus, and live regions are evaluated.
  - **Other platforms:** Use the platform's native audit (Android `AccessibilityChecks`, iOS `XCUIAccessibilityAudit`, .NET `AccessibilityInsights`) under the same precedence.
- **Specs/Documentation.** Follow the project's documentation pattern; the accessibility contract lives in the feature's own spec. → `references/spec-driven-development.md` (workflow, phase mapping), `references/specs-documentation.md` (content items, template).

