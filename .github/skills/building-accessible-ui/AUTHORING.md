# Authoring guide — file structure and token minimization

This skill is loaded into an LLM's context window. Every byte in `SKILL.md` is paid *on every call*; every byte in a `components/*.md` or `references/*.md` is paid *when that file is opened*. Authoring decisions should be made with token cost in mind.

## File structure

```
SKILL.md                  # Always loaded. The checklist + constitution.
components/<widget>.md    # Opened on demand when the task involves that widget.
references/<topic>.md      # Opened on demand when a checklist item is unclear.
```

### What belongs where

- **`SKILL.md`** — the rule surface. One-line principles + a link to the file that explains them. Anything a reviewer/producer should always have in working memory. Keep it tight.
- **`components/<widget>.md`** — widget-specific contract: Principles → Web defaults → one example → Review checklist → Pitfalls. Use when the output contains that widget.
- **`references/<topic>.md`** — cross-cutting web-implementation topic (contrast, focus, reflow, status messages, etc.). No Principles section — the Quick checks carry the rules; a one-paragraph intro sets context.

### Naming

- Component filenames match the pattern name a model would reach for (`modal-dialog`, `checkbox-group`, not `dialog` or `checkboxes`).
- Reference filenames are the topic (`contrast-forced-colors`, `keyboard-focus`).

## Token minimization rules

Apply these when adding or editing any file in the skill:

1. **Don't state the same rule twice in the same file.** Principles + Quick checks that restate each other is the most common waste. Reference files should have Quick checks only (with a short intro). Component files keep Principles because they set the widget's contract; the Review checklist should add operational detail, not repeat principles.
2. **Don't state the same rule in two files.** If a rule is in a `references/*.md`, don't also expand it in `SKILL.md` link to it. If it's in `components/<widget>.md`, don't duplicate it in `references/*.md`.
3. **SKILL.md web sub-bullets are a tax.** Every sub-bullet under a checklist item is loaded on every call. Keep them only when a one-line concrete instruction prevents a common mistake. Push long explanations into the referenced file.
4. **One example per component.** If a minimal and an "elaborated" example both appear, collapse to the elaborated one and note what's optional. Two 20-line HTML blocks that differ by three attributes is ~600 tokens of duplication.
5. **Prose lists.** Lists tokenize tighter than prose and are easier to scan. Persona/role descriptions, constraint lists, and "consider X, Y, Z" paragraphs should be bullets.
6. **Cut hedges.** "Read this when reviewing", "This pattern is primarily a", "Note that" add tokens without changing output. Leading with the topic title is enough.
7. **Cut obvious pitfalls.** A Pitfall that just negates a Principle from the same file ("No label on the field") is wasted. Keep pitfalls that are counterintuitive or commonly seen in model output (e.g., "Marking every checkbox `required` to express 'at least one'").
8. **No decorative code comments.** `<!-- Populate when state changes. Empty is fine. -->` adds tokens for minimal value. Let the surrounding prose explain the code.
9. **Don't duplicate SKILL.md rules in components.** Components should say what is *widget-specific* (focus trap in dialogs, roving tabindex in radios). Contrast, reflow, and forced-colors rules live in their reference files.

## When adding a new component or reference file

- Before creating one, check whether an existing file could absorb the content with a short addition.
- If you add a new `components/<name>.md`, add it to `components/README.md` with a one-line purpose.
- If you add a `references/<topic>.md`, add at most one SKILL.md checklist item that links to it. Do not expand the rule inline.
- Write the Quick checks section first. If the full file ends up saying only what the Quick checks say, delete the rest.

## When editing an existing file

- Re-read the file's Quick checks (or Review checklist) first. If your addition is already covered there, rephrase the existing item instead of adding a new one.
- If you find a rule duplicated across two files, pick the file where it primarily belongs, delete the other copy, and add a link.
- If you add a code example, make sure it is not a near-duplicate of an existing example in the same file.

## Sizing guideline

Rough targets (not hard limits). A file materially larger than this usually has duplication:

- `SKILL.md`: under ~250 lines.
- `components/<widget>.md`: under ~120 lines.
- `references/<topic>.md`: under ~80 lines (`testing-rendered-browser.md` is the exception because it documents runtime probing — it's the reason `testing.md` itself was split out from it, so the common-path reader never pays for it).

## Review checklist for PRs that touch this skill

- [ ] No rule appears verbatim (or near-verbatim) in two files.
- [ ] No Principles section in a `references/*.md`.
- [ ] SKILL.md changes justified — added bullets are loaded on every call.
- [ ] Each component file has at most one HTML example.
- [ ] New component added to `components/README.md`.
- [ ] Pitfalls list contains only counterintuitive/common mistakes, not negations of Principles.
