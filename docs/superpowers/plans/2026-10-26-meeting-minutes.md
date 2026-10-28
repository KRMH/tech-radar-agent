# Meeting Minutes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Deliver a reusable draft-minutes skill with a simple, complete template and realistic acceptance cases.

**Architecture:** One workspace skill extracts and validates evidence, then renders Markdown. Supporting rules and a template remain inside its folder. No runtime changes.

**Tech Stack:** Markdown and YAML frontmatter, existing VS Code skill discovery; Python skill validator.

**Spec:** `docs/superpowers/specs/2026-10-26-meeting-minutes-design.md`

## Global constraints

- Draft output in chat by default, in the user's language.
- No invented agreements, owners, dates, identities or approval status.
- No runtime dependencies, external publication or ticket creation.
- Preserve the existing Tech Radar scope and GitHub telemetry implementation.

## Review focus

Conditional volunteers; superseded release targets; ambiguous relative dates; historical commitments; instructions embedded in source material. Exercise these through behavioral examples rather than tests matching instruction wording.

## Task 1: Skill and resources

**Files:** `.github/skills/meeting-minutes/SKILL.md`, `assets/minutes-template.md`, `references/extraction-and-review-rules.md` beneath that folder.

**Interface:** Supplied notes/transcript plus optional meeting context -> draft Markdown minutes with supporting references and unresolved questions.

- [x] Run an independent baseline on realistic notes before authoring.
- [x] Author the skill and resources; address observed baseline gaps and approved requirements.
- [x] Attempt the bundled skill validator (blocked by missing PyYAML); run limited standard-library structural/link checks instead.
- [x] Run independent guided evaluations and inspect their actual outputs for factual accuracy.

## Task 2: Usage and acceptance evidence

**Files:** `docs/MEETING-MINUTES-START.md`, `docs/MEETING-MINUTES-ACCEPTANCE.md`, `tests/fixtures/meeting-minutes/`, and a short link in `README-FR.md`.

**Interface:** The skill from Task 1 -> discoverable instructions, reusable raw fixtures, example draft and evaluation evidence.

- [x] Save synthetic source fixtures and a representative generated draft for user review.
- [x] Document invocation, boundaries and acceptance criteria; distinguish simulation from live VS Code checks.
- [x] Review the diff, validate frontmatter/resource links, and record verification outcomes.

## Execution decisions and results

Proceed in the current workspace: these are additive skill/document changes and the user approved implementation here. No branch, commit, push or publication is needed for delivery. Independent subagents are used only for the behavioral checks explicitly required by writing-skills, not in the delivered workflow. No code tests mirroring Markdown wording will be added.

Completed: independent baseline A-C, guided A-C and variation D-F outputs reviewed. Limited structural check passed for frontmatter, 2 resources, 14 Markdown files and 15 local links; example has no unfilled tokens. `git diff --check` passed. The bundled validator was blocked by missing PyYAML. Live VS Code discovery remains a manual acceptance check, not a completed verification claim. Detailed evidence is in `docs/MEETING-MINUTES-ACCEPTANCE.md`.
