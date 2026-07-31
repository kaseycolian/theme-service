<#
  install.ps1 — make this repo's skills available to Claude Code on Windows.
  - Links skill/ -> ~/.claude/skills/theme-service          (create + apply themes)
    and  skill-a11y-way-pages/ -> ~/.claude/skills/a11y-way-pages  (header/footer/favicon)
    as directory JUNCTIONS, which need no admin; falls back to a copy if that fails.
  - Writes ~/.claude/theme-service.local.json with this repo's path so agents can find
    the source of truth. This file lives OUTSIDE the repo and is never committed.
  Re-run any time to refresh. Usage:  pwsh -File install/install.ps1
#>
$ErrorActionPreference = 'Stop'

$repo   = Split-Path -Parent $PSScriptRoot           # install/ -> repo root
$claude = Join-Path $env:USERPROFILE '.claude'
$skills = Join-Path $claude 'skills'
$config = Join-Path $claude 'theme-service.local.json'

# Every skill this repo ships: source directory -> name under ~/.claude/skills/.
$skillMap = [ordered]@{
  'skill'                = 'theme-service'
  'skill-a11y-way-pages' = 'a11y-way-pages'
}

foreach ($dir in $skillMap.Keys) {
  if (-not (Test-Path (Join-Path $repo "$dir/SKILL.md"))) { throw "$dir/SKILL.md not found under $repo" }
}
New-Item -ItemType Directory -Force -Path $skills | Out-Null

$linked = $true
foreach ($dir in $skillMap.Keys) {
  $source = Join-Path $repo $dir
  $target = Join-Path $skills $skillMap[$dir]

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
  try {
    New-Item -ItemType Junction -Path $target -Target $source | Out-Null
    Write-Host "Linked (junction): $target -> $source"
  } catch {
    Copy-Item -Recurse -Force $source $target
    $linked = $false
    Write-Host "Copied skill into: $target (junction unavailable; re-run install to update)"
  }
}

# Machine-local config (repo location) — outside the repo, never committed.
@{ repo = $repo; version = (Get-Content (Join-Path $repo 'VERSION') -Raw).Trim() } |
  ConvertTo-Json | Set-Content -Path $config -Encoding UTF8
Write-Host "Wrote $config"

Write-Host ""
Write-Host "Done. Claude Code will discover these skills on next session: $($skillMap.Values -join ', ')."
if (-not $linked) { Write-Host "Note: installed as a copy — re-run this script after updating the repo." }
