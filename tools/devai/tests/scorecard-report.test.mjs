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
    const baseline = join(root, 'baseline.json');
    writeFileSync(
      baseline,
      JSON.stringify({
        items: rows.map((row) => ({
          ...row,
          native_verdict: 'FAIL',
          evaluation_disposition: 'partial',
        })),
      }),
    );
    writeFileSync(
      decisions,
      JSON.stringify({ rows, baseline_register: baseline }),
    );
    // An extra captured reading cannot override the native scorecard, but its
    // exact persisted bytes must survive without depending on ignored state.
    const reading = {
      id: 'SR-0123456789abcdef',
      sensor: { kind: 'trace_resolution' },
      status: 'pass',
    };
    const canonical = join(
      root,
      '.devai/state/sensor-readings/trace_resolution',
      `${reading.id}.json`,
    );
    mkdirSync(resolve(canonical, '..'), { recursive: true });
    const canonicalBytes = JSON.stringify(reading) + '\n';
    writeFileSync(canonical, canonicalBytes);
    writeFileSync(
      join(audit, 'supplemental.json'),
      JSON.stringify({
        argv: ['fixture'],
        exitCode: 0,
        signal: null,
        timedOut: false,
        stdout: JSON.stringify({
          ok: true,
          result: { value: { results: [{ stdout: JSON.stringify(reading) }] } },
        }),
        stderr: '',
      }),
    );
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
    const comparison = JSON.parse(
      readFileSync(join(output, 'baseline-comparison.json')),
    );
    assert.equal(comparison.cells.length, 43);
    assert.equal(comparison.baseline_native_applicable_counts.FAIL, 43);
    const manifest = JSON.parse(
      readFileSync(join(output, 'evidence-manifest.json')),
    );
    assert.ok(
      manifest.artifacts.every((entry) => /^[0-9a-f]{64}$/.test(entry.sha256)),
    );
    assert.equal(manifest.canonical_readings.length, 1);
    assert.equal(
      readFileSync(
        join(output, manifest.canonical_readings[0].archive_path),
        'utf8',
      ),
      canonicalBytes,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
