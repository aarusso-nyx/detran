import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const HISTORICAL_ORPHANS_DIGEST =
  'f7e35c3977f6da17344c26605982d046a9f844cb4612d3acbc565ec9f01dd37b';
const HISTORICAL_ORPHANS_HEAD = 'c848723c1ee9053233b7e08732c5b80bbe06d625';
const HISTORICAL_ORPHAN_ROUND_COUNTS = new Map([
  ['R-0005', 1],
  ['R-0007', 38],
  ['R-0013', 10],
  ['R-0017', 3],
]);
const A2_EXCEPTION_PATH =
  'work/rounds/R-0020/contracts/CTG-0002-exceptions.jsonl';
const A2_DECISION_REF = 'work/rounds/R-0020/AUTHORIZATION-A2-2026-09-28.md';
const A2_DECISION_SHA256 =
  '8058b19e4c19570a8556ce775d4b21aabeebd13399d323742e91f90d20eac40f';
const A2_CANONICAL_DIGEST =
  '63a3ea15d53b9cd61585104c54cb0282abb53e6cd8b4154d1169f290ad6e9441';
const A2_ORPHAN = {
  path: 'record/proofs/work/generic/R-0021.jsonl',
  sequence: 2,
  sha256: 'c562dfce81ec9ba08c4d3eae22547ad36adb99fbb76dc2632bb20e81fbbfb804',
};

function fail(message) {
  throw new Error(message);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function key(roundId, sequence, kind = 'generic') {
  return kind === 'generic'
    ? `${roundId}:${sequence}`
    : `${kind}:${roundId}:${sequence}`;
}

function display(line) {
  return `${line.relativePath}:${line.sequence}`;
}

function compareCanonicalPaths(left, right) {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

function parseArguments(argumentsList) {
  let repositoryRoot = process.cwd();

  for (let index = 0; index < argumentsList.length; index += 1) {
    if (argumentsList[index] !== '--repo-root') {
      fail(`unknown argument: ${argumentsList[index]}`);
    }

    const root = argumentsList[index + 1];
    if (!root) {
      fail('--repo-root requires a path');
    }

    repositoryRoot = root;
    index += 1;
  }

  return resolve(repositoryRoot);
}

async function listJsonlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return listJsonlFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith('.jsonl') ? [entryPath] : [];
    }),
  );
  return files.flat().sort();
}

function lineBuffers(bytes) {
  const lines = [];
  let start = 0;

  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 10) {
      const end = index > start && bytes[index - 1] === 13 ? index - 1 : index;
      lines.push(bytes.subarray(start, end));
      start = index + 1;
    }
  }

  if (start < bytes.length) {
    lines.push(bytes.subarray(start));
  }

  return lines;
}

async function readProofLines(repositoryRoot) {
  const workDirectory = resolve(repositoryRoot, 'record/proofs/work');
  const files = await listJsonlFiles(workDirectory);
  const lines = [];

  for (const file of files) {
    const relativePath = relative(repositoryRoot, file).split(sep).join('/');
    const filename = relativePath.slice(relativePath.lastIndexOf('/') + 1, -6);
    const physicalLines = lineBuffers(await readFile(file));

    for (let position = 0; position < physicalLines.length; position += 1) {
      const bytes = physicalLines[position];
      if (bytes.length === 0) {
        fail(`${relativePath}:${position + 1}: empty JSONL line`);
      }

      let value;
      try {
        value = JSON.parse(bytes.toString('utf8'));
      } catch {
        fail(`${relativePath}:${position + 1}: unreadable JSON`);
      }

      const sequence = value?.sequence;
      if (!Number.isInteger(sequence) || sequence !== position + 1) {
        fail(
          `${relativePath}:${position + 1}: expected sequence ${position + 1}, received ${String(sequence)}`,
        );
      }
      if (value.round_id !== filename) {
        fail(
          `${relativePath}:${sequence}: round_id ${String(value.round_id)} does not match ${filename}`,
        );
      }
      if (!['generic', 'historical-gap'].includes(value.kind)) {
        fail(
          `${relativePath}:${sequence}: unsupported proof kind ${String(value.kind)}`,
        );
      }
      if (
        relativePath !==
        `record/proofs/work/${value.kind}/${value.round_id}.jsonl`
      ) {
        fail(`${relativePath}:${sequence}: proof kind does not match its path`);
      }

      lines.push({
        bytes,
        key: key(value.round_id, sequence, value.kind),
        relativePath,
        roundId: value.round_id,
        sequence,
        value,
      });
    }
  }

  return lines;
}

function notesFor(record) {
  if (!Array.isArray(record.notes)) {
    return null;
  }

  const roundLikeNotes = record.notes.filter(
    (note) => typeof note === 'string' && note.startsWith('round_id='),
  );
  const sequenceLikeNotes = record.notes.filter(
    (note) => typeof note === 'string' && note.startsWith('proof_sequence='),
  );
  const roundNotes = roundLikeNotes.filter(
    (note) => typeof note === 'string' && /^round_id=R-\d+$/.test(note),
  );
  const sequenceNotes = sequenceLikeNotes.filter(
    (note) => typeof note === 'string' && /^proof_sequence=\d+$/.test(note),
  );

  if (
    roundLikeNotes.length !== 1 ||
    sequenceLikeNotes.length !== 1 ||
    roundNotes.length !== 1 ||
    sequenceNotes.length !== 1
  ) {
    return null;
  }

  return {
    roundId: roundNotes[0].slice('round_id='.length),
    sequence: Number(sequenceNotes[0].slice('proof_sequence='.length)),
  };
}

function hasProofNotes(record) {
  return (
    Array.isArray(record.notes) &&
    record.notes.some(
      (note) =>
        typeof note === 'string' &&
        (note.startsWith('round_id=') || note.startsWith('proof_sequence=')),
    )
  );
}

async function readAnchors(repositoryRoot, linesByKey) {
  const chainPath = resolve(repositoryRoot, 'record/proofs/chain.json');
  let chain;
  try {
    chain = JSON.parse(await readFile(chainPath, 'utf8'));
  } catch {
    fail('record/proofs/chain.json: unreadable JSON');
  }

  if (!Array.isArray(chain.records)) {
    fail('record/proofs/chain.json: records must be an array');
  }

  const anchors = new Map();
  const errors = [];
  for (const record of chain.records) {
    const notes = notesFor(record);
    const isEvidenceRecord =
      typeof record?.action === 'string' &&
      record.action.startsWith('evidence.record.');

    if (!notes && !hasProofNotes(record)) {
      if (isEvidenceRecord) {
        errors.push(
          `invalid anchor notes in chain record ${String(record.id ?? '(unknown)')}`,
        );
      }
      continue;
    }

    if (!notes) {
      if (isEvidenceRecord) {
        errors.push(
          `invalid anchor notes in chain record ${String(record.id ?? '(unknown)')}`,
        );
      }
      continue;
    }

    const kind = isEvidenceRecord
      ? record.action.slice('evidence.record.'.length)
      : 'generic';
    const anchorKey = key(notes.roundId, notes.sequence, kind);
    const anchoredLine = linesByKey.get(anchorKey);
    if (!anchoredLine) {
      errors.push(
        `invalid anchor reference ${notes.roundId}:${notes.sequence}`,
      );
      continue;
    }
    // DEVAI 1.9+ uses a separate epoch per kind and binds each new line's
    // physical bytes. The installed verifier validates historical-gap payloads
    // and cutoff eligibility in the second half of verify:proof-anchors.
    if (
      kind === 'historical-gap' &&
      (record.proof_path !== anchoredLine.relativePath ||
        record.proof_sequence !== anchoredLine.sequence ||
        record.proof_sha256 !== sha256(anchoredLine.bytes))
    ) {
      errors.push(`invalid historical-gap anchor for ${display(anchoredLine)}`);
      continue;
    }

    const records = anchors.get(anchorKey) ?? [];
    records.push(record);
    anchors.set(anchorKey, records);
  }

  return { anchors, errors };
}

async function readHistoricalOrphans(repositoryRoot) {
  const baselinePath = resolve(
    repositoryRoot,
    'work/rounds/R-0020/baseline.json',
  );
  let baseline;
  try {
    baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
  } catch {
    fail(`${baselinePath}: unreadable JSON`);
  }

  if (
    baseline?.head_sha !== HISTORICAL_ORPHANS_HEAD ||
    baseline?.proofs?.lines?.length !== 119 ||
    baseline?.proofs?.counts?.jsonl_lines !== 119 ||
    baseline?.proofs?.counts?.anchored !== 67 ||
    baseline?.proofs?.counts?.orphans !== 52 ||
    !Array.isArray(baseline?.proofs?.lines)
  ) {
    fail(`${baselinePath}: invalid historical orphan metadata`);
  }

  if (
    baseline.proofs.lines.some((line) => typeof line?.anchored !== 'boolean')
  ) {
    fail(`${baselinePath}: invalid anchored flag`);
  }

  const historicalOrphans = baseline.proofs.lines.filter(
    (line) => line?.anchored === false,
  );
  if (
    historicalOrphans.length !== 52 ||
    !Array.isArray(baseline.proofs.orphans)
  ) {
    fail(`${baselinePath}: invalid historical orphan count`);
  }

  const canonicalOrphans = historicalOrphans
    .map(({ path, sequence, round_id, sha256: digest }) => ({
      path,
      sequence,
      round_id,
      sha256: digest,
    }))
    .sort(
      (left, right) =>
        compareCanonicalPaths(left.path, right.path) ||
        left.sequence - right.sequence,
    );
  const declaredOrphans = baseline.proofs.orphans
    .map(({ path, sequence, sha256: digest }) => ({
      path,
      sequence,
      sha256: digest,
    }))
    .sort(
      (left, right) =>
        compareCanonicalPaths(left.path, right.path) ||
        left.sequence - right.sequence,
    );
  const expectedOrphans = canonicalOrphans.map(
    ({ path, sequence, sha256: digest }) => ({
      path,
      sequence,
      sha256: digest,
    }),
  );

  const canonicalText = canonicalOrphans
    .map(
      ({ path, sequence, sha256: digest }) =>
        `${path}\t${sequence}\t${digest}\n`,
    )
    .join('');
  if (
    JSON.stringify(declaredOrphans) !== JSON.stringify(expectedOrphans) ||
    sha256(canonicalText) !== HISTORICAL_ORPHANS_DIGEST
  ) {
    fail(`${baselinePath}: historical orphan allowlist mismatch`);
  }
  const roundCounts = new Map();
  for (const orphan of canonicalOrphans) {
    roundCounts.set(
      orphan.round_id,
      (roundCounts.get(orphan.round_id) ?? 0) + 1,
    );
  }
  if (
    roundCounts.size !== HISTORICAL_ORPHAN_ROUND_COUNTS.size ||
    [...HISTORICAL_ORPHAN_ROUND_COUNTS].some(
      ([roundId, count]) => roundCounts.get(roundId) !== count,
    )
  ) {
    fail(`${baselinePath}: invalid historical orphan round counts`);
  }

  const allowed = new Map();
  for (const orphan of canonicalOrphans) {
    if (
      typeof orphan.path !== 'string' ||
      typeof orphan.round_id !== 'string' ||
      !Number.isInteger(orphan.sequence) ||
      typeof orphan.sha256 !== 'string' ||
      !/^[a-f0-9]{64}$/.test(orphan.sha256) ||
      !orphan.path.endsWith(`/${orphan.round_id}.jsonl`)
    ) {
      fail(`${baselinePath}: invalid historical orphan`);
    }

    const orphanKey = `${orphan.path}:${orphan.sequence}`;
    if (allowed.has(orphanKey)) {
      fail(`${baselinePath}: duplicate historical orphan ${orphanKey}`);
    }
    allowed.set(orphanKey, orphan);
  }

  return allowed;
}

function hasExactKeys(value, expected) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    JSON.stringify(Object.keys(value).sort()) ===
      JSON.stringify([...expected].sort())
  );
}

async function readA2Exception(repositoryRoot) {
  const exceptionPath = resolve(repositoryRoot, A2_EXCEPTION_PATH);
  let bytes;
  try {
    bytes = await readFile(exceptionPath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    fail(`A2 exception R-0021:2: cannot read ${A2_EXCEPTION_PATH}`);
  }

  const lines = lineBuffers(bytes);
  if (lines.length !== 1 || lines[0].length === 0) {
    fail('A2 exception R-0021:2: expected exactly one nonempty JSONL line');
  }

  let exception;
  try {
    exception = JSON.parse(lines[0].toString('utf8'));
  } catch {
    fail('A2 exception R-0021:2: unreadable JSON');
  }

  if (
    !hasExactKeys(exception, [
      'adendum',
      'decision_ref',
      'decision_sha256',
      'orphan_lines',
      'canonical_digest_sha256',
    ]) ||
    exception.adendum !== 'A2' ||
    exception.decision_ref !== A2_DECISION_REF ||
    exception.decision_sha256 !== A2_DECISION_SHA256 ||
    exception.canonical_digest_sha256 !== A2_CANONICAL_DIGEST ||
    !Array.isArray(exception.orphan_lines) ||
    exception.orphan_lines.length !== 1 ||
    !hasExactKeys(exception.orphan_lines[0], ['path', 'sequence', 'sha256']) ||
    exception.orphan_lines[0].path !== A2_ORPHAN.path ||
    exception.orphan_lines[0].sequence !== A2_ORPHAN.sequence ||
    exception.orphan_lines[0].sha256 !== A2_ORPHAN.sha256
  ) {
    fail('A2 exception R-0021:2: invalid exception envelope');
  }

  const canonicalText = `${A2_ORPHAN.path}\t${A2_ORPHAN.sequence}\t${A2_ORPHAN.sha256}\n`;
  if (sha256(canonicalText) !== A2_CANONICAL_DIGEST) {
    fail('A2 exception R-0021:2: invalid canonical digest');
  }

  let decisionBytes;
  try {
    decisionBytes = await readFile(resolve(repositoryRoot, A2_DECISION_REF));
  } catch {
    fail('A2 exception R-0021:2: cannot read decision');
  }
  if (sha256(decisionBytes) !== A2_DECISION_SHA256) {
    fail('A2 exception R-0021:2: decision hash mismatch');
  }

  return A2_ORPHAN;
}

function declarationReferences(line) {
  const payload = line.value?.payload;
  if (payload?.action !== 'declare_historical_orphan_lines') {
    return [];
  }

  if (
    payload.round !== line.roundId ||
    !Array.isArray(payload.orphan_lines) ||
    payload.orphan_lines.length === 0
  ) {
    fail(`${display(line)}: invalid orphan declaration`);
  }

  return payload.orphan_lines.map((reference, index) => ({
    ...reference,
    declaration: line,
    index,
  }));
}

function validateDeclarations(
  lines,
  linesByKey,
  anchors,
  historicalOrphans,
  a2Exception,
) {
  const declarations = new Map();
  const errors = [];

  for (const line of lines) {
    const references = declarationReferences(line);
    if (references.length === 0) {
      continue;
    }

    if (anchors.get(line.key)?.length !== 1) {
      errors.push(
        `${display(line)}: orphan declaration requires one direct anchor`,
      );
      continue;
    }

    for (const reference of references) {
      if (
        typeof reference.path !== 'string' ||
        !Number.isInteger(reference.sequence) ||
        typeof reference.sha256 !== 'string' ||
        !/^[a-f0-9]{64}$/.test(reference.sha256)
      ) {
        errors.push(
          `${display(line)}: invalid orphan reference ${reference.index + 1}`,
        );
        continue;
      }

      const target = linesByKey.get(key(line.roundId, reference.sequence));
      if (!target || target.relativePath !== reference.path) {
        errors.push(
          `${display(line)}: invalid orphan reference ${reference.path}:${reference.sequence}`,
        );
        continue;
      }
      if (sha256(target.bytes) !== reference.sha256) {
        errors.push(`${display(line)}: hash mismatch for ${display(target)}`);
        continue;
      }
      const historicalOrphan = historicalOrphans.get(
        `${reference.path}:${reference.sequence}`,
      );
      const isA2Orphan =
        a2Exception !== null &&
        reference.path === a2Exception.path &&
        reference.sequence === a2Exception.sequence &&
        reference.sha256 === a2Exception.sha256;
      if (
        (!historicalOrphan ||
          historicalOrphan.round_id !== target.roundId ||
          historicalOrphan.sha256 !== reference.sha256) &&
        !isA2Orphan
      ) {
        errors.push(
          `${display(line)}: ${display(target)} is not an allowed historical orphan`,
        );
        continue;
      }
      if (anchors.has(target.key)) {
        errors.push(
          `${display(line)}: ${display(target)} already has a direct anchor`,
        );
        continue;
      }
      if (declarations.has(target.key)) {
        errors.push(
          `${display(line)}: duplicate declaration for ${display(target)}`,
        );
        continue;
      }

      declarations.set(target.key, line);
    }
  }

  return { declarations, errors };
}

async function verify(repositoryRoot) {
  const lines = await readProofLines(repositoryRoot);
  const linesByKey = new Map();
  const errors = [];

  for (const line of lines) {
    if (linesByKey.has(line.key)) {
      errors.push(`duplicate proof line ${display(line)}`);
    }
    linesByKey.set(line.key, line);
  }

  const anchorResult = await readAnchors(repositoryRoot, linesByKey);
  const historicalOrphans = await readHistoricalOrphans(repositoryRoot);
  const a2Exception = await readA2Exception(repositoryRoot);
  errors.push(...anchorResult.errors);
  for (const [anchorKey, records] of anchorResult.anchors) {
    if (records.length > 1) {
      errors.push(
        `duplicate anchors for ${display(linesByKey.get(anchorKey))}`,
      );
    }
  }

  const declarationResult = validateDeclarations(
    lines,
    linesByKey,
    anchorResult.anchors,
    historicalOrphans,
    a2Exception,
  );
  errors.push(...declarationResult.errors);

  const unanchored = lines.filter(
    (line) =>
      !anchorResult.anchors.has(line.key) &&
      !declarationResult.declarations.has(line.key),
  );
  errors.push(
    ...unanchored.map((line) => `undeclared orphan ${display(line)}`),
  );

  const directlyAnchored = lines.filter((line) =>
    anchorResult.anchors.has(line.key),
  ).length;
  const duplicateAnchors = [...anchorResult.anchors.values()].filter(
    (records) => records.length > 1,
  ).length;
  const invalidReferences = errors.filter(
    (error) =>
      error.startsWith('invalid anchor reference ') ||
      error.includes(': invalid orphan reference '),
  ).length;
  const validationErrors =
    errors.length - unanchored.length - duplicateAnchors - invalidReferences;
  console.log(`directly anchored: ${directlyAnchored}`);
  console.log(`declared orphans: ${declarationResult.declarations.size}`);
  console.log(`undeclared orphans: ${unanchored.length}`);
  console.log(`duplicate anchors: ${duplicateAnchors}`);
  console.log(`invalid references: ${invalidReferences}`);
  console.log(`validation errors: ${validationErrors}`);

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

try {
  await verify(parseArguments(process.argv.slice(2)));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
