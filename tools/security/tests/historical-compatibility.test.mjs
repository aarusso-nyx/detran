import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASELINE,
  AUTHORIZED_APPEND,
  AUTHORIZED_MAIN_APPEND,
  verifyAuthorizedAppend,
  sha256,
  CLOSURES,
  MISSING_ROUNDS,
  PRESERVATION_PATH,
  boundSource,
  verifyHistoricalCompatibility,
} from '../verify-historical-compatibility.mjs';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(repository, 'docs/meta/security/historical-compatibility.json'),
    'utf8',
  ),
);
const clone = () => structuredClone(manifest);
function rejects(change, code) {
  const value = clone();
  change(value);
  assert.throws(() => verifyHistoricalCompatibility(acceptedRoot, value), code);
}
const put = (root, file, bytes) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), bytes);
};
function fixture(run, { closures = false, all = false, retain = false } = {}) {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'detran-history-custody-test-')),
  );
  const copy = (file) =>
    put(root, file, fs.readFileSync(path.join(repository, file)));
  try {
    // Copy the worktree's Git pointer for read-only show/log/cat-file queries.
    // No Git mutation is issued by this suite or the verifier.
    copy('.git');
    if (closures || all) {
      for (const entry of manifest.closure_links) {
        copy(entry.record_source.path);
        copy(entry.closure_source.path);
      }
    }
    if (all) {
      const reference = JSON.parse(
        fs.readFileSync(path.join(repository, PRESERVATION_PATH), 'utf8'),
      );
      for (const file of Object.keys(reference)) copy(file);
      copy(PRESERVATION_PATH);
      copy(manifest.legacy_adr.source.path);
      fs.cpSync(
        path.join(repository, manifest.known_mutation.path),
        path.join(root, manifest.known_mutation.path),
        { recursive: true },
      );
      copy('docs/meta/security/historical-compatibility.json');
      for (const entry of manifest.diagnostic_captures) copy(entry.path);
      put(root, AUTHORIZED_APPEND.path, authenticAppend);
      put(root, AUTHORIZED_MAIN_APPEND.path, authenticMainAppend);
    }
    return run(root, copy);
  } finally {
    if (!retain) fs.rmSync(root, { recursive: true, force: true });
  }
}

const gitBytes = (commit, file) =>
  execFileSync('git', [
    '--no-replace-objects',
    '-C',
    repository,
    'show',
    `${commit}:${file}`,
  ]);
const authenticAppend = gitBytes(
  AUTHORIZED_APPEND.commit,
  AUTHORIZED_APPEND.path,
);
const originalAppend = gitBytes(BASELINE, AUTHORIZED_APPEND.path);
const authenticMainAppend = gitBytes(
  AUTHORIZED_MAIN_APPEND.commit,
  AUTHORIZED_MAIN_APPEND.path,
);
const originalMainAppend = gitBytes(BASELINE, AUTHORIZED_MAIN_APPEND.path);
let acceptedRoot;
before(() =>
  fixture(
    (root) => {
      acceptedRoot = root;
    },
    { all: true, retain: true },
  ),
);
after(() => {
  if (acceptedRoot) fs.rmSync(acceptedRoot, { recursive: true, force: true });
});

test('actual repository either has both exact approved streams or refuses their unintegrated baseline versions', () => {
  let unintegrated = false;
  for (const [approved, transition] of [
    [AUTHORIZED_APPEND, manifest.preservation.authorized_append_transition],
    [
      AUTHORIZED_MAIN_APPEND,
      manifest.preservation.integrated_main_append_transition,
    ],
  ]) {
    const current = fs.readFileSync(path.join(repository, approved.path));
    if (sha256(current) !== approved.sha256) {
      assert.equal(sha256(current), transition.original_sha256);
      unintegrated = true;
    }
  }
  if (unintegrated)
    assert.throws(
      () => verifyHistoricalCompatibility(repository),
      /APPEND_CURRENT_HASH_UNAPPROVED/,
    );
  else
    assert.equal(
      verifyHistoricalCompatibility(repository).native_verdict_replaced,
      false,
    );
});

test('authentic approved append in an isolated full custody copy preserves every explicit finding', () => {
  const result = verifyHistoricalCompatibility(acceptedRoot);
  assert.equal(result.ok, true);
  assert.equal(result.status, 'supplementary-map-verified-with-recorded-gaps');
  assert.equal(result.native_readings_issued, false);
  assert.equal(result.native_verdict_replaced, false);
  assert.equal(result.located_closure_sources, Object.keys(CLOSURES).length);
  assert.deepEqual(result.missing_records, [...MISSING_ROUNDS].sort());
  assert.ok(
    result.retained_findings.includes('DECISION_FRONTMATTER_INVALID:ADR-0001'),
  );
  assert.ok(result.retained_findings.includes('ROUND_ARCHIVE_MUTATED:R-0017'));
  assert.equal(result.preservation.sealed_sources, 1073);
  assert.equal(result.preservation.R0036, 'closed:PC-0022');
  assert.equal(
    result.preservation.authorized_append_transition.authorized_new_lines,
    1,
  );
  assert.equal(
    result.preservation.integrated_main_append_transition.authorized_new_lines,
    2,
  );
  assert.match(result.limitation, /native verification remains required/);
});

function appendFixture(run) {
  return fixture((root) => {
    put(root, AUTHORIZED_APPEND.path, authenticAppend);
    run(root, () =>
      verifyAuthorizedAppend(
        root,
        structuredClone(manifest.preservation.authorized_append_transition),
        originalAppend,
        sha256(originalAppend),
      ),
    );
  });
}

test('authorized append rejects source identity spoofing and invented authority', () =>
  appendFixture((root) => {
    for (const key of ['path', 'commit', 'git_blob', 'sha256']) {
      const transition = structuredClone(
        manifest.preservation.authorized_append_transition,
      );
      transition.source[key] =
        key === 'path'
          ? 'record/proofs/work/generic/R-9999.jsonl'
          : '0'.repeat(key === 'sha256' ? 64 : 40);
      assert.throws(
        () =>
          verifyAuthorizedAppend(
            root,
            transition,
            originalAppend,
            sha256(originalAppend),
          ),
        /APPEND_SOURCE_IDENTITY_INVALID/,
      );
    }
    const transition = structuredClone(
      manifest.preservation.authorized_append_transition,
    );
    transition.authority = 'invented authority';
    assert.throws(
      () =>
        verifyAuthorizedAppend(
          root,
          transition,
          originalAppend,
          sha256(originalAppend),
        ),
      /APPEND_TRANSITION_IDENTITY_INVALID/,
    );
  }));

test('authorized append rejects old-prefix changes unknown third lines and the original one-line version', () =>
  appendFixture((root, verify) => {
    assert.equal(verify().original_lines_preserved, 1);
    const altered = Buffer.from(authenticAppend);
    altered[0] ^= 1;
    put(root, AUTHORIZED_APPEND.path, altered);
    assert.throws(verify, /APPEND_PREFIX_CHANGED/);
    put(
      root,
      AUTHORIZED_APPEND.path,
      Buffer.concat([
        authenticAppend,
        Buffer.from('{"sequence":3,"round_id":"R-0037"}\n'),
      ]),
    );
    assert.throws(verify, /APPEND_CURRENT_HASH_UNAPPROVED/);
    put(root, AUTHORIZED_APPEND.path, originalAppend);
    assert.throws(verify, /APPEND_CURRENT_HASH_UNAPPROVED/);
  }));

test('changed appended sequence or round cannot claim the approved source bytes', () =>
  appendFixture((root, verify) => {
    const lines = authenticAppend
      .toString()
      .trimEnd()
      .split('\n')
      .map((line) => JSON.parse(line));
    for (const change of [
      (row) => {
        row.sequence = 3;
      },
      (row) => {
        row.round_id = 'R-9999';
      },
    ]) {
      const rows = structuredClone(lines);
      change(rows[1]);
      put(
        root,
        AUTHORIZED_APPEND.path,
        originalAppend.toString() + JSON.stringify(rows[1]) + '\n',
      );
      assert.throws(verify, /APPEND_CURRENT_HASH_UNAPPROVED/);
    }
  }));

test('compatibility cannot claim a replacement native verdict or accept an extra waiver field', () => {
  rejects((value) => {
    value.native_verdict_replacement = true;
  }, /AUTHORITY_OR_VERDICT_INVALID/);
  rejects((value) => {
    value.waiver = 'accept all future exceptions';
  }, /KEYS_INVALID/);
  rejects((value) => {
    value.baseline_commit = '0'.repeat(40);
  }, /VERSION_OR_BASELINE_INVALID/);
});

test('all exact closure mappings are required and duplicate or new identities reject', () => {
  rejects((value) => {
    value.closure_links.pop();
  }, /CLOSURE_POPULATION_INVALID/);
  rejects((value) => {
    value.closure_links[1] = structuredClone(value.closure_links[0]);
  }, /CLOSURE_IDENTITY_INVALID/);
  rejects((value) => {
    value.closure_links[0].round_id = 'R-9999';
  }, /CLOSURE_IDENTITY_INVALID/);
  rejects((value) => {
    value.closure_links[0].closure_id = 'PC-9999';
  }, /CLOSURE_IDENTITY_INVALID/);
});

test('source identities cannot substitute another valid record or closure under an old round', () => {
  rejects((value) => {
    value.closure_links[0].record_source.path =
      value.closure_links[1].record_source.path;
  }, /SOURCE_PATH_IDENTITY_INVALID/);
  rejects((value) => {
    value.closure_links[0].closure_source.path =
      value.closure_links[1].closure_source.path;
  }, /SOURCE_PATH_IDENTITY_INVALID/);
  rejects((value) => {
    value.closure_links[0].disposition = 'missing record accepted';
  }, /DISPOSITION_INVALID/);
});

test('source commit blob and hash all bind independently to the fixed baseline', () => {
  const source = structuredClone(manifest.closure_links[0].record_source);
  assert.equal(source.commit, BASELINE);
  assert.throws(
    () => boundSource(repository, { ...source, commit: '0'.repeat(40) }),
    /SOURCE_COMMIT_MISMATCH/,
  );
  assert.throws(
    () => boundSource(repository, { ...source, git_blob: '0'.repeat(40) }),
    /GIT_OBJECT_MISMATCH/,
  );
  assert.throws(
    () => boundSource(repository, { ...source, sha256: '0'.repeat(64) }),
    /SOURCE_HASH_MISMATCH/,
  );
  assert.throws(
    () =>
      boundSource(repository, {
        ...source,
        path: manifest.closure_links[1].record_source.path,
      }),
    /GIT_OBJECT_MISMATCH/,
  );
});

test('current bound source tampering and symlinks reject in an isolated copy', () =>
  fixture((root, copy) => {
    const source = manifest.closure_links[0].record_source;
    copy(source.path);
    assert.ok(boundSource(root, source).length > 0);
    fs.appendFileSync(
      path.join(root, source.path),
      '\nInspector synthetic tamper\n',
    );
    assert.throws(() => boundSource(root, source), /CURRENT_BYTES_CHANGED/);
    fs.unlinkSync(path.join(root, source.path));
    fs.symlinkSync(
      path.join(repository, source.path),
      path.join(root, source.path),
    );
    assert.throws(() => boundSource(root, source), /SOURCE_SYMLINK_INVALID/);
  }));

test('missing closure source is not inferred from the reference or a valid Git object', () =>
  fixture((root) => {
    put(
      root,
      manifest.closure_links[0].record_source.path,
      fs.readFileSync(
        path.join(repository, manifest.closure_links[0].record_source.path),
      ),
    );
    assert.throws(() => verifyHistoricalCompatibility(root, clone()), /ENOENT/);
  }));

test('missing records remain named gaps with no removal duplicate extension or approved reconstruction', () => {
  rejects((value) => {
    value.missing_records.pop();
  }, /MISSING_POPULATION_INVALID/);
  rejects((value) => {
    value.missing_records[1] = structuredClone(value.missing_records[0]);
  }, /MISSING_IDENTITY_INVALID/);
  rejects((value) => {
    value.missing_records[0].round_id = 'R-9999';
  }, /MISSING_IDENTITY_INVALID/);
  rejects((value) => {
    value.missing_records[0].disposition = 'retrospectively closed';
  }, /MISSING_DISPOSITION_INVALID/);
});

test('a fabricated new record for an absent historical round rejects before any compatibility success', () =>
  fixture(
    (root) => {
      const gap = manifest.missing_records[0];
      put(
        root,
        gap.path,
        `---\nid: ${gap.round_id}\nstatus: closed\n---\nSynthetic forbidden reconstruction.\n`,
      );
      assert.throws(
        () => verifyHistoricalCompatibility(root, clone()),
        /UNREGISTERED_NEW_RECORD/,
      );
    },
    { closures: true },
  ));

test('known R0017 mutation cannot be waived or assigned a fabricated source tree', () => {
  rejects((value) => {
    value.known_mutation.disposition = 'mutation now accepted';
  }, /MUTATION_DISPOSITION_INVALID/);
  rejects((value) => {
    value.known_mutation.first_closed_tree = '0'.repeat(40);
  }, /MUTATION_HISTORY_MISMATCH/);
  rejects((value) => {
    value.known_mutation.baseline_tree = '0'.repeat(40);
  }, /MUTATION_BASELINE_INVALID/);
});

test('preservation scope and complete prefix metadata cannot be shrunk or rebound', () => {
  rejects((value) => {
    value.preservation.sealed_source_count--;
  }, /PRESERVATION_REFERENCE_INVALID/);
  rejects((value) => {
    value.preservation.reference_sha256 = '0'.repeat(64);
  }, /PRESERVATION_REFERENCE_INVALID/);
  rejects((value) => {
    value.preservation.governed_prefix.record_count--;
  }, /GOVERNED_PREFIX_BINDING_INVALID/);
  rejects((value) => {
    value.preservation.governed_prefix.records_sha256 = '0'.repeat(64);
  }, /GOVERNED_PREFIX_BINDING_INVALID/);
  rejects((value) => {
    value.preservation.governed_prefix.head = '0'.repeat(64);
  }, /GOVERNED_PREFIX_BINDING_INVALID/);
});

test('every prefix entry identity and legacy source identity remain mandatory', () => {
  rejects((value) => {
    value.preservation.governed_prefix.entries.pop();
  }, /GOVERNED_ENTRIES_MISSING/);
  rejects((value) => {
    value.preservation.governed_prefix.entries[0].id = 'forged';
  }, /GOVERNED_ENTRY_IDENTITY_INVALID/);
  rejects((value) => {
    value.preservation.governed_prefix.entries[0].sha256 = '0'.repeat(64);
  }, /GOVERNED_ENTRY_IDENTITY_INVALID/);
  rejects((value) => {
    value.preservation.legacy.git_blob = '0'.repeat(40);
  }, /LEGACY_IDENTITY_INVALID/);
});

test('required native diagnostic captures cannot be omitted replaced or promoted to PASS', () => {
  rejects((value) => {
    value.diagnostic_captures.pop();
  }, /CAPTURE_POPULATION_INVALID/);
  rejects((value) => {
    value.diagnostic_captures[0].sha256 = '0'.repeat(64);
  }, /CAPTURE_IDENTITY_INVALID/);
  rejects((value) => {
    value.diagnostic_captures[0].status = 'pass';
  }, /CAPTURE_READING_IDENTITY_INVALID/);
});

test('actual history bytes and actual governed prefix tampering reject in a complete isolated custody copy', () =>
  fixture(
    (root, copy) => {
      const chainFile = 'record/proofs/chain.json';
      const original = JSON.parse(
        fs.readFileSync(path.join(root, chainFile), 'utf8'),
      );
      const chain = structuredClone(original);
      chain.records.reverse();
      put(root, chainFile, JSON.stringify(chain));
      assert.throws(
        () => verifyHistoricalCompatibility(root, clone()),
        /GOVERNED_PREFIX_CHANGED/,
      );
      copy(chainFile);
      const sealed = manifest.closure_links[0].record_source.path;
      fs.appendFileSync(
        path.join(root, sealed),
        '\nSynthetic custody violation\n',
      );
      assert.throws(
        () => verifyHistoricalCompatibility(root, clone()),
        /CURRENT_BYTES_CHANGED/,
      );
      copy(sealed);
      const legacy = manifest.preservation.legacy.path;
      fs.appendFileSync(path.join(root, legacy), '\n');
      assert.throws(
        () => verifyHistoricalCompatibility(root, clone()),
        /SEALED_BYTES_CHANGED/,
      );
      copy(legacy);
      fs.unlinkSync(path.join(root, manifest.diagnostic_captures[0].path));
      assert.throws(
        () => verifyHistoricalCompatibility(root, clone()),
        /ENOENT/,
      );
    },
    { all: true },
  ));

test('an appended unverified tail stays explicitly subject to native verification and never becomes a native PASS', () =>
  fixture(
    (root) => {
      const chainFile = 'record/proofs/chain.json';
      const chain = JSON.parse(
        fs.readFileSync(path.join(root, chainFile), 'utf8'),
      );
      chain.records.push({ id: 'inspector-synthetic-unverified-tail' });
      put(root, chainFile, JSON.stringify(chain));
      const result = verifyHistoricalCompatibility(root, clone());
      assert.equal(
        result.status,
        'supplementary-map-verified-with-recorded-gaps',
      );
      assert.equal(result.native_verdict_replaced, false);
      assert.equal(result.native_readings_issued, false);
      assert.equal(
        result.preservation.governed_tail_records,
        chain.records.length -
          manifest.preservation.governed_prefix.record_count,
      );
      assert.equal(
        result.preservation.governed_tail_requires_native_verification,
        true,
      );
      assert.match(result.limitation, /newly appended evidence-chain tail/);
    },
    { all: true },
  ));

function mainAppendFixture(run) {
  return fixture((root) => {
    put(root, AUTHORIZED_MAIN_APPEND.path, authenticMainAppend);
    run(root, () =>
      verifyAuthorizedAppend(
        root,
        structuredClone(
          manifest.preservation.integrated_main_append_transition,
        ),
        originalMainAppend,
        sha256(originalMainAppend),
      ),
    );
  });
}

test('canonical-main transition accepts only the authentic six-line stream preserving all four original lines', () =>
  mainAppendFixture((root, verify) => {
    const result = verify();
    assert.equal(result.path, AUTHORIZED_MAIN_APPEND.path);
    assert.equal(result.authentic_commit, AUTHORIZED_MAIN_APPEND.commit);
    assert.equal(result.original_lines_preserved, 4);
    assert.equal(result.authorized_new_lines, 2);
    assert.ok(
      authenticMainAppend
        .subarray(0, originalMainAppend.length)
        .equals(originalMainAppend),
    );
  }));

test('canonical-main transition rejects source identity spoofing and invented authority', () =>
  mainAppendFixture((root) => {
    for (const key of ['path', 'commit', 'git_blob', 'sha256']) {
      const transition = structuredClone(
        manifest.preservation.integrated_main_append_transition,
      );
      transition.source[key] =
        key === 'path'
          ? AUTHORIZED_APPEND.path
          : '0'.repeat(key === 'sha256' ? 64 : 40);
      assert.throws(
        () =>
          verifyAuthorizedAppend(
            root,
            transition,
            originalMainAppend,
            sha256(originalMainAppend),
          ),
        /APPEND_SOURCE_IDENTITY_INVALID/,
      );
    }
    const transition = structuredClone(
      manifest.preservation.integrated_main_append_transition,
    );
    transition.authority = 'new unreviewed main exception';
    assert.throws(
      () =>
        verifyAuthorizedAppend(
          root,
          transition,
          originalMainAppend,
          sha256(originalMainAppend),
        ),
      /APPEND_TRANSITION_IDENTITY_INVALID/,
    );
  }));

test('canonical-main transition rejects prefix changes a seventh line and old four-line fallback', () =>
  mainAppendFixture((root, verify) => {
    const altered = Buffer.from(authenticMainAppend);
    altered[0] ^= 1;
    put(root, AUTHORIZED_MAIN_APPEND.path, altered);
    assert.throws(verify, /APPEND_PREFIX_CHANGED/);
    put(
      root,
      AUTHORIZED_MAIN_APPEND.path,
      Buffer.concat([
        authenticMainAppend,
        Buffer.from('{"sequence":7,"round_id":"R-0025"}\n'),
      ]),
    );
    assert.throws(verify, /APPEND_CURRENT_HASH_UNAPPROVED/);
    put(root, AUTHORIZED_MAIN_APPEND.path, originalMainAppend);
    assert.throws(verify, /APPEND_CURRENT_HASH_UNAPPROVED/);
  }));

test('reviewed transition slots cannot be missing swapped or populated from the other authentic stream', () => {
  rejects((value) => {
    delete value.preservation.integrated_main_append_transition;
  }, /KEYS_INVALID/);
  rejects((value) => {
    delete value.preservation.authorized_append_transition;
  }, /KEYS_INVALID/);
  rejects((value) => {
    [
      value.preservation.authorized_append_transition,
      value.preservation.integrated_main_append_transition,
    ] = [
      value.preservation.integrated_main_append_transition,
      value.preservation.authorized_append_transition,
    ];
  }, /APPEND_TRANSITION_IDENTITY_INVALID|APPEND_TRANSITIONS_SWAPPED/);
  rejects((value) => {
    value.preservation.authorized_append_transition.source = structuredClone(
      value.preservation.integrated_main_append_transition.source,
    );
  }, /APPEND_SOURCE_IDENTITY_INVALID/);
});

test('an unknown proof stream cannot become a new append exception even with baseline hash and authentic-looking metadata', () =>
  mainAppendFixture((root) => {
    const transition = structuredClone(
      manifest.preservation.integrated_main_append_transition,
    );
    transition.path = 'record/proofs/work/generic/R-9999.jsonl';
    transition.source.path = transition.path;
    assert.throws(
      () =>
        verifyAuthorizedAppend(
          root,
          transition,
          originalMainAppend,
          sha256(originalMainAppend),
        ),
      /APPEND_TRANSITION_IDENTITY_INVALID/,
    );
    const value = clone();
    value.preservation.extra_append_transition = transition;
    assert.throws(
      () => verifyHistoricalCompatibility(acceptedRoot, value),
      /KEYS_INVALID/,
    );
  }));
