#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'detran-blueprints-'));
try {
  const result = spawnSync(
    process.execPath,
    [path.join(root, 'tools/blueprints/generate.mjs')],
    {
      cwd: root,
      env: { ...process.env, BLUEPRINTS_OUTPUT: temp },
      encoding: 'utf8',
    },
  );
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  const expected = JSON.parse(
    fs.readFileSync(
      path.join(temp, 'tools/blueprints/generated-files.json'),
      'utf8',
    ),
  );
  const committedManifest = path.join(
    root,
    'tools/blueprints/generated-files.json',
  );
  const committed = fs.existsSync(committedManifest)
    ? JSON.parse(fs.readFileSync(committedManifest, 'utf8'))
    : [];
  const all = [...new Set([...expected, ...committed])].sort();
  const drift = all.filter((relative) => {
    const generated = path.join(temp, relative);
    const checkedIn = path.join(root, relative);
    if (!fs.existsSync(generated) || !fs.existsSync(checkedIn)) return true;
    return !fs.readFileSync(generated).equals(fs.readFileSync(checkedIn));
  });
  if (drift.length) {
    console.error(
      'Generated blueprint output drifted from the committed tree:',
    );
    console.error(drift.map((file) => `- ${file}`).join('\n'));
    process.exit(1);
  }
  console.log(
    'blueprints:check passed: committed generated tree matches every blueprint',
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
