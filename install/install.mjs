#!/usr/bin/env node
/* install.mjs — cross-platform skill installer.
   Links a theme-service repo's skill/ into ~/.claude/skills/theme-service (directory
   junction on Windows, symlink elsewhere; copy fallback) and writes the machine-local
   config ~/.claude/theme-service.local.json (OUTSIDE the repo, never committed):
     { repo, version, includeBuiltinThemes, history: [{date, version, action, note}] }

   Usage (usually via npm scripts):
     npm run install-no-themes         # link skill + config only (no themes built)
     npm run install-all               # ^ and build themes (built-ins + your local)
     node install/install.mjs --source <path>   # point at a DIFFERENT theme-service clone
     node install/install.mjs --builtins false  # remember: exclude the origin's built-ins
     node install/install.mjs --help

   Change your source anytime: re-run from the clone you want, use --source, or edit the
   `repo` field in ~/.claude/theme-service.local.json. It's read at runtime. */
import { existsSync, lstatSync, rmSync, mkdirSync, symlinkSync, cpSync, writeFileSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const flag = name => { const i = argv.indexOf(name); return i !== -1 ? argv[i + 1] : undefined; };
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(`theme-service installer
  --source <path>        use a different theme-service clone as your source (default: this repo)
  --builtins <true|false> remember whether to include the origin's built-in themes when building
  --help                 show this
Links skill/ into ~/.claude/skills/theme-service and writes ~/.claude/theme-service.local.json.`);
  process.exit(0);
}

const scriptRepo = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = flag('--source') ? resolve(flag('--source')) : scriptRepo;
const source = join(repo, 'skill');
const claude = join(homedir(), '.claude');
const skills = join(claude, 'skills');
const target = join(skills, 'theme-service');
const configPath = join(claude, 'theme-service.local.json');

if (!existsSync(join(source, 'SKILL.md'))) {
  console.error(`skill/SKILL.md not found under ${source} — is ${repo} a theme-service clone?`);
  process.exit(1);
}
mkdirSync(skills, { recursive: true });

// Refresh an existing link; refuse to clobber a real directory.
if (existsSync(target)) {
  if (lstatSync(target).isSymbolicLink()) rmSync(target, { recursive: true, force: true });
  else { console.error(`${target} exists and is a real directory (not a link). Remove it manually, then re-run.`); process.exit(1); }
}

let linked = true;
try {
  symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir');
  console.log(`Linked skill: ${target} -> ${source}`);
} catch {
  cpSync(source, target, { recursive: true });
  linked = false;
  console.log(`Copied skill into: ${target} (link unavailable; re-run install to update)`);
}

// Merge into the existing machine-local config (preserve history + prior prefs).
let cfg = {};
try { if (existsSync(configPath)) cfg = JSON.parse(readFileSync(configPath, 'utf8')); } catch { cfg = {}; }
const version = (() => { try { return readFileSync(join(repo, 'VERSION'), 'utf8').trim(); } catch { return '0.0.0'; } })();

cfg.repo = repo;
cfg.version = version;
const builtinsArg = flag('--builtins');
if (builtinsArg !== undefined) cfg.includeBuiltinThemes = builtinsArg !== 'false';
else if (cfg.includeBuiltinThemes === undefined) cfg.includeBuiltinThemes = true;

cfg.history = Array.isArray(cfg.history) ? cfg.history : [];
cfg.history.push({
  date: new Date().toISOString().slice(0, 10),
  version,
  action: 'install',
  note: `source ${repo} · includeBuiltinThemes=${cfg.includeBuiltinThemes}`,
});

writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`Wrote ${configPath}  (repo=${repo}, includeBuiltinThemes=${cfg.includeBuiltinThemes})`);
console.log("\nDone. Claude Code will discover the 'theme-service' skill on next session.");
if (!linked) console.log('Note: installed as a copy — re-run this script after updating the repo.');
