# Specs and documentation

Put accessibility intent in the same spec as the feature it describes, not a separate a11y doc that drifts. The contract should be concrete enough for a reviewer or AI to implement and test against without guessing.

For *when* to write the contract and how it splits across multi-phase spec-driven workflows (Kiro, spec-kit), see `references/spec-driven-development.md`. This file covers *what* the contract contains.

A fillable feature-spec template and a worked example are sidecar files. Both show a full feature spec with accessibility embedded as one section — not a standalone a11y doc:

- Template: `references/specs-documentation.template.md`
- Example: `references/specs-documentation.example.md`

## Where it lives

Match the project's existing documentation pattern.

- **Spec-driven repos** (`specs/`, `.kiro/specs/`, `design-docs/`, `rfcs/`, ADRs): add an `## Accessibility` section to the feature spec, or split it across phase files per `references/spec-driven-development.md`.
- **Component libraries** (Storybook MDX, co-located `README.md`): add a11y notes to the component's doc page.
- **AI context files** (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/*`, `copilot-instructions.md`): record project-wide conventions (implementation priority, testing tooling, supported AT). Link out to per-feature specs; don't restate them here.
- **Tickets / PR descriptions**: restate the accessibility acceptance criteria that must still hold.

A single project-wide `ACCESSIBILITY.md` is fine for conventions. It is not a substitute for per-feature specs.

## Adapting to the project

The content items below are required; the format is not. Treat the template as a checklist of content, not a required heading structure.

- **No existing spec pattern.** Don't invent a heavy process. Capture the accessibility contract in whatever doc the change already owns — the PR description, the component's `README.md`, a short design note co-located with the code. Cover the content items below; skip the template's headings if they're heavier than the change warrants. If the feature is substantial and there is nowhere to put a spec, propose adding `specs/` or `docs/features/` and ask before creating it.
- **Specs in a different format** (Jira, Notion, `.kiro/specs`, ADRs, Storybook MDX, YAML/JSON schema). Keep the host format. Map each required content item onto the closest existing field or section; for non-Markdown schemas, add fields under an `accessibility:` key using the same names (`components`, `labels`, `grouping`, `keyboard`, `dynamic_state`, `status_messages`, `testing`, `known_limitations`). Never maintain a parallel Markdown copy alongside the host doc — it will drift.
- **Minimum viable capture.** If only part fits: labels/accessible names, keyboard contract, and live regions are the three items most often lost to format mismatch. Prioritize those, then add the rest as space allows.

## What to include

Each item must be concrete enough to verify.

- **Components used.** Widgets/primitives composed by the view; link to each component spec. For custom widgets, state why nothing existing fits.
- **Landmarks and headings.** Landmarks the view owns, the `<h1>`, the outline, and the `<title>` pattern.
- **Labels and accessible names.** Visible label and — when different — accessible name for every interactive element. Call out names assembled from context (group label + option, row action + item).
- **Grouping and associations.** `<fieldset>`/`<legend>` membership; help text targets (`aria-describedby`); error message targets (`aria-errormessage`, `aria-invalid`); required-field markers.
- **Keyboard behavior.** Tab order, activation keys, arrow-key navigation in composite widgets, Escape, where focus moves on open, where it restores on close. Specify for every dynamic interaction.
- **Dynamic state and ARIA.** State attributes that update (`aria-expanded`, `aria-pressed`, `aria-selected`, `aria-checked`, `aria-invalid`) and the events that update them. How hidden content is hidden (`hidden` vs `aria-hidden`) so the layers don't conflict.
- **Status messages.** Every `aria-live` region: id, politeness (`polite` / `assertive` / `role="alert"`), message template, and trigger. Cover loading, empty, and error states explicitly. → `references/status-messages.md`.
- **Testing strategy.** The automated check that covers this feature (tool, target, test file), keyboard scenarios, manual checks, and explicit opt-outs. → `references/testing.md`.
- **Known limitations.** Gaps, the affected persona, and the planned fix. No "fully accessible" claims.

## Writing for AI consumption

- **Imperative and testable.** "The Clear button's accessible name is `Clear filters`" beats "labeled clearly".
- **Name element and attribute.** State the tag, the attribute, and the id it points to. Don't leave the shape implicit.
- **Structured sections.** Use the template's headings so tools and humans can find each contract without reading prose.
- **Link, don't duplicate.** Refer to component specs and project conventions instead of restating them.
- **Acceptance checklist at the end.** A short self-verify list (keyboard flow, labels, live regions, axe clean) the AI can run against the final output.

## Quick checks

- [ ] `## Accessibility` section lives in the feature/component spec, not a separate doc.
- [ ] Components used are listed and linked.
- [ ] Landmarks, `<h1>`, heading outline, and `<title>` are specified for view-level specs.
- [ ] Every interactive element has a visible label and, when different, an accessible name.
- [ ] Grouping, help-text association, error-message association, and required markers are specified.
- [ ] Keyboard behavior is specified for every dynamic interaction, including focus move and restore.
- [ ] Dynamic ARIA state attributes are listed with their update triggers.
- [ ] Every `aria-live` region has id, politeness, message template, and trigger; loading / empty / error states are covered.
- [ ] Testing strategy names the automated check and any manual checks; opt-outs are explicit.
- [ ] Known limitations list the affected persona; no "fully accessible" claims.
- [ ] Host documentation format is preserved; content items are mapped into existing sections/fields rather than duplicated into a parallel doc.
