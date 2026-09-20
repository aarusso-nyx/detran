import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  createWriteStream,
} from 'node:fs';
import { resolve, relative } from 'node:path';
import { createRequire } from 'node:module';

// Round-local evidence adapter explicitly requested by OWNER for native JSON Schema output.
// It does not replace or modify the shared orchestra bridge.
const root = process.cwd();
const req = createRequire(resolve('package.json'));
const Ajv = req('./node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/ajv.js');
const prefix = 'work/rounds/R-0007/reviews/attempt-2/';
const cycle = process.argv[3] ?? '1';
if (
  ![
    '1',
    '2',
    '1-technical',
    '2-technical',
    'sequence-delta-1',
    'manual-openapi-delta-1',
    'ddl05-prompt-1',
    'ddl05-delivery-1',
    'sql-1',
    'sql-2',
    'sql1-corrective-prompt-1',
    'sql1-corrective-delta-2',
    'sql2-apply-searchpath-delta-1',
    'sql2-pre-parser-delta-1',
    'sql2-enforce-parser-delta-1',
    'sql2-upgrade-sensor-delta-1',
  ].includes(cycle)
)
  throw Error('Invalid cycle');
const stem = `${prefix}ctg-0001-c4-od-v3-review-${cycle}`;
const readset =
  cycle === 'sql2-upgrade-sensor-delta-1'
    ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-UPGRADE-SENSOR-DELTA-READSET.md'
    : cycle === 'sql2-enforce-parser-delta-1'
    ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-ENFORCE-PARSER-DELTA-READSET.md'
    : cycle === 'sql2-pre-parser-delta-1'
    ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-PRE-PARSER-DELTA-READSET.md'
    : cycle === 'sql2-apply-searchpath-delta-1'
    ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-APPLY-SEARCHPATH-DELTA-READSET.md'
    : cycle === 'sql-2'
    ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL2-REVIEW-READSET.md'
    : cycle === 'sql1-corrective-delta-2'
      ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL1-CORRECTIVE-DELTA-READSET.md'
      : cycle === 'sql1-corrective-prompt-1'
        ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL1-CORRECTIVE-PROMPT-READSET.md'
        : cycle === 'sql-1'
          ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SQL-REVIEW-READSET.md'
          : cycle === 'ddl05-prompt-1'
            ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-PROMPT-READSET.md'
            : cycle === 'ddl05-delivery-1'
              ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-DDL05-DELIVERY-READSET.md'
              : cycle === 'manual-openapi-delta-1'
                ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-MANUAL-OPENAPI-DELTA-READSET.md'
                : cycle === 'sequence-delta-1'
                  ? 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-SEQUENCE-DELTA-READSET.md'
                  : 'work/rounds/R-0007/reports/CTG-0001-C4-OD-V3-REVIEW-READSET.md';
const schemaPath = `${prefix}ctg-0001-c4-od-v2-sol-1.schema.json`;
const hash = (b) => createHash('sha256').update(b).digest('hex');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const write = (p, data) =>
  writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx' });
const pathsIn = (p) =>
  [...readFileSync(p, 'utf8').matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
const safe = (p) => {
  if (p.startsWith('/') || relative(root, resolve(p)).startsWith('..'))
    throw Error(`Outside worktree: ${p}`);
  return p;
};

if (process.argv[2] === 'freeze') {
  const paths = new Set([
    ...pathsIn(readset),
    readset,
    schemaPath,
    `${stem}.prompt.md`,
    `${prefix}c4-od-v3-review-runner.mjs`,
    'docs/meta/agents/orchestra/reviewer-prompt.template.md',
    'docs/meta/agents/orchestra/README.md',
    'node_modules/@aarusso-nyx/devai/dist/runtime/index/schemas/task.schema.json',
  ]);
  for (const p of [...paths]) {
    if (
      p.endsWith('-READSET.md') ||
      p.endsWith('-INVENTORY.md') ||
      p.endsWith('-ALLOWLIST.md') ||
      p.includes('/prompts/')
    ) {
      for (const nested of pathsIn(p))
        if (existsSync(nested)) paths.add(safe(nested));
    }
  }
  const inputs = [...paths].sort().map((p) => {
    safe(p);
    const content = readFileSync(p, 'utf8');
    return { path: p, sha256: hash(content), content };
  });
  const entries = inputs.map(({ path, sha256 }) => ({ path, sha256 }));
  const digest = hash(JSON.stringify(entries));
  write(`${stem}.inputs.json`, { candidate_sha256: digest, inputs });
  write(`${stem}.manifest.json`, { candidate_sha256: digest, files: entries });
  console.log(
    JSON.stringify({ frozen: entries.length, candidate_sha256: digest }),
  );
} else if (process.argv[2] === 'review') {
  const manifest = json(`${stem}.manifest.json`);
  const checkInputs = () => {
    for (const f of manifest.files)
      if (hash(readFileSync(f.path)) !== f.sha256)
        throw Error(`Candidate changed: ${f.path}`);
  };
  checkInputs();
  const started = new Date().toISOString();
  const args = [
    '-p',
    '--model',
    'claude-fable-5',
    '--permission-mode',
    'plan',
    '--tools',
    'Read,Grep,Glob',
    '--allowedTools',
    'Read',
    'Grep',
    'Glob',
    '--strict-mcp-config',
    '--mcp-config',
    '{"mcpServers":{}}',
    '--no-chrome',
    '--no-session-persistence',
    '--output-format',
    'json',
    '--json-schema',
    readFileSync(schemaPath, 'utf8'),
  ];
  const rawPath = `${stem}.raw.json`;
  const errorPath = `${stem}.stderr.log`;
  if (existsSync(rawPath) || existsSync(errorPath))
    throw Error('Invocation artifacts already exist');
  const stdout = createWriteStream(rawPath, { flags: 'wx' });
  const stderr = createWriteStream(errorPath, { flags: 'wx' });
  const child = spawn('claude', args, {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  child.stdout.pipe(stdout);
  child.stderr.pipe(stderr);
  child.stdin.end(readFileSync(`${stem}.prompt.md`));
  console.log(
    JSON.stringify({
      started_at: started,
      model: 'claude-fable-5',
      candidate_sha256: manifest.candidate_sha256,
    }),
  );
  const exit = await new Promise((ok, fail) => {
    child.on('error', fail);
    child.on('close', ok);
  });
  await Promise.all(
    [stdout, stderr].map((s) =>
      s.closed ? Promise.resolve() : new Promise((ok) => s.on('close', ok)),
    ),
  );
  const ended = new Date().toISOString();
  const record = {
    family: 'claude',
    model: 'claude-fable-5',
    adapter: 'owner-approved-native-json-schema-v3',
    prompt: `${stem}.prompt.md`,
    prompt_sha256: hash(readFileSync(`${stem}.prompt.md`)),
    schema: schemaPath,
    schema_sha256: hash(readFileSync(schemaPath)),
    raw_output: rawPath,
    raw_sha256: hash(readFileSync(rawPath)),
    cwd: root,
    started_at: started,
    ended_at: ended,
    exit_code: exit,
    candidate_sha256: manifest.candidate_sha256,
  };
  try {
    if (exit !== 0) throw Error(`CLI exit ${exit}`);
    checkInputs();
    const raw = json(rawPath);
    if (raw.is_error) throw Error('CLI returned is_error');
    const output = raw.structured_output;
    const validate = new Ajv({ allErrors: true, strict: false }).compile(
      json(schemaPath),
    );
    if (!validate(output))
      throw Error(
        `Invalid structured_output: ${JSON.stringify(validate.errors)}`,
      );
    const highs = output.findings.filter((f) => f.severity === 'high').length;
    if ((output.verdict === 'PASS') !== (highs === 0))
      throw Error('Verdict and high findings disagree');
    for (const f of output.findings) {
      safe(f.file);
      const lines = readFileSync(f.file, 'utf8').split('\n').length;
      if (f.line > lines)
        throw Error(`Nonexistent finding line: ${f.file}:${f.line}`);
    }
    write(`${stem}.json`, output);
    write(`${stem}.bridge.json`, {
      ...record,
      status: 'valid',
      output: `${stem}.json`,
      output_sha256: hash(readFileSync(`${stem}.json`)),
      verdict: output.verdict,
      high_findings: highs,
      reported_model_usage: raw.modelUsage ?? null,
    });
    console.log(
      JSON.stringify({
        verdict: output.verdict,
        findings: output.findings.length,
        high_findings: highs,
      }),
    );
  } catch (error) {
    write(`${stem}.invalid.json`, {
      ...record,
      status: 'invalid-output',
      reason: String(error),
    });
    throw error;
  }
} else throw Error('Use freeze or review');
