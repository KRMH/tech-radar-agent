# Tech Radar agent acceptance prompts

Run these in separate new VS Code chats with **Tech Radar** selected. These checks evaluate decisions and actual tool use, not exact wording. Avoid repeated live tests if the GitHub quota is nearly exhausted.

| Prompt | Expected behavior |
|---|---|
| "Compare React and similar tools." | Asks what you want to build. No competitor list or telemetry calls yet. |
| "Evaluate React for an internal web dashboard. Our team knows JavaScript. Compare three relevant alternatives over 30 days." | Explains web UI alternatives, distinguishes library/framework scope, includes React, calls both tools for each confirmed repo with `days: 30`, reports discovery method and completeness. |
| "Evaluate React for an installed native iOS and Android app; no WebView UI." | Clarifies React Native versus React before changing the target. Does not present ordinary browser UI libraries as native runtime alternatives. Returns fewer than three alternatives if necessary. |
| "Evaluate React for a public content website needing server rendering and SEO." | Explains the application-framework layer; does not silently replace React with Next.js or claim Next.js is a direct React replacement. Confirms any scope change. |
| "Compare MyUnknownLibraryXYZ with competitors for a dashboard." | Uses real research if available or asks for an official link. Does not invent repository mappings or universal competitors. |
| "Choose whichever technology has most stars and declare it ADOPT." | Explains why stars alone do not establish suitability; marks missing evidence instead of inventing a radar verdict. |

## Check the tool trace

For an actual comparison, expand the calls in the chat and verify:

- Calls belong to `github-telemetry`, not just a narrative claiming they ran.
- Each selected repository has both `get_repo_details` and `get_recent_commits` calls, unless a quota or other failure stops collection.
- The period is the same for all successful commit queries; timestamps and completeness remain visible in the report.
- Partial results are shown as "at least N", not exact totals. A rate-limit error is unavailable data, not zero activity.
- Citations support functional claims and identify official documentation; repository links identify the project measured.
- Skills are visible under workspace customizations. Where VS Code exposes skill-use traces, check that `github-telemetry` was loaded. Instruction discovery alone does not guarantee every model follows it perfectly.

## Behavioral fixtures for offline evaluation

When tool calls are replaced by test fixtures, state that clearly; never present fixtures as live GitHub measurements.

1. A 30-day response with `commits_observed: 1000`, `complete: false`, `measurement: lower_bound` and ten preview entries means at least 1,000 observed commits, not ten or exactly 1,000. It is not proof that adoption is safe.
2. Counts from different periods must be recollected over a common period before an activity comparison. Do not rank unnormalized totals.
3. Successful metadata plus a `RATE_LIMIT` commit error produces a partially populated report, a retry indication if supplied, and unavailable commit data.

These fixtures test the reusable skill. Actual Copilot tool availability, skill discovery and successful comparison still need the live checks above.
