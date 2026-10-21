# Agent and skill verification — updated 21 October 2026

## Current live-discovery update

- Configured Exa as the primary hosted MCP search connection with its OAuth login flow, followed by Tavily in keyless mode.
- Added `discovery/providers.json` to set provider order and enable/disable flags, restored the local technology catalogue as the last offline fallback, and updated the agent, skill, startup guide and acceptance prompts.
- The provider fallback and Exa OAuth setup have not yet been exercised in VS Code. The earlier test results below apply to the GitHub Telemetry code and the earlier discovery workflow only.

> Historical note: the checks below describe the earlier catalogue-based workflow and redirect fix. They do not verify the Exa/Tavily fallback behavior or the Exa OAuth flow added afterward.

The current discovery setup is structurally covered by `tests/discovery-config.test.js`: it checks provider entries and tool names, keeps the catalogue last while allowing the live providers to be reordered or disabled, verifies the MCP endpoints, and checks the restored catalogue's link/repository fields. A live Exa OAuth session and actual quota-triggered fallback in VS Code remain to be confirmed by the user.

Implemented in the existing `github-telemetry-local` VS Code project:

- `Tech Radar` workspace custom agent.
- `github-telemetry` workspace skill covering the two existing MCP tools.
- Thirteen-technology catalogue, four use-case profiles and official source links.
- Startup guide and acceptance prompts for real VS Code chats.

## Checks performed

The agent and skill YAML frontmatter parses with unique keys. Relative links from the agent resolve to the skill and catalogue. Catalogue IDs and repository mappings have valid formats, unique identities and consistent profile references. The configured MCP server name matches the agent's server selection.

The existing complete `npm.cmd test` suite passed: **34 tests, zero failures**. No runtime dependency or MCP implementation change was needed for this workflow addition.

A fresh evaluator applied the actual instructions to independent simulated chats. It:

1. Asked for a use case when given only React.
2. Asked whether React for native mobile meant React Native before substituting that project.
3. Selected web UI choices for a dashboard, disclosed catalogue-based functional evidence and explicitly labeled offline fixture telemetry.
4. Reported partial counts as lower bounds and preserved unavailable fields after a rate limit instead of inventing a complete scorecard.

This is an instruction-following simulation, not a live run of your VS Code chat. A wording conflict about explicitly supplied offline data was clarified after review. The telemetry reference-skill baseline already handled basic safeguards well, so no improvement claim is made from a manufactured failing baseline.

The archive is inspected for required project and hidden VS Code/GitHub files, portable skill export, matching skill contents, valid JSON, absence of dependency folders and successful ZIP integrity checks.

## What remains to confirm in VS Code

The earlier server launch was confirmed by the user's `Discovered 2 tools` log. The new custom agent's picker entry, skill discovery, enabled web tools and actual multi-repository comparison have not yet been exercised in the VS Code chat. Use [the startup guide](TECH-RADAR-START.md) and [acceptance prompts](AGENT-ACCEPTANCE.md).

Historical note from before the current Exa/Tavily setup: no general internet-search integration had been added or verified. At that time, the default path used the curated catalogue and fetched official URLs when tools permitted. Repository/source links were starting points; unreachable documentation was disclosed and functional claims were not presented as freshly verified. Nuxt documentation could not be retrieved during source research; its official GitHub repository corroborated its application-framework role.

No GitHub remote was created and no files were pushed. The existing `src/` layout was preserved to avoid breaking the working MCP entrypoint. Hosted publication remains outside this local workflow update and subject to the previously reported Sites administrator restriction.

## Follow-up: transferred repositories

The user's React comparison exposed a real redirect-handling defect: GitHub returned HTTP 301 for `facebook/react`, pointing to the repository-ID endpoint and canonical `react/react` project. The original client rejected redirects and mislabeled this response as a network failure.

The client now follows at most five redirects, restricted to HTTPS `api.github.com` repository/commit endpoints, within the same 15-second request deadline. It returns the canonical repository URL and uses that repository for commit queries. The catalogue and skill now use `react/react`.

Regression checks cover transferred repositories, rejection of other redirect hosts and redirect loops. **All 37 tests pass.** Live metadata and 30-day commit queries using the old `facebook/react` inputs both succeeded and returned `https://github.com/react/react`. Restart a previously running MCP process to load the corrected client.

The maintained skill source is `.github/skills/github-telemetry/SKILL.md`, a supported VS Code discovery location. During packaging, it is exported to `skills/github-telemetry/SKILL.md` as well, the portable plugin discovery location. The two archived copies are checked for identical contents; edit the maintained source rather than the generated export.
