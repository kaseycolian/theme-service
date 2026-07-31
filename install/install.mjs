#!/usr/bin/env node
/* install.mjs — cross-platform skill installer.
   Links this repo's two skills into ~/.claude/skills/ (directory junction on Windows,
   symlink elsewhere; copy fallback):
     skill/                 -> ~/.claude/skills/theme-service    (create + apply themes)
     skill-a11y-way-pages/  -> ~/.claude/skills/a11y-way-pages    (site header/footer/favicon)
   They are deliberately separate: the pages skill consumes theme tokens read-only and
   never edits themes, so neither can disturb the other's work.

   Also writes the machine-local config ~/.claude/theme-service.local.json (OUTSIDE the
   repo, never committed) — both skills read `repo` from it to find their source:
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
Links skill/ -> ~/.claude/skills/theme-service and skill-a11y-way-pages/ -> ~/.claude/skills/a11y-way-pages,
and writes ~/.claude/theme-service.local.json.`);
  process.exit(0);
}

const scriptRepo = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = flag('--source') ? resolve(flag('--source')) : scriptRepo;
const claude = join(homedir(), '.claude');
const skills = join(claude, 'skills');
const configPath = join(claude, 'theme-service.local.json');

// Every skill this repo ships: [source dir in the repo, name under ~/.claude/skills/].
const SKILLS = [
  ['skill', 'theme-service'],
  ['skill-a11y-way-pages', 'a11y-way-pages'],
];

for (const [dir] of SKILLS) {
  if (!existsSync(join(repo, dir, 'SKILL.md'))) {
    console.error(`${dir}/SKILL.md not found under ${repo} — is it a theme-service clone?`);
    process.exit(1);
  }
}
mkdirSync(skills, { recursive: true });

/** Junction/symlink `source` at `target`, refreshing an existing link. Returns false if
 *  it had to fall back to a copy (which then needs a re-run to pick up repo changes). */
function link(source, target) {
  // Refresh an existing link; refuse to clobber a real directory.
  if (existsSync(target)) {
    if (lstatSync(target).isSymbolicLink()) rmSync(target, { recursive: true, force: true });
    else { console.error(`${target} exists and is a real directory (not a link). Remove it manually, then re-run.`); process.exit(1); }
  }
  try {
    symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir');
    console.log(`Linked skill: ${target} -> ${source}`);
    return true;
  } catch {
    cpSync(source, target, { recursive: true });
    console.log(`Copied skill into: ${target} (link unavailable; re-run install to update)`);
    return false;
  }
}

let linked = true;
for (const [dir, name] of SKILLS) {
  if (!link(join(repo, dir), join(skills, name))) linked = false;
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
console.log(`\nDone. Claude Code will discover these skills on next session: ${SKILLS.map(s => s[1]).join(', ')}.`);
if (!linked) console.log('Note: installed as a copy — re-run this script after updating the repo.');
