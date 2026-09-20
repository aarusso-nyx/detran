import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const root = process.cwd();
const prefix = 'work/rounds/R-0007/reviews/attempt-2/ctg-0002-final-3';
const schema = `${prefix}.schema.json`;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const req = createRequire(resolve('package.json'));
const Ajv = req('./node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/ajv.js');
const safe = (path) => {
  if (path.startsWith('/') || relative(root, resolve(path)).startsWith('..'))
    throw new Error(`Outside worktree: ${path}`);
  return path;
};
const read = (path) => readFile(safe(path));
const outputs = new Set([
  `${prefix}.manifest.json`,
  `${prefix}.raw.json`,
  `${prefix}.stderr.log`,
  `${prefix}.json`,
  `${prefix}.bridge.json`,
  `${prefix}.invalid.json`,
]);

const candidatePaths = () => {
  const result = spawnSync(
    'git',
    ['status', '--porcelain=v1', '-z', '--untracked-files=all'],
    { cwd: root, encoding: 'utf8' },
  );
  if (result.status !== 0)
    throw new Error(`git status failed: ${result.stderr}`);
  const paths = [];
  for (const record of result.stdout.split('\0').filter(Boolean)) {
    const path = record.slice(3);
    if (!outputs.has(path)) paths.push(safe(path));
  }
  return [...new Set(paths)].sort();
};

const assertFrozen = async () => {
  const manifest = JSON.parse(await read(`${prefix}.manifest.json`));
  for (const file of manifest.files)
    if (hash(await read(file.path)) !== file.sha256)
      throw new Error(`Candidate changed: ${file.path}`);
  return manifest;
};

if (process.argv[2] === 'freeze') {
  const support = [
    `${prefix}.readset.md`,
    `${prefix}.prompt.md`,
    `${prefix}.runner.mjs`,
    schema,
  ];
  const files = [];
  for (const path of [...new Set([...candidatePaths(), ...support])].sort())
    files.push({ path, sha256: hash(await read(path)) });
  const candidate_sha256 = hash(JSON.stringify(files));
  await writeFile(
    `${prefix}.manifest.json`,
    `${JSON.stringify({ candidate_sha256, files }, null, 2)}\n`,
    { flag: 'wx' },
  );
  process.stdout.write(
    `${JSON.stringify({ candidate_sha256, files: files.length })}\n`,
  );
} else if (process.argv[2] === 'review') {
  const manifest = await assertFrozen();
  const started_at = new Date().toISOString();
  const child = spawn(
    'claude',
    [
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
      (await read(schema)).toString(),
    ],
    { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] },
  );
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
  child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
  child.stdin.end(await read(`${prefix}.prompt.md`));
  const exit_code = await new Promise((ok, fail) => {
    child.on('error', fail);
    child.on('close', ok);
  });
  await writeFile(`${prefix}.raw.json`, stdout, { flag: 'wx' });
  await writeFile(`${prefix}.stderr.log`, stderr, { flag: 'wx' });
  const record = {
    model: 'claude-fable-5',
    candidate_sha256: manifest.candidate_sha256,
    started_at,
    ended_at: new Date().toISOString(),
    exit_code,
    raw_sha256: hash(stdout),
  };
  try {
    if (exit_code !== 0) throw new Error(`CLI exit ${exit_code}`);
    await assertFrozen();
    const raw = JSON.parse(stdout);
    if (raw.is_error) throw new Error('CLI is_error');
    const output = raw.structured_output;
    const valid = new Ajv({ allErrors: true, strict: false }).compile(
      JSON.parse(await read(schema)),
    );
    if (!valid(output))
      throw new Error(
        `Invalid structured output: ${JSON.stringify(valid.errors)}`,
      );
    const high = output.findings.filter(
      (finding) => finding.severity === 'high',
    );
    if ((output.verdict === 'PASS') !== (high.length === 0))
      throw new Error('Verdict/high mismatch');
    for (const finding of output.findings) {
      const content = (await read(safe(finding.file))).toString();
      if (finding.line > content.split('\n').length)
        throw new Error(`Invalid line: ${finding.file}:${finding.line}`);
    }
    await writeFile(`${prefix}.json`, `${JSON.stringify(output, null, 2)}\n`, {
      flag: 'wx',
    });
    await writeFile(
      `${prefix}.bridge.json`,
      `${JSON.stringify({ ...record, status: 'valid', verdict: output.verdict, high_findings: high.length }, null, 2)}\n`,
      { flag: 'wx' },
    );
    process.stdout.write(
      `${JSON.stringify({ verdict: output.verdict, findings: output.findings.length, candidate_sha256: manifest.candidate_sha256 })}\n`,
    );
  } catch (error) {
    await writeFile(
      `${prefix}.invalid.json`,
      `${JSON.stringify({ ...record, status: 'invalid', reason: String(error) }, null, 2)}\n`,
      { flag: 'wx' },
    );
    throw error;
  }
} else throw new Error('Use freeze or review');
