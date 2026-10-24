import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GOVERNED_UPGRADE_PATHS,
  UPGRADE_MANIFEST,
  UPGRADE_MANIFEST_SHA256,
  verifyGovernedUpgradeCompatibility,
} from '../governed-upgrade-compatibility.mjs';
import {
  PRESERVATION_PATH,
  AUTHORIZED_APPEND,
  AUTHORIZED_MAIN_APPEND,
  verifyHistoricalCompatibility,
  sha256,
} from '../verify-historical-compatibility.mjs';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const manifestBytes = fs.readFileSync(path.join(repository, UPGRADE_MANIFEST));
const manifest = JSON.parse(manifestBytes);
const git = (...args) =>
  execFileSync('git', ['--no-replace-objects', '-C', repository, ...args], {
    maxBuffer: 16 * 1024 * 1024,
  });
const put = (root, file, bytes) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), bytes);
};
function fixture(run, { historical = false } = {}) {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'detran-upgrade-custody-test-')),
  );
  try {
    put(
      root,
      '.git',
      `gitdir: ${git('rev-parse', '--absolute-git-dir').toString().trim()}\n`,
    );
    if (historical) {
      const legacy = JSON.parse(
        fs.readFileSync(
          path.join(
            repository,
            'docs/meta/security/historical-compatibility.json',
          ),
        ),
      );
      const reference = JSON.parse(
        fs.readFileSync(path.join(repository, PRESERVATION_PATH)),
      );
      for (const file of Object.keys(reference))
        put(root, file, fs.readFileSync(path.join(repository, file)));
      for (const file of [
        PRESERVATION_PATH,
        legacy.legacy_adr.source.path,
        ...legacy.closure_links.flatMap((item) => [
          item.record_source.path,
          item.closure_source.path,
        ]),
        ...legacy.diagnostic_captures.map((item) => item.path),
      ])
        put(root, file, fs.readFileSync(path.join(repository, file)));
      fs.cpSync(
        path.join(repository, legacy.known_mutation.path),
        path.join(root, legacy.known_mutation.path),
        { recursive: true },
      );
      for (const item of [AUTHORIZED_APPEND, AUTHORIZED_MAIN_APPEND])
        put(root, item.path, git('show', `${item.commit}:${item.path}`));
    }
    put(root, UPGRADE_MANIFEST, manifestBytes);
    put(
      root,
      'docs/meta/security/historical-compatibility.json',
      fs.readFileSync(
        path.join(
          repository,
          'docs/meta/security/historical-compatibility.json',
        ),
      ),
    );
    for (const item of [
      ...manifest.generated_files,
      ...manifest.authority_sources,
      ...manifest.preserved_sources,
      ...manifest.dependencies.map((item) => item.after),
    ])
      put(root, item.path, git('show', `${item.commit}:${item.path}`));
    const reference = JSON.parse(
      fs.readFileSync(path.join(repository, PRESERVATION_PATH)),
    );
    const baselineFiles = new Map(
      manifest.sealed_transitions.map((item) => [
        item.path,
        git('show', `${manifest.baseline_commit}:${item.path}`),
      ]),
    );
    return run(
      root,
      () => verifyGovernedUpgradeCompatibility(root, reference, baselineFiles),
      reference,
      baselineFiles,
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
function rewrite(root, file, change) {
  const value = JSON.parse(fs.readFileSync(path.join(root, file)));
  change(value);
  put(root, file, JSON.stringify(value, null, 2) + '\n');
}

test('ADR-0062 accepts only the authentic two-path transition and issues no native verdict', () =>
  fixture((root, verify) => {
    assert.equal(sha256(manifestBytes), UPGRADE_MANIFEST_SHA256);
    assert.deepEqual(GOVERNED_UPGRADE_PATHS, [
      '.devai/config/project.json',
      '.devai/pin/constitution.md',
    ]);
    assert.equal(manifest.generated_files.length, 6);
    assert.equal(
      Object.keys(
        JSON.parse(fs.readFileSync(path.join(repository, PRESERVATION_PATH))),
      ).length,
      1073,
    );
    const result = verify();
    assert.deepEqual(result.sealed_paths, [...GOVERNED_UPGRADE_PATHS]);
    assert.equal(result.generated_files_verified, 6);
    assert.equal(
      result.adoption_commit,
      '74b9eec83cd10d981f5ec5923c0f82ad7b2c13b5',
    );
    assert.equal(result.native_verdict_replaced, false);
    assert.equal(Object.hasOwn(result, 'native_readings_issued'), false);
  }));

test('ADR-0062 preserves original baseline reference and source bytes independently', () => {
  for (const file of GOVERNED_UPGRADE_PATHS) {
    fixture((root, verify, reference) => {
      reference[file] = '0'.repeat(64);
      assert.throws(verify, /original preservation reference/);
    });
    fixture((root, verify, reference, baselineFiles) => {
      baselineFiles.set(file, Buffer.from('forged baseline'));
      assert.throws(verify, /original preservation reference/);
    });
  }
});

test('ADR-0062 rejects every changed or missing generated configuration including receipt', () => {
  for (const item of manifest.generated_files) {
    fixture((root, verify) => {
      fs.appendFileSync(path.join(root, item.path), '\n');
      assert.throws(verify, /current bytes/);
    });
    fixture((root, verify) => {
      fs.unlinkSync(path.join(root, item.path));
      assert.throws(verify, /ENOENT|GOVERNED_UPGRADE_REFUSED/);
    });
  }
});

test('ADR-0062 digest boundary rejects 14 omitted duplicated swapped substituted and forged manifests', () => {
  const changes = [
    (m) => m.sealed_transitions.pop(),
    (m) => m.sealed_transitions.push(m.sealed_transitions[0]),
    (m) => m.sealed_transitions.reverse(),
    (m) => (m.sealed_transitions[0].path = '.devai/config/thresholds.json'),
    (m) => (m.sealed_transitions[0].baseline.sha256 = '0'.repeat(64)),
    (m) => (m.sealed_transitions[0].after.git_blob = '0'.repeat(40)),
    (m) => (m.before_commit = '0'.repeat(40)),
    (m) => (m.adoption_commit = '0'.repeat(40)),
    (m) => (m.authority = 'invented Owner waiver'),
    (m) => (m.authority_sources[1].sha256 = '0'.repeat(64)),
    (m) => m.generated_files.pop(),
    (m) => (m.generated_files[5].path = 'forged-upgrade-receipt.json'),
    (m) => (m.native_verdict_replacement = true),
    (m) => (m.provider.to = '2.8.0'),
  ];
  // These are digest-boundary refusals, not coverage claims for inner semantic
  // guards. The production verifier has no injectable identity/test seam.
  assert.equal(changes.length, 14);
  for (const change of changes)
    fixture((root, verify) => {
      rewrite(root, UPGRADE_MANIFEST, change);
      assert.throws(verify, /manifest digest/);
    });
});

test('ADR-0062 rejects missing manifests and symlinked manifests or current sources', () => {
  fixture((root, verify) => {
    fs.unlinkSync(path.join(root, UPGRADE_MANIFEST));
    assert.throws(verify, /ENOENT|GOVERNED_UPGRADE_REFUSED/);
  });
  for (const file of [
    UPGRADE_MANIFEST,
    ...manifest.generated_files.map((item) => item.path),
  ])
    fixture((root, verify) => {
      const original = fs.readFileSync(path.join(root, file));
      put(root, 'same-bytes-target', original);
      fs.unlinkSync(path.join(root, file));
      fs.symlinkSync(
        path.join(root, 'same-bytes-target'),
        path.join(root, file),
      );
      assert.throws(verify, /nonregular or linked source/);
    });
});

test('ADR-0062 refuses v1 manifest changes and changed policy or C6 bindings', () => {
  for (const file of [
    'docs/meta/security/historical-compatibility.json',
    ...manifest.preserved_sources.map((item) => item.path),
  ])
    fixture((root, verify) => {
      fs.appendFileSync(path.join(root, file), '\n');
      assert.throws(verify, /original v1 manifest changed|current bytes/);
    });
  fixture((root, verify) => {
    rewrite(root, '.devai/config/invariant-producers.json', (m) =>
      m.bindings.push({ id: 'invented-producer' }),
    );
    assert.throws(verify, /current bytes|C6 bindings/);
  });
});

test('ADR-0062 allows later legitimate prose and unrelated dependencies while binding immutable adoption authority', () =>
  fixture((root, verify) => {
    for (const item of manifest.authority_sources.slice(0, 2))
      fs.appendFileSync(
        path.join(root, item.path),
        '\nLater legitimate follow-up.\n',
      );
    rewrite(root, 'package.json', (m) => {
      m.description = 'Later documentation';
      m.devDependencies['unrelated-fixture-package'] = '1.0.0';
    });
    fs.appendFileSync(
      path.join(root, 'pnpm-lock.yaml'),
      '\n# Later unrelated dependency metadata\n',
    );
    assert.equal(verify().native_verdict_replaced, false);
  }));

test('ADR-0062 rejects unregistered future provider pin and lock identities', () => {
  fixture((root, verify) => {
    rewrite(
      root,
      'package.json',
      (m) => (m.devDependencies['@aarusso-nyx/devai'] = '2.8.0'),
    );
    assert.throws(verify, /current provider dependency identity/);
  });
  fixture((root, verify) => {
    const file = 'pnpm-lock.yaml';
    put(
      root,
      file,
      fs
        .readFileSync(path.join(root, file), 'utf8')
        .replaceAll('@aarusso-nyx/devai@2.7.0', '@aarusso-nyx/devai@2.8.0'),
    );
    assert.throws(verify, /unique DEVAI lock identity required/);
  });
  fixture((root, verify) => {
    rewrite(
      root,
      '.devai/config/project.json',
      (m) => (m.devai_version = '2.8.0'),
    );
    assert.throws(verify, /current bytes/);
  });
});

test('ADR-0062 keeps unrelated sealed bytes strict after the authentic upgrade', () =>
  fixture(
    (root) => {
      const result = verifyHistoricalCompatibility(root);
      assert.equal(result.preservation.sealed_sources, 1073);
      assert.equal(
        result.preservation.governed_upgrade_transition
          .generated_files_verified,
        6,
      );
      const file = '.devai/state/evidence-chain.json';
      fs.appendFileSync(path.join(root, file), '\n');
      assert.throws(
        () => verifyHistoricalCompatibility(root),
        /SEALED_BYTES_CHANGED/,
      );
    },
    { historical: true },
  ));

test('ADR-0062 leaves original pre-upgrade sealed paths valid without using the forward map', () =>
  fixture(
    (root) => {
      for (const item of manifest.sealed_transitions)
        put(
          root,
          item.path,
          git('show', `${manifest.before_commit}:${item.path}`),
        );
      fs.unlinkSync(path.join(root, UPGRADE_MANIFEST));
      const result = verifyHistoricalCompatibility(root);
      assert.equal(result.ok, true);
      assert.equal(result.preservation.sealed_sources, 1073);
      assert.equal(
        Object.hasOwn(result.preservation, 'governed_upgrade_transition'),
        false,
      );
      assert.equal(result.native_verdict_replaced, false);
    },
    { historical: true },
  ));

test('ADR-0062 rejects both mixed old/new sealed-path states', () => {
  for (const oldPath of GOVERNED_UPGRADE_PATHS)
    fixture(
      (root) => {
        put(root, oldPath, git('show', `${manifest.before_commit}:${oldPath}`));
        assert.throws(
          () => verifyHistoricalCompatibility(root),
          /GOVERNED_UPGRADE_REFUSED: current bytes/,
        );
      },
      { historical: true },
    );
});
