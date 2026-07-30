# Spec-driven development

Accessibility decisions made at spec time are cheap and verifiable; made at review time they are
rework. The spec is the interface between the agent that plans a feature and the agent (or human)
that implements it — if the contract isn't in the spec, the implementer is guessing.

## Two directions

- **Authoring a spec.** Produce the contract, not a promise to write one later. Every entry must be
  concrete enough that a different agent can implement it without asking a question. Reuse the
  content list in `references/specs-documentation.md` — don't restate it here.
- **Implementing from a spec.** Read its accessibility section first; it overrides your defaults.
  No section → write it into the spec, get it reviewed with the rest of the plan, then implement.
  Spec conflicts with this skill's checklist → the checklist wins on correctness (WCAG 2.2 AA isn't
  negotiable by a spec); flag the conflict rather than silently picking a side.

## Phase mapping

Multi-phase spec-driven workflows (Kiro `.kiro/specs/<feature>/`, GitHub spec-kit's
`/specify` → `/plan` → `/tasks`, or any repo-specific requirements/design/tasks split) spread the
contract across files. Put each piece where the phase already expects that kind of content:

| Phase artifact | Accessibility content that belongs there |
|---|---|
| `requirements.md` (`/specify`) | Affected personas (constitution rule 2); accessibility acceptance criteria in the doc's own requirement style (EARS, user story, given/when/then); explicit non-goals and opt-outs |
| `design.md` (`/plan`) | Components used and why (constitution rule 3 ladder); landmarks/headings/`<title>`; accessible-name table; grouping and associations; keyboard and focus contract; ARIA state attributes with update triggers; live regions with politeness and message templates |
| `tasks.md` (`/tasks`) | Per-task accessibility done-criteria and the test that proves each one |

Single-file spec repos: same content, one `## Accessibility` section — use
`references/specs-documentation.template.md`. A worked multi-phase example is
`references/spec-driven-development.example.md`.

## Task-level criteria

A task that renders UI without an accessibility criterion is under-specified. Never write a bare
"add accessibility" task — accessibility is a criterion on each UI task, not a separate task that
gets cut under schedule pressure. Example `tasks.md` entry:

```markdown
- [ ] Add remove button to each saved-location row
      Done when: accessible name is "Remove <location name>"; Enter/Space activates; confirm
      dialog receives focus on open and returns it to the row's remove button on close.
      Test: tests/a11y/saved-locations.spec.ts
```

## Stable keys for agentic consumption

Use the section names `references/specs-documentation.md` already defines — `components`, `labels`,
`grouping`, `keyboard`, `dynamic_state`, `status_messages`, `testing`, `known_limitations` — as
headings or anchors in every phase file, so a downstream agent can locate a contract by name instead
of parsing prose.

## Drift

If implementation diverges from the spec, update the spec in the same change — a spec whose
accessible names no longer match the code is worse than no spec. Before submitting, re-check the
spec's acceptance criteria against the shipped artifact and report against them (see
`references/testing.md` for the re-run-before-submitting rule).

## Quick checks

- [ ] A spec exists before UI code is written, or the gap is called out and the spec is written first.
- [ ] The accessibility contract lives in the feature's own spec, not a separate doc.
- [ ] Every interactive element has an accessible name specified.
- [ ] Focus move and restore are specified for every dynamic interaction.
- [ ] Each live region has politeness, message template, and trigger.
- [ ] Each UI task has an accessibility done-criterion and a named test.
- [ ] Acceptance criteria are checkable against the built artifact, not aspirational.
- [ ] No "fully accessible" claim; known limitations are listed with the affected persona.
