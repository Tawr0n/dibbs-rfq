#!/usr/bin/env bash
# PostToolUse hook: formats the file Claude just wrote or edited.
set -euo pipefail

file_path=$(jq -r '.tool_input.file_path // empty')
[[ -z "$file_path" || ! -f "$file_path" ]] && exit 0

cd "$CLAUDE_PROJECT_DIR"
pnpm exec prettier --write --ignore-unknown "$file_path" >/dev/null 2>&1 || true
