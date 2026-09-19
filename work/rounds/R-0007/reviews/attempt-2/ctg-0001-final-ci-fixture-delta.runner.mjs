import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const root = process.cwd();
const prefix =
  'work/rounds/R-0007/reviews/attempt-2/ctg-0001-final-ci-fixture-delta';
const readset = `${prefix}.readset.md`;
const prompt = `${prefix}.prompt.md`;
const runner = `${prefix}.runner.mjs`;
const schema =
  'work/rounds/R-0007/reviews/attempt-2/ctg-0001-c4-od-v2-sol-1.schema.json';
const manifestPath = `${prefix}.manifest.json`;
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const req = createRequire(resolve('package.json'));
const Ajv = req('./node_modules/.pnpm/ajv@8.20.0/node_modules/ajv/dist/ajv.js');

function safe(path) {
  if (path.startsWith('/') || relative(root, resolve(path)).startsWith('..'))
    throw new Error(`Outside worktree: ${path}`);
  return path;
}

async function frozen() {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  for (const file of manifest.files)
    if (hash(await readFile(safe(file.path))) !== file.sha256)
      throw new Error(`Candidate changed: ${file.path}`);
  return manifest;
}

if (process.argv[2] === 'freeze') {
  const paths = [
    ...(await readFile(readset, 'utf8')).matchAll(/^- `([^`]+)`/gm),
  ].map((match) => match[1]);
  const files = [];
  for (const path of [
    ...new Set([...paths, readset, prompt, runner, schema]),
  ].sort())
    files.push({ path: safe(path), sha256: hash(await readFile(path)) });
  const candidate_sha256 = hash(JSON.stringify(files));
  await writeFile(
    manifestPath,
    `${JSON.stringify({ candidate_sha256, files }, null, 2)}\n`,
    { flag: 'wx' },
  );
  process.stdout.write(
    `${JSON.stringify({ candidate_sha256, files: files.length })}\n`,
  );
} else if (process.argv[2] === 'review') {
  const manifest = await frozen();
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
    await readFile(schema, 'utf8'),
  ];
  const started_at = new Date().toISOString();
  const child = spawn('claude', args, {
    cwd: root,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => (stdout += chunk.toString()));
  child.stderr.on('data', (chunk) => (stderr += chunk.toString()));
  child.stdin.end(await readFile(prompt));
  const exit_code = await new Promise((resolveExit, reject) => {
    child.on('error', reject);
    child.on('close', resolveExit);
  });
  const rawPath = `${prefix}.raw.json`;
  await writeFile(rawPath, stdout, { flag: 'wx' });
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
    await frozen();
    const raw = JSON.parse(stdout);
    if (raw.is_error) throw new Error('CLI is_error');
    const output = raw.structured_output;
    const valid = new Ajv({ allErrors: true, strict: false }).compile(
      JSON.parse(await readFile(schema, 'utf8')),
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
      const lines = (await readFile(safe(finding.file), 'utf8')).split(
        '\n',
      ).length;
      if (finding.line > lines)
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
