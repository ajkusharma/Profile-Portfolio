# Article release regression checks

Run `npm test`. It creates a **fresh production build**, starts the local
production server on port 4173, runs Chromium tests, shuts it down, then runs
metadata/plugin and built-discovery checks. No running app, email credentials,
published domain, or third-party share submission is needed. Outbound browser
requests and local API calls are blocked; share links are inspected rather than opened.

Browser setup:

- Replit's supplied `/repl/tools/bin/chromium` is detected automatically.
- Elsewhere run `npx playwright install chromium` once after `npm ci`.
- An existing Chromium can be selected with
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium`.

Other commands:

- `npm run test:articles:browser` — browser/static-HTML tests only, with fresh build.
- `npm run test:articles:types` — type-check the tests and configuration.
- `npm run check` — existing application type check.

Coverage includes both Home → article → other article → Home journeys, direct
requests/reloads, every TOC target, deep links, scroll reset, browser history,
unknown slugs, all canonical/description/Open Graph/Twitter metadata, exact
`https://www.ajkusharma.com` LinkedIn/X share URLs, clipboard success, permission
rejection and missing clipboard API, selectable manual-copy fallback, and
feedback reset on article changes.

Separate JavaScript-disabled browser contexts verify the generated HTML files
and their metadata. Full paragraph/list/code/caption text is compared with the
client reader, with checks for every section, architecture diagrams and sources.
This establishes local crawler-readable output, not live publication or indexing.

Tests fail without automatic retries. Failure screenshots and traces go in
ignored `test-results/`; open a trace using `npx playwright show-trace <path>`.
