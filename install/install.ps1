<#
  install.ps1 — make the theme-service skill available to Claude Code on Windows.
  - Links this repo's skill/ into ~/.claude/skills/theme-service (directory JUNCTION,
    which needs no admin; falls back to a copy if that fails).
  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find
    the source of truth. This file lives OUTSIDE the repo and is never committed.
  Re-run any time to refresh. Usage:  pwsh -File install/install.ps1
#>
$ErrorActionPreference = 'Stop'

$repo   = Split-Path -Parent $PSScriptRoot           # install/ -> repo root
$source = Join-Path $repo 'skill'
$claude = Join-Path $env:USERPROFILE '.claude'
$skills = Join-Path $claude 'skills'
$target = Join-Path $skills 'theme-service'
$config = Join-Path $claude 'theme-service.local.json'

if (-not (Test-Path (Join-Path $source 'SKILL.md'))) { throw "skill/SKILL.md not found under $source" }
New-Item -ItemType Directory -Force -Path $skills | Out-Null

# Remove any existing link (reparse point) so we can refresh it. Refuse to clobber a real folder.
if (Test-Path $target) {
  $item = Get-Item $target -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
    (Get-Item $target -Force).Delete()
  } else {
    throw "$target exists and is a real directory (not a link). Remove it manually, then re-run."
  }
}

# Prefer a junction (no admin). Fall back to a copy.
$linked = $false
try {
  New-Item -ItemType Junction -Path $target -Target $source | Out-Null
  $linked = $true
  Write-Host "Linked (junction): $target -> $source"
} catch {
  Copy-Item -Recurse -Force $source $target
  Write-Host "Copied skill into: $target (junction unavailable; re-run install to update)"
}

# Machine-local config (repo location) — outside the repo, never committed.
@{ repo = $repo; version = (Get-Content (Join-Path $repo 'VERSION') -Raw).Trim() } |
  ConvertTo-Json | Set-Content -Path $config -Encoding UTF8
Write-Host "Wrote $config"

Write-Host ""
Write-Host "Done. Claude Code will discover the 'theme-service' skill on next session."
if (-not $linked) { Write-Host "Note: installed as a copy — re-run this script after updating the repo." }
