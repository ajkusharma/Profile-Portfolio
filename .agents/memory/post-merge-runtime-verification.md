---
name: Post-merge runtime verification
description: Dependency replacement can require a managed workflow restart even after successful setup.
---

Verify the actual preview after post-merge dependency installation; successful setup and reconciliation alone do not prove the browser is working.

**Why:** Replacing installed dependencies left the running Vite preview returning “504 Outdated Optimize Dep” despite a successful setup result. Restarting the managed application workflow restored the preview.

**How to apply:** When dependency setup succeeds but the preview reports outdated optimized dependencies, restart the existing managed workflow and check the rendered app rather than changing application code or bypassing dependency security policy.
