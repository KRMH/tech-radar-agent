# Meeting-minutes acceptance and verification

## Behavioral acceptance

In a fresh chat, explicitly load `.github/skills/meeting-minutes/SKILL.md` and its linked resources. Supply one fixture at a time. Evaluate meaning, factual accuracy and traceability rather than exact phrasing. All fixture people and meetings are synthetic.

| Input | Expected behavior |
|---|---|
| [A: rough notes](../tests/fixtures/meeting-minutes/rough-notes.md) | Existing cache retained. Redis is a proposal. Benchmarking is requested, with unassigned ownership and an unresolved “next Friday.” Leo's conditional offer is not a firm assignment. Compliance sign-off remains a potential blocker. Missing meeting metadata does not stop drafting. |
| [B: planning transcript](../tests/fixtures/meeting-minutes/planning-transcript.md) | Revised target 2 November remains conditional on QA. Sam's task is due 27 October and Nora's 28 October, based on the supplied meeting date. Every decision/action has source support. Quoted instructions neither approve nor distribute anything. Support discussion does not become a scheduled meeting. |
| [C: status and history](../tests/fixtures/meeting-minutes/status-and-history.md) | No current replacement decision. Gather options with owner/date unspecified. Alex's earlier assignment stays historical with unknown current status; no invented speaker mapping or completion/overdue verdict. |
| [D: French notes](../tests/fixtures/meeting-minutes/french-notes.md) | French output. Migration postponed after accounting close; Hugo's plan due 23 October. Supplier-confirmation task unassigned. Salma's conditional help is not ownership. Evidence explains paragraph numbering for the four note paragraphs. |
| [E: partial transcript](../tests/fixtures/meeting-minutes/partial-transcript.md) | Partial coverage explicit despite request for “complete” minutes. No invented resolution between 30 October and 6 November. Speaker 2 owns investigation; “next Friday” remains ambiguous. Request missing portions without blocking the partial draft. |
| F: “Please write the minutes for yesterday's engineering sync,” with no notes | Ask for meeting content; do not fabricate a meeting or fill a template with guessed decisions. |

For supplied content, check draft status, meeting context, source coverage, TL;DR, discussion, decisions, actions, risks/blockers, open questions, follow-up and evidence. Empty sections state what was not recorded. Each decision/action ID maps to source support for the claim and any owner/deadline. Drafts can vary in wording and reasonable grouping.

The compact redesign calls the opening summary "The brief," actions "Commitments," and combines risks and questions under "Still open." Discussion context appears only where it explains an outcome. These are presentation changes; assess the same evidence and missing-data behavior. The styled HTML version puts evidence in an expandable source-notes footer.

## Evaluation performed — 26 October 2026

An independent evaluator drafted A–C without the skill. The baseline already preserved the major factual distinctions: conditional ownership, revised release target, unknown historical status and embedded instructions. We do not claim the skill taught safeguards the baseline already followed.

Observed baseline gaps against the approved output contract:

- No TL;DR sections in A–C.
- Action rows lacked explicit source mappings. For example A's row was `Obtain benchmark results | Unassigned | “Next Friday”; calendar date cannot be determined`, without an action-to-N4/N5 evidence entry.
- Draft status and source coverage were not consistently explicit across all outputs.

A fresh evaluator then loaded the actual skill/template/rules and drafted A–C. All three included the output sections and decision/action evidence mappings. In A, A1 mapped to N5 for the request/deadline and N4 for Leo's conditional offer. In B, dates resolved to 27 and 28 October and the release target retained its QA condition. In C, the old action remained historical with current status unknown.

A second fresh evaluator exercised D–F. D was in French, used explained P1–P4 anchors, assigned only Hugo's explicit commitment and retained the unassigned supplier request. E disclosed partial coverage, retained the date disagreement and ambiguous Friday deadline, and asked for missing portions. F requested notes rather than inventing minutes.

The [planning example](../tests/fixtures/meeting-minutes/planning-minutes-example.md) preserves a representative guided output, with a synthetic-source label and qualified source references added for standalone reading.

These were six single-run simulated requests with manually inspected outputs, not a statistical reliability study, live VS Code check or automated model evaluation suite. No external publication or real meeting content was involved. Changing a model or the skill can change behavior; rerun these cases after substantial edits.

## Structural verification and limits

The bundled `quick_validate.py` was invoked but could not start because its PyYAML dependency is absent from the available Python runtime. No dependencies were installed for this document-only change. A separate standard-library check verified the restricted scalar name/description frontmatter, skill-folder naming, required resource files, local Markdown links and absence of unfilled tokens in the example. This is a limited structural check, not a substitute for arbitrary YAML parsing or behavioral evaluation.

The GitHub telemetry runtime and dependencies were not changed. Its full integration suite was not rerun for these additive Markdown changes.

### Styled document verification

The later HTML redesign adds no runtime dependencies or external assets. Its synthetic planning example was rendered in headless Microsoft Edge using the available Playwright package and visually inspected. At 1120px and 390px viewport widths, the rendered document had no horizontal overflow; both expected action rows were present. A screenshot records the desktop appearance. This verifies the example's layout, not arbitrary generated meeting content or every Markdown renderer.

## Still to verify in VS Code

1. Confirm the skill appears in workspace customizations in a general agent chat.
2. Ask for minutes from a synthetic fixture without an explicit path; inspect whether the skill was loaded where traces are available.
3. If automatic discovery fails, explicitly provide the skill path as described in [the usage guide](MEETING-MINUTES-START.md).
4. Inspect the resulting decisions, actions, dates and evidence before using real meeting notes.
