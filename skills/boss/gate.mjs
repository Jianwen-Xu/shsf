#!/usr/bin/env node
// Mechanical half of the /boss gate: what changed, which of it is tests,
// and which files the spec never mentions. Facts only — the verdict stays
// with the human.
//
//   node skills/boss/gate.mjs --spec .shsf/x.md [--base HEAD] [--head <ref>] [--strict]
//
// Exit 0 normally, 1 with --strict when a test file changed that the spec's
// "Test changes" line does not declare, 2 on usage or git errors.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const TEST_PATTERNS = [
  /(^|\/)(tests?|__tests__|spec)\//i,
  /\.(test|spec)\.[cm]?[jt]sx?$/i,
  /_test\.(py|go|rb|exs?)$/i,
  /(^|\/)test_.*\.py$/i,
  /Tests?\.(java|cs|kt)$/,
];

const PATHISH =
  /\/|\.(md|mjs|cjs|js|ts|tsx|jsx|py|go|rs|java|kt|rb|json|ya?ml|toml|css|scss|html|sh|sql)$/i;

const isTest = (p) => TEST_PATTERNS.some((r) => r.test(p));
const norm = (p) => p.replace(/^\.\//, '').replace(/\/+$/, '');

function fail(msg) {
  console.error(`gate: ${msg}`);
  process.exit(2);
}

// --- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const opts = { base: 'HEAD', head: null, spec: null, strict: false };

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--help' || a === '-h') {
    console.log('usage: gate.mjs [--spec <file>] [--base <ref>] [--head <ref>] [--strict]');
    process.exit(0);
  } else if (a === '--strict') opts.strict = true;
  else if (a === '--spec' || a === '--base' || a === '--head') {
    const v = argv[++i];
    if (v === undefined) fail(`${a} needs a value`);
    opts[a.slice(2)] = v;
  } else fail(`unknown argument ${a}`);
}

if (!opts.spec) {
  if (!existsSync('.shsf/latest')) fail('no --spec given and no .shsf/latest to fall back on');
  opts.spec = readFileSync('.shsf/latest', 'utf8').trim();
}

let spec;
try {
  spec = readFileSync(opts.spec, 'utf8');
} catch (err) {
  fail(`cannot read spec ${opts.spec}: ${err.code === 'ENOENT' ? 'no such file' : err.message}`);
}

// --- spec terms -------------------------------------------------------------
/** Section body between `## <name>` and the next `## `. */
function section(name) {
  const re = new RegExp(`^##\\s+${name}\\s*$`, 'm');
  const m = re.exec(spec);
  if (!m) return '';
  const rest = spec.slice(m.index + m[0].length);
  const next = /^##\s+\S/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** Path-like tokens: backticked spans and bare words that look like paths. */
function pathTokens(text) {
  const out = new Set();
  for (const m of text.matchAll(/`([^`\n]+)`/g)) {
    const t = m[1].trim();
    if (PATHISH.test(t)) out.add(norm(t));
  }
  for (const m of text.matchAll(/(?:^|[\s(（,;、])([\w.@-]+(?:\/[\w.@-]+)+|[\w-]+\.[a-z]{1,5})(?=$|[\s),;、。:：])/g)) {
    const t = m[1].trim();
    if (PATHISH.test(t)) out.add(norm(t));
  }
  return [...out];
}

const scopeTokens = pathTokens(section('Scope'));
const declaredTests = pathTokens(
  (section('Acceptance').match(/^\s*-\s*\*\*Test changes:\*\*(.*)$/m) || [, ''])[1],
);

const mentions = (file, list) =>
  list.some((t) => file === t || file.startsWith(`${t}/`) || file.includes(t));

// --- diff -------------------------------------------------------------------
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    fail(`git ${args.join(' ')} failed: ${(err.stderr || err.message).toString().trim()}`);
  }
}

const range = opts.head ? `${opts.base}..${opts.head}` : opts.base;
const status = git(['diff', '--name-status', '--find-renames', range]).trim();
const changes = status
  ? status.split('\n').map((line) => {
      const parts = line.split('\t');
      return { code: parts[0].charAt(0), path: parts[parts.length - 1] };
    })
  : [];

// Bookkeeping lives in .shsf/ and is never part of the change under review.
const tracked = changes.filter((c) => !c.path.startsWith('.shsf/'));
const tests = tracked.filter((c) => isTest(c.path));
const unmentioned = tracked.filter(
  (c) => !mentions(c.path, scopeTokens) && !declaredTests.some((t) => c.path.includes(t)),
);
const undeclaredTests = tests.filter((c) => !mentions(c.path, declaredTests));

// --- report -----------------------------------------------------------------
const label = opts.head ? `${opts.base}..${opts.head}` : `${opts.base}..working tree`;
const line = (c, note = '') => `  ${c.code} ${c.path}${note ? `  ${note}` : ''}`;

console.log(`GATE   ${label}`);
console.log(`FILES  ${tracked.length} changed`);

if (tracked.length === 0) {
  console.log('TESTS  none changed');
  console.log('SCOPE  nothing to match');
} else {
  console.log(
    tests.length === 0 ? 'TESTS  none changed' : `TESTS  ${tests.length} changed`,
  );
  for (const c of tests) {
    console.log(line(c, mentions(c.path, declaredTests) ? 'declared' : 'NOT declared in Test changes'));
  }

  if (unmentioned.length === 0) {
    console.log('SCOPE  every changed file is named in the spec');
  } else {
    console.log(`SCOPE  ${unmentioned.length} not named in the spec`);
    for (const c of unmentioned) console.log(line(c));
  }
}

if (scopeTokens.length) console.log(`TERMS  ${scopeTokens.join(' · ')}`);

process.exit(opts.strict && undeclaredTests.length > 0 ? 1 : 0);
