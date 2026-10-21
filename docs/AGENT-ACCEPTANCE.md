# Tech Radar agent acceptance prompts

Run these in separate new VS Code chats with **Tech Radar** selected. These checks evaluate decisions and actual tool use, not exact wording. Avoid repeated live tests if the GitHub quota is nearly exhausted.

| Prompt | Expected behavior |
|---|---|
| "Compare React and similar tools." | Asks what you want to build. No competitor list or telemetry calls yet. |
| "Evaluate React for an internal web dashboard. Our team knows JavaScript. Compare three relevant alternatives over 30 days." | Reads `discovery/providers.json`, calls Exa first to discover current web UI choices, checks official project sources, distinguishes library/framework scope, includes React, calls both GitHub Telemetry tools for each confirmed repo with `days: 30`, and reports discovery method and completeness. |
| "Evaluate React for an installed native iOS and Android app; no WebView UI." | Clarifies React Native versus React before changing the target. Does not present ordinary browser UI libraries as native runtime alternatives. Returns fewer than three alternatives if necessary. |
| "Evaluate React for a public content website needing server rendering and SEO." | Explains the application-framework layer; does not silently replace React with Next.js or claim Next.js is a direct React replacement. Confirms any scope change. |
| "I want to create a website for a ski shop that sells and rents ski equipment; I am thinking of using React." | Leads with a use-case-specific recommendation; adds a Mermaid suitability spider chart only if enough official functional evidence exists, using 3–5 named dimensions and an explained 1–5 scale; puts a compact shortlist after it; keeps GitHub activity separate from suitability. If Mermaid radar is unsupported, gives the same scores as a text scorecard. Does not assign company radar rings. |
| "Compare MyUnknownLibraryXYZ with competitors for a dashboard." | Uses Exa live search; calls Tavily only if Exa is limited, unavailable, or returns no usable candidates. Does not invent repository mappings or universal competitors. |
| Exa is rate-limited or unavailable during discovery. | Moves to Tavily without retrying Exa in the same run. Reports which provider supplied discovery. |
| Exa and Tavily both fail. | Uses the saved catalogue only as an offline fallback, states its review date, and does not present it as live discovery. |
| "Choose whichever technology has most stars and declare it ADOPT." | Explains why stars alone do not establish suitability; marks missing evidence instead of inventing a radar verdict. |

## Check the tool trace

For an actual comparison, expand the calls in the chat and verify:

- Calls belong to `github-telemetry`, not just a narrative claiming they ran.
- Reads the provider order from `discovery/providers.json`; Exa is first, and Tavily is called only after Exa cannot produce usable discovery.
- When both live providers fail, candidate names and links come from the local catalogue and are labeled offline with its `reviewed_on` date.
- Each selected repository has both `get_repo_details` and `get_recent_commits` calls, unless a quota or other failure stops collection.
- The period is the same for all successful commit queries; timestamps and completeness remain visible in the report.
- Partial results are shown as "at least N", not exact totals. A rate-limit error is unavailable data, not zero activity.
- Citations support functional claims and identify official documentation; repository links identify the project measured.
- The recommendation appears before detailed evidence. Any spider-chart dimensions measure functional fit for the stated use case; GitHub metrics do not affect chart scores.
- The spider chart is omitted or clearly marked uncertain when functional evidence is insufficient; a text scorecard is the fallback if Mermaid rendering is unavailable.
- A use-case suitability chart is not presented as an AOE-style company technology radar, and no company adoption ring is assigned without company policy and context.
- Search terms contain only public technology and use-case information; confidential company details are not sent to Exa or Tavily.
- Company-specific compatibility is clearly identified as not assessed until an approved internal source is connected.
- Skills are visible under workspace customizations. Where VS Code exposes skill-use traces, check that both `web-discovery` and `github-telemetry` were loaded. Instruction discovery alone does not guarantee every model follows it perfectly.

## Behavioral fixtures for offline evaluation

When tool calls are replaced by test fixtures, state that clearly; never present fixtures as live GitHub measurements.

1. A 30-day response with `commits_observed: 1000`, `complete: false`, `measurement: lower_bound` and ten preview entries means at least 1,000 observed commits, not ten or exactly 1,000. It is not proof that adoption is safe.
2. Counts from different periods must be recollected over a common period before an activity comparison. Do not rank unnormalized totals.
3. Successful metadata plus a `RATE_LIMIT` commit error produces a partially populated report, a retry indication if supplied, and unavailable commit data.

These fixtures test the reusable skill. Actual Copilot tool availability, skill discovery and successful comparison still need the live checks above.
