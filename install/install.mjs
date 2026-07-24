#!/usr/bin/env node
/* install.mjs — cross-platform skill installer (run via `npm run install-skill`).
   Links this repo's skill/ into ~/.claude/skills/theme-service (directory junction on
   Windows, symlink elsewhere; falls back to a copy) and writes the machine-local repo
   pointer to ~/.claude/theme-service.local.json (OUTSIDE the repo, never committed).
   Same effect as install.ps1 / install.sh — use whichever you prefer. Re-run to refresh. */
import { existsSync, lstatSync, rmSync, mkdirSync, symlinkSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');   // install/ -> repo root
const source = join(repo, 'skill');
const claude = join(homedir(), '.claude');
const skills = join(claude, 'skills');
const target = join(skills, 'theme-service');
const config = join(claude, 'theme-service.local.json');

if (!existsSync(join(source, 'SKILL.md'))) {
  console.error(`skill/SKILL.md not found under ${source}`);
  process.exit(1);
}
mkdirSync(skills, { recursive: true });

// Refresh an existing link; refuse to clobber a real directory.
if (existsSync(target)) {
  if (lstatSync(target).isSymbolicLink()) {
    rmSync(target, { recursive: true, force: true });
  } else {
    console.error(`${target} exists and is a real directory (not a link). Remove it manually, then re-run.`);
    process.exit(1);
  }
}

let linked = true;
try {
  symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir');
  console.log(`Linked: ${target} -> ${source}`);
} catch {
  cpSync(source, target, { recursive: true });
  linked = false;
  console.log(`Copied skill into: ${target} (link unavailable; re-run install to update)`);
}

const version = readFileSync(join(repo, 'VERSION'), 'utf8').trim();
writeFileSync(config, JSON.stringify({ repo, version }, null, 2) + '\n');
console.log(`Wrote ${config}`);

console.log("\nDone. Claude Code will discover the 'theme-service' skill on next session.");
if (!linked) console.log('Note: installed as a copy — re-run this script after updating the repo.');
