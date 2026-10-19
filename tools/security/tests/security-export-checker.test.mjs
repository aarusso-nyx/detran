import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as prettier from 'prettier';
import { exportAuthorization } from '../export-authorization.ts';
import { exportPii } from '../export-pii.ts';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const checker = path.join(
  repository,
  'tools/security/check-security-exports.mjs',
);
const read = (root, file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (root, file, value) =>
  fs.writeFileSync(
    path.join(root, file),
    `${JSON.stringify(value, null, 2)}\n`,
  );
const invoke = (root, args = []) => {
  const result = spawnSync(
    process.execPath,
    [checker, '--repo-root', root, ...args],
    { cwd: repository, encoding: 'utf8' },
  );
  assert.ifError(result.error);
  return {
    status: result.status,
    output: `${result.stdout}\n${result.stderr}`,
  };
};
const nativeArgs = (root) => [
  '--api-map',
  path.join(root, 'native-api.json'),
  '--data-model',
  path.join(root, 'native-data.json'),
  '--pii-model',
  path.join(root, 'native-pii.json'),
];
function rejected(result, pattern) {
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, pattern);
  assert.doesNotMatch(result.output, /^PASS /m);
}
async function fixture(run) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'detran-security-checker-test-'),
  );
  const put = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  };
  try {
    fs.symlinkSync(
      path.join(repository, 'node_modules'),
      path.join(root, 'node_modules'),
      'dir',
    );
    // Fixture-only sources. No generated object here is a native observation or governance reading.
    const auth = read(repository, 'law/security/authorization.json');
    for (const file of new Set([
      ...auth.controls.map((row) => row.file),
      ...auth.test_references.map((row) => row.file),
      'tools/security/export-authorization.ts',
      'tools/security/export-pii.ts',
      'docs/meta/security/lgpd-rait.md',
      'docs/framework/arch/boat-route-contract.md',
      'docs/framework/schemas/authorization-crosswalk.schema.json',
      'docs/framework/schemas/pii-registry.schema.json',
      'law/schemas/api-map.schema.json',
      'law/schemas/data-model-inventory.schema.json',
    ]))
      put(file, fs.readFileSync(path.join(repository, file), 'utf8'));
    const controller = `@Controller('v1/cases')\n@Resource('inf:case')\nexport class CasesController {\n  @Get(':id')\n  @Action('read')\n  read() {\n    return {};\n  }\n}\n`;
    const files = [
      'backend/app/src/one.controller.ts',
      'backend/app/src/two.controller.ts',
    ];
    files.forEach((file) => put(file, controller));
    const api = {
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
      endpoints: files.map((file, index) => ({
        id: `fixture-endpoint-${index}`,
        method: 'GET',
        path: '/v1/cases/:id',
        controller: {
          file,
          class: 'CasesController',
          methodName: 'read',
          startLine: 4,
          endLine: 8,
        },
        evidence: [{ path: file, startLine: 4, endLine: 8 }],
      })),
    };
    put(
      'backend/database/ddl/person.sql',
      'CREATE TABLE est.person (\n  email text,\n  driver_name text,\n  state text\n);\n',
    );
    fs.mkdirSync(path.join(root, 'senatran-mock/database/ddl'), {
      recursive: true,
    });
    const model = {
      schemaVersion: '1.0.0',
      generatedAt: '2026-01-01T00:00:00Z',
      dialect: 'postgres',
      tables: [
        {
          schema: 'est',
          name: 'person',
          columns: [
            { name: 'email', type: 'text' },
            { name: 'driver_name', type: 'text' },
            { name: 'state', type: 'text' },
          ],
          evidence: [
            {
              path: 'backend/database/ddl/person.sql',
              startLine: 1,
              endLine: 5,
            },
          ],
        },
      ],
    };
    const pii = structuredClone(model);
    pii.tables[0].columns[0].pii_class = 'email';
    pii.tables[0].columns[2].pii_class = 'location';
    put(
      'docs/framework/blueprints/person.json',
      JSON.stringify({
        module: {
          namespace: 'est',
          description: 'Inspector synthetic fixture only',
        },
        database: {
          entities: [
            {
              table: 'person',
              fields: [{ name: 'driver_name', pii: 'personal' }],
            },
          ],
        },
      }),
    );
    put(
      'law/security/authorization.json',
      await prettier.format(JSON.stringify(exportAuthorization(root, api)), {
        parser: 'json',
      }),
    );
    put(
      'law/security/pii-registry.json',
      await prettier.format(JSON.stringify(exportPii(root, model, pii)), {
        parser: 'json',
      }),
    );
    write(root, 'native-api.json', api);
    write(root, 'native-data.json', model);
    write(root, 'native-pii.json', pii);
    await run(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('actual canonical snapshots validate while explicitly disclaiming native regeneration', () => {
  const result = invoke(repository, ['--snapshots-only']);
  assert.equal(result.status, 0, result.output);
  assert.match(
    result.output,
    /snapshots-only; native input regeneration NOT EXECUTED/,
  );
  assert.match(result.output, /not a native sensor verdict/);
});

test('missing explicit native inputs fail instead of silently skipping production', () => {
  rejected(invoke(repository), /Choose explicit native input paths/);
  rejected(
    invoke(repository, ['--api-map', 'only-one-input.json']),
    /Choose explicit native input paths/,
  );
});

test('snapshots-only cannot masquerade as partial native regeneration', () => {
  rejected(
    invoke(repository, ['--snapshots-only', '--api-map', 'unused.json']),
    /Choose explicit native input paths/,
  );
  rejected(
    invoke(repository, ['--snapshots-only', '--snapshots-only']),
    /Duplicate option/,
  );
});

test('full real CLI validates three explicit fixture bodies and both deterministic exporters', async () =>
  fixture((root) => {
    const result = invoke(root, nativeArgs(root));
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /both deterministic exporter checks/);
    assert.match(
      result.output,
      /not a native sensor verdict or legal validation/,
    );
  }));

test('canonical snapshot schema rejects an invalid population type', async () =>
  fixture((root) => {
    const value = read(root, 'law/security/authorization.json');
    value.population.total = 'two';
    write(root, 'law/security/authorization.json', value);
    rejected(invoke(root, ['--snapshots-only']), /schema rejected/);
  }));

test('canonical snapshot schema rejects unexpected nested properties', async () =>
  fixture((root) => {
    const value = read(root, 'law/security/pii-registry.json');
    value.fields[0].legal_basis.approved = true;
    write(root, 'law/security/pii-registry.json', value);
    rejected(invoke(root, ['--snapshots-only']), /schema rejected/);
  }));

test('schema rejects a fabricated runtime proof or an approved legal conclusion', async () =>
  fixture((root) => {
    const auth = read(root, 'law/security/authorization.json');
    auth.endpoints[0].runtime_authorization_proven = true;
    write(root, 'law/security/authorization.json', auth);
    rejected(invoke(root, ['--snapshots-only']), /schema rejected/);
    auth.endpoints[0].runtime_authorization_proven = false;
    write(root, 'law/security/authorization.json', auth);
    const pii = read(root, 'law/security/pii-registry.json');
    pii.fields[0].legal_basis.status = 'approved';
    write(root, 'law/security/pii-registry.json', pii);
    rejected(invoke(root, ['--snapshots-only']), /schema rejected/);
  }));

test('supplied native body with omitted handler fails actual source population matching', async () =>
  fixture((root) => {
    const value = read(root, 'native-api.json');
    value.endpoints.pop();
    write(root, 'native-api.json', value);
    rejected(
      invoke(root, nativeArgs(root)),
      /Native API map omits 1 source handlers/,
    );
  }));

test('supplied native duplicate identity fails even when its source handler is distinct', async () =>
  fixture((root) => {
    const value = read(root, 'native-api.json');
    value.endpoints[1].id = value.endpoints[0].id;
    write(root, 'native-api.json', value);
    rejected(invoke(root, nativeArgs(root)), /duplicate native endpoint ID/);
  }));

test('supplied native stale handler coordinates fail actual exporter check', async () =>
  fixture((root) => {
    const value = read(root, 'native-api.json');
    value.endpoints[0].path = '/stale';
    write(root, 'native-api.json', value);
    rejected(invoke(root, nativeArgs(root)), /Stale native API coordinates/);
  }));

test('supplied native model and PII semantic mismatch fails without dropping a field', async () =>
  fixture((root) => {
    const value = read(root, 'native-pii.json');
    value.tables[0].columns[0].type = 'bigint';
    write(root, 'native-pii.json', value);
    rejected(invoke(root, nativeArgs(root)), /PII model is stale or omits/);
  }));

test('explicit input native schema rejects missing capture metadata', async () =>
  fixture((root) => {
    const value = read(root, 'native-api.json');
    delete value.generatedAt;
    write(root, 'native-api.json', value);
    rejected(invoke(root, nativeArgs(root)), /native body schema rejected/);
  }));

test('tampered population digest passes shape but fails deterministic reproduction', async () =>
  fixture((root) => {
    const value = read(root, 'law/security/authorization.json');
    value.native_population_sha256 = '0'.repeat(64);
    write(root, 'law/security/authorization.json', value);
    rejected(
      invoke(root, nativeArgs(root)),
      /Authorization crosswalk is stale/,
    );
  }));

test('tampered conditional policy semantics cannot be accepted just because shape is valid', async () =>
  fixture((root) => {
    const value = read(root, 'law/security/authorization.json');
    value.endpoints[0].predicate = 'fabricated unconditional grant';
    write(root, 'law/security/authorization.json', value);
    rejected(
      invoke(root, nativeArgs(root)),
      /Authorization crosswalk is stale/,
    );
  }));

test('changed actual source bytes reject stale provenance before native reproduction', async () =>
  fixture((root) => {
    const file = path.join(root, 'backend/domains/shared/src/policy.guard.ts');
    fs.appendFileSync(file, '\n// Inspector source perturbation\n');
    rejected(invoke(root, ['--snapshots-only']), /Stale source digest/);
  }));

test('liar population totals reject even if all individual snapshot row types are valid', async () =>
  fixture((root) => {
    const value = read(root, 'law/security/authorization.json');
    value.population.total++;
    write(root, 'law/security/authorization.json', value);
    rejected(
      invoke(root, ['--snapshots-only']),
      /authorization.population.total/,
    );
  }));
