# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]

**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]

**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Accessibility Design *(mandatory when the spec's Accessibility Requirements section is non-empty)*

<!--
  ACTION REQUIRED: Carry the spec's accessibility acceptance criteria (AR-xxx) into a concrete,
  reviewable design here. See .github/skills/building-accessible-ui/SKILL.md and
  references/spec-driven-development.example.md for the expected level of detail. Use these
  section headings as-is (they are stable keys other tooling/agents look for) —
  components, labels, grouping, keyboard, dynamic_state, status_messages.
-->

### components

[Components used and why, per the implementation priority ladder in the accessibility
constitution: existing component > component library > native element > native + minimal ARIA >
fully custom widget. Name the actual `components/<name>.md` guidance consulted.]

### labels

| Control | Visible label | Accessible name | Notes |
|---|---|---|---|
| [control] | [visible text] | [computed accessible name] | [e.g., assembled per row] |

### grouping

[How related controls are grouped (e.g., `<fieldset>`/`<legend>`) and where group-level
help/error text attaches — on the group itself, not on each option or an intermediate wrapper.]

### keyboard

- Tab order: [describe]
- Key behavior: [Enter/Space/Escape/arrow keys, per widget]
- Focus move: [what receives focus and when]
- Focus restore: [what focus returns to on close/cancel/complete]

### dynamic_state

[ARIA state attributes introduced or changed (`aria-expanded`, `aria-pressed`, `aria-selected`,
`aria-invalid`, etc.) and the exact trigger that updates each one.]

### status_messages

[Live regions introduced: id/selector, politeness (`polite`/`assertive`), message template, and
the trigger that fires it. State "none" if this feature has no dynamic status to announce.]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
