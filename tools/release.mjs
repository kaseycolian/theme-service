#!/usr/bin/env node
/* =============================================================================
   release.mjs — cut a release: bump VERSION, prepend a CHANGELOG entry, commit
   those two files, and create the git tag `vX.Y.Z` (GitHub versioning).

   Usage:  npm run release <patch|minor|major> -- --note "what changed"
     e.g.  npm run release minor -- --note "Add 3 sunset themes; tweak skill prompts"

   VERSION is the single source of truth (build-final.mjs reads it). Commit your
   feature work FIRST; this finalizes the version. Then push with:
     git push --follow-tags
   ============================================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const die = m => { console.error(m); process.exit(1); };

const type = args.find(a => ['patch', 'minor', 'major'].includes(a));
if (!type) die('Usage: npm run release <patch|minor|major> -- --note "…"');
const noteIdx = args.findIndex(a => a === '--note' || a === '-m');
const note = (noteIdx !== -1 && args[noteIdx + 1]) ? args[noteIdx + 1] : '';

const git = (a, opts = {}) => spawnSync('git', a, { cwd: REPO, encoding: 'utf8', ...opts });
if (git(['rev-parse', '--is-inside-work-tree']).status !== 0) die('Not a git repo.');

// Compute next version from the VERSION file.
const cur = readFileSync(join(REPO, 'VERSION'), 'utf8').trim();
const m = cur.match(/^(\d+)\.(\d+)\.(\d+)$/);
if (!m) die(`VERSION "${cur}" is not semver (X.Y.Z).`);
let [maj, min, pat] = m.slice(1).map(Number);
if (type === 'major') { maj++; min = 0; pat = 0; }
else if (type === 'minor') { min++; pat = 0; }
else pat++;
const next = `${maj}.${min}.${pat}`;
const tag = `v${next}`;

if (git(['rev-parse', tag]).status === 0) die(`Tag ${tag} already exists.`);

// Write VERSION.
writeFileSync(join(REPO, 'VERSION'), next + '\n');

// Prepend a CHANGELOG entry above the first "## " section.
const date = new Date().toISOString().slice(0, 10);
const body = note || `Release ${tag}.`;
const clPath = join(REPO, 'CHANGELOG.md');
let cl = readFileSync(clPath, 'utf8');
const entry = `## ${next} — ${date}\n\n${body}\n\n`;
const at = cl.indexOf('\n## ');
cl = at !== -1 ? cl.slice(0, at + 1) + entry + cl.slice(at + 1) : cl.trimEnd() + '\n\n' + entry;
writeFileSync(clPath, cl);

// Commit ONLY VERSION + CHANGELOG (leaves any other staged work alone), then tag.
const subject = `Release ${tag}${note ? ': ' + note : ''}`;
let r = git(['commit', '-m', subject, '--', 'VERSION', 'CHANGELOG.md'], { stdio: 'inherit' });
if (r.status !== 0) die('git commit failed (nothing to commit? or pre-commit hook failed).');
r = git(['tag', '-a', tag, '-m', body], { stdio: 'inherit' });
if (r.status !== 0) die('git tag failed.');

console.log(`\nReleased ${tag}. Push it with:\n  git push --follow-tags`);
