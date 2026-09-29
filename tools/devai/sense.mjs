import { readFile } from 'node:fs/promises';

const repoUrl = new URL('../../', import.meta.url);
const schemaUrl = new URL(
  'node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json',
  repoUrl,
);
const registryUrl = new URL(
  'node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
  repoUrl,
);
const presetsUrl = new URL(
  'node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
  repoUrl,
);

const statusValues = new Set([
  'pass',
  'fail',
  'review',
  'skipped',
  'killed',
  'error',
  'unknown',
]);
const readingProperties = new Set([
  'schemaVersion',
  'lifecycle',
  'id',
  'sensor',
  'timestamp',
  'duration_ms',
  'tier',
  'status',
  'deterministic',
  'command',
  'command_hash',
  'exit_code',
  'evidence_path',
  'out_head',
  'err_head',
  'killed',
  'findings',
  'metrics',
  'confidence',
]);

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) {
    throw new TypeError(`Invalid SensorReading: ${message}`);
  }
}

function assertProperties(value, allowed, location) {
  for (const key of Object.keys(value)) {
    assert(allowed.has(key), `${location}.${key} is not allowed`);
  }
}

function assertString(value, location, { minLength = 0, maxLength } = {}) {
  assert(typeof value === 'string', `${location} must be a string`);
  assert(value.length >= minLength, `${location} is too short`);
  if (maxLength !== undefined) {
    assert(value.length <= maxLength, `${location} is too long`);
  }
}

function assertConfidence(confidence) {
  assert(isPlainObject(confidence), 'confidence must be an object');
  assertProperties(
    confidence,
    new Set(['score', 'interval_low', 'interval_high', 'method']),
    'confidence',
  );
  if ('score' in confidence) {
    assert(
      typeof confidence.score === 'number' &&
        confidence.score >= 0 &&
        confidence.score <= 1,
      'confidence.score must be between 0 and 1',
    );
  }
  for (const key of ['interval_low', 'interval_high']) {
    if (key in confidence) {
      assert(
        typeof confidence[key] === 'number',
        `confidence.${key} must be a number`,
      );
    }
  }
  if ('method' in confidence) {
    assertString(confidence.method, 'confidence.method');
  }
}

function assertFindings(findings) {
  assert(Array.isArray(findings), 'findings must be an array');
  for (const finding of findings) {
    assert(isPlainObject(finding), 'finding must be an object');
    assertProperties(
      finding,
      new Set(['severity', 'code', 'message', 'file', 'line', 'invariant_id']),
      'finding',
    );
    assert(
      typeof finding.severity === 'string' &&
        ['info', 'warning', 'error', 'critical'].includes(finding.severity),
      'finding.severity is invalid',
    );
    assertString(finding.code, 'finding.code', { minLength: 1 });
    assertString(finding.message, 'finding.message', { minLength: 1 });
    if ('file' in finding) assertString(finding.file, 'finding.file');
    if ('line' in finding) {
      assert(
        Number.isInteger(finding.line) && finding.line >= 1,
        'finding.line is invalid',
      );
    }
    if ('invariant_id' in finding) {
      assertString(finding.invariant_id, 'finding.invariant_id');
      assert(
        finding.invariant_id.startsWith('INV-'),
        'finding.invariant_id is invalid',
      );
    }
  }
}

function validateReading(reading, kinds) {
  assert(isPlainObject(reading), 'reading must be an object');
  assertProperties(reading, readingProperties, 'reading');
  for (const key of [
    'schemaVersion',
    'id',
    'sensor',
    'timestamp',
    'status',
    'deterministic',
    'command',
    'command_hash',
  ]) {
    assert(key in reading, `${key} is required`);
  }
  assert(reading.schemaVersion === '1.0.0', 'schemaVersion must be 1.0.0');
  assert(/^SR-[a-f0-9]{16}$/.test(reading.id), 'id is invalid');
  assert(isPlainObject(reading.sensor), 'sensor must be an object');
  assertProperties(
    reading.sensor,
    new Set(['name', 'kind', 'version']),
    'sensor',
  );
  assert(
    'name' in reading.sensor && 'kind' in reading.sensor,
    'sensor.name and sensor.kind are required',
  );
  assertString(reading.sensor.name, 'sensor.name', { minLength: 1 });
  assert(kinds.has(reading.sensor.kind), 'sensor.kind is invalid');
  if ('version' in reading.sensor)
    assertString(reading.sensor.version, 'sensor.version');
  assertString(reading.timestamp, 'timestamp');
  assert(
    !Number.isNaN(Date.parse(reading.timestamp)),
    'timestamp must be date-time',
  );
  assert(statusValues.has(reading.status), 'status is invalid');
  assert(
    typeof reading.deterministic === 'boolean',
    'deterministic must be boolean',
  );
  assertString(reading.command, 'command', { minLength: 1 });
  assert(
    /^[a-f0-9]{64}$/.test(reading.command_hash),
    'command_hash is invalid',
  );
  if ('lifecycle' in reading) {
    assert(
      ['supported', 'experimental'].includes(reading.lifecycle),
      'lifecycle is invalid',
    );
  }
  if ('duration_ms' in reading) {
    assert(
      Number.isInteger(reading.duration_ms) && reading.duration_ms >= 0,
      'duration_ms is invalid',
    );
  }
  if ('tier' in reading)
    assert(
      ['L0', 'L1', 'L2', 'semantic'].includes(reading.tier),
      'tier is invalid',
    );
  if ('exit_code' in reading) {
    assert(
      reading.exit_code === null || Number.isInteger(reading.exit_code),
      'exit_code is invalid',
    );
  }
  for (const key of ['evidence_path']) {
    if (key in reading)
      assert(
        reading[key] === null || typeof reading[key] === 'string',
        `${key} is invalid`,
      );
  }
  for (const key of ['out_head', 'err_head']) {
    if (key in reading) assertString(reading[key], key, { maxLength: 4096 });
  }
  if ('killed' in reading)
    assert(typeof reading.killed === 'boolean', 'killed must be boolean');
  if ('findings' in reading) assertFindings(reading.findings);
  if ('metrics' in reading) {
    assert(isPlainObject(reading.metrics), 'metrics must be an object');
    for (const value of Object.values(reading.metrics)) {
      assert(
        ['number', 'string', 'boolean'].includes(typeof value),
        'metric is invalid',
      );
    }
  }
  if ('confidence' in reading) assertConfidence(reading.confidence);
  if (!reading.deterministic)
    assert(
      'confidence' in reading,
      'confidence is required for stochastic readings',
    );
}

function safeStatus(reading) {
  if (reading.killed === true) return 'killed';
  if (
    typeof reading.exit_code === 'number' &&
    reading.exit_code !== 0 &&
    reading.status === 'pass'
  ) {
    return 'fail';
  }
  return reading.status;
}

async function loadPolicy() {
  const [schema, registry, presets] = await Promise.all([
    readJson(schemaUrl),
    readJson(registryUrl),
    readJson(presetsUrl),
  ]);
  assert(
    schema.$id ===
      'https://devai.nyxk.com.br/schemas/sensor-reading.schema.json',
    'pinned schema id differs',
  );
  assert(schema.schema_version === '1.0.0', 'pinned schema version differs');
  assert(Array.isArray(registry.entries), 'registry.entries is invalid');
  assert(Array.isArray(presets.presets), 'presets.presets is invalid');
  return { registry, presets };
}

/**
 * Runs only an injected executor. This module never invokes `devai sense run` or
 * `devai sense record`; those protected commands require separate consent.
 */
export async function runSense({ preset, round, execute } = {}) {
  assert(typeof execute === 'function', 'execute must be an injected function');
  const { registry, presets } = await loadPolicy();
  const presetDefinition = presets.presets.find(
    (candidate) => candidate.name === preset,
  );
  assert(presetDefinition, 'preset is invalid');
  if (presetDefinition.round_required) {
    assert(
      typeof round === 'string' && round.length > 0,
      'round is required for this preset',
    );
  }
  const registryByKind = new Map(
    registry.entries.map((entry) => [entry.kind, entry]),
  );
  const selected = [...presetDefinition.members];
  for (const kind of selected)
    assert(registryByKind.has(kind), `preset kind ${kind} is not registered`);
  if (preset === 'sweep') {
    const readKinds = registry.entries
      .filter((entry) => entry.effect === 'read')
      .map((entry) => entry.kind);
    assert(
      JSON.stringify(selected) === JSON.stringify(readKinds),
      'sweep differs from registry read order',
    );
  }
  const kinds = new Set(registryByKind.keys());
  const readings = [];
  for (const kind of selected) {
    const rawReading = await execute(kind);
    validateReading(rawReading, kinds);
    assert(
      rawReading.sensor.kind === kind,
      'reading sensor.kind differs from selected kind',
    );
    const reading = { ...rawReading, status: safeStatus(rawReading) };
    validateReading(reading, kinds);
    readings.push(reading);
  }
  return { selected, readings };
}

function printUsage() {
  process.stdout.write(
    'Usage: pnpm devai:sense\n\n' +
      'This command only describes the sensor plan. It does not run or record sensors.\n' +
      'Protected commands (`devai sense run` and `devai sense record`) require explicit consent.\n',
  );
}

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  printUsage();
}
