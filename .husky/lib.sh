#!/usr/bin/env bash
# Shared helpers sourced by pre-commit and pre-push hooks

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

suggest_fixes() {
  local tool="$1"
  local findings="$2"

  if [ -z "$findings" ]; then
    return
  fi

  if ! command -v claude &>/dev/null; then
    echo -e "  ${YELLOW}Tip: install Claude Code to get automated fix suggestions.${NC}"
    return
  fi

  echo ""
  echo -e "${BOLD}Claude suggestions for ${tool} findings:${NC}"
  echo "──────────────────────────────────────────────"

  # Truncate very large outputs so the prompt stays focused
  local truncated
  truncated=$(echo "$findings" | head -c 6000)

  claude -p "You are a security code reviewer. The following findings were detected by ${tool} in a JavaScript/TypeScript codebase. For each finding, provide a specific, minimal fix — show the exact code change (before/after snippet or inline edit). Be concise and practical. Do not add commentary beyond what is needed to understand each fix.

Findings:
${truncated}"

  echo "──────────────────────────────────────────────"
  echo ""

  # Only prompt if running in a real terminal (not CI)
  if [ -t 1 ] && [ -e /dev/tty ]; then
    read -r -p "Apply these fixes with Claude Code? [y/N] " response </dev/tty
    echo ""
    if [[ "${response}" =~ ^[Yy]$ ]]; then
      claude "Apply fixes for the following ${tool} security findings. Make minimal, targeted changes only — do not refactor or change anything beyond what is needed to resolve each finding.

Findings:
${truncated}" </dev/tty
    fi
  fi
}
