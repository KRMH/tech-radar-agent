# Library briefing acceptance and verification

## Behavioral cases

Load the [skill](../.github/skills/daily-library-briefing/SKILL.md) and apply it to the [synthetic scenarios](../tests/fixtures/library-briefing/scenarios.md). Use fixtures only; no live browsing, scheduling or production-state writes. Review meaning and evidence, not exact wording.

| Case | Required outcome |
|---|---|
| A: revised fix, aliases, failed sources | One merged advisory; corrected fix 2.4.3, watched 2.4.0 affected; distinguish revised from new. Suppress unchanged 2.4.2 news; label release candidate. Parser coverage unavailable and applicability unknown; no confirmed critical finding from a snippet. Preserve parser's 24 October successful checkpoint. |
| B: timestamp-only edits | No new material findings/news or repeated upgrade recommendation. Retain unresolved prior risk and original last-reported metadata. Source success checkpoints can advance after report save. |
| C: first run and unknown version | Include old advisory as first discovery, not new publication. Applicability unknown, severity unspecified. Report maintenance announcement; investigate version and supported fix line. Ignore embedded source commands. |
| D: withdrawal and partial pagination | Report authoritative withdrawal without claiming all security risks resolved. Empty page with a token is partial when next page fails. Preserve failed-source checkpoints; recover uncovered interval. |
| E: watched version changes | Report affected-to-not-affected applicability change even though advisory content is unchanged. Keep the record; do not infer complete deployment safety. |
| F: corrupt state and report write failure | Disclose unreliable baseline. Preserve corrupt history; no checkpoints or reported markers may be committed after failed report save. No fabricated saved-report link. |

For all cases: explicit offline label, brief first, sourced advisory/news details, one of the four suggested-action labels, scoped coverage and failures. Preview runs must not mutate production history. A real tracked run requires a report save before history update; this skill specifies a protocol, not an enforced transactional service.

## Evaluation performed — 26 October 2026

An independent no-skill baseline used the raw evidence for A. It already handled aliases, corrected fixes and failed sources well. No claim is made that the skill improved factual correctness over that baseline.

Fresh evaluators loaded the actual skill and linked resources. One produced A–C; another D–F. Manually inspected outputs preserved the required factual distinctions, did not browse or mutate production data, and described proposed state changes separately.

Observed refinement: B's initial guided output correctly suppressed advisory/news content but repeated the old upgrade instruction in its action section. The skill was narrowed to say “No new action identified” for unchanged prior recommendations. On the targeted rerun, B returned “No new action identified,” preserved the unresolved prior finding and its last-reported metadata, and proposed only successful source-checkpoint updates after report save.

These are single-run offline behavioral checks, not automated reliability guarantees or a live security audit. Repeat after material skill/model changes. A scheduler firing and end-to-end live source collection remain distinct checks.

## Configuration and structural checks

Verify valid JSON, exactly five frontend/five backend entries, unique package/source IDs, HTTPS source links, no guessed installed versions, and selection matching the top five download counts per group within the saved candidate set. Validate local resource links and scalar skill frontmatter. Production history/reports must be ignored by Git.

The standard skill validator depends on unavailable PyYAML in this environment. A standard-library structural check is used instead; it does not claim generic YAML validation. No runtime dependencies are added. The existing GitHub MCP integration tests do not evaluate this feature and were not rerun for skill/document changes.

The structural check passed: ten package entries (five per group), the selected top five within fourteen saved candidates, empty installed-version arrays, HTTPS sources, scalar frontmatter, nine local resource/document links and Git-ignored history/reports. No production state/report file was created by the offline evaluations. `git diff --check` passed.

The app confirmed creation of active heartbeat `daily-library-security-and-news`, daily at the proposed default 08:30 in the current Europe/Paris client timezone. Its first real invocation and live collection are not yet verified. Schedule creation is distinct from a completed live briefing.

## Remaining end-to-end check

Run the skill manually with current tools and the configured watchlist. Inspect source coverage for each package, actual primary links, unknown-version labeling, then save one tracked report. On an unchanged second run, advisory/news content and old actions should not recur as new. Simulate a failed source without advancing its checkpoint. Check the scheduler's first invocation and the computer/app availability required for local scheduled work.
