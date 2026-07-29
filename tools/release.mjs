#!/usr/bin/env node
/* =============================================================================
   release.mjs — cut a release: bump VERSION, prepend a CHANGELOG entry, commit
   those two files, and create the git tag `vX.Y.Z` (GitHub versioning).

   Usage:  npm run release <patch|minor|major> -- --note "what changed"
     e.g.  npm run release minor -- --note "Add 3 sunset themes; tweak skill prompts"

   Flags:
     --note, -m <text>   REQUIRED. Becomes the CHANGELOG entry and the tag message.
                         Multi-line is fine and encouraged — first line is the
                         commit subject, the rest becomes the commit body.
     --allow-dirty       Release with uncommitted work present. See below.
     --yes, -y           Skip the confirmation prompt.

   VERSION is the single source of truth (build-final.mjs reads it). Commit your
   feature work FIRST; this finalizes the version. Then push with:
     git push --follow-tags

   Why the dirty-tree guard exists: this commits ONLY VERSION + CHANGELOG.md, so
   releasing with uncommitted work produces a tag pointing at a commit that does
   not contain the work the tag claims to ship. Nothing errors — it surfaces much
   later, when someone checks out the tag and finds it half-empty. --allow-dirty
   is there for the case where you genuinely mean it.
   ============================================================================= */
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const die = m => { console.error(m); process.exit(1); };
const has = (...names) => names.some(n => args.includes(n));

const USAGE = 'Usage: npm run release <patch|minor|major> -- --note "…" [--allow-dirty] [--yes]';

/* The bump rule, restated here so the script can show it at the moment you have
   to choose. CHANGELOG.md's header is the canonical statement — keep both in
   step if the policy ever changes. */
const POLICY = {
  major: 'breaking token renames/removals, or a default-theme change',
  minor: 'additive themes/tokens, or new opt-in files',
  patch: 'fixes and docs — no token surface change',
};

const type = args.find(a => ['patch', 'minor', 'major'].includes(a));
if (!type) die(USAGE);

/* Required, not defaulted. This note is the only thing a consuming app has to go
   on when deciding whether an upgrade affects it, so a release without one is a
   release nobody can migrate against. The old default ("Release vX.Y.Z.") wrote
   an entry that said nothing. */
const noteIdx = args.findIndex(a => a === '--note' || a === '-m');
const note = (noteIdx !== -1 && args[noteIdx + 1]) ? args[noteIdx + 1].trim() : '';
if (!note) {
  die(`${USAGE}\n\n--note is required: it becomes the CHANGELOG entry apps read to migrate.`);
}

const git = (a, opts = {}) => spawnSync('git', a, { cwd: REPO, encoding: 'utf8', ...opts });
if (git(['rev-parse', '--is-inside-work-tree']).status !== 0) die('Not a git repo.');

/* Anything uncommitted other than the two files this script is about to write
   and commit itself. A hand-edited CHANGELOG is normal — the new entry is
   prepended to whatever is already there — so those two never count as dirty.
   Untracked files count: a new file that is part of the feature is exactly the
   thing that would go missing from the tag. */
const OWN = ['VERSION', 'CHANGELOG.md'];
const dirty = git(['status', '--porcelain']).stdout
  .split('\n')
  .filter(Boolean)
  .map(l => ({ code: l.slice(0, 2).trim(), path: l.slice(3).trim() }))
  .filter(e => !OWN.includes(e.path));
if (dirty.length && !has('--allow-dirty')) {
  die(
    `Refusing to release with uncommitted changes (${dirty.length}):\n` +
    dirty.slice(0, 12).map(e => `  ${e.code.padEnd(2)} ${e.path}`).join('\n') +
    (dirty.length > 12 ? `\n  … and ${dirty.length - 12} more` : '') +
    '\n\nThis commits only VERSION + CHANGELOG.md, so the tag would not contain the\n' +
    'work above. Commit it first, or pass --allow-dirty if that is what you want.'
  );
}

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

/* Show the whole plan before touching anything, because the two things most
   worth catching — wrong bump type, note that reads badly in the log — are only
   obvious side by side. */
const noteLines = note.split('\n');
console.log(`\n  ${cur}  ->  ${next}   (${type})    tag ${tag}`);
console.log(`\n  Bump rule (CHANGELOG.md is canonical):`);
for (const [k, rule] of Object.entries(POLICY)) {
  console.log(`    ${k === type ? '->' : '  '} ${k.padEnd(6)} ${rule}`);
}
console.log(`\n  CHANGELOG entry:\n    ## ${next} — ${new Date().toISOString().slice(0, 10)}`);
for (const l of noteLines.slice(0, 6)) console.log(`    ${l}`);
if (noteLines.length > 6) console.log(`    … ${noteLines.length - 6} more line(s)`);
if (dirty.length) console.log(`\n  WARNING: releasing with ${dirty.length} uncommitted change(s) (--allow-dirty).`);
console.log('');

/* Prompt only when there is a human to answer. Piped or non-interactive (CI, an
   agent, `| tee`) proceeds as before, so every documented invocation and any
   existing automation keeps working without --yes. */
if (process.stdin.isTTY && !has('--yes', '-y')) {
  const { createInterface } = await import('node:readline');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(res => rl.question(`Release ${tag}? [y/N] `, a => { rl.close(); res(a); }));
  if (!/^y(es)?$/i.test(answer.trim())) die('Aborted. Nothing written.');
}

// Write VERSION.
writeFileSync(join(REPO, 'VERSION'), next + '\n');

// Prepend a CHANGELOG entry above the first "## " section.
const date = new Date().toISOString().slice(0, 10);
const clPath = join(REPO, 'CHANGELOG.md');
let cl = readFileSync(clPath, 'utf8');
const entry = `## ${next} — ${date}\n\n${note}\n\n`;
const at = cl.indexOf('\n## ');
cl = at !== -1 ? cl.slice(0, at + 1) + entry + cl.slice(at + 1) : cl.trimEnd() + '\n\n' + entry;
writeFileSync(clPath, cl);

/* Commit ONLY VERSION + CHANGELOG (leaves any other staged work alone), then tag.
   Subject is the note's FIRST LINE only: `-m "Release v1.2.0: <whole note>"` put
   a multi-line string in the subject position, which git silently splits at the
   first newline anyway — so a long note produced a subject with no separating
   blank line and a body git had to guess at. Passing the two parts as separate
   -m arguments makes the split explicit. */
const subject = `Release ${tag}: ${noteLines[0]}`;
const rest = noteLines.slice(1).join('\n').trim();
const commitArgs = ['commit', '-m', subject];
if (rest) commitArgs.push('-m', rest);
let r = git([...commitArgs, '--', 'VERSION', 'CHANGELOG.md'], { stdio: 'inherit' });
if (r.status !== 0) die('git commit failed (nothing to commit? or pre-commit hook failed).');
r = git(['tag', '-a', tag, '-m', note], { stdio: 'inherit' });
if (r.status !== 0) die('git tag failed.');

console.log(`\nReleased ${tag}. Push it with:\n  git push --follow-tags`);
