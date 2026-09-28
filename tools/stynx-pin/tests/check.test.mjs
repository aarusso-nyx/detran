import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const checkScript = path.resolve(testDirectory, '../../check-stynx-pin.ts');
const tsxUrl = import.meta.resolve('tsx');

function withFixture(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'detran-stynx-pin-'));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeJson(root, relative, value) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeFixtureManifest(root, relative, manifest) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function createFixture(root, version = '1.4.0') {
  writeJson(root, 'tools/stynx-version.json', { version });
}

function runCheck(root, { cwd = root, explicitRoot = true } = {}) {
  assert.ok(
    checkScript && readFileOrNull(checkScript) !== null,
    `CLI ausente para caracterização RED: ${checkScript}`,
  );
  const args = ['--import', tsxUrl, checkScript];
  if (explicitRoot) args.push(root);
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
  });
  return {
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
    status: result.status,
  };
}

function readFileOrNull(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function assertExit(result, expected) {
  assert.equal(result.status, expected, result.output);
}

function assertDiagnostic(result, ...fields) {
  for (const field of fields) {
    assert.match(result.output, new RegExp(escapeRegExp(field)));
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

test('C-02-01 dado fonte válida e manifestos uniformes quando verifica então aceita as quatro seções', () => {
  withFixture((root) => {
    createFixture(root);
    writeFixtureManifest(root, 'package.json', {
      dependencies: { '@stynx-nyx/core': '1.4.0', lodash: '^4.17.21' },
      devDependencies: { '@stynx-nyx/data': '1.4.0', prettier: '^3.5.3' },
      optionalDependencies: { '@stynx-nyx/jobs': '1.4.0' },
      peerDependencies: { '@stynx-nyx/ui': '1.4.0' },
    });
    writeFixtureManifest(root, 'packages/novo/package.json', {
      dependencies: { '@stynx-nyx/auth': '1.4.0' },
    });

    assertExit(runCheck(root), 0);
  });
});

test('C-02-02 dado versões divergentes por seção quando verifica então diagnostica cada declaração', () => {
  withFixture((root) => {
    createFixture(root);
    writeFixtureManifest(root, 'package.json', {
      dependencies: { '@stynx-nyx/core': '1.3.1' },
      devDependencies: { '@stynx-nyx/data': '1.5.0' },
      optionalDependencies: { '@stynx-nyx/jobs': '0.0.1' },
      peerDependencies: { '@stynx-nyx/ui': '2.0.0' },
    });

    const result = runCheck(root);
    assertExit(result, 1);
    for (const section of [
      'dependencies',
      'devDependencies',
      'optionalDependencies',
      'peerDependencies',
    ]) {
      assertDiagnostic(result, 'package.json', section, '1.4.0');
    }
    assertDiagnostic(
      result,
      '@stynx-nyx/core',
      '@stynx-nyx/data',
      '@stynx-nyx/jobs',
      '@stynx-nyx/ui',
      '1.3.1',
    );
  });
});

test('C-02-03 dado ranges tags protocolos e valor não string quando verifica então rejeita todos', () => {
  withFixture((root) => {
    createFixture(root);
    const invalidVersions = {
      '@stynx-nyx/core': '^1.4.0',
      '@stynx-nyx/data': '~1.4.0',
      '@stynx-nyx/auth': '>=1.4.0',
      '@stynx-nyx/ui': 'latest',
      '@stynx-nyx/jobs': 'workspace:*',
      '@stynx-nyx/queue': 'file:../queue',
      '@stynx-nyx/link': 'link:../link',
      '@stynx-nyx/cache': 'npm:other-package@1.4.0',
      '@stynx-nyx/git': 'git://github.com/example/stynx.git',
      '@stynx-nyx/http': 'https://example.invalid/stynx.tgz',
      '@stynx-nyx/value': 140,
    };
    writeFixtureManifest(root, 'package.json', {
      dependencies: invalidVersions,
    });

    const result = runCheck(root);
    assertExit(result, 1);
    for (const [pkg, found] of Object.entries(invalidVersions)) {
      assertDiagnostic(result, pkg, String(found), '1.4.0');
    }
  });
});

test('C-02-04 dado manifestos raiz docs e pacote novo quando verifica então encontra todos', () => {
  withFixture((root) => {
    createFixture(root);
    writeFixtureManifest(root, 'package.json', {
      dependencies: { '@stynx-nyx/core': '1.3.1' },
    });
    writeFixtureManifest(root, 'docs/site/package.json', {
      devDependencies: { '@stynx-nyx/ui': '1.3.1' },
    });
    writeFixtureManifest(root, 'novos/workspaces/aninhado/package.json', {
      peerDependencies: { '@stynx-nyx/data': '1.3.1' },
    });

    const result = runCheck(root);
    assertExit(result, 1);
    assertDiagnostic(
      result,
      'package.json',
      'docs/site/package.json',
      'novos/workspaces/aninhado/package.json',
    );
  });
});

test('C-02-05 dado diretórios excluídos e fonte gerada quando verifica então ignora só os excluídos', () => {
  withFixture((root) => {
    createFixture(root);
    for (const directory of [
      'dist',
      'build',
      'node_modules',
      '.git',
      '.devai',
      '.cache',
      '.angular',
      '.next',
      'coverage',
      'scratch',
      'tmp',
    ]) {
      writeFixtureManifest(root, `${directory}/package.json`, {
        dependencies: { '@stynx-nyx/core': '1.3.1' },
      });
    }
    writeFixtureManifest(root, 'backend/domains/generated/package.json', {
      dependencies: { '@stynx-nyx/core': '1.3.1' },
    });

    const result = runCheck(root);
    assertExit(result, 1);
    assertDiagnostic(result, 'backend/domains/generated/package.json');
    for (const directory of [
      'dist',
      'build',
      'node_modules',
      '.git',
      '.devai',
      '.cache',
      '.angular',
      '.next',
      'coverage',
      'scratch',
      'tmp',
    ]) {
      assert.doesNotMatch(
        result.output,
        new RegExp(`${escapeRegExp(directory)}/package\\.json`),
      );
    }
  });
});

test('C-02-06 dado fonte ou manifesto inválido quando verifica então falha com caminho e causa', () => {
  const cases = [
    {
      name: 'fonte ausente',
      prepare(root) {
        writeFixtureManifest(root, 'package.json', {});
      },
      path: 'tools/stynx-version.json',
    },
    {
      name: 'fonte JSON malformada',
      prepare(root) {
        mkdirSync(path.join(root, 'tools'), { recursive: true });
        writeFileSync(path.join(root, 'tools/stynx-version.json'), '{', 'utf8');
      },
      path: 'tools/stynx-version.json',
    },
    {
      name: 'version ausente',
      prepare(root) {
        writeJson(root, 'tools/stynx-version.json', {});
      },
      path: 'tools/stynx-version.json',
    },
    {
      name: 'version não string',
      prepare(root) {
        writeJson(root, 'tools/stynx-version.json', { version: 140 });
      },
      path: 'tools/stynx-version.json',
    },
    {
      name: 'version range',
      prepare(root) {
        writeJson(root, 'tools/stynx-version.json', { version: '^1.4.0' });
      },
      path: 'tools/stynx-version.json',
    },
    {
      name: 'manifesto JSON malformado',
      prepare(root) {
        createFixture(root);
        writeFileSync(path.join(root, 'package.json'), '{', 'utf8');
      },
      path: 'package.json',
    },
    {
      name: 'seção de dependências inválida',
      prepare(root) {
        createFixture(root);
        writeFixtureManifest(root, 'package.json', { dependencies: [] });
      },
      path: 'package.json',
    },
  ];

  for (const scenario of cases) {
    withFixture((root) => {
      scenario.prepare(root);
      const result = runCheck(root);
      assertExit(result, 1);
      assertDiagnostic(result, scenario.path);
    });
  }
});

test('C-02-07 dado repoRoot explícito ou cwd quando verifica então usa a fonte da fixture', () => {
  withFixture((root) => {
    createFixture(root, '2.4.7');
    writeFixtureManifest(root, 'package.json', {
      dependencies: { '@stynx-nyx/core': '2.4.7' },
    });

    assertExit(runCheck(root), 0);
    assertExit(runCheck(root, { explicitRoot: false }), 0);
  });
});

test('C-02-08 dado symlinks externos e repo sem STYNX quando verifica então não segue links nem escreve', () => {
  withFixture((root) => {
    createFixture(root);
    writeFixtureManifest(root, 'package.json', {
      dependencies: { react: '^19.0.0' },
    });
    const external = mkdtempSync(
      path.join(os.tmpdir(), 'detran-stynx-pin-external-'),
    );
    try {
      writeFixtureManifest(external, 'package.json', {
        dependencies: { '@stynx-nyx/core': '1.3.1' },
      });
      symlinkSync(external, path.join(root, 'linked-directory'));
      symlinkSync(
        path.join(external, 'package.json'),
        path.join(root, 'linked-package.json'),
      );
      const before = readFileSync(path.join(root, 'package.json'));

      assertExit(runCheck(root), 0);
      assert.deepEqual(readFileSync(path.join(root, 'package.json')), before);
    } finally {
      rmSync(external, { recursive: true, force: true });
    }
  });
});
