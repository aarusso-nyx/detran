import { readFile, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const PRESET_NAMES = ['baseline', 'structural', 'governed', 'sweep'];
const EXPECTED_COUNTS = {
  baseline: 4,
  structural: 12,
  governed: 20,
  sweep: 49,
};
const EXPECTED_SWEEP_EXCLUDED_COUNT = 10;

function error(code, path, message, kind) {
  return kind === undefined
    ? { code, path, message }
    : { code, path, kind, message };
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function sameSet(left, right) {
  return (
    left.length === right.length && left.every((value) => right.includes(value))
  );
}

function sameSequence(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function validStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

export function verifySensorPolicy({ registry, presets, schema } = {}) {
  const errors = [];
  const counts = {};
  if (!isObject(registry) || !Array.isArray(registry.entries)) {
    errors.push(
      error(
        'SENSOR_POLICY_SOURCE_MALFORMED',
        'registry.entries',
        'Registry must contain an entries array.',
      ),
    );
  }
  if (!isObject(presets) || !Array.isArray(presets.presets)) {
    errors.push(
      error(
        'SENSOR_POLICY_SOURCE_MALFORMED',
        'presets.presets',
        'Presets must contain a presets array.',
      ),
    );
  }
  const schemaKinds = schema?.properties?.sensor?.properties?.kind?.enum;
  if (!isObject(schema) || !validStringArray(schemaKinds)) {
    errors.push(
      error(
        'SENSOR_POLICY_SOURCE_MALFORMED',
        'schema.properties.sensor.properties.kind.enum',
        'Schema must contain a string enum for SensorReading.sensor.kind.',
      ),
    );
  }
  if (errors.length > 0) return { ok: false, errors, counts };

  const entries = registry.entries;
  const registryKinds = [];
  const registryPaths = new Map();
  for (const [index, entry] of entries.entries()) {
    if (
      !isObject(entry) ||
      typeof entry.kind !== 'string' ||
      entry.kind.length === 0
    ) {
      errors.push(
        error(
          'SENSOR_REGISTRY_ENTRY_MALFORMED',
          `registry.entries[${index}].kind`,
          'Registry entries must have a non-empty string kind.',
        ),
      );
      continue;
    }
    registryKinds.push(entry.kind);
    if (!registryPaths.has(entry.kind)) {
      registryPaths.set(entry.kind, `registry.entries[${index}]`);
    }
    if (typeof entry.effect !== 'string')
      errors.push(
        error(
          'SENSOR_REGISTRY_ENTRY_MALFORMED',
          `registry.entries[${index}].effect`,
          'Registry entries must have a string effect.',
          entry.kind,
        ),
      );
    if (!validStringArray(entry.tiers))
      errors.push(
        error(
          'SENSOR_REGISTRY_ENTRY_MALFORMED',
          `registry.entries[${index}].tiers`,
          'Registry entries must have a string tiers array.',
          entry.kind,
        ),
      );
  }
  for (const kind of new Set(registryKinds)) {
    if (registryKinds.indexOf(kind) !== registryKinds.lastIndexOf(kind))
      errors.push(
        error(
          'SENSOR_REGISTRY_KIND_DUPLICATE',
          'registry.entries',
          'Registry kinds must be unique.',
          kind,
        ),
      );
  }
  for (const kind of new Set(schemaKinds)) {
    if (schemaKinds.indexOf(kind) !== schemaKinds.lastIndexOf(kind))
      errors.push(
        error(
          'SENSOR_SCHEMA_KIND_DUPLICATE',
          'schema.properties.sensor.properties.kind.enum',
          'Schema kinds must be unique.',
          kind,
        ),
      );
  }

  const presetByName = new Map();
  for (const [index, preset] of presets.presets.entries()) {
    const path = `presets.presets[${index}]`;
    if (!isObject(preset) || typeof preset.name !== 'string') {
      errors.push(
        error(
          'SENSOR_PRESET_MALFORMED',
          path,
          'Every preset must have a string name.',
        ),
      );
      continue;
    }
    if (presetByName.has(preset.name)) {
      errors.push(
        error(
          'SENSOR_PRESET_DUPLICATE',
          `${path}.name`,
          'Preset names must be unique.',
        ),
      );
      continue;
    }
    presetByName.set(preset.name, preset);
    if (
      !validStringArray(preset.members) ||
      !validStringArray(preset.excluded)
    ) {
      errors.push(
        error(
          'SENSOR_PRESET_MALFORMED',
          path,
          'Preset members and excluded must be string arrays.',
        ),
      );
      continue;
    }
    if (hasDuplicates(preset.members))
      errors.push(
        error(
          'SENSOR_PRESET_MEMBER_DUPLICATE',
          `${path}.members`,
          'Preset members must be unique.',
        ),
      );
    if (hasDuplicates(preset.excluded))
      errors.push(
        error(
          'SENSOR_PRESET_EXCLUDED_DUPLICATE',
          `${path}.excluded`,
          'Preset exclusions must be unique.',
        ),
      );
  }
  if (!sameSet([...presetByName.keys()], PRESET_NAMES))
    errors.push(
      error(
        'SENSOR_PRESET_POPULATION_INVALID',
        'presets.presets',
        'Presets must contain baseline, structural, governed, and sweep exactly once.',
      ),
    );

  const registryKindSet = new Set(registryKinds);
  for (const name of PRESET_NAMES) {
    const preset = presetByName.get(name);
    if (
      !preset ||
      !validStringArray(preset.members) ||
      !validStringArray(preset.excluded)
    )
      continue;
    counts[name] = preset.members.length;
    for (const kind of [...preset.members, ...preset.excluded]) {
      if (!registryKindSet.has(kind))
        errors.push(
          error(
            'SENSOR_PRESET_KIND_NOT_IN_REGISTRY',
            `presets.${name}`,
            'Preset kinds must exist in the registry.',
            kind,
          ),
        );
    }
  }

  const tierKinds = (tiers) =>
    entries
      .filter(
        (entry) =>
          isObject(entry) &&
          validStringArray(entry.tiers) &&
          tiers.some((tier) => entry.tiers.includes(tier)),
      )
      .map((entry) => entry.kind);
  const expectedMembers = {
    baseline: tierKinds(['BASELINE']),
    structural: tierKinds(['BASELINE', 'TIER2']),
    governed: tierKinds(['BASELINE', 'TIER2', 'TIER3']),
    sweep: entries
      .filter((entry) => entry?.effect === 'read')
      .map((entry) => entry.kind),
  };
  const expectedExcluded = entries
    .filter((entry) => entry?.effect !== 'read')
    .map((entry) => entry.kind);
  for (const name of ['baseline', 'structural', 'governed']) {
    const preset = presetByName.get(name);
    if (!preset || !validStringArray(preset.members)) continue;
    if (counts[name] !== EXPECTED_COUNTS[name])
      errors.push(
        error(
          'SENSOR_PRESET_COUNT_INVALID',
          `presets.${name}.members`,
          `Preset ${name} must contain ${EXPECTED_COUNTS[name]} members.`,
        ),
      );
    if (!sameSet(preset.members, expectedMembers[name]))
      errors.push(
        error(
          'SENSOR_PRESET_MEMBERS_INVALID',
          `presets.${name}.members`,
          `Preset ${name} must match its registry tier population.`,
        ),
      );
  }
  const sweep = presetByName.get('sweep');
  if (
    sweep &&
    validStringArray(sweep.members) &&
    validStringArray(sweep.excluded)
  ) {
    if (counts.sweep !== EXPECTED_COUNTS.sweep)
      errors.push(
        error(
          'SENSOR_PRESET_COUNT_INVALID',
          'presets.sweep.members',
          'Preset sweep must contain 49 members.',
        ),
      );
    if (sweep.excluded.length !== EXPECTED_SWEEP_EXCLUDED_COUNT)
      errors.push(
        error(
          'SENSOR_SWEEP_EXCLUDED_COUNT_INVALID',
          'presets.sweep.excluded',
          'Sweep must exclude 10 non-read registry entries.',
        ),
      );
    if (!sameSequence(sweep.members, expectedMembers.sweep))
      errors.push(
        error(
          'SENSOR_SWEEP_MEMBERS_INVALID',
          'presets.sweep.members',
          'Sweep members must match read registry entries in registry order.',
        ),
      );
    if (!sameSequence(sweep.excluded, expectedExcluded))
      errors.push(
        error(
          'SENSOR_SWEEP_EXCLUDED_INVALID',
          'presets.sweep.excluded',
          'Sweep exclusions must match non-read registry entries in registry order.',
        ),
      );
    if (sweep.round_required !== true)
      errors.push(
        error(
          'SENSOR_SWEEP_ROUND_REQUIRED_INVALID',
          'presets.sweep.round_required',
          'Sweep must require a round.',
        ),
      );
  }
  const selectedKinds = new Set(
    [...presetByName.values()]
      .filter((preset) => validStringArray(preset.members))
      .flatMap((preset) => preset.members),
  );
  for (const kind of registryKinds) {
    if (selectedKinds.has(kind) && !schemaKinds.includes(kind)) {
      const selectingPresets = PRESET_NAMES.filter((name) =>
        presetByName.get(name)?.members?.includes(kind),
      );
      errors.push({
        code: 'SENSOR_KIND_NOT_IN_SCHEMA',
        path: 'schema.properties.sensor.properties.kind.enum',
        registryPath: registryPaths.get(kind),
        presets: selectingPresets,
        kind,
        message:
          'Selected registry kind is missing from SensorReading.sensor.kind.',
      });
    }
  }
  return { ok: errors.length === 0, errors, counts };
}

function parseArguments(argv) {
  const paths = {
    registry: new URL(
      '../../node_modules/@aarusso-nyx/devai/dist/law/policy/sensor-registry.json',
      import.meta.url,
    ),
    presets: new URL(
      '../../node_modules/@aarusso-nyx/devai/dist/law/policy/sense-presets.json',
      import.meta.url,
    ),
    schema: new URL(
      '../../node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/sensor-reading.schema.json',
      import.meta.url,
    ),
  };
  if (argv.length === 0) return paths;
  if (argv.length !== 6) return null;

  const names = new Set();
  for (let index = 0; index < argv.length; index += 2) {
    const option = argv[index];
    if (!option?.startsWith('--')) return null;
    const name = option.slice(2);
    if (
      !['registry', 'presets', 'schema'].includes(name) ||
      !argv[index + 1] ||
      names.has(name)
    ) {
      return null;
    }
    names.add(name);
    paths[name] = argv[index + 1];
  }
  return names.size === 3 ? paths : null;
}

async function readJson(path, name) {
  try {
    return { value: JSON.parse(await readFile(path, 'utf8')) };
  } catch (caught) {
    return {
      error: error(
        'SENSOR_POLICY_SOURCE_UNREADABLE',
        name,
        `Unable to read ${name}: ${caught instanceof Error ? caught.message : String(caught)}`,
      ),
    };
  }
}

async function main() {
  const paths = parseArguments(process.argv.slice(2));
  if (!paths) {
    const result = {
      ok: false,
      errors: [
        error(
          'SENSOR_POLICY_ARGUMENTS_INVALID',
          'argv',
          'Use --registry <path> --presets <path> --schema <path>.',
        ),
      ],
      counts: {},
    };
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = 1;
    return;
  }
  const sources = await Promise.all(
    ['registry', 'presets', 'schema'].map(async (name) => [
      name,
      await readJson(paths[name], name),
    ]),
  );
  const unreadable = sources.flatMap(([, source]) =>
    source.error ? [source.error] : [],
  );
  const result =
    unreadable.length > 0
      ? { ok: false, errors: unreadable, counts: {} }
      : verifySensorPolicy(
          Object.fromEntries(
            sources.map(([name, source]) => [name, source.value]),
          ),
        );
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.ok ? 0 : 1;
}

const entrypointPath = process.argv[1]
  ? await realpath(process.argv[1]).catch(() => null)
  : null;
if (entrypointPath === fileURLToPath(import.meta.url)) await main();
