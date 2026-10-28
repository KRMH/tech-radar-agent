# Source collection and applicability

## Official evidence first

For each configured package use its exact ecosystem identity and verified project links. Do not guess a repository from the package name. Maintainer advisories/release notes are primary evidence; OSV and GitHub's advisory database provide structured records and aliases. CVE identifiers are optional: report a relevant GHSA/OSV advisory even before a CVE is assigned.

A repository may contain many packages. Verify the affected package identity before attaching a repository-level advisory or monorepo release note to a watched package; mark uncertain mappings as investigate rather than asserting applicability.

Configured sources define coverage, not an exhaustive guarantee. Report which sources were actually checked. If a watchlist has no verified security or news source, identify that gap. Search may locate official pages, but a successful search is not a successful advisory-feed check. Do not use the technology catalogue or model memory as fresh security evidence. Send only public package identifiers/version information to external services; not internal project names, code or confidential context.

## OSV when API access is available

Use `POST https://api.osv.dev/v1/query` with `package.name`, `package.ecosystem` and an exact `version` to query a watched version. An available tool must support the actual request; ordinary page fetch/search is not an HTTP POST substitute. If unsupported, use other verified primary sources and mark OSV not checked.

Follow `next_page_token` with `page_token`. An empty page with a next token is not a complete empty result. If a collection bound, timeout or quota stops pagination, preserve observed findings and mark partial. Do not advance that source's successful checkpoint. Querying all versions by package, when supported, can identify new advisories not affecting a watched version; exact-version queries alone cover the watched versions, not every advisory for the library.

Previously reported IDs require direct record rechecks for material revisions/withdrawal. OSV excludes withdrawn records from query results, so disappearance cannot establish remediation or withdrawal. Preserve and verify the direct ID/source record. A withdrawn record changes the advisory's status; it does not prove the package has no other vulnerabilities.

## Interpreting versions and fixes

Record each watched exact version separately. Version ranges in package manifests describe allowed versions, not necessarily the installed artifact. Version matching differs by ecosystem; do not use string ordering or assume every ecosystem follows npm SemVer. A definitive exact-version match or explicit authoritative affected range can establish applicability. If identity, range semantics, configuration or version is uncertain, report unknown with an investigate action.

An advisory may have several disjoint affected/fixed branches. A fixed event for one line is not automatically a suitable upgrade target for another line. Cite the maintainer-supported fix for the watched line or state that the target needs verification. Keep runtime/configuration prerequisites explicit; an affected version does not alone prove exploitability in the user's deployment. Never invent severity, exploit status, CVSS numeric scores or a security guarantee.

## Releases and news

Use official changelogs, release notes, security notices, deprecation notices and maintenance/support announcements. GitHub's releases endpoint does not include all plain Git tags. Check the configured official announcement/changelog source as well; lack of a GitHub release is not lack of news. Label prereleases; do not recommend a release candidate as the default production fix. Check publication and meaningful update dates, not just indexing/retrieval dates.

If Exa/Tavily are needed for discovery, follow enabled live provider order in `discovery/providers.json`; do not retry a failed provider in the same run. This skill performs monitoring of an established list, so it does not require a use-case interview or competitor discovery. Never fall back to the offline catalogue for today's news. A provider failure may be bypassed by successfully fetching a known primary source; log actual per-source coverage.

## Source contracts

- [OSV query API and pagination](https://google.github.io/osv.dev/post-v1-query/)
- [OSV FAQ: withdrawn records](https://github.com/google/osv.dev/blob/master/docs/faq.md)
- [GitHub releases API](https://docs.github.com/en/rest/releases/releases)

These document source behavior. They are not evidence of any current package vulnerability.
