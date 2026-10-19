import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

test('renders a successful native UNKNOWN command as 43 blocked entries, never measured PASS', () => {
  const source = resolve(import.meta.dirname, '../../..');
  const root = mkdtempSync(join(tmpdir(), 'detran-assessment-'));
  try {
    mkdirSync(join(root, 'node_modules/@aarusso-nyx'), { recursive: true });
    symlinkSync(
      realpathSync(join(source, 'node_modules/@aarusso-nyx/devai')),
      join(root, 'node_modules/@aarusso-nyx/devai'),
      'dir',
    );
    const version = JSON.parse(
      readFileSync(
        join(source, 'node_modules/@aarusso-nyx/devai/package.json'),
      ),
    ).version;
    const commit = 'a'.repeat(40),
      cells = [],
      rows = [];
    for (let f = 1; f <= 5; f++)
      for (let t = 1; t <= 9; t++) {
        const substrate = `F${f}`,
          property = `T${t}`,
          cell = `${substrate}:${property}`;
        const na = cell === 'F1:T1' || cell === 'F4:T5';
        cells.push({
          substrate,
          property,
          verdict: na ? 'N/A' : 'UNKNOWN',
          sensor_readings: [],
        });
        if (!na)
          rows.push({
            cell,
            evaluation_disposition: 'blocked',
            criteria: 'Fixture predicate',
            input_population: { fixture: true },
            limitations: 'No observation in this fixture',
            next_action: 'Collect actual evidence',
            follow_up_owner: 'Inspector',
          });
      }
    const audit = join(root, 'captures');
    mkdirSync(audit);
    writeFileSync(
      join(audit, 'evaluation-context.json'),
      JSON.stringify({ integration_head: commit, framework_version: version }),
    );
    writeFileSync(
      join(audit, 'evaluated-scorecard.json'),
      JSON.stringify({
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdout: JSON.stringify({
          schemaVersion: '1.0.0',
          action_id: 'audit scorecard',
          ok: true,
          result: {
            media_type: 'application/json',
            verdict: 'unknown',
            value: {
              integration_head: commit,
              cells,
              overall: { verdict: 'UNKNOWN' },
            },
          },
        }),
        stderr: '',
      }),
    );
    const decisions = join(root, 'decisions.json');
    writeFileSync(decisions, JSON.stringify({ rows }));
    const output = join(root, 'report');
    execFileSync(
      process.execPath,
      [
        join(source, 'tools/devai/report-scorecard-remediation.mjs'),
        audit,
        decisions,
        output,
      ],
      { cwd: root },
    );
    const summary = JSON.parse(readFileSync(join(output, 'summary.json')));
    assert.equal(summary.applicable, 43);
    assert.equal(summary.native_counts.UNKNOWN, 43);
    assert.equal(summary.native_counts['N/A'], 2);
    assert.equal(summary.assessment_counts.blocked, 43);
    assert.equal(summary.supported_machine_verdicts, 0);
    assert.equal(summary.readiness_established, false);
    const manifest = JSON.parse(
      readFileSync(join(output, 'evidence-manifest.json')),
    );
    assert.ok(
      manifest.artifacts.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
