# Use the Tech Radar agent in VS Code

The working project now contains a **Tech Radar** custom agent and a **github-telemetry** skill. The MCP server still exposes the same two tools. No additional dependency installation is needed for these instructions.

## Start a comparison

1. Keep this project folder open in VS Code and confirm `github-telemetry` is running with two tools discovered.
2. Open a **new chat**. In the agent picker (where you selected Agent), choose **Tech Radar**.
3. If it is not listed, run **Developer: Reload Window**, then open a new chat. Check **Chat: Open Customizations** to inspect the workspace agent and skill. Older versions may expose these options under Configure Custom Agents.
4. In the tools picker, check that file reading, the two GitHub Telemetry tools and any available web research tools are enabled. Tool identifiers and available tool sets depend on the VS Code agent harness. If a tool is missing, use the agent editor's Configure Tools action and select the real installed tool; do not invent tool names.
5. Start with this request:

> Evaluate React for an internal web dashboard. Our team knows JavaScript and we need interactive charts. Compare it with three relevant alternatives. Use the same 30-day period for GitHub Telemetry and explain any partial results.

The agent should explain why the alternatives fit this use case, call both tools for each confirmed repository, and separate functional fit from GitHub activity.

Next, try:

> Compare React and similar tools.

This should produce a question about what you want to build before any shortlist or telemetry calls.

## What discovery can do today

The project includes a **curated catalogue of 13 technologies** for web UI, server-rendered websites and cross-platform mobile. It includes official documentation links and canonical repositories.

The agent's `web` tool set may provide URL fetching without general internet search. Its `search` tool set normally searches the workspace. Neither should be described as an internet competitor search. The agent must report which discovery method it actually used.

If genuine web search is available in your installation and enabled for this agent, the workflow can use it to extend the catalogue's suggestions. No new search integration has been installed here. Without it, comparisons use the curated catalogue and the official links it supplies. For unknown technologies, the agent may ask for an official link instead of guessing.

The shortlist is a use-case-specific proposal, not an exhaustive market survey. Official documentation supports functional claims; the two MCP tools supply current repository measurements.

## Files and future capabilities

```text
.github/
  agents/tech-radar.agent.md
  skills/github-telemetry/SKILL.md
discovery/technology-catalogue.json
src/                         # existing GitHub tool implementations
tests/                       # existing MCP and GitHub tests
docs/AGENT-ACCEPTANCE.md
```

This is one project folder suitable for one Git repository. The current conversation has not created a remote repository or pushed anything to GitHub. Future tool implementations can get their own folders; keeping the existing `src/` paths avoids breaking your working MCP launch configuration.

Skills live in `.github/skills/` because VS Code discovers that location. For each future capability, add a skill describing its inputs, useful results and interpretation, then let the agent route to it. A skill can cover multiple related tools, as the telemetry skill does. It is not necessary to duplicate a skill for every individual API endpoint.

The custom agent currently enables `read`, `search`, `web` and `github-telemetry/*` using the documented VS Code tool-set syntax. Other harnesses may use different identifiers; the tools picker is the final check of what is available. The agent is instructed to perform read-only research.

## Scope and limits

The skill handles partial counts, rate limits, inaccessible repositories and comparison periods. There are no stored example metrics to mistake for live measurements.

This first milestone does not assign Tech Radar rings, security conclusions, license-compliance decisions or longevity scores. Those need your organization's policy and additional evidence; the two current tools cannot establish them.

Files and behavior have been checked separately from real execution in your Copilot chat. Use the acceptance prompts below to confirm the actual selected agent, skill and tool calls in your VS Code setup.

## References

- [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)
- [Custom agent file and tool names](https://code.visualstudio.com/docs/agents/reference/custom-agent-file-reference)
- [VS Code Agent Skills and supported locations](https://code.visualstudio.com/docs/agent-customization/agent-skills)
