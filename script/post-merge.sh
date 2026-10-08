#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Keep dependencies reproducible without changing the committed lockfile.
npm ci --no-audit --no-fund

# Verify merged code and rebuild the portfolio and static article pages.
npm run check
npm run build
