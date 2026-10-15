import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

// Inspector source-only sensors. These do not prove PostgreSQL or SDK execution.
const source = readFileSync(
  new URL('../../stynx-storage-public-install.mjs', import.meta.url),
  'utf8',
);
const finalStart = source.indexOf(
  'const final = await inspect(target, root, plan, subject, custodyAssertion);',
);
const verifyStart = source.indexOf(
  'const candidateReports = await verify(',
  finalStart,
);
const commitStart = source.indexOf('commitAttempted = true;', verifyStart);

test('public candidate genuine verifier follows actual same-target readonly transition and retained on witness', () => {
  assert.ok(
    finalStart > 0 && verifyStart > finalStart && commitStart > verifyStart,
  );
  const admission = source.slice(finalStart, verifyStart);
  const transition = admission.search(
    /await target\.query\(['"]SET TRANSACTION READ ONLY['"]\)/u,
  );
  assert.ok(
    transition > 0,
    'Same target must enter genuine PostgreSQL readonly mode',
  );
  const after = admission.slice(transition);
  assert.match(after, /current_setting\(['"]transaction_read_only['"]\)/u);
  assert.match(after, /requireFact\([\s\S]*?=== ['"]on['"]/u);
  assert.match(
    after,
    /retained\.write\(['"]candidate\/read-only-mode\.json['"]/u,
  );
  assert.doesNotMatch(
    after,
    /(?:COMMIT|ROLLBACK|BEGIN|\.connect\(|closeTarget\()/u,
  );
  assert.match(source.slice(verifyStart, commitStart), /verify\(\s*target,/u);
});

test('public candidate restores canonical catalog deparse path before genuine verification', () => {
  const phase = source.slice(finalStart, verifyStart);
  const restored = phase.indexOf('await target.query(utcContextSql);');
  const readonly = phase.indexOf(
    "await target.query('SET TRANSACTION READ ONLY');",
  );
  assert.ok(restored > 0 && readonly > restored);
  assert.match(
    phase.slice(readonly),
    /current_setting\(['"]search_path['"]\)/u,
  );
  assert.match(phase.slice(readonly), /current_schemas\(false\)::text/u);
  assert.match(
    phase.slice(readonly),
    /verificationMode\.search_path === ['"]pg_catalog, public['"]/u,
  );
});

test('public candidate readonly phase preserves both real reports and has no target mutation or mode reversal before commit', () => {
  const phase = source.slice(finalStart, commitStart);
  assert.doesNotMatch(
    phase,
    /target\.query\([\s\S]*?['"`](?:SET TRANSACTION READ WRITE|SET LOCAL transaction_read_only\s*=\s*off|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|GRANT|REVOKE|TRUNCATE)/u,
  );
  const verifyFunction = source.slice(
    source.indexOf('async function verify('),
    source.indexOf('function validateWriterRole('),
  );
  assert.match(verifyFunction, /verifyOutboxStorage/u);
  assert.match(verifyFunction, /verifyOfflineStorage/u);
  assert.match(verifyFunction, /report\.supported === true/u);
  assert.match(verifyFunction, /reports\/.*?verifier\.json/u);
  const originalTests = readFileSync(
    new URL('./install.test.mjs', import.meta.url),
    'utf8',
  );
  assert.match(
    originalTests,
    /public pure null release refuses before any SDK or SQL and unknown full authorization stays closed/u,
  );
  assert.match(originalTests, /STYNX_PUBLIC_INSTALL_RELEASE_UNAVAILABLE/u);
});

test('public candidate restores and retains actual protected catalog deparser context before genuine verification', () => {
  const admission = source.slice(finalStart, verifyStart);
  const restore = admission.indexOf('await target.query(utcContextSql);');
  const readonly = admission.indexOf(
    "await target.query('SET TRANSACTION READ ONLY');",
  );
  assert.ok(
    restore > 0 && restore < readonly,
    'Protected UTC/RLS/search_path context must be restored on the same target',
  );
  assert.match(admission, /current_setting\(['"]search_path['"]\)/u);
  assert.match(admission, /current_schemas\(false\)/u);
  assert.match(admission, /searchPath:\s*verificationMode\.search_path/u);
  assert.match(
    admission,
    /effectiveSchemas:\s*verificationMode\.effective_schemas/u,
  );
  assert.match(
    admission,
    /verificationMode\.search_path === ['"]pg_catalog, public['"]/u,
  );
});

test('six protected published UUID id digests reproduce exact qualified-default mismatch without SDK or SQL', () => {
  const raw = readFileSync(
    new URL(
      '../fixtures/publication-161/historical/scratch/r22-adoption-161/package-admission/projection/public-storage-projection.json.raw',
      import.meta.url,
    ),
  );
  assert.equal(
    createHash('sha256').update(raw).digest('hex'),
    '944f0041700de5e2c31ebf0e71b7999df999d76cc6645b3bec38ddfc0f692388',
  );
  const catalog = JSON.parse(raw).outbox.manifest.catalog;
  const names = [
    'ack_quarantine.id',
    'acknowledgements.id',
    'event_acks.id',
    'event_attempts.id',
    'event_retirements.id',
    'messages.id',
  ];
  const digest = (value) =>
    createHash('sha256')
      .update(
        JSON.stringify(
          Object.fromEntries(
            Object.entries(value).sort(([a], [b]) =>
              a < b ? -1 : a > b ? 1 : 0,
            ),
          ),
        ),
      )
      .digest('hex');
  for (const name of names) {
    const entries = catalog.filter(
      (entry) => entry.kind === 'column' && entry.name === name,
    );
    assert.equal(entries.length, 1);
    assert.equal(entries[0].value.default, 'gen_random_uuid()');
    assert.equal(
      digest(entries[0].value),
      'f716a522629b39b1e6adc0fe16e0060982461ca7b14c0809495a6ec21d23ced8',
    );
    assert.equal(
      digest({ ...entries[0].value, default: 'pg_catalog.gen_random_uuid()' }),
      '2eb3c55831e694fa4ff2925c1cb1ae634eca6021dda54c239bc77d385e5d8a70',
    );
  }
});
