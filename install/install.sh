#!/usr/bin/env bash
# install.sh — make the theme-service skill available to Claude Code on macOS/Linux.
#  - Symlinks this repo's skill/ into ~/.claude/skills/theme-service (falls back to copy).
#  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find the
#    source of truth. That file lives OUTSIDE the repo and is never committed.
# Re-run any time to refresh.  Usage:  bash install/install.sh
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(dirname "$script_dir")"
source_dir="$repo/skill"
claude="$HOME/.claude"
skills="$claude/skills"
target="$skills/theme-service"
config="$claude/theme-service.local.json"

[ -f "$source_dir/SKILL.md" ] || { echo "skill/SKILL.md not found under $source_dir" >&2; exit 1; }
mkdir -p "$skills"

# Refresh an existing link; refuse to clobber a real directory.
if [ -L "$target" ]; then
  rm "$target"
elif [ -e "$target" ]; then
  echo "$target exists and is a real directory (not a link). Remove it manually, then re-run." >&2
  exit 1
fi

if ln -s "$source_dir" "$target" 2>/dev/null; then
  echo "Linked (symlink): $target -> $source_dir"
else
  cp -R "$source_dir" "$target"
  echo "Copied skill into: $target (symlink unavailable; re-run install to update)"
fi

version="$(tr -d '[:space:]' < "$repo/VERSION")"
printf '{\n  "repo": "%s",\n  "version": "%s"\n}\n' "$repo" "$version" > "$config"
echo "Wrote $config"

echo
echo "Done. Claude Code will discover the 'theme-service' skill on next session."
