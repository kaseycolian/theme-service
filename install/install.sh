#!/usr/bin/env bash
# install.sh — make this repo's skills available to Claude Code on macOS/Linux.
#  - Symlinks skill/ -> ~/.claude/skills/theme-service           (create + apply themes)
#    and     skill-a11y-way-pages/ -> ~/.claude/skills/a11y-way-pages  (header/footer/favicon)
#    Falls back to a copy if symlinking is unavailable.
#  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find the
#    source of truth. That file lives OUTSIDE the repo and is never committed.
# Re-run any time to refresh.  Usage:  bash install/install.sh
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(dirname "$script_dir")"
claude="$HOME/.claude"
skills="$claude/skills"
config="$claude/theme-service.local.json"

# Every skill this repo ships, as "<source dir>:<name under ~/.claude/skills/>".
skill_map=(
  "skill:theme-service"
  "skill-a11y-way-pages:a11y-way-pages"
)

for entry in "${skill_map[@]}"; do
  dir="${entry%%:*}"
  [ -f "$repo/$dir/SKILL.md" ] || { echo "$dir/SKILL.md not found under $repo" >&2; exit 1; }
done
mkdir -p "$skills"

for entry in "${skill_map[@]}"; do
  dir="${entry%%:*}"
  name="${entry##*:}"
  source_dir="$repo/$dir"
  target="$skills/$name"

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
done

version="$(tr -d '[:space:]' < "$repo/VERSION")"
printf '{\n  "repo": "%s",\n  "version": "%s"\n}\n' "$repo" "$version" > "$config"
echo "Wrote $config"

echo
names=""
for entry in "${skill_map[@]}"; do names="${names:+$names, }${entry##*:}"; done
echo "Done. Claude Code will discover these skills on next session: $names."
