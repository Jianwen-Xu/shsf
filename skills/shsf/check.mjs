#!/usr/bin/env node
// Zero-dependency validator for .shsf spec files.
//
//   node skills/shsf/check.mjs [file...]     (default: every .shsf/*.md)
//
// Exit 1 on an invalid spec that claims `status: ready`, or an unknown status.
// Warnings do not fail the run. Format is defined by shsf-template.md.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const STATUSES = ['draft', 'ready', 'done'];
const SECTIONS = ['Task', 'Context', 'Decisions', 'Scope', 'Acceptance'];

/** Problems for one file, as {line, level, message}. */
function inspect(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const problems = [];
  const add = (line, level, message) => problems.push({ line, level, message });

  // --- frontmatter ---------------------------------------------------------
  let fm = {};
  let open = -1;
  let close = -1;

  if (lines[0]?.trim() === '---') {
    close = lines.indexOf('---', 1);
    if (close === -1) {
      add(1, 'error', 'unterminated frontmatter');
    } else {
      open = 1;
      for (let i = 1; i < close; i++) {
        const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(lines[i]);
        if (!m) continue;
        fm[m[1]] = m[2].replace(/\s+#.*$/, '').trim();
      }
    }
  } else {
    add(1, 'error', 'missing frontmatter (expected --- on line 1)');
  }

  const statusLine = lines.findIndex((l) => /^status:/.test(l)) + 1;
  if (!fm.status) {
    add(statusLine || 1, 'error', 'frontmatter is missing "status"');
  } else if (!STATUSES.includes(fm.status)) {
    add(statusLine, 'error', `unknown status "${fm.status}" (expected ${STATUSES.join(', ')})`);
  }

  // --- required sections (warnings only) -----------------------------------
  for (const name of SECTIONS) {
    const re = new RegExp(`^##\\s+${name}\\b`);
    if (!lines.some((l) => re.test(l))) {
      add(close + 1 || 1, 'warning', `missing "## ${name}" section`);
    }
  }

  // --- blocking decisions must be answered once ready ----------------------
  if (fm.status === 'ready') {
    for (let i = 0; i < lines.length; i++) {
      const heading = /^###\s+(D\d+)\b/.exec(lines[i]);
      if (!heading || !/\[blocking\]/.test(lines[i])) continue;

      let end = i + 1;
      while (end < lines.length && !/^#{2,3}\s/.test(lines[end])) end++;

      const block = lines.slice(i + 1, end);
      const answerAt = block.findIndex((l) => /^Answer:/.test(l));
      const inline = answerAt === -1 ? '' : block[answerAt].replace(/^Answer:\s*/, '').trim();
      const below =
        answerAt === -1
          ? ''
          : (block.slice(answerAt + 1).find((l) => l.trim() !== '') ?? '').trim();
      const answered = inline !== '' || (below !== '' && !/^#{1,6}\s/.test(below));

      if (!answered) {
        add(
          i + 1,
          'error',
          `${heading[1]} is [blocking] but has no Answer — spec is "ready" but not decided`,
        );
      }
    }
  }

  return problems;
}

// --- main ------------------------------------------------------------------
const args = process.argv.slice(2);
let targets = args;
if (targets.length === 0) {
  try {
    targets = readdirSync('.shsf')
      .filter((f) => f.endsWith('.md'))
      .map((f) => join('.shsf', f));
  } catch {
    targets = [];
  }
}

if (targets.length === 0) {
  console.error('check: no spec files given and none found in .shsf/');
  process.exit(1);
}

let failed = false;
let count = 0;
for (const path of targets) {
  let problems;
  try {
    problems = inspect(path);
  } catch (err) {
    console.error(`${path}:0: ${err.code === 'ENOENT' ? 'no such file' : err.message}`);
    failed = true;
    continue;
  }
  problems.sort((a, b) => a.line - b.line);
  for (const p of problems) {
    console.error(`${path}:${p.line}: ${p.message}`);
    if (p.level === 'error') failed = true;
    count++;
  }
}

process.exit(failed ? 1 : 0);
