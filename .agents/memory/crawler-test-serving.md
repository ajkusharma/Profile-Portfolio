---
name: Crawler test serving
description: Why crawler regression tests must exercise the production request path rather than Vite preview.
---

Use the actual production server for crawler-visible HTML checks, even when a
generic preview server appears adequate for client-side navigation.

**Why:** Vite preview served the Home SPA fallback for extensionless article
requests despite complete generated article HTML existing on disk. JavaScript
repaired the page and metadata, concealing the difference. Production serving
delivered the generated article pages. A passing SPA test cannot establish
crawler-readable responses.

**How to apply:** Check the raw response at the public article route and use a
JavaScript-disabled browser. Keep crawler checks independent of live publication
and indexing; local production serving only establishes build/serving behavior.
