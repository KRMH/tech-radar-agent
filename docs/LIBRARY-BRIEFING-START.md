# Daily library security and news briefing

The [daily-library-briefing skill](../.github/skills/daily-library-briefing/SKILL.md) prepares a sourced morning digest: a brief, security changes, relevant release/maintenance news, suggested actions and collection coverage. It does not install or upgrade packages.

## Watchlist

Edit [briefing/watchlist.json](../briefing/watchlist.json). It currently selects five frontend and five backend npm projects using the largest weekly download counts within the [documented candidate set](../briefing/selection-2026-10-26.json):

| Frontend | Backend |
|---|---|
| React (`react`) | Express (`express`) |
| Preact (`preact`) | Hono (`hono`) |
| Vue (`vue`) | NestJS (`@nestjs/core`) |
| jQuery (`jquery`) | Fastify (`fastify`) |
| Solid (`solid-js`) | Koa (`koa`) |

The npm API returned the window 16–22 October 2026. This is a selection from 14 candidates, not a universal adoption ranking; downloads include automated and transitive installs. The saved evidence lists every candidate, count and API URL. The selected identities cover the named packages, not all companion packages or transitive dependencies.

Installed `versions` arrays are intentionally empty: this is ecosystem monitoring, not a scan of your deployed applications. Advisories include affected/fixed versions, but applicability to you remains unknown. Fill exact versions or explicitly request a project lockfile import to make findings actionable for that project. Never copy the latest available version into installed versions merely to fill a field.

Each library lists official maintainer advisories, OSV, release pages and available announcement pages. The skill records which sources actually worked; an unconfigured or unavailable source is not clean coverage. OSV API collection requires a tool supporting HTTP POST; ordinary search/page fetch does not provide it. The collector must disclose unavailable capabilities instead of claiming an API query happened. Prefer current maintainer evidence over search snippets.

## Manual preview

Use a fresh general agent chat with this project open:

> Read `.github/skills/daily-library-briefing/SKILL.md` and its linked resources. Prepare a live preview using `briefing/watchlist.json`. Do not write history. Identify unavailable sources, unknown installed versions and any incomplete collection.

A preview does not change deduplication history. For a reusable daily baseline:

> Use the daily-library-briefing skill for a tracked live run of `briefing/watchlist.json`. Save the report and history locally according to its history contract, then return the short digest and the report link.

Tracked reports go under `briefing/reports/`; history is `briefing/state.json`. Both are git-ignored. They remain model-managed files, not a deterministic collection/deduplication service. Do not run overlapping writers or manually reset history without accepting that older findings may reappear.

## Daily execution

The skill does not start a timer. A supported scheduler must invoke it in an environment with read/write access and live research tools. The Codex app created the active heartbeat `daily-library-security-and-news` on 26 October 2026, daily at 08:30 using the current Europe/Paris client timezone, returning to this chat. This uses the proposed default time; the user can change it. The app confirmed creation; its first live invocation has not yet been observed.

Keep the computer on, the app running and the project available for local scheduled work, as described in [OpenAI's scheduled-task documentation](https://learn.chatgpt.com/docs/automations?surface=app). The automation prompt explicitly loads the workspace skill, so it does not rely on automatic skill discovery.

The default monitoring behavior saves each tracked report and notifies for meaningful changes, new/changed source failures, recovery or required user input. Unchanged items and unchanged failures are suppressed. Request a message every day explicitly if you also want no-change digests delivered.

## Test without live data

> Load `.github/skills/daily-library-briefing/SKILL.md`. Apply it to each case in `tests/fixtures/library-briefing/scenarios.md`. Use only those offline fixtures, return digests and proposed history changes, and do not browse or write production state.

See [acceptance and verification](LIBRARY-BRIEFING-ACCEPTANCE.md). `npm test` covers the existing GitHub service, not this skill's judgment or scheduling. No runtime dependency is added for this feature.
