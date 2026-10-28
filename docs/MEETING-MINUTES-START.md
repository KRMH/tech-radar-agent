# Draft meeting minutes

The workspace [meeting-minutes skill](../.github/skills/meeting-minutes/SKILL.md) turns supplied notes or a transcript into draft minutes. It requires no GitHub metrics, search provider, new MCP server or backend. It uses a [reusable template](../.github/skills/meeting-minutes/assets/minutes-template.md).

For a document with actual colors and typography, request a styled HTML recap. The [HTML template](../.github/skills/meeting-minutes/assets/minutes-template.html) uses an ink-colored opening brief, teal decision markers and an amber open-issues section. See the [styled synthetic example](../tests/fixtures/meeting-minutes/planning-minutes-example.html). Markdown remains the plain-text companion; its colors depend on the reader. Neither format uses emojis.

## Use in VS Code

1. Open this project and start a chat in a general agent mode that can read workspace files. The existing **Tech Radar** custom agent is for technology comparisons; use the general agent for minutes.
2. In **Chat: Open Customizations**, check whether `meeting-minutes` is available among workspace skills. Reload the window if needed. Skill discovery must still be checked in your actual VS Code setup.
3. Paste your meeting notes and ask:

   > Use the meeting-minutes skill to draft the minutes below. Keep the result concise and mark missing owners or deadlines explicitly. [Paste notes here.]

4. If automatic discovery does not load the skill, provide the explicit workspace path:

   > Read `.github/skills/meeting-minutes/SKILL.md` and its linked resources, then apply them to these notes: [paste notes].

Optional context: meeting title, meeting date, confirmed participants, agenda and previous minutes. Without notes/transcript, the skill asks for meeting content. Missing metadata alone does not prevent a draft. You can request English or French; it follows your language.

## What you receive

Draft status; meeting context and source coverage; TL;DR; concise discussion; decisions; actions with owners, deadlines and conditions; risks/blockers; open questions/to-confirm; next follow-up; and source references for each decision/action.

Proposals stay distinct from agreements. Conditional volunteers are not assigned automatically. Historical minutes are context, not evidence that an old action remains open. Relative dates use the meeting date and remain unresolved when ambiguous.

The default result stays in chat. Ask explicitly to save it to a file if desired. The skill does not send, publish, approve, create Jira tickets or upload transcripts to research services. Normal chat/model processing still applies; it does not promise device-only processing.

## Try a synthetic meeting

> Read `.github/skills/meeting-minutes/SKILL.md` and draft minutes from `tests/fixtures/meeting-minutes/planning-transcript.md`.

The expected behavior and additional cases are in [meeting-minutes acceptance](MEETING-MINUTES-ACCEPTANCE.md). The [example draft](../tests/fixtures/meeting-minutes/planning-minutes-example.md) shows the intended output. These are synthetic examples, not actual company meeting records.
