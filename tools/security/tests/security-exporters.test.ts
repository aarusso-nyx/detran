import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  exportAuthorization,
  type ApiMap,
  type ApiEndpoint,
} from '../export-authorization.js';
import { exportPii, type DataModel } from '../export-pii.js';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const clone = <T>(value: T): T => structuredClone(value);
function fixture(
  run: (root: string, put: (file: string, text: string) => void) => void,
) {
  const root = mkdtempSync(
    path.join(os.tmpdir(), 'detran-security-exporter-test-'),
  );
  const put = (file: string, text: string) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  };
  try {
    run(root, put);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
function supportingSources(put: (file: string, text: string) => void) {
  for (const file of [
    'backend/domains/portal/identity/src/handwritten/citizen.guard.ts',
    'backend/domains/shared/src/policy.guard.ts',
    'backend/domains/shared/src/policy.ts',
    'backend/app/src/app.module.ts',
    'backend/domains/shared/src/roles.ts',
    'backend/domains/shared/src/decorators.ts',
    'backend/domains/shared/src/policy.guard.spec.ts',
    'backend/domains/shared/src/policy.spec.ts',
    'backend/app/src/portal-opportunistic-auth.spec.ts',
    'backend/domains/portal/identity/src/handwritten/citizen.guard.spec.ts',
    'backend/app/tests/e2e/rait-p402-scope.e2e.spec.ts',
    'backend/domains/inf/rait-case/tests/unit/rait-case-behavioral-matrix.spec.ts',
    'backend/app/src/renach-webhook.guard.ts',
    'backend/app/src/renach-webhook.guard.spec.ts',
    'tools/security/export-authorization.ts',
    'tools/security/export-pii.ts',
    'docs/meta/security/lgpd-rait.md',
    'docs/framework/arch/boat-route-contract.md',
  ])
    put(file, readFileSync(path.join(repository, file), 'utf8'));
}
const controller = `@Controller('v1/cases')
@Resource('inf:case')
export class CasesController {
  @Get(':id')
  @Action('read')
  read() {
    return {};
  }
}
`;
function endpoint(file: string, id = file): ApiEndpoint {
  return {
    id,
    method: 'GET',
    path: '/v1/cases/:id',
    controller: {
      file,
      class: 'CasesController',
      methodName: 'read',
      startLine: 4,
      endLine: 8,
    },
  };
}
function authFixture(
  root: string,
  put: (file: string, text: string) => void,
): ApiMap {
  supportingSources(put);
  const files = [
    'backend/app/src/cases.controller.ts',
    'senatran-mock/cases.controller.ts',
    'tools/security/tests/fixtures/cases.controller.ts',
  ];
  files.forEach((file) => put(file, controller));
  return {
    schemaVersion: '1.0.0',
    endpoints: files.map((file) => endpoint(file)),
  };
}

test('authorization preserves policy conditions, all populations and exact source provenance', () =>
  fixture((root, put) => {
    const api = authFixture(root, put);
    const result = exportAuthorization(root, api);
    assert.equal(result.native_sensor_compatible, false);
    assert.deepEqual(result.population, {
      total: 3,
      application_policy: 1,
      application_public: 0,
      mock: 1,
      test_fixture: 1,
      other: 0,
      unresolved_application: 0,
    });
    const application = result.endpoints.find(
      (row) => row.population === 'application',
    )!;
    assert.equal(application.binding, 'conditional-policy-reference');
    assert.equal(application.policy_key, 'inf:case:read');
    assert.match(application.predicate!, /tenant\/agency\/identity\/purpose/);
    assert.equal(application.runtime_authorization_proven, false);
    assert.ok(
      result.endpoints
        .filter((row) => row.population !== 'application')
        .every(
          (row) =>
            row.binding === 'separate-population-unresolved' &&
            !row.runtime_authorization_proven,
        ),
    );
    assert.equal(
      result.sources.find(
        (row) => row.path === 'backend/app/src/cases.controller.ts',
      )!.sha256,
      hash(controller),
    );
  }));

test('authorization public callback preserves guard review without granting runtime proof', () =>
  fixture((root, put) => {
    supportingSources(put);
    const file = 'backend/app/src/pec-renach-transmission.controller.ts';
    put(
      file,
      `@Controller('v1/ch/transmissions/callbacks')
export class CallbackController {
  @Post('renach')
  @Public()
  @UseGuards(RenachWebhookGuard)
  receive() {
    return {};
  }
}
`,
    );
    const api: ApiMap = {
      schemaVersion: '1.0.0',
      endpoints: [
        {
          id: 'callback',
          method: 'POST',
          path: '/v1/ch/transmissions/callbacks/renach',
          controller: {
            file,
            class: 'CallbackController',
            methodName: 'receive',
            startLine: 3,
            endLine: 8,
          },
        },
      ],
    };
    const row = exportAuthorization(root, api).endpoints[0]!;
    assert.equal(row.binding, 'declared-public');
    assert.deepEqual(row.guards, ['RenachWebhookGuard']);
    assert.match(row.public_review!.control, /HMAC/);
    assert.equal(row.policy_key, null);
    assert.equal(row.runtime_authorization_proven, false);
  }));

test('authorization rejects omitted source endpoints and duplicate native identities', () =>
  fixture((root, put) => {
    const api = authFixture(root, put);
    assert.throws(
      () =>
        exportAuthorization(root, {
          ...api,
          endpoints: api.endpoints.slice(1),
        }),
      /omits.*source handlers/i,
    );
    const duplicated = clone(api);
    duplicated.endpoints[1]!.id = duplicated.endpoints[0]!.id;
    assert.throws(
      () => exportAuthorization(root, duplicated),
      /duplicate native endpoint ID/i,
    );
  }));

test('authorization rejects stale method, path, line and binding coordinates', () =>
  fixture((root, put) => {
    const api = authFixture(root, put);
    for (const mutate of [
      (row: ApiEndpoint) => {
        row.method = 'POST';
      },
      (row: ApiEndpoint) => {
        row.path = '/invented';
      },
      (row: ApiEndpoint) => {
        row.controller.startLine++;
      },
      (row: ApiEndpoint) => {
        row.controller.endLine++;
      },
      (row: ApiEndpoint) => {
        row.controller.methodName = 'missing';
      },
    ]) {
      const bad = clone(api);
      mutate(bad.endpoints[0]!);
      assert.throws(
        () => exportAuthorization(root, bad),
        /Stale native|Missing\/duplicate source binding/,
      );
    }
  }));

test('authorization cannot positively bind an unresolved nonliteral route', () =>
  fixture((root, put) => {
    supportingSources(put);
    const file = 'backend/app/src/cases.controller.ts';
    put(file, controller.replace("@Get(':id')", '@Get(DYNAMIC_ROUTE)'));
    const api: ApiMap = {
      schemaVersion: '1.0.0',
      endpoints: [{ ...endpoint(file), path: '/v1/cases' }],
    };
    // A retained endpoint may be explicitly unresolved, or extraction may reject it.
    let result;
    try {
      result = exportAuthorization(root, api);
    } catch (error) {
      assert.match(
        String(error),
        /dynamic|nonliteral|unresolved|route|Stale native/i,
      );
      return;
    }
    assert.equal(result.endpoints.length, 1);
    assert.equal(result.endpoints[0]!.binding, 'unresolved');
    assert.equal(result.endpoints[0]!.policy_key, null);
  }));

test('authorization is deterministic and changes provenance when an actual control source changes', () =>
  fixture((root, put) => {
    const api = authFixture(root, put),
      original = exportAuthorization(root, api);
    assert.deepEqual(exportAuthorization(root, api), original);
    assert.deepEqual(
      exportAuthorization(root, {
        ...api,
        endpoints: [...api.endpoints].reverse(),
      }),
      original,
    );
    const file = 'backend/domains/shared/src/policy.guard.ts';
    put(
      file,
      readFileSync(path.join(root, file), 'utf8') +
        '\n// Inspector provenance perturbation\n',
    );
    const changed = exportAuthorization(root, api);
    assert.notEqual(
      changed.sources.find((row) => row.path === file)!.sha256,
      original.sources.find((row) => row.path === file)!.sha256,
    );
    assert.deepEqual(changed.endpoints, original.endpoints);
  }));

function piiFixture(root: string, put: (file: string, text: string) => void) {
  supportingSources(put);
  mkdirSync(path.join(root, 'senatran-mock/database/ddl'), { recursive: true });
  mkdirSync(path.join(root, 'docs/framework/blueprints'), { recursive: true });
  put(
    'backend/database/ddl/person.sql',
    'CREATE TABLE est.person (\n  email text,\n  driver_name text,\n  state text\n);\n',
  );
  const model: DataModel = {
    schemaVersion: '1.0.0',
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
          { path: 'backend/database/ddl/person.sql', startLine: 1, endLine: 5 },
        ],
      },
    ],
  };
  const pii = clone(model);
  pii.tables[0]!.columns[0]!.pii_class = 'contact';
  pii.tables[0]!.columns[2]!.pii_class = 'location';
  const blueprint = {
    module: {
      namespace: 'est',
      description: 'Inspector synthetic data context',
    },
    database: {
      entities: [
        { table: 'person', fields: [{ name: 'driver_name', pii: 'personal' }] },
      ],
    },
  };
  put('docs/framework/blueprints/person.json', JSON.stringify(blueprint));
  return { model, pii, blueprint };
}

test('PII union retains blueprint-only fields and does not manufacture legal facts', () =>
  fixture((root, put) => {
    const { model, pii } = piiFixture(root, put),
      result = exportPii(root, model, pii);
    assert.equal(result.native_sensor_compatible, false);
    assert.equal(result.population.native_candidates, 2);
    assert.equal(result.population.blueprint_outside_native_heuristic, 1);
    assert.equal(result.population.known_field_union, 3);
    const driver = result.fields.find(
      (row) => row.id === 'est.person.driver_name',
    )!;
    assert.equal(driver.sql_present, true);
    assert.equal(driver.classification_status, 'source-declared');
    assert.deepEqual(driver.canonical_classifications, ['personal']);
    for (const row of result.fields) {
      assert.deepEqual(row.legal_basis, { status: 'pending', values: [] });
      assert.deepEqual(row.retention, { status: 'pending', values: [] });
      assert.ok(row.pending.includes(`PII-LEGAL-BASIS:${row.id}`));
      assert.ok(row.pending.includes(`PII-RETENTION:${row.id}`));
    }
    const state = result.fields.find((row) => row.id === 'est.person.state')!;
    assert.match(state.semantic_review.category, /needs-semantic-review/);
    assert.equal(state.classification_status, 'pending');
  }));

test('PII rejects mismatched populations, stale column semantics and source coordinates', () =>
  fixture((root, put) => {
    const { model, pii } = piiFixture(root, put);
    const missing = clone(pii);
    missing.tables[0]!.columns.pop();
    assert.throws(() => exportPii(root, model, missing), /populations differ/);
    const stale = clone(pii);
    stale.tables[0]!.columns[0]!.type = 'integer';
    assert.throws(() => exportPii(root, model, stale), /stale|omits/);
    const badCoordinates = clone(model);
    badCoordinates.tables[0]!.evidence[0]!.startLine = 0;
    assert.throws(
      () => exportPii(root, badCoordinates, pii),
      /Stale\/malformed DDL coordinates/,
    );
    put(
      'backend/database/ddl/person.sql',
      'CREATE TABLE est.person (\n  other text\n);\n',
    );
    assert.throws(() => exportPii(root, model, pii), /does not declare column/);
  }));

test('PII rejects duplicate SQL tables and duplicate column identities', () =>
  fixture((root, put) => {
    const { model, pii } = piiFixture(root, put);
    const tables = clone(model);
    tables.tables.push(clone(tables.tables[0]!));
    assert.throws(() => exportPii(root, tables, pii), /Duplicate SQL table/);
    const columns = clone(model);
    columns.tables[0]!.columns.push(clone(columns.tables[0]!.columns[0]!));
    assert.throws(() => exportPii(root, columns, pii), /Duplicate SQL column/);
  }));

test('PII missing blueprint column remains an explicit mapping gap', () =>
  fixture((root, put) => {
    const { model, pii, blueprint } = piiFixture(root, put);
    blueprint.database.entities[0]!.fields.push({
      name: 'missing_column',
      pii: 'health',
    });
    put('docs/framework/blueprints/person.json', JSON.stringify(blueprint));
    const result = exportPii(root, model, pii),
      missing = result.fields.find(
        (row) => row.id === 'est.person.missing_column',
      )!;
    assert.equal(result.population.blueprint_without_sql, 1);
    assert.equal(missing.sql_present, false);
    assert.equal(missing.sql, null);
    assert.ok(
      missing.pending.includes('PII-SQL-MAPPING:est.person.missing_column'),
    );
    assert.ok(missing.owner_question);
  }));

test('PII contradictory classifications and retention remain conflicts with provenance', () =>
  fixture((root, put) => {
    const { model, pii, blueprint } = piiFixture(root, put);
    put(
      'docs/framework/blueprints/other.json',
      JSON.stringify({
        ...blueprint,
        database: {
          entities: [
            {
              table: 'person',
              fields: [
                {
                  name: 'driver_name',
                  pii: 'health',
                  retention: 'parameter:health-retention',
                },
              ],
            },
          ],
        },
      }),
    );
    put(
      'docs/framework/blueprints/person.json',
      JSON.stringify({
        ...blueprint,
        database: {
          entities: [
            {
              table: 'person',
              fields: [
                { name: 'driver_name', pii: 'personal', retention: 'forever' },
              ],
            },
          ],
        },
      }),
    );
    const row = exportPii(root, model, pii).fields.find(
      (field) => field.id === 'est.person.driver_name',
    )!;
    assert.equal(row.classification_status, 'conflict');
    assert.deepEqual(row.canonical_classifications, ['health', 'personal']);
    assert.equal(row.retention.status, 'conflict');
    assert.deepEqual(row.retention.values, [
      'forever',
      'parameter:health-retention',
    ]);
    assert.equal(row.blueprint_sources.length, 2);
    assert.ok(
      row.pending.includes('PII-CLASS-CONFLICT:est.person.driver_name'),
    );
    assert.ok(
      row.pending.includes('PII-RETENTION-CONFLICT:est.person.driver_name'),
    );
    assert.ok(
      row.pending.includes(
        'PII-INDEFINITE-RETENTION-REVIEW:est.person.driver_name',
      ),
    );
    assert.equal(row.legal_basis.status, 'pending');
  }));

test('PII determinism and source hash changes preserve quoted classification provenance', () =>
  fixture((root, put) => {
    const { model, pii } = piiFixture(root, put),
      original = exportPii(root, model, pii);
    assert.deepEqual(exportPii(root, model, pii), original);
    const reversedModel = clone(model),
      reversedPii = clone(pii);
    reversedModel.tables[0]!.columns.reverse();
    reversedPii.tables[0]!.columns.reverse();
    assert.deepEqual(exportPii(root, reversedModel, reversedPii), original);
    const file = 'docs/meta/security/lgpd-rait.md';
    put(
      file,
      readFileSync(path.join(root, file), 'utf8') +
        '\nInspector source provenance perturbation.\n',
    );
    const changed = exportPii(root, model, pii);
    assert.notEqual(
      changed.sources.find((row) => row.path === file)!.sha256,
      original.sources.find((row) => row.path === file)!.sha256,
    );
    assert.deepEqual(changed.fields, original.fields);
  }));

test('PII source namespace must match the inventory table rather than only its unqualified name', () =>
  fixture((root, put) => {
    const { model, pii } = piiFixture(root, put);
    model.tables[0]!.schema = 'inf';
    pii.tables[0]!.schema = 'inf';
    assert.throws(
      () => exportPii(root, model, pii),
      /DDL|namespace|table|schema/i,
    );
  }));

test('PII conflicting purpose and legal sources remain explicit pending conflicts', () =>
  fixture((root, put) => {
    const { model, pii, blueprint } = piiFixture(root, put);
    const quoted = (purpose: string, legalBasis: string) =>
      JSON.stringify({
        ...blueprint,
        database: {
          entities: [
            {
              table: 'person',
              fields: [
                { name: 'driver_name', pii: 'personal', purpose, legalBasis },
              ],
            },
          ],
        },
      });
    put(
      'docs/framework/blueprints/person.json',
      quoted('purpose-A-from-test-source', 'basis-A-from-test-source'),
    );
    put(
      'docs/framework/blueprints/other.json',
      quoted('purpose-B-from-test-source', 'basis-B-from-test-source'),
    );
    const row = exportPii(root, model, pii).fields.find(
      (field) => field.id === 'est.person.driver_name',
    )!;
    assert.equal(row.processing_purpose.status, 'conflict');
    assert.equal(row.legal_basis.status, 'conflict');
    assert.deepEqual(row.legal_basis.values, [
      'basis-A-from-test-source',
      'basis-B-from-test-source',
    ]);
    assert.ok(
      row.pending.includes('PII-PURPOSE-CONFLICT:est.person.driver_name'),
    );
    assert.ok(
      row.pending.includes('PII-LEGAL-BASIS-CONFLICT:est.person.driver_name'),
    );
    assert.equal(row.retention.status, 'pending');
  }));

test('PII quoted legal basis is explicitly unvalidated even when a source supplies one', () =>
  fixture((root, put) => {
    const { model, pii, blueprint } = piiFixture(root, put);
    put(
      'docs/framework/blueprints/person.json',
      JSON.stringify({
        ...blueprint,
        database: {
          entities: [
            {
              table: 'person',
              fields: [
                {
                  name: 'driver_name',
                  pii: 'personal',
                  legal_basis: 'fixture-source-basis',
                  retention: 'fixture-source-parameter',
                  purpose: 'fixture-source-purpose',
                },
              ],
            },
          ],
        },
      }),
    );
    const row = exportPii(root, model, pii).fields.find(
      (field) => field.id === 'est.person.driver_name',
    )!;
    assert.deepEqual(row.legal_basis, {
      status: 'source-declared-not-legally-validated',
      values: ['fixture-source-basis'],
    });
    assert.equal(
      row.retention.status,
      'source-declared-not-operationally-validated',
    );
    assert.equal(
      row.blueprint_sources[0]!.source.pointer,
      '/database/entities/0/fields/0',
    );
  }));
