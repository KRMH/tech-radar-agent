# Use the Tech Radar agent in VS Code

The project contains a **Tech Radar** agent, a **web-discovery** skill for public-web research, and the existing **github-telemetry** skill for public GitHub measurements. Discovery tries Exa first, Tavily second, then the saved technology catalogue as an explicitly offline fallback. The order and enable/disable switches are in `discovery/providers.json`.

## Start a comparison

1. Keep this project folder open in VS Code.
2. Open a new chat and choose **Tech Radar** in the agent picker.
3. If it is not listed, run **Developer: Reload Window**, then open a new chat. Check **Chat: Open Customizations** to inspect the workspace agent, skills, and MCP servers.
4. In the tools picker, confirm that Exa (`web_search_exa`, `web_fetch_exa`), Tavily (`tavily-search`, `tavily-extract`), and both GitHub Telemetry tools are enabled. Sign in to Exa if VS Code prompts you. If a tool is missing, check the MCP server and its output.
5. Try this request:

> Evaluate React for an internal web dashboard. Our team knows JavaScript and needs interactive charts. Find three relevant alternatives using current web sources. Compare functionality separately from GitHub activity over the same 30-day period, and say when company compatibility has not been assessed.

The agent should search the web for candidates, check official project sources, confirm canonical repositories, and then call both GitHub Telemetry tools for each confirmed public repository.

If you ask only “Compare React and similar tools,” the agent should ask what you want to build before searching for alternatives or collecting telemetry.

## How discovery works

Exa is the primary live provider. Its hosted MCP server supports Exa OAuth sign-in, which lets you use the account's free monthly credits without putting an API key in the repository. Tavily is the next provider if Exa is unavailable, rate-limited, or produces no usable candidates. Tavily currently runs in keyless mode and may also be limited. If both live providers fail, the agent uses `discovery/technology-catalogue.json` for candidate names and saved official links, labels discovery as offline, and includes that catalogue's review date. It does not present saved candidates as newly researched. See [Exa MCP setup](https://exa.ai/mcp), [Exa pricing](https://exa.ai/pricing), and [Tavily MCP setup](https://docs.tavily.com/documentation/mcp).

Tech Radar checks functional claims against official documentation and confirms GitHub repositories from official project sources. Search results help it discover candidates; they are not proof by themselves. If search is unavailable, it says live discovery could not be completed rather than using an old list or model memory as if it were current research.

## Company context later

The current workflow compares public technologies for the use case you describe. It does not know which tools your company already uses or approves. Later, an approved internal source—such as an architecture standards document or technology inventory—can be added as a separate company-fit step after the public comparison. Keep confidential company details out of public Exa and Tavily queries.

## Project files

```text
.github/
  agents/tech-radar.agent.md
  skills/github-telemetry/SKILL.md
  skills/web-discovery/SKILL.md
.mcp.json                     # Exa and Tavily remote search connections for Copilot agents
.vscode/mcp.json              # Local GitHub Telemetry server
discovery/providers.json      # Provider enable switches and fallback order
discovery/technology-catalogue.json # Offline fallback candidates and official links
src/                          # GitHub Telemetry implementation
tests/                        # Existing MCP and GitHub tests
docs/AGENT-ACCEPTANCE.md
```

The agent is configured for read-only research. The GitHub Telemetry server still provides the same two tools: repository details and recent commit activity.

## Limits

GitHub stars, forks, and commits do not establish security, license compliance, maintainer count, release freshness, issue-resolution speed, or performance. Tech Radar does not assign Adopt/Trial/Assess/Hold rings or a security verdict from these metrics. Company policy and internal compatibility are not evaluated until an approved company source is connected.

## References

- [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)
- [VS Code MCP servers](https://code.visualstudio.com/docs/agent-customization/mcp-servers)
- [Exa MCP server](https://exa.ai/mcp)
- [Exa free plan](https://exa.ai/pricing)
- [Tavily MCP server](https://docs.tavily.com/documentation/mcp)
