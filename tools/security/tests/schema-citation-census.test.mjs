import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { censusSchemaCitations } from '../schema-citation-census.mjs';

const modulePath = fileURLToPath(
  new URL('../schema-citation-census.mjs', import.meta.url),
);
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
function fixture(run) {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'detran-schema-census-')),
  );
  const git = (...args) =>
    execFileSync('git', ['-C', root, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  const put = (relative, value) => {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  };
  git('init', '-q');
  try {
    return run({ root, put, git });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
function incomplete(result, relative) {
  assert.equal(result.complete, false);
  assert.ok(result.errors.some((entry) => entry.path === relative));
  assert.ok(result.declaredPopulation.paths.includes(relative));
}

test('complete tracked recursive schema population includes citation-free files and excludes untracked or unrelated JSON', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/root.json', { description: 'ADR-014' });
    put('law/schemas/nested/other.schema.json', { type: 'string' });
    put('law/elsewhere.json', { description: 'ADR-999' });
    put('docs/schema.json', { description: 'ADR-998' });
    git('add', '.');
    put('law/schemas/untracked.json', { description: 'ADR-997' });
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.declaredPopulation.paths, [
      'law/schemas/nested/other.schema.json',
      'law/schemas/root.json',
    ]);
    assert.equal(result.declaredPopulation.count, 2);
    assert.deepEqual(
      result.files.map((entry) => [entry.path, entry.occurrenceCount]),
      [
        ['law/schemas/nested/other.schema.json', 0],
        ['law/schemas/root.json', 1],
      ],
    );
    assert.deepEqual(
      result.occurrences.map((entry) => entry.reference),
      ['ADR-014'],
    );
  }));

test('exact source bytes, JSON Pointer escaping and repeated occurrence offsets are retained', () =>
  fixture(({ root, put, git }) => {
    const text = 'ADR-014 / ADR-GOV-0022 ADR-014';
    const relative = 'law/schemas/pointers.json';
    const bytes = `{
  "properties": {"a/b~c": {"description": ${JSON.stringify(text)}}},
  "examples": [{"description": "ADR-007"}]
}\n`;
    put(relative, bytes);
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    const occurrences = result.occurrences.filter(
      (entry) => entry.jsonPointer === '/properties/a~1b~0c/description',
    );
    assert.deepEqual(
      occurrences.map((entry) => [
        entry.reference,
        entry.occurrenceIndex,
        entry.stringOffset,
      ]),
      [
        ['ADR-014', 0, 0],
        ['ADR-GOV-0022', 1, text.indexOf('ADR-GOV-0022')],
        ['ADR-014', 2, text.lastIndexOf('ADR-014')],
      ],
    );
    for (const entry of occurrences) {
      assert.equal(entry.originalString, text);
      assert.equal(entry.location, 'value');
      assert.equal(entry.path, relative);
      assert.equal(entry.sha256, digest(Buffer.from(bytes)));
    }
    assert.equal(result.files[0].sha256, digest(Buffer.from(bytes)));
    assert.equal(result.files[0].byteLength, Buffer.byteLength(bytes));
    assert.ok(
      result.occurrences.some(
        (entry) => entry.jsonPointer === '/examples/0/description',
      ),
    );
  }));

test('ADR-looking object keys remain observable with an escaped pointer', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/keys.json', {
      properties: { 'ADR-014/~': { type: 'string' } },
    });
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    assert.ok(
      result.occurrences.some(
        (entry) =>
          entry.location === 'key' &&
          entry.reference === 'ADR-014' &&
          entry.jsonPointer === '/properties/ADR-014~1~0' &&
          entry.originalString === 'ADR-014/~',
      ),
    );
  }));

test('schema examples and a schema property named examples retain distinct conservative contexts', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/contexts.json', {
      examples: [{ description: 'ADR-014' }],
      properties: {
        examples: { description: 'ADR-015' },
        default: { description: 'ADR-016' },
      },
      default: { description: 'ADR-017' },
    });
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    const byReference = new Map(
      result.occurrences.map((entry) => [entry.reference, entry]),
    );
    assert.notEqual(
      byReference.get('ADR-014').context.mode,
      byReference.get('ADR-015').context.mode,
    );
    assert.equal(
      byReference.get('ADR-015').context.mode,
      byReference.get('ADR-016').context.mode,
    );
    assert.notEqual(
      byReference.get('ADR-017').context.mode,
      byReference.get('ADR-016').context.mode,
    );
    for (const occurrence of result.occurrences) {
      assert.ok(Array.isArray(occurrence.context.ancestorSegments));
      assert.ok(Array.isArray(occurrence.context.observedKeywords));
      assert.equal(occurrence.native_verdict, undefined);
      assert.equal(occurrence.waiver, undefined);
      assert.equal(occurrence.resolved, undefined);
    }
  }));

test('numeric and provider scoped namespaces are preserved without fake local resolution', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/references.json', {
      description: 'ADR-014 ADR-0001 ADR-GOV-0022 ADR-SCR-0021',
    });
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    assert.deepEqual(
      result.occurrences.map((entry) => entry.reference),
      ['ADR-014', 'ADR-0001', 'ADR-GOV-0022', 'ADR-SCR-0021'],
    );
    assert.ok(result.gaps.length > 0);
    assert.equal(result.native_reading, undefined);
    assert.equal(result.verdict, undefined);
  }));

test('deterministic census does not rewrite tracked bytes or the Git index', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/a.json';
    put(relative, '{ "description" : "ADR-014" }\n');
    git('add', '.');
    const before = fs.readFileSync(path.join(root, relative));
    const index = fs.readFileSync(path.join(root, '.git/index'));
    const first = censusSchemaCitations({ repoRoot: root });
    const second = censusSchemaCitations({ repoRoot: root });
    assert.deepEqual(second, first);
    assert.deepEqual(fs.readFileSync(path.join(root, relative)), before);
    assert.deepEqual(fs.readFileSync(path.join(root, '.git/index')), index);
    put(relative, '{ "description" : "ADR-015" }\n');
    const changed = censusSchemaCitations({ repoRoot: root });
    assert.notEqual(changed.files[0].sha256, first.files[0].sha256);
    assert.equal(changed.occurrences[0].reference, 'ADR-015');
  }));

test('malformed tracked JSON is an explicit population error', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/broken.json';
    put(relative, '{"description":"ADR-014",');
    git('add', '.');
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('duplicate JSON keys cannot silently discard a citation', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/duplicate.json';
    put(relative, '{"description":"ADR-014","description":"no citation"}');
    git('add', '.');
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('missing tracked schema is retained as an error rather than shrinking population', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/missing.json';
    put(relative, { description: 'ADR-014' });
    git('add', '.');
    fs.unlinkSync(path.join(root, relative));
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('tracked symlink to an internal schema is refused', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/actual.json', { description: 'ADR-014' });
    const relative = 'law/schemas/alias.json';
    fs.symlinkSync('actual.json', path.join(root, relative));
    git('add', '.');
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('tracked external symlink is refused without citing outside bytes', () =>
  fixture(({ root, put, git }) => {
    const outside = `${root}-outside.json`;
    fs.writeFileSync(outside, '{"description":"ADR-999"}');
    try {
      put('law/schemas/ordinary.json', {});
      const relative = 'law/schemas/escape.json';
      fs.symlinkSync(outside, path.join(root, relative));
      git('add', '.');
      const result = censusSchemaCitations({ repoRoot: root });
      incomplete(result, relative);
      assert.ok(
        !result.occurrences.some((entry) => entry.reference === 'ADR-999'),
      );
    } finally {
      fs.rmSync(outside, { force: true });
    }
  }));

test('a schema directory replaced by an escaping symlink cannot admit external bytes', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/nested/a.json';
    put(relative, { description: 'ADR-014' });
    git('add', '.');
    const outside = `${root}-outside`;
    fs.mkdirSync(outside);
    fs.writeFileSync(path.join(outside, 'a.json'), '{"description":"ADR-999"}');
    try {
      fs.rmSync(path.join(root, 'law/schemas/nested'), { recursive: true });
      fs.symlinkSync(outside, path.join(root, 'law/schemas/nested'), 'dir');
      const result = censusSchemaCitations({ repoRoot: root });
      incomplete(result, relative);
      assert.ok(
        !result.occurrences.some((entry) => entry.reference === 'ADR-999'),
      );
    } finally {
      fs.rmSync(outside, { recursive: true, force: true });
    }
  }));

test('CLI returns whole JSON and nonzero exit for an incomplete population', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/broken.json', '{');
    git('add', '.');
    const result = spawnSync(
      process.execPath,
      [modulePath, '--repo-root', root],
      { encoding: 'utf8' },
    );
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stderr);
    const report = JSON.parse(result.stdout);
    incomplete(report, 'law/schemas/broken.json');
  }));

test('byte equality with a self-declared installed package never authenticates a provider or resolves a citation', () =>
  fixture(({ root, put, git }) => {
    const bytes = '{"description":"ADR-014"}\n';
    const manifest = '{"name":"@aarusso-nyx/devai","version":"0.0.0-fixture"}';
    const packageRoot = 'node_modules/@aarusso-nyx/devai';
    put('law/schemas/a.json', bytes);
    git('add', 'law');
    put(`${packageRoot}/package.json`, manifest);
    put(`${packageRoot}/dist/runtime/index/schemas/a.json`, bytes);
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    const observed = result.files[0].providerObservation;
    assert.equal(observed.byteEqual, true);
    assert.equal(observed.authenticatedOrigin, false);
    assert.equal(observed.declaredVersion, '0.0.0-fixture');
    assert.equal(observed.sha256, digest(Buffer.from(bytes)));
    assert.equal(observed.packageJsonSha256, digest(Buffer.from(manifest)));
    assert.equal(observed.packageRoot, packageRoot);
    assert.equal(observed.packageJsonPath, 'package.json');
    assert.equal(observed.sourcePath, 'dist/runtime/index/schemas/a.json');
    assert.equal(observed.pathBasis, 'installed-provider-package-relative');
    assert.equal(result.occurrences[0].resolved, undefined);
    put(`${packageRoot}/dist/runtime/index/schemas/a.json`, '{}');
    const mismatch = censusSchemaCitations({ repoRoot: root });
    assert.equal(mismatch.files[0].providerObservation.byteEqual, false);
    assert.equal(
      mismatch.files[0].providerObservation.authenticatedOrigin,
      false,
    );
    assert.equal(mismatch.occurrences[0].reference, 'ADR-014');
  }));

test('invalid UTF-8 is an error rather than a replacement-character source witness', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/utf8.json';
    put(relative, '{}');
    fs.writeFileSync(
      path.join(root, relative),
      Buffer.concat([
        Buffer.from('{"description":"'),
        Buffer.from([0xc3, 0x28]),
        Buffer.from(' ADR-014"}'),
      ]),
    );
    git('add', '.');
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('equivalent escaped duplicate JSON keys also reject', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/escaped-duplicate.json';
    put(relative, '{"description":"ADR-014","descr\\u0069ption":"hidden"}');
    git('add', '.');
    incomplete(censusSchemaCitations({ repoRoot: root }), relative);
  }));

test('a Git repository with no tracked schemas cannot claim completeness', () =>
  fixture(({ root, put }) => {
    put('law/schemas/untracked.json', { description: 'ADR-014' });
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, false);
    assert.equal(result.declaredPopulation.count, 0);
    assert.ok(result.errors.length > 0);
  }));

test('CLI invoked through an external symlink still emits whole JSON and refuses malformed input', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/broken.json', '{');
    git('add', '.');
    const alias = `${root}-census-cli.mjs`;
    fs.symlinkSync(modulePath, alias);
    try {
      const result = spawnSync(process.execPath, [alias, '--repo-root', root], {
        encoding: 'utf8',
      });
      assert.ifError(result.error);
      assert.equal(result.status, 1, result.stderr);
      incomplete(JSON.parse(result.stdout), 'law/schemas/broken.json');
    } finally {
      fs.rmSync(alias, { force: true });
    }
  }));

test('changed worktree bytes expose their distinct Git blob identity and declared measurement basis', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/changed.json';
    put(relative, { description: 'ADR-014' });
    git('add', '.');
    const indexBlobOid = git('rev-parse', `:${relative}`).trim();
    put(relative, { description: 'ADR-015' });
    const worktreeBlobOid = git('hash-object', '--', relative).trim();
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    assert.equal(result.files[0].indexBlobOid, indexBlobOid);
    assert.equal(result.files[0].worktreeBlobOid, worktreeBlobOid);
    assert.notEqual(indexBlobOid, worktreeBlobOid);
    assert.equal(result.files[0].worktreeMatchesIndex, false);
    assert.equal(
      result.declaredPopulation.basis,
      'tracked-index-population/worktree-bytes',
    );
    assert.ok(
      ['sha1', 'sha256'].includes(result.declaredPopulation.gitObjectFormat),
    );
    assert.equal(result.occurrences[0].reference, 'ADR-015');
    git('add', relative);
    const staged = censusSchemaCitations({ repoRoot: root });
    assert.equal(staged.files[0].worktreeMatchesIndex, true);
    assert.equal(staged.files[0].indexBlobOid, worktreeBlobOid);
  }));

test('UTF-8 BOM is explicitly refused rather than silently stripped', () =>
  fixture(({ root, put, git }) => {
    const relative = 'law/schemas/bom.json';
    put(relative, '{}');
    fs.writeFileSync(
      path.join(root, relative),
      Buffer.concat([
        Buffer.from([0xef, 0xbb, 0xbf]),
        Buffer.from('{"description":"ADR-014"}'),
      ]),
    );
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    incomplete(result, relative);
    assert.ok(result.errors.some((entry) => /BOM/.test(entry.code)));
  }));

test('uppercase JSON extension and newline-containing tracked paths cannot silently disappear', () =>
  fixture(({ root, put, git }) => {
    const paths = ['law/schemas/upper.JSON', 'law/schemas/line\nbreak.json'];
    for (const relative of paths) put(relative, { description: 'ADR-014' });
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.declaredPopulation.count, paths.length);
    for (const relative of paths) {
      assert.ok(result.declaredPopulation.paths.includes(relative));
      assert.ok(
        result.files.some((entry) => entry.path === relative) ||
          result.errors.some((entry) => entry.path === relative),
      );
    }
    if (result.errors.length) assert.equal(result.complete, false);
  }));

test('non-root repository directories and invalid CLI arguments fail closed', () =>
  fixture(({ root, put, git }) => {
    put('law/schemas/a.json', {});
    git('add', '.');
    const result = censusSchemaCitations({
      repoRoot: path.join(root, 'law'),
    });
    assert.equal(result.complete, false);
    assert.ok(
      result.errors.some((entry) => entry.code === 'REPOSITORY_ROOT_REQUIRED'),
    );
    const cli = spawnSync(process.execPath, [modulePath, '--unknown-option'], {
      encoding: 'utf8',
    });
    assert.ifError(cli.error);
    assert.equal(cli.status, 1, cli.stderr);
    const report = JSON.parse(cli.stdout);
    assert.equal(report.complete, false);
    assert.ok(
      report.errors.some((entry) => entry.code === 'INVALID_ARGUMENTS'),
    );
  }));

test('declared citation grammar states its limits and offsets count decoded UTF-16 units', () =>
  fixture(({ root, put, git }) => {
    const text =
      '😀 ADR-12345 ADR-14 adr-014 ADR-scr-0021 ADR 014 ADR-014 ADR-SCR-0021';
    put('law/schemas/grammar.json', { description: text });
    git('add', '.');
    const result = censusSchemaCitations({ repoRoot: root });
    assert.equal(result.complete, true);
    const grammar = result.citationGrammar;
    assert.equal(typeof grammar.expression, 'string');
    assert.ok(grammar.expression.length > 0);
    assert.equal(grammar.flags, 'g');
    assert.equal(grammar.caseSensitive, true);
    assert.deepEqual(grammar.digitRange, [3, 4]);
    assert.equal(
      grammar.stringOffsetUnit,
      'UTF-16 code units of decoded JSON strings',
    );
    assert.ok(grammar.limitations.length > 0);
    assert.match(grammar.limitations.join(' '), /uppercase|case-sensitive/i);
    assert.match(grammar.limitations.join(' '), /3.?4|three|four/i);
    assert.match(grammar.limitations.join(' '), /semantic|resolv/i);
    const expected = ['ADR-014', 'ADR-SCR-0021'];
    assert.deepEqual(
      result.occurrences.map((entry) => entry.reference),
      expected,
    );
    assert.deepEqual(
      [...text.matchAll(new RegExp(grammar.expression, grammar.flags))].map(
        (match) => match[0],
      ),
      expected,
    );
    const firstOffset = text.lastIndexOf('ADR-014');
    assert.equal(result.occurrences[0].stringOffset, firstOffset);
    assert.notEqual(Buffer.byteLength(text.slice(0, firstOffset)), firstOffset);
    assert.notEqual([...text.slice(0, firstOffset)].length, firstOffset);
  }));
