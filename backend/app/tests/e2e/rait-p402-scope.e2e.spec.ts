// Article7 Inspector: Owner-approved P4-02-S1. Real AppModule + PostgreSQL;
// missing DB, missing implementation and generic500/501 are never protection.
import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { RequestMethod, type INestApplication } from '@nestjs/common';
import { ModulesContainer, NestFactory } from '@nestjs/core';
import { Client } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  RaitP402ScopeFixture,
  assertDedicatedDatabaseEnvironment,
  RAIT_ACTOR,
  RAIT_SECRETARY,
  RAIT_TENANT,
  RAIT_CASE,
} from '../shared/rait-case-command.fixture.js';

type MethodDisposition = {
  method: string;
  path: string;
  disposition: string;
  controller: string;
};
const manifest = JSON.parse(
  readFileSync(
    new URL(
      '../../../../work/rounds/R-0025/reports/P4-02-S1-method-dispositions.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as { methods: MethodDisposition[] };
const PREFIX = '/v1/inf/rait';
const ABSENT = '71000000-0000-7000-8000-000000009999';
const OTHER_ACTOR = '00000000-0000-4000-8000-0000b0000002';
const COORDINATOR = '00000000-0000-4000-8000-0000b0000004';
const PARTY = '00000000-0000-7000-8000-000011000007';
const DOCUMENT = '00000000-0000-7000-8000-000012000007';
let app: INestApplication;
let owner: Client;
const previousEnv = new Map<string, string | undefined>();
function env(key: string, value: string) {
  if (!previousEnv.has(key)) previousEnv.set(key, process.env[key]);
  process.env[key] = value;
}
function headers(role = 'rait-analyst', actor = RAIT_ACTOR) {
  env('DETRAN_LOCAL_ROLES', role);
  env('DETRAN_LOCAL_ACTOR_ID', actor);
  return {
    authorization: 'Bearer local',
    'x-tenant-id': RAIT_TENANT,
    'idempotency-key': `r25-s1-${randomUUID()}`,
  };
}
async function get(path: string, role = 'rait-analyst', actor = RAIT_ACTOR) {
  return request(app.getHttpServer()).get(path).set(headers(role, actor));
}
function bodyRows(body: unknown): Record<string, unknown>[] {
  expect(Array.isArray(body), 'collection transport remains a bare array').toBe(
    true,
  );
  return body as Record<string, unknown>[];
}
async function effects() {
  const { rows } = await owner.query(`select
    (select jsonb_agg(to_jsonb(c) order by id) from inf.rait_case c) cases,
    (select jsonb_agg(to_jsonb(p) order by id) from inf.rait_party p) parties,
    (select count(*)::int from integration.outbox) outbox,
    (select count(*)::int from integration.idempotency_keys) idem,
    (select count(*)::int from audit.events) audit,
    (select count(*)::int from audit.events where action='INF_RAIT_CASE_PROTOCOL') "protocolAudit",
    (select count(*)::int from audit.events where action='INF_RAIT_CASE_ADMIT') "admitAudit",
    (select count(*)::int from audit.events where action='INF_RAIT_CASE_POOL_SCOPE_ACTIVATE') "routingAudit",
    (select count(*)::int from audit.events where action='INF_RAIT_COMMAND_REPLAY_BIND') "replayAudit",
    (select count(*)::int from inf.rait_priority_assessment) priority`);
  return rows[0];
}
function normalize(parts: string[]) {
  return (
    '/' +
    parts
      .flatMap((p) => p.split('/'))
      .filter(Boolean)
      .join('/')
  );
}
function mountedRoutes() {
  const out: { method: string; path: string; controller: string }[] = [];
  const paths = (x: unknown): string[] =>
    Array.isArray(x) ? x.map(String) : [typeof x === 'string' ? x : ''];
  for (const module of app.get(ModulesContainer).values())
    for (const wrapper of module.controllers.values()) {
      if (!wrapper.instance) continue;
      const proto = Object.getPrototypeOf(wrapper.instance) as Record<
        string,
        unknown
      >;
      for (const name of Object.getOwnPropertyNames(proto)) {
        const handler = proto[name];
        if (typeof handler !== 'function') continue;
        const method = Reflect.getMetadata('method', handler) as
          RequestMethod | undefined;
        if (method === undefined) continue;
        for (const a of paths(Reflect.getMetadata('path', proto.constructor)))
          for (const b of paths(Reflect.getMetadata('path', handler)))
            out.push({
              method: RequestMethod[method]!,
              path: normalize([a, b]).replace(/:([A-Za-z]+)/g, '{$1}'),
              controller: proto.constructor.name,
            });
      }
    }
  return out;
}
beforeAll(async () => {
  assertDedicatedDatabaseEnvironment();
  env('DETRAN_LOCAL_TENANT_ID', RAIT_TENANT);
  owner = new Client({
    connectionString: process.env.STYNX_OWNER_DATABASE_URL,
  });
  await owner.connect();
  await owner.query("select set_config('app.role','owner',false)");
  await owner.query("select set_config('app.tenant_id',$1,false)", [
    RAIT_TENANT,
  ]);
  const appClient = new Client({
    connectionString: process.env.STYNX_APP_DATABASE_URL,
  });
  await appClient.connect();
  try {
    expect(
      (await appClient.query('select current_user as role')).rows[0].role,
    ).toBe('role_app_backend');
  } finally {
    await appClient.end();
  }
  const { AppModule } = await import('../../src/app.module.js');
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
}, 180_000);
afterAll(async () => {
  await app?.close();
  await owner?.end();
  for (const [key, value] of previousEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('S1 frozen107-method disposition and actual mounted handlers', () => {
  it('has exactly107 unique dispositions:71 replaced,25 retained-scoped,11 removed', () => {
    expect(manifest.methods).toHaveLength(107);
    expect(
      new Set(manifest.methods.map((m) => `${m.method} ${m.path}`)).size,
    ).toBe(107);
    for (const [kind, n] of [
      ['replaced', 71],
      ['retained-scoped', 25],
      ['removed', 11],
    ] as const)
      expect(
        manifest.methods.filter((m) => m.disposition === kind),
      ).toHaveLength(n);
  });
  for (const method of manifest.methods)
    it(`${method.method} ${method.path} is ${method.disposition} with one authoritative handler`, async () => {
      const matches = mountedRoutes().filter(
        (r) => r.path === method.path && r.method === method.method,
      );
      if (method.disposition === 'removed') {
        expect(matches).toHaveLength(0);
        const path = method.path.replaceAll('{id}', ABSENT);
        const response = await request(app.getHttpServer())
          [method.method.toLowerCase() as 'patch'](path)
          .set(headers('technical-admin'))
          .send({ state: 'EM_INSTRUCAO', version: 99 });
        expect(response.status, JSON.stringify(response.body)).toBe(404);
      } else {
        expect(matches).toHaveLength(1);
        // Architect manifest uses a descriptive placeholder for retained transport.
        // Pin the actual unchanged source controller instead of that prose value.
        const retainedController = method.path.includes('/inquiries/')
          ? 'RaitInquiryCommandsController'
          : method.path === `${PREFIX}/admissibility`
            ? 'RaitAdmissibilityCommandsController'
            : method.path.includes('/schedules') ||
                method.path.includes('/batches') ||
                method.path.includes('/assignments/')
              ? 'RaitWorklistCommandsController'
              : 'RaitCaseCommandsController';
        expect(matches[0]?.controller).toBe(
          method.disposition === 'retained-scoped'
            ? retainedController
            : method.controller,
        );
      }
    });
});

describe('S1 decisive HTTP reads, canonical identity and closed triage/merits fields', () => {
  it('retains own assigned-case HTTP200 as a positive control', async () => {
    const response = await get(`${PREFIX}/cases/${RAIT_CASE('07')}`);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.id).toBe(RAIT_CASE('07'));
  });
  it('legacy unit-null base pool is a real matching relation, not a missing-scope fallback', async () => {
    const source = (
      await owner.query(
        `select c.unit_id as case_unit,p.unit_id as pool_unit
      from inf.rait_case c join inf.rait_assignment a on a.case_id=c.id and a.tenant_id=c.tenant_id and a.active
      join inf.rait_pool p on p.id=a.pool_id and p.tenant_id=a.tenant_id where c.id=$1`,
        [RAIT_CASE('07')],
      )
    ).rows[0];
    expect(source).toEqual({ case_unit: null, pool_unit: null });
    expect((await get(`${PREFIX}/cases/${RAIT_CASE('07')}`)).status).toBe(200);
    expect((await get(`${PREFIX}/cases/${RAIT_CASE('08')}`)).status).toBe(404);
  });
  it('retains preadmission triage200 with the exact closed case subset', async () => {
    const response = await get(`${PREFIX}/cases/${RAIT_CASE('02')}`);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(
      [
        'id',
        'protocol_number',
        'instance',
        'state',
        'protocolled_at',
        'version',
        'suspensive_effect',
        'unit_id',
      ].sort(),
    );
  });
  it('filters other analysts assigned cases before list pagination, not only on detail', async () => {
    const response = await get(`${PREFIX}/cases?limit=1&offset=0`);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const rows = bodyRows(response.body);
    expect(rows.some((r) => r.id === RAIT_CASE('08'))).toBe(false);
    for (const row of rows) expect(row).not.toHaveProperty('tenant_id');
  });
  for (const [role, actor] of [
    ['rait-analyst', RAIT_ACTOR],
    ['rait-coordinator', COORDINATOR],
    ['AUDITOR', RAIT_ACTOR],
    ['technical-admin', RAIT_ACTOR],
    ['agency-admin', RAIT_ACTOR],
    ['rait-manager', RAIT_ACTOR],
    ['rait-rapporteur', RAIT_ACTOR],
    ['rait-chair', RAIT_ACTOR],
    ['rait-central-authority', RAIT_ACTOR],
  ])
    it(`${role} without a complete matching purpose cannot read somebody else's merits`, async () => {
      const denied = await get(
        `${PREFIX}/cases/${RAIT_CASE('08')}`,
        role,
        actor,
      );
      const missing = await get(`${PREFIX}/cases/${ABSENT}`, role, actor);
      expect(denied.status, JSON.stringify(denied.body)).toBe(404);
      expect(missing.status).toBe(404);
      expect(denied.body).not.toHaveProperty('data');
      expect(JSON.stringify(denied.body)).not.toContain(RAIT_CASE('08'));
    });
  for (const actor of [ABSENT, 'external-oidc-subject'])
    it(`denies orphan/external identity ${actor}`, async () => {
      const response = await get(
        `${PREFIX}/cases/${RAIT_CASE('07')}`,
        'rait-analyst',
        actor,
      );
      expect(response.status, JSON.stringify(response.body)).toBe(403);
    });
  it('does not combine coordinator action with analyst membership under multi-role principal', async () => {
    const response = await get(
      `${PREFIX}/cases/${RAIT_CASE('08')}`,
      'rait-analyst,rait-coordinator',
    );
    expect(response.status, JSON.stringify(response.body)).toBe(404);
  });
  it('triage party projection suppresses identity numbers, emails and audit attribution', async () => {
    const response = await get(`${PREFIX}/parties?case_id=${RAIT_CASE('02')}`);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const rows = bodyRows(response.body);
    expect(rows.length).toBeGreaterThan(0);
    const allowed = new Set([
      'id',
      'case_id',
      'role',
      'person_name',
      'legitimacy_basis',
      'representation_kind',
      'representation_verified',
      'representation_document_id',
    ]);
    for (const row of rows) {
      expect(row.case_id).toBe(RAIT_CASE('02'));
      expect(['requerente', 'procurador']).toContain(row.role);
      expect(Object.keys(row).every((k) => allowed.has(k))).toBe(true);
    }
  });
  it('caller-supplied document.kind does not prove necessary intake document class', async () => {
    const response = await get(
      `${PREFIX}/documents?case_id=${RAIT_CASE('02')}`,
    );
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(bodyRows(response.body)).toEqual([]);
  });
  it('own assigned document read excludes storage credentials, URLs and unrelated fields', async () => {
    const response = await get(`${PREFIX}/documents/${DOCUMENT}`);
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const allowed = new Set([
      'id',
      'case_id',
      'kind',
      'origin',
      'filename',
      'content_hash',
      'digitised_from_paper',
      'attached_at',
    ]);
    expect(Object.keys(response.body).every((key) => allowed.has(key))).toBe(
      true,
    );
    expect(response.body).not.toHaveProperty('storage_key');
  });
});

describe('S1 real mutation bypasses preserve persisted rows and all side effects', () => {
  for (const [resource, payload] of [
    [
      'documents',
      {
        case_id: RAIT_CASE('07'),
        kind: 'requerimento',
        origin: 'requerente',
        storage_key: 'forged',
        content_hash: 'forged',
        filename: 'forged',
        attached_by: RAIT_ACTOR,
      },
    ],
    ['inquiries', { case_id: RAIT_CASE('07'), subject: 'forged' }],
  ] as const)
    it(`authorized assigned analyst generic POST ${resource} rejects protected body400 without effects`, async () => {
      const before = await effects();
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/${resource}`)
        .set(headers())
        .send(payload);
      expect(response.status, JSON.stringify(response.body)).toBe(400);
      expect(await effects()).toEqual(before);
    });
  it('raw case PATCH is removed404 and cannot change state/version', async () => {
    const before = await effects();
    const response = await request(app.getHttpServer())
      .patch(`${PREFIX}/cases/${RAIT_CASE('07')}`)
      .set(headers('rait-analyst'))
      .send({ state: 'ADMITIDO', version: 999 });
    // Restore the baseline if the exploit succeeds, without pretending its persisted effect never happened.
    const after = await effects();
    await owner.query(
      'update inf.rait_case set state=$2,version=$3 where id=$1',
      [
        RAIT_CASE('07'),
        before.cases.find((r: { id: string }) => r.id === RAIT_CASE('07'))
          .state,
        before.cases.find((r: { id: string }) => r.id === RAIT_CASE('07'))
          .version,
      ],
    );
    expect(response.status, JSON.stringify(response.body)).toBe(404);
    expect(after).toEqual(before);
  });
  it('reparenting an authorized child to an unauthorized case fails404 and preserves source', async () => {
    const before = await effects();
    const response = await request(app.getHttpServer())
      .patch(`${PREFIX}/parties/${PARTY}`)
      .set(headers('rait-secretary', RAIT_SECRETARY))
      .send({ case_id: RAIT_CASE('08') });
    const after = await effects();
    await owner.query(
      'update inf.rait_party set case_id=$2,updated_at=$3 where id=$1',
      [
        PARTY,
        RAIT_CASE('07'),
        before.parties.find((r: { id: string }) => r.id === PARTY).updated_at,
      ],
    );
    expect(response.status, JSON.stringify(response.body)).toBe(404);
    expect(after).toEqual(before);
  });
});

describe('S1 every baseline method has an HTTP action-denial observation', () => {
  for (const method of manifest.methods)
    it(`${method.method} ${method.path}: omitted role never executes or returns a resource`, async () => {
      const before = await effects();
      const path = method.path
        .replaceAll('{id}', ABSENT)
        .replaceAll('{caseId}', RAIT_CASE('08'));
      const verb = method.method.toLowerCase() as 'get';
      const call = request(app.getHttpServer())
        [verb](path)
        .set(headers('CIDADAO'));
      if (method.method !== 'GET') call.send({ case_id: RAIT_CASE('08') });
      const response = await call;
      expect(response.status, JSON.stringify(response.body)).toBe(
        method.disposition === 'removed' ? 404 : 403,
      );
      expect(await effects()).toEqual(before);
    });
});

// The whole block is explicitly schema-dependent. A missing table is a failed
// prerequisite, never securityRED, a skipped control, or optional-DB PASS.
describe('S1 explicit bindings, exact pools, complete purposes and real role_app_backend RLS', () => {
  let fixture: RaitP402ScopeFixture;
  const AUDITOR = '00000000-0000-4000-8000-0000b0000015';
  const MANAGER = '00000000-0000-4000-8000-0000b0000012';
  const CHAIR = '00000000-0000-4000-8000-0000b0000011';
  const RAPPORTEUR = '00000000-0000-4000-8000-0000b0000008';
  beforeAll(async () => {
    fixture = new RaitP402ScopeFixture();
    await fixture.connect();
    await fixture.prepareScope();
  });
  beforeEach(async () => {
    await fixture.clearScopes();
  });
  afterAll(async () => {
    if (fixture) {
      await fixture.cleanupScope();
      await fixture.owner.end();
    }
  });
  for (const [verb, item] of [
    ['get', false],
    ['get', true],
    ['post', false],
    ['patch', true],
    ['delete', true],
  ] as const)
    it(`hidden pool-scope record CRUD ${verb} ${item ? 'detail' : 'collection'} is absent even for technical-admin wildcard`, async () => {
      const before = (
        await owner.query('select * from inf.rait_case_pool_scope order by id')
      ).rows;
      const existing = before.find((row) => row.case_id === RAIT_CASE('04'));
      expect(existing).toBeDefined();
      const response = await request(app.getHttpServer())
        [verb](
          `${PREFIX}/rait-case-pool-scope-record${item ? '/' + existing!.id : ''}`,
        )
        .set(headers('technical-admin'))
        .send({
          case_id: RAIT_CASE('04'),
          pool_id: RaitP402ScopeFixture.OTHER_POOL,
          active: true,
        });
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(
        (
          await owner.query(
            'select * from inf.rait_case_pool_scope order by id',
          )
        ).rows,
      ).toEqual(before);
    });
  for (const path of [
    '/cases/not-a-uuid',
    '/documents/not-a-uuid',
    '/cases?case_id=not-a-uuid',
    '/documents?case_id=not-a-uuid',
    '/cases?limit=not-a-number',
    '/cases?offset=-1',
    '/cases?limit=Infinity',
  ])
    it(`malformed identifier/pagination ${path} returns a controlled denial`, async () => {
      await fixture.scope(COORDINATOR, 'rait-coordinator');
      const before = await effects();
      const response = await get(
        PREFIX + path,
        'rait-coordinator',
        COORDINATOR,
      );
      expect([400, 404], JSON.stringify(response.body)).toContain(
        response.status,
      );
      expect(response.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    });
  for (const [role, actor] of [
    ['rait-secretary', RAIT_SECRETARY],
    ['rait-manager', MANAGER],
    ['rait-coordinator', COORDINATOR],
    ['rait-rapporteur', RAPPORTEUR],
    ['rait-chair', CHAIR],
  ] as const)
    it(`${role} batch-item list and detail expose exactly the four sourced fields`, async () => {
      if (role !== 'rait-rapporteur') await fixture.scope(actor, role);
      const response = await get(`${PREFIX}/batch-items`, role, actor);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      const rows = bodyRows(response.body);
      expect(rows.length).toBeGreaterThan(0);
      const keys = ['id', 'case_id', 'batch_id', 'member_id'].sort();
      for (const row of rows) expect(Object.keys(row).sort()).toEqual(keys);
      const detail = await get(
        `${PREFIX}/batch-items/${rows[0]!.id}`,
        role,
        actor,
      );
      expect(detail.status, JSON.stringify(detail.body)).toBe(200);
      expect(Object.keys(detail.body).sort()).toEqual(keys);
      expect(detail.body).toEqual(rows[0]);
    });
  for (const [role, actor, caseId] of [
    ['rait-analyst', RAIT_ACTOR, RAIT_CASE('07')],
    ['rait-rapporteur', RAPPORTEUR, RAIT_CASE('11')],
  ] as const)
    it(`${role} own assignment alone does not reveal another member's released assignment history`, async () => {
      const own = (
        await owner.query(
          `select a.id,a.pool_id from inf.rait_assignment a join inf.rait_pool_member m on m.id=a.member_id and m.tenant_id=a.tenant_id where a.tenant_id=$1 and a.case_id=$2 and a.active and m.person_id=$3`,
          [RAIT_TENANT, caseId, actor],
        )
      ).rows[0];
      expect(own).toBeDefined();
      const other = (
        await owner.query(
          `select id from inf.rait_pool_member where tenant_id=$1 and pool_id=$2 and person_id<>$3 and status='ATIVO' order by id limit 1`,
          [RAIT_TENANT, own.pool_id, actor],
        )
      ).rows[0];
      expect(other).toBeDefined();
      const agendas = (
        await owner.query(
          `select a.id,a.withdrawn,a.withdrawn_reason from inf.rait_agenda_item a join inf.rait_pool_member m on m.id=a.rapporteur_member_id and m.tenant_id=a.tenant_id where a.tenant_id=$1 and a.case_id=$2 and m.person_id=$3`,
          [RAIT_TENANT, caseId, actor],
        )
      ).rows;
      for (const a of agendas)
        await owner.query(
          "update inf.rait_agenda_item set withdrawn=true,withdrawn_reason='S1 own-assignment fixture' where id=$1",
          [a.id],
        );
      const id = randomUUID();
      await owner.query(
        `insert into inf.rait_assignment(id,tenant_id,case_id,pool_id,member_id,assigned_by,active,released_at,release_reason) values($1,$2,$3,$4,$5,$6,false,now(),'concluido')`,
        [id, RAIT_TENANT, caseId, own.pool_id, other.id, RAIT_SECRETARY],
      );
      try {
        expect(
          (await get(`${PREFIX}/assignments/${own.id}`, role, actor)).status,
        ).toBe(200);
        expect(
          (await get(`${PREFIX}/assignments/${id}`, role, actor)).status,
        ).toBe(404);
        const list = await get(
          `${PREFIX}/assignments?case_id=${caseId}`,
          role,
          actor,
        );
        expect(list.status).toBe(200);
        expect(bodyRows(list.body).some((row) => row.id === own.id)).toBe(true);
        expect(bodyRows(list.body).some((row) => row.id === id)).toBe(false);
        await fixture.scope(COORDINATOR, 'rait-coordinator');
        expect(
          (
            await get(
              `${PREFIX}/assignments/${id}`,
              'rait-coordinator',
              COORDINATOR,
            )
          ).status,
        ).toBe(200);
      } finally {
        await owner.query('delete from inf.rait_assignment where id=$1', [id]);
        for (const a of agendas)
          await owner.query(
            'update inf.rait_agenda_item set withdrawn=$2,withdrawn_reason=$3 where id=$1',
            [a.id, a.withdrawn, a.withdrawn_reason],
          );
      }
    });
  it('revoked operational routing cannot authorize pool-only merits through either same-unit pool', async () => {
    const pool = RaitP402ScopeFixture.OTHER_POOL;
    await fixture.scope(COORDINATOR, 'rait-coordinator', 'pool', pool);
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('03')}`,
          'rait-coordinator',
          COORDINATOR,
        )
      ).status,
    ).toBe(200);
    const links = (
      await owner.query(
        'select id,active from inf.rait_case_pool_scope where case_id=$1',
        [RAIT_CASE('03')],
      )
    ).rows;
    await owner.query(
      'update inf.rait_case_pool_scope set active=false where case_id=$1',
      [RAIT_CASE('03')],
    );
    try {
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('03')}`,
            'rait-coordinator',
            COORDINATOR,
          )
        ).status,
      ).toBe(404);
      await fixture.scope(COORDINATOR, 'rait-coordinator', 'pool');
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('03')}`,
            'rait-coordinator',
            COORDINATOR,
          )
        ).status,
      ).toBe(404);
      const list = await get(
        `${PREFIX}/cases`,
        'rait-coordinator',
        COORDINATOR,
      );
      expect(list.status).toBe(200);
      expect(
        bodyRows(list.body).some((row) => row.id === RAIT_CASE('03')),
      ).toBe(false);
    } finally {
      for (const link of links)
        await owner.query(
          'update inf.rait_case_pool_scope set active=$2 where id=$1',
          [link.id, link.active],
        );
    }
  });
  for (const path of [
    '/batch-items/not-a-uuid',
    '/batch-items?case_id=not-a-uuid',
    '/assignments/not-a-uuid',
  ])
    it(`malformed worklist read ${path} has a controlled response`, async () => {
      await fixture.scope(COORDINATOR, 'rait-coordinator');
      const before = await effects();
      const response = await get(
        PREFIX + path,
        'rait-coordinator',
        COORDINATOR,
      );
      expect([400, 404], JSON.stringify(response.body)).toContain(
        response.status,
      );
      expect(await effects()).toEqual(before);
    });
  for (const [path, role, actor, payload] of [
    [
      '/inquiries/not-a-uuid/commands/answer',
      'rait-analyst',
      RAIT_ACTOR,
      { documentIds: [DOCUMENT], answeredOn: '2026-09-14' },
    ],
    ['/pools/not-a-uuid/claim-next', 'rait-analyst', RAIT_ACTOR, {}],
    ['/schedules/not-a-uuid/publish', 'rait-coordinator', COORDINATOR, {}],
    [
      '/assignments/not-a-uuid/commands/reassign',
      'rait-coordinator',
      COORDINATOR,
      {
        replacementMemberId: '00000000-0000-7000-8000-000021000002',
        reason: 'rebalanceamento',
      },
    ],
  ] as const)
    it(`malformed retained command ${path} never raises an uncontrolled SQL error`, async () => {
      const before = await effects();
      const response = await request(app.getHttpServer())
        .post(PREFIX + path)
        .set({ ...headers(role, actor), 'if-match': '"1"' })
        .send(payload);
      expect([400, 404], JSON.stringify(response.body)).toContain(
        response.status,
      );
      expect(response.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    });
  for (const [role, actor] of [
    ['rait-coordinator', COORDINATOR],
    ['AUDITOR', AUDITOR],
  ]) {
    it(`${role}: explicit active unit binding positively reads unassigned merits`, async () => {
      await fixture.scope(actor, role);
      const response = await get(
        `${PREFIX}/cases/${RAIT_CASE('04')}`,
        role,
        actor,
      );
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body).toMatchObject({
        id: RAIT_CASE('04'),
        state: 'ADMITIDO',
      });
      expect(response.body).not.toHaveProperty('tenant_id');
    });
    it(`${role}: exact pool binding reads its linked case, excludes other pool in same unit and unlinked case`, async () => {
      await fixture.scope(actor, role, 'pool');
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, role, actor)).status,
      ).toBe(200);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('03')}`, role, actor)).status,
      ).toBe(404);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('01')}`, role, actor)).status,
      ).toBe(404);
      const response = await get(`${PREFIX}/cases`, role, actor);
      expect(response.status).toBe(200);
      const rows = bodyRows(response.body);
      expect(rows.some((r) => r.id === RAIT_CASE('04'))).toBe(true);
      expect(
        rows.some((r) => r.id === RAIT_CASE('03') || r.id === RAIT_CASE('01')),
      ).toBe(false);
    });
    it(`${role}: independently authorized bindings union without cross-role borrowing`, async () => {
      await fixture.scope(actor, role, 'pool');
      await fixture.scope(actor, role, 'pool', RaitP402ScopeFixture.OTHER_POOL);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('03')}`, role, actor)).status,
      ).toBe(200);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, role, actor)).status,
      ).toBe(200);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('01')}`, role, actor)).status,
      ).toBe(404);
    });
    it(`${role}: binding revocation and authenticated role removal deny subsequent reads`, async () => {
      const id = await fixture.scope(actor, role);
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, role, actor)).status,
      ).toBe(200);
      await owner.query(
        'update inf.rait_case_read_scope set active=false where id=$1',
        [id],
      );
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, role, actor)).status,
      ).toBe(404);
      await owner.query(
        'update inf.rait_case_read_scope set active=true where id=$1',
        [id],
      );
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, 'rait-analyst', actor))
          .status,
      ).toBe(404);
    });
    it(`${role}: impediment excludes both detail and collection despite explicit scope`, async () => {
      await fixture.scope(actor, role);
      const member = await owner.query(
        'select id from inf.rait_pool_member where person_id=$1 limit 1',
        [actor],
      );
      const memberId = member.rows[0]?.id ?? randomUUID();
      const ownMember = !member.rows[0];
      if (ownMember)
        await owner.query(
          `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status)
        values($1,$2,'00000000-0000-7000-8000-000020000001',$3,'coordenador','ATIVO')`,
          [memberId, RAIT_TENANT, actor],
        );
      const impedimentId = randomUUID();
      try {
        await owner.query(
          `insert into inf.rait_impediment(id,tenant_id,member_id,case_id,basis,declared_at)
          values($1,$2,$3,$4,'foro_intimo',now())`,
          [impedimentId, RAIT_TENANT, memberId, RAIT_CASE('04')],
        );
        expect(
          (await get(`${PREFIX}/cases/${RAIT_CASE('04')}`, role, actor)).status,
        ).toBe(404);
        const list = await get(`${PREFIX}/cases`, role, actor);
        expect(bodyRows(list.body).some((r) => r.id === RAIT_CASE('04'))).toBe(
          false,
        );
      } finally {
        await owner.query('delete from inf.rait_impediment where id=$1', [
          impedimentId,
        ]);
        if (ownMember)
          await owner.query('delete from inf.rait_pool_member where id=$1', [
            memberId,
          ]);
      }
    });
  }
  // Each real existing child row is tested at its actual parent, including
  // clock-alert -> clock -> case. No random missing-ID substitute for a leak probe.
  for (const [resource, table] of [
    ['parties', 'rait_party'],
    ['documents', 'rait_document'],
    ['admissibility', 'rait_admissibility'],
    ['pending-contents', 'rait_pending_content'],
    ['redirects', 'rait_redirect'],
    ['deadlines', 'rait_deadline'],
    ['inquiries', 'rait_inquiry'],
    ['drafts', 'rait_draft'],
    ['decisions', 'rait_decision'],
    ['communications', 'rait_communication'],
    ['events', 'rait_case_event'],
    ['assignments', 'rait_assignment'],
    ['clocks', 'rait_clock'],
    ['clock-alerts', 'rait_clock_alert'],
  ])
    it(`${resource}: actual child positive + revoked-parent detail/list negative + closed fields`, async () => {
      const row = (
        await owner.query(
          `select id from inf.${table} where tenant_id=$1 ${resource === 'redirects' ? 'and case_id is not null' : ''} order by id limit 1`,
          [RAIT_TENANT],
        )
      ).rows[0];
      expect(
        row,
        `${resource} must have a persisted positive fixture`,
      ).toBeDefined();
      const scope = await fixture.scope(COORDINATOR, 'rait-coordinator');
      const positive = await get(
        `${PREFIX}/${resource}/${row.id}`,
        'rait-coordinator',
        COORDINATOR,
      );
      expect(positive.status, JSON.stringify(positive.body)).toBe(200);
      expect(positive.body.id).toBe(row.id);
      for (const field of [
        'tenant_id',
        'storage_key',
        'payload',
        'missing_items',
        'content_ref',
        'enclosed_document_ids',
      ])
        expect(positive.body).not.toHaveProperty(field);
      const list = await get(
        `${PREFIX}/${resource}`,
        'rait-coordinator',
        COORDINATOR,
      );
      expect(list.status, JSON.stringify(list.body)).toBe(200);
      expect(bodyRows(list.body).some((item) => item.id === row.id)).toBe(true);
      await owner.query(
        'update inf.rait_case_read_scope set active=false where id=$1',
        [scope],
      );
      const denied = await get(
        `${PREFIX}/${resource}/${row.id}`,
        'rait-coordinator',
        COORDINATOR,
      );
      expect(denied.status, JSON.stringify(denied.body)).toBe(404);
      const hidden = await get(
        `${PREFIX}/${resource}`,
        'rait-coordinator',
        COORDINATOR,
      );
      expect(hidden.status).toBe(200);
      expect(bodyRows(hidden.body)).toEqual([]);
    });
  it('active tenant membership and internal auth.users identity are necessary even with valid scope', async () => {
    await fixture.scope(COORDINATOR, 'rait-coordinator');
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('04')}`,
          'rait-coordinator',
          COORDINATOR,
        )
      ).status,
    ).toBe(200);
    await owner.query(
      'update auth.memberships set is_active=false where tenant_id=$1 and user_id=$2',
      [RAIT_TENANT, COORDINATOR],
    );
    try {
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('04')}`,
            'rait-coordinator',
            COORDINATOR,
          )
        ).status,
      ).toBe(404);
    } finally {
      await owner.query(
        'update auth.memberships set is_active=true where tenant_id=$1 and user_id=$2',
        [RAIT_TENANT, COORDINATOR],
      );
    }
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('04')}`,
          'rait-coordinator',
          RaitP402ScopeFixture.FOREIGN_USER,
        )
      ).status,
    ).toBe(403);
  });
  it('own impediment metadata remains readable while another member and ordinary case merits remain hidden', async () => {
    const member = (
      await owner.query(
        `select id from inf.rait_pool_member where tenant_id=$1 and person_id=$2 and status='ATIVO' and pool_id=$3 order by id limit 1`,
        [RAIT_TENANT, RAIT_ACTOR, '00000000-0000-7000-8000-000020000001'],
      )
    ).rows[0];
    expect(member).toBeDefined();
    const id = randomUUID();
    await owner.query(
      `insert into inf.rait_impediment(id,tenant_id,member_id,case_id,basis,declared_at) values($1,$2,$3,$4,'foro_intimo',now())`,
      [id, RAIT_TENANT, member.id, RAIT_CASE('07')],
    );
    try {
      const own = await get(`${PREFIX}/impediments/${id}`);
      expect(own.status, JSON.stringify(own.body)).toBe(200);
      expect(own.body).toMatchObject({
        id,
        case_id: RAIT_CASE('07'),
        member_id: member.id,
        basis: 'foro_intimo',
      });
      expect(own.body).not.toHaveProperty('tenant_id');
      expect((await get(`${PREFIX}/cases/${RAIT_CASE('07')}`)).status).toBe(
        404,
      );
      expect(
        (await get(`${PREFIX}/impediments/${id}`, 'rait-analyst', OTHER_ACTOR))
          .status,
      ).toBe(404);
      const list = await get(`${PREFIX}/impediments`);
      expect(list.status).toBe(200);
      expect(bodyRows(list.body).some((row) => row.id === id)).toBe(true);
      const otherList = await get(
        `${PREFIX}/impediments`,
        'rait-analyst',
        OTHER_ACTOR,
      );
      expect(otherList.status).toBe(200);
      expect(bodyRows(otherList.body).some((row) => row.id === id)).toBe(false);
    } finally {
      await owner.query('delete from inf.rait_impediment where id=$1', [id]);
    }
  });
  it('triage cannot borrow a same-unit membership when the case is explicitly linked to another pool', async () => {
    const original = (
      await owner.query('select state,version from inf.rait_case where id=$1', [
        RAIT_CASE('03'),
      ])
    ).rows[0];
    await owner.query(
      "update inf.rait_case set state='PROTOCOLADO',version=1 where id=$1",
      [RAIT_CASE('03')],
    );
    const before = await effects();
    try {
      expect((await get(`${PREFIX}/cases/${RAIT_CASE('03')}`)).status).toBe(
        404,
      );
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/cases/${RAIT_CASE('03')}/commands/triage`)
        .set({ ...headers(), 'if-match': '"1"' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(response.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        'update inf.rait_case set state=$2,version=$3 where id=$1',
        [RAIT_CASE('03'), original.state, original.version],
      );
    }
  });
  it('qualified coordinator creates a schedule through the real collection controller', async () => {
    await fixture.scope(COORDINATOR, 'rait-coordinator');
    const before = await effects();
    let id: string | undefined;
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/schedules`)
        .set(headers('rait-coordinator', COORDINATOR))
        .send({
          poolId: '00000000-0000-7000-8000-000020000001',
          memberId: '00000000-0000-7000-8000-000021000001',
          kind: 'escala_semanal',
          periodStart: '2032-01-05',
          periodEnd: '2032-01-11',
        });
      expect(response.status, JSON.stringify(response.body)).toBe(201);
      id = response.body.data.id;
      expect(response.body.data).toMatchObject({
        pool_id: '00000000-0000-7000-8000-000020000001',
        member_id: '00000000-0000-7000-8000-000021000001',
        kind: 'escala_semanal',
        version: 1,
      });
      expect(response.headers.etag).toBe('W/"1"');
      expect(response.body.events).toEqual([]);
      expect(
        (
          await owner.query(
            'select id from inf.rait_schedule where tenant_id=$1 and id=$2',
            [RAIT_TENANT, id],
          )
        ).rows,
      ).toEqual([{ id }]);
      const after = await effects();
      expect(after.idem - before.idem).toBe(1);
      expect(after.replayAudit - before.replayAudit).toBe(1);
      expect(after.audit - before.audit).toBe(2);
    } finally {
      if (id)
        await owner.query('delete from inf.rait_schedule where id=$1', [id]);
    }
  });
  it('qualified secretary creates an exact-pool batch through the real collection controller', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const before = await effects();
    let id: string | undefined;
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/batches`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send({
          poolId: '00000000-0000-7000-8000-000020000002',
          weekStart: '2032-01-05',
          kind: 'extraordinario',
          caseIds: [RAIT_CASE('19')],
        });
      expect(response.status, JSON.stringify(response.body)).toBe(201);
      id = response.body.data.id;
      expect(response.body.data).toMatchObject({
        pool_id: '00000000-0000-7000-8000-000020000002',
        state: 'LOTE_ABERTO',
        version: 1,
      });
      expect(response.headers.etag).toBe('W/"1"');
      expect(response.body.events).toHaveLength(1);
      expect(
        (
          await owner.query(
            'select case_id from inf.rait_batch_item where tenant_id=$1 and batch_id=$2',
            [RAIT_TENANT, id],
          )
        ).rows,
      ).toEqual([{ case_id: RAIT_CASE('19') }]);
      const after = await effects();
      expect(after.outbox - before.outbox).toBe(1);
      expect(after.idem - before.idem).toBe(1);
      expect(after.replayAudit - before.replayAudit).toBe(1);
      expect(after.audit - before.audit).toBe(2);
    } finally {
      if (id) {
        await owner.query('delete from inf.rait_batch_item where batch_id=$1', [
          id,
        ]);
        await owner.query('delete from inf.rait_batch where id=$1', [id]);
      }
    }
  });
  it('same-unit same-instance batch creation requires a current exact route beyond independent secretary scope', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const pool = '00000000-0000-7000-8000-000020000002';
    const caseId = RAIT_CASE('18');
    const parents = (
      await owner.query(
        `select c.instance as case_instance,c.unit_id as case_unit,p.instance as pool_instance,p.unit_id as pool_unit from inf.rait_case c join inf.rait_pool p on p.tenant_id=c.tenant_id and p.id=$3 where c.tenant_id=$1 and c.id=$2`,
        [RAIT_TENANT, caseId, pool],
      )
    ).rows[0];
    expect(parents).toEqual({
      case_instance: 'jari',
      case_unit: RaitP402ScopeFixture.UNIT,
      pool_instance: 'jari',
      pool_unit: RaitP402ScopeFixture.UNIT,
    });
    expect(
      (await get(`${PREFIX}/cases/${caseId}`, 'rait-secretary', RAIT_SECRETARY))
        .status,
    ).toBe(200);
    const routing = (
      await owner.query(
        `select exists(select 1 from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 and active) as link,exists(select 1 from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active) as assignment,exists(select 1 from inf.rait_batch_item bi join inf.rait_batch b on b.tenant_id=bi.tenant_id and b.id=bi.batch_id where bi.tenant_id=$1 and bi.case_id=$2 and b.state='LOTE_ACEITO') as accepted_batch`,
        [RAIT_TENANT, caseId],
      )
    ).rows[0];
    expect(routing).toEqual({
      link: false,
      assignment: false,
      accepted_batch: false,
    });
    expect(
      (
        await owner.query(
          'select id from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 and pool_id=$3',
          [RAIT_TENANT, caseId, pool],
        )
      ).rows,
    ).toEqual([]);
    const body = {
      poolId: pool,
      weekStart: '2032-01-05',
      kind: 'extraordinario',
      caseIds: [caseId],
    };
    const h = headers('rait-secretary', RAIT_SECRETARY);
    const before = await effects();
    const batches = (
      await owner.query('select * from inf.rait_batch order by id')
    ).rows;
    const items = (
      await owner.query('select * from inf.rait_batch_item order by id')
    ).rows;
    const denied = await request(app.getHttpServer())
      .post(`${PREFIX}/batches`)
      .set(h)
      .send(body);
    expect(denied.status, JSON.stringify(denied.body)).toBe(404);
    expect(denied.body).not.toHaveProperty('data');
    expect(await effects()).toEqual(before);
    expect(
      (await owner.query('select * from inf.rait_batch order by id')).rows,
    ).toEqual(batches);
    expect(
      (await owner.query('select * from inf.rait_batch_item order by id')).rows,
    ).toEqual(items);
    const link = randomUUID();
    let batch: string | undefined;
    await owner.query(
      `insert into inf.rait_case_pool_scope(id,tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,$4,true,'r25-s1-fixture','same-unit-exact-route-control')`,
      [link, RAIT_TENANT, caseId, pool],
    );
    try {
      const allowed = await request(app.getHttpServer())
        .post(`${PREFIX}/batches`)
        .set(h)
        .send(body);
      expect(allowed.status, JSON.stringify(allowed.body)).toBe(201);
      batch = allowed.body.data.id;
      expect(allowed.body.data).toMatchObject({
        pool_id: pool,
        state: 'LOTE_ABERTO',
        version: 1,
      });
      expect(
        (
          await owner.query(
            'select case_id from inf.rait_batch_item where batch_id=$1',
            [batch],
          )
        ).rows,
      ).toEqual([{ case_id: caseId }]);
    } finally {
      if (batch) {
        await owner.query('delete from inf.rait_batch_item where batch_id=$1', [
          batch,
        ]);
        await owner.query('delete from inf.rait_batch where id=$1', [batch]);
      }
      await owner.query(
        "delete from inf.rait_case_pool_scope where id=$1 and authorization_ref='r25-s1-fixture'",
        [link],
      );
    }
  });
  it('batch creation rejects only the wrong requested pool in an otherwise valid request', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const member = randomUUID();
    const cetran = '00000000-0000-7000-8000-000020000003';
    await owner.query(
      `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'secretaria','ATIVO')`,
      [member, RAIT_TENANT, cetran, RAIT_SECRETARY],
    );
    const payload = {
      poolId: '00000000-0000-7000-8000-000020000002',
      weekStart: '2032-01-05',
      kind: 'extraordinario',
      caseIds: [RAIT_CASE('17')],
    };
    let id: string | undefined;
    try {
      // The secretary independently qualifies for this existing CETRAN case;
      // only the requested JARI pool differs from its trusted current pool.
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('17')}`,
            'rait-secretary',
            RAIT_SECRETARY,
          )
        ).status,
      ).toBe(200);
      const before = await effects();
      const batches = (
        await owner.query('select * from inf.rait_batch order by id')
      ).rows;
      const denied = await request(app.getHttpServer())
        .post(`${PREFIX}/batches`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send(payload);
      expect(denied.status, JSON.stringify(denied.body)).toBe(404);
      expect(denied.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
      expect(
        (await owner.query('select * from inf.rait_batch order by id')).rows,
      ).toEqual(batches);
      const positive = await request(app.getHttpServer())
        .post(`${PREFIX}/batches`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send({ ...payload, poolId: cetran });
      expect(positive.status, JSON.stringify(positive.body)).toBe(201);
      id = positive.body.data.id;
      expect(
        (
          await owner.query(
            'select case_id from inf.rait_batch_item where batch_id=$1',
            [id],
          )
        ).rows,
      ).toEqual([{ case_id: RAIT_CASE('17') }]);
    } finally {
      if (id) {
        await owner.query('delete from inf.rait_batch_item where batch_id=$1', [
          id,
        ]);
        await owner.query('delete from inf.rait_batch where id=$1', [id]);
      }
      await owner.query('delete from inf.rait_pool_member where id=$1', [
        member,
      ]);
    }
  });
  for (const operation of ['accept', 'impediment'] as const)
    it(`malformed route caseId for batch ${operation} is404 before SQL or body validation`, async () => {
      const before = await effects();
      const response = await request(app.getHttpServer())
        .post(
          `${PREFIX}/batches/00000000-0000-7000-8000-000028000002/items/not-a-uuid/${operation}`,
        )
        .set({ ...headers('rait-rapporteur', RAPPORTEUR), 'if-match': '"1"' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(response.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    });
  for (const resource of ['pending-contents', 'redirects'] as const)
    it(`triage has no sourced ${resource} projection for actual records`, async () => {
      const id = randomUUID();
      const table =
        resource === 'pending-contents'
          ? 'rait_pending_content'
          : 'rait_redirect';
      if (resource === 'pending-contents')
        await owner.query(
          `insert into inf.rait_pending_content(id,tenant_id,case_id,missing_items,due_on,opened_by) values($1,$2,$3,'[]'::jsonb,'2026-12-31',$4)`,
          [id, RAIT_TENANT, RAIT_CASE('02'), RAIT_ACTOR],
        );
      else
        await owner.query(
          `insert into inf.rait_redirect(id,tenant_id,case_id,direction,reason,protocol_number,counterpart_agency,redirected_by) values($1,$2,$3,'entrada','orgao_incompetente','S1-T-PROJECTION','fixture',$4)`,
          [id, RAIT_TENANT, RAIT_CASE('02'), RAIT_ACTOR],
        );
      try {
        const parent = await get(`${PREFIX}/cases/${RAIT_CASE('02')}`);
        expect(parent.status, JSON.stringify(parent.body)).toBe(200);
        expect(parent.body).not.toHaveProperty('ait_id');
        expect((await get(`${PREFIX}/${resource}/${id}`)).status).toBe(404);
        const list = await get(
          `${PREFIX}/${resource}?case_id=${RAIT_CASE('02')}`,
        );
        expect(list.status).toBe(200);
        expect(bodyRows(list.body)).toEqual([]);
      } finally {
        await owner.query(`delete from inf.${table} where id=$1`, [id]);
      }
    });
  for (const [role, actor] of [
    ['rait-coordinator', COORDINATOR],
    ['rait-chair', CHAIR],
  ] as const)
    it(`${role} retains approved decision grounds rather than suppressing merits as generic metadata`, async () => {
      await fixture.scope(actor, role);
      const row = (
        await owner.query(
          `select id,case_id,grounds from inf.rait_decision where tenant_id=$1 and case_id=$2 order by id limit 1`,
          [RAIT_TENANT, RAIT_CASE('12')],
        )
      ).rows[0];
      expect(row).toBeDefined();
      const response = await get(`${PREFIX}/decisions/${row.id}`, role, actor);
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body).toHaveProperty('grounds', row.grounds);
      expect(response.body).not.toHaveProperty('tenant_id');
    });
  it('manager positively reads operational case projection and cannot access parties/documents/merits', async () => {
    await fixture.scope(MANAGER, 'rait-manager');
    const response = await get(
      `${PREFIX}/cases/${RAIT_CASE('07')}`,
      'rait-manager',
      MANAGER,
    );
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    const allowed = new Set([
      'id',
      'protocol_number',
      'instance',
      'circuit',
      'state',
      'unit_id',
      'protocolled_at',
      'version',
      'last_movement_at',
      'pending_completion',
      'archived',
    ]);
    expect(Object.keys(response.body).every((key) => allowed.has(key))).toBe(
      true,
    );
    expect(
      (await get(`${PREFIX}/parties/${PARTY}`, 'rait-manager', MANAGER)).status,
    ).toBe(404);
    expect(
      (await get(`${PREFIX}/documents/${DOCUMENT}`, 'rait-manager', MANAGER))
        .status,
    ).toBe(404);
  });
  it('secretary positive triage retains only triage fields; procedural membership never blanket merits', async () => {
    const triage = await get(
      `${PREFIX}/cases/${RAIT_CASE('02')}`,
      'rait-secretary',
      RAIT_SECRETARY,
    );
    expect(triage.status, JSON.stringify(triage.body)).toBe(200);
    expect(triage.body).not.toHaveProperty('ait_id');
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const procedural = await get(
      `${PREFIX}/cases/${RAIT_CASE('07')}`,
      'rait-secretary',
      RAIT_SECRETARY,
    );
    expect(procedural.status).toBe(200);
    expect(procedural.body).not.toHaveProperty('ait_id');
    expect(procedural.body).not.toHaveProperty('withdrawal_document_id');
  });
  it('AUDITOR sealed archive uses S redaction rather than oversight merits union', async () => {
    await fixture.scope(AUDITOR, 'AUDITOR');
    await owner.query('update inf.rait_case set archived=true where id=$1', [
      RAIT_CASE('07'),
    ]);
    try {
      const response = await get(
        `${PREFIX}/cases/${RAIT_CASE('07')}`,
        'AUDITOR',
        AUDITOR,
      );
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('ait_id');
      expect(response.body).not.toHaveProperty('withdrawal_document_id');
      const parties = await get(
        `${PREFIX}/parties?case_id=${RAIT_CASE('07')}`,
        'AUDITOR',
        AUDITOR,
      );
      expect(parties.status).toBe(200);
      for (const row of bodyRows(parties.body))
        for (const key of ['person_name', 'document_number', 'contact_email'])
          expect(row).not.toHaveProperty(key);
    } finally {
      await owner.query('update inf.rait_case set archived=false where id=$1', [
        RAIT_CASE('07'),
      ]);
    }
  });
  it('rapporteur own-assignment positive is retained; pool membership alone cannot read another case', async () => {
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('11')}`,
          'rait-rapporteur',
          RAPPORTEUR,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('08')}`,
          'rait-rapporteur',
          RAPPORTEUR,
        )
      ).status,
    ).toBe(404);
  });
  it('chair requires scope AND matching active presidency, rather than either factor alone', async () => {
    await fixture.scope(CHAIR, 'rait-chair');
    expect(
      (await get(`${PREFIX}/cases/${RAIT_CASE('11')}`, 'rait-chair', CHAIR))
        .status,
    ).toBe(200);
    const member = '00000000-0000-7000-8000-000021000011';
    await owner.query(
      "update inf.rait_pool_member set status='ADVERTIDO' where id=$1",
      [member],
    );
    try {
      expect(
        (await get(`${PREFIX}/cases/${RAIT_CASE('11')}`, 'rait-chair', CHAIR))
          .status,
      ).toBe(404);
    } finally {
      await owner.query(
        "update inf.rait_pool_member set status='ATIVO' where id=$1",
        [member],
      );
    }
  });
  it('rapporteur relevant agenda participation authorizes supporting merits without an own active assignment', async () => {
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('15')}`,
          'rait-rapporteur',
          RAPPORTEUR,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('04')}`,
          'rait-rapporteur',
          RAPPORTEUR,
        )
      ).status,
    ).toBe(404);
  });
  it('central designated review scope positively reads favorable JARI decision, denies unrelated defense case', async () => {
    const actor = '00000000-0000-4000-8000-0000b0000007';
    await fixture.scope(actor, 'rait-central-authority');
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('13')}`,
          'rait-central-authority',
          actor,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('10')}`,
          'rait-central-authority',
          actor,
        )
      ).status,
    ).toBe(404);
  });
  it('signer qualified jurisdiction/appointment/current duty positively reads ready case and loses access after duty revocation', async () => {
    const actor = '00000000-0000-4000-8000-0000b0000006';
    await fixture.prepareCommand('decide', RAIT_CASE('09'));
    try {
      const positive = await get(
        `${PREFIX}/cases/${RAIT_CASE('09')}`,
        'rait-signing-authority',
        actor,
      );
      expect(positive.status, JSON.stringify(positive.body)).toBe(200);
      await owner.query(
        "update inf.rait_pool_member set status='ADVERTIDO' where person_id=$1 and member_role='autoridade'",
        [actor],
      );
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('09')}`,
            'rait-signing-authority',
            actor,
          )
        ).status,
      ).toBe(404);
      expect(
        (
          await get(
            `${PREFIX}/cases/${RAIT_CASE('08')}`,
            'rait-signing-authority',
            actor,
          )
        ).status,
      ).toBe(404);
    } finally {
      await owner.query(
        "update inf.rait_pool_member set status='ATIVO' where person_id=$1 and member_role='autoridade'",
        [actor],
      );
      await fixture.resetMutableState();
    }
  });
  for (const [role, actor] of [
    ['rait-hr', '00000000-0000-4000-8000-0000b0000013'],
    ['rait-finance', '00000000-0000-4000-8000-0000b0000014'],
    ['integration-operator', '00000000-0000-4000-8000-0000b0000017'],
    ['bi-analyst', RAIT_ACTOR],
  ])
    it(`${role} functional role does not authorize generic case merits`, async () => {
      const response = await get(
        `${PREFIX}/cases/${RAIT_CASE('07')}`,
        role,
        actor,
      );
      expect(response.status).toBe(404);
    });
  it('ordinary own-case party metadata and document filename remain successful, protected representation is not writable', async () => {
    const before = (
      await owner.query('select person_name from inf.rait_party where id=$1', [
        PARTY,
      ])
    ).rows[0];
    const docBefore = (
      await owner.query('select filename from inf.rait_document where id=$1', [
        DOCUMENT,
      ])
    ).rows[0];
    try {
      const party = await request(app.getHttpServer())
        .patch(`${PREFIX}/parties/${PARTY}`)
        .set(headers())
        .send({ person_name: 'S1 ordinary metadata' });
      expect(party.status, JSON.stringify(party.body)).toBe(200);
      expect(party.body.person_name).toBe('S1 ordinary metadata');
      const document = await request(app.getHttpServer())
        .patch(`${PREFIX}/documents/${DOCUMENT}`)
        .set(headers())
        .send({ filename: 'S1 ordinary filename' });
      expect(document.status, JSON.stringify(document.body)).toBe(200);
      expect(document.body.filename).toBe('S1 ordinary filename');
      const effectsBefore = await effects();
      const invalid = await request(app.getHttpServer())
        .patch(`${PREFIX}/parties/${PARTY}`)
        .set(headers())
        .send({ representation_verified: true });
      expect(invalid.status, JSON.stringify(invalid.body)).toBe(400);
      expect(await effects()).toEqual(effectsBefore);
    } finally {
      await owner.query(
        'update inf.rait_party set person_name=$2 where id=$1',
        [PARTY, before.person_name],
      );
      await owner.query(
        'update inf.rait_document set filename=$2 where id=$1',
        [DOCUMENT, docBefore.filename],
      );
    }
  });
  for (const [source, target] of [
    [PARTY, RAIT_CASE('08')],
    ['00000000-0000-7000-8000-000011000008', RAIT_CASE('07')],
  ])
    it(`party reparent requires BOTH authorized source and target: ${source} -> ${target}`, async () => {
      const original = (
        await owner.query(
          'select case_id,updated_at from inf.rait_party where id=$1',
          [source],
        )
      ).rows[0];
      const before = await effects();
      try {
        const response = await request(app.getHttpServer())
          .patch(`${PREFIX}/parties/${source}`)
          .set(headers())
          .send({ case_id: target });
        expect(response.status, JSON.stringify(response.body)).toBe(404);
        expect(await effects()).toEqual(before);
      } finally {
        await owner.query(
          'update inf.rait_party set case_id=$2,updated_at=$3 where id=$1',
          [source, original.case_id, original.updated_at],
        );
      }
    });
  for (const [resource, role, actor, caseId] of [
    ['communications', 'rait-secretary', RAIT_SECRETARY, RAIT_CASE('07')],
    ['decisions', 'rait-chair', CHAIR, RAIT_CASE('11')],
  ])
    for (const method of ['post', 'patch'] as const)
      it(`${role} authorized scope ${method} ${resource}: empty/ordinary raw write is400, never noop200`, async () => {
        await fixture.scope(actor, role);
        const row = (
          await owner.query(
            `select id from inf.rait_${resource === 'communications' ? 'communication' : 'decision'} where tenant_id=$1 ${resource === 'decisions' ? "and case_id='00000000-0000-7000-8000-000010000012'" : ''} order by id limit 1`,
            [RAIT_TENANT],
          )
        ).rows[0];
        const before = await effects();
        const path =
          `${PREFIX}/${resource}` + (method === 'patch' ? `/${row.id}` : '');
        const response = await request(app.getHttpServer())
          [method](path)
          .set(headers(role, actor))
          .send(method === 'post' ? { case_id: caseId } : {});
        expect(response.status, JSON.stringify(response.body)).toBe(400);
        expect(await effects()).toEqual(before);
      });
  for (const role of [
    'technical-admin',
    'technical-admin,rait-secretary',
    'technical-admin,AUDITOR',
    'technical-admin,rait-secretary,AUDITOR',
  ])
    it(`party DELETE has no sourced S1 case purpose even for ${role}`, async () => {
      await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
      await fixture.scope(RAIT_SECRETARY, 'AUDITOR');
      const saved = (
        await owner.query('select * from inf.rait_party where id=$1', [PARTY])
      ).rows[0];
      const before = await effects();
      try {
        const response = await request(app.getHttpServer())
          .delete(`${PREFIX}/parties/${PARTY}`)
          .set(headers(role, RAIT_SECRETARY));
        expect(response.status, JSON.stringify(response.body)).toBe(404);
        expect(await effects()).toEqual(before);
      } finally {
        await owner.query(
          `insert into inf.rait_party select (jsonb_populate_record(null::inf.rait_party,$1::jsonb)).*
          where not exists(select 1 from inf.rait_party where id=$2)`,
          [JSON.stringify(saved), PARTY],
        );
      }
    });
  it('cross-tenant parent and membership FKs reject foreign scope and caller cannot manufacture unit/pool authority', async () => {
    await expect(
      owner.query(
        `insert into inf.rait_case_read_scope(tenant_id,actor_id,role,unit_id,active,authorization_ref)
      values($1,$2,'AUDITOR',$3,true,'r25-s1-fixture')`,
        [
          RAIT_TENANT,
          RaitP402ScopeFixture.FOREIGN_USER,
          RaitP402ScopeFixture.UNIT,
        ],
      ),
    ).rejects.toMatchObject({ code: '23503' });
    await expect(
      owner.query(
        `insert into inf.rait_case_read_scope(tenant_id,actor_id,role,unit_id,active,authorization_ref)
      values($1,$2,'AUDITOR',$3,true,'r25-s1-fixture')`,
        [RAIT_TENANT, AUDITOR, RaitP402ScopeFixture.FOREIGN_UNIT],
      ),
    ).rejects.toMatchObject({ code: '23503' });
    const response = await get(
      `${PREFIX}/cases/${RAIT_CASE('04')}?unit_id=${RaitP402ScopeFixture.UNIT}&actor_id=${COORDINATOR}&purpose=oversight`,
      'AUDITOR',
      AUDITOR,
    );
    expect(response.status).toBe(404);
  });
  it('independent tenantB binding is invisible under tenantA real app-role RLS and both internal tables enforce RLS', async () => {
    const id = randomUUID();
    await owner.query("select set_config('app.tenant_id',$1,false)", [
      RaitP402ScopeFixture.FOREIGN_TENANT,
    ]);
    try {
      await owner.query(
        `insert into inf.rait_case_read_scope(id,tenant_id,actor_id,role,unit_id,active,authorization_ref)
      values($1,$2,$3,'AUDITOR',$4,true,'r25-s1-fixture')`,
        [
          id,
          RaitP402ScopeFixture.FOREIGN_TENANT,
          RaitP402ScopeFixture.FOREIGN_USER,
          RaitP402ScopeFixture.FOREIGN_UNIT,
        ],
      );
    } finally {
      await owner.query("select set_config('app.tenant_id',$1,false)", [
        RAIT_TENANT,
      ]);
    }
    const client = new Client({
      connectionString: process.env.STYNX_APP_DATABASE_URL,
    });
    await client.connect();
    try {
      await client.query('begin');
      await client.query("select set_config('app.tenant_id',$1,true)", [
        RAIT_TENANT,
      ]);
      expect(
        (await client.query('select current_user as role')).rows[0].role,
      ).toBe('role_app_backend');
      expect(
        (
          await client.query(
            'select id from inf.rait_case_read_scope where id=$1',
            [id],
          )
        ).rows,
      ).toEqual([]);
      await client.query("select set_config('app.tenant_id',$1,true)", [
        RaitP402ScopeFixture.FOREIGN_TENANT,
      ]);
      expect(
        (
          await client.query(
            'select id from inf.rait_case_read_scope where id=$1',
            [id],
          )
        ).rows,
      ).toHaveLength(1);
      const rules =
        await client.query(`select relname,relrowsecurity,relforcerowsecurity from pg_class
        where oid in ('inf.rait_case_read_scope'::regclass,'inf.rait_case_pool_scope'::regclass)`);
      expect(rules.rows).toHaveLength(2);
      for (const row of rules.rows) {
        expect(row.relrowsecurity).toBe(true);
        expect(row.relforcerowsecurity).toBe(true);
      }
    } finally {
      await client.query('rollback');
      await client.end();
    }
  });
  it('actual independently persisted tenant-B case is missing to tenantA HTTP and visible only under tenantB app-role context', async () => {
    await fixture.scope(COORDINATOR, 'rait-coordinator');
    const response = await get(
      `${PREFIX}/cases/${RaitP402ScopeFixture.FOREIGN_CASE}`,
      'rait-coordinator',
      COORDINATOR,
    );
    expect(response.status, JSON.stringify(response.body)).toBe(404);
    expect(JSON.stringify(response.body)).not.toContain(
      RaitP402ScopeFixture.FOREIGN_CASE,
    );
    const client = new Client({
      connectionString: process.env.STYNX_APP_DATABASE_URL,
    });
    await client.connect();
    try {
      await client.query('begin');
      await client.query("select set_config('app.tenant_id',$1,true)", [
        RAIT_TENANT,
      ]);
      expect(
        (
          await client.query('select id from inf.rait_case where id=$1', [
            RaitP402ScopeFixture.FOREIGN_CASE,
          ])
        ).rows,
      ).toEqual([]);
      await client.query("select set_config('app.tenant_id',$1,true)", [
        RaitP402ScopeFixture.FOREIGN_TENANT,
      ]);
      expect(
        (
          await client.query(
            `select c.id from inf.rait_case c join inf.ait_ait a on a.id=c.ait_id and a.tenant_id=c.tenant_id
        join inf.normative_catalog n on n.id=a.catalog_id and n.tenant_id=c.tenant_id where c.id=$1`,
            [RaitP402ScopeFixture.FOREIGN_CASE],
          )
        ).rows,
      ).toEqual([{ id: RaitP402ScopeFixture.FOREIGN_CASE }]);
    } finally {
      await client.query('rollback');
      await client.end();
    }
  });
  it('scope constraints require one parent, nonempty provenance, default inactive and unique exact role binding', async () => {
    for (const [unit, pool, ref] of [
      [null, null, 'valid'],
      [
        RaitP402ScopeFixture.UNIT,
        '00000000-0000-7000-8000-000020000001',
        'valid',
      ],
      [RaitP402ScopeFixture.UNIT, null, '  '],
    ])
      await expect(
        owner.query(
          `insert into inf.rait_case_read_scope(tenant_id,actor_id,role,unit_id,pool_id,authorization_ref)
        values($1,$2,'AUDITOR',$3,$4,$5)`,
          [RAIT_TENANT, AUDITOR, unit, pool, ref],
        ),
      ).rejects.toMatchObject({ code: '23514' });
    await fixture.scope(AUDITOR, 'AUDITOR');
    await expect(fixture.scope(AUDITOR, 'AUDITOR')).rejects.toMatchObject({
      code: '23505',
    });
  });
  it('internal scope tables remain unreachable as public CRUD and case-pool FK/uniqueness/provenance are enforced', async () => {
    for (const resource of ['case-read-scopes', 'case-pool-scopes']) {
      expect(
        (await get(`${PREFIX}/${resource}`, 'technical-admin')).status,
      ).toBe(404);
      expect(
        (
          await request(app.getHttpServer())
            .post(`${PREFIX}/${resource}`)
            .set(headers('technical-admin'))
            .send({})
        ).status,
      ).toBe(404);
    }
    await expect(
      owner.query(
        `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
      values($1,$2,$3,true,'r25-s1-fixture','fixture-source')`,
        [
          RAIT_TENANT,
          RaitP402ScopeFixture.FOREIGN_CASE,
          '00000000-0000-7000-8000-000020000001',
        ],
      ),
    ).rejects.toMatchObject({ code: '23503' });
    await expect(
      owner.query(
        `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
      values($1,$2,$3,true,'r25-s1-fixture','fixture-source')`,
        [RAIT_TENANT, RAIT_CASE('04'), '00000000-0000-7000-8000-000020000001'],
      ),
    ).rejects.toMatchObject({ code: '23505' });
    const inactive = await owner.query(
      `insert into inf.rait_case_read_scope(tenant_id,actor_id,role,unit_id,authorization_ref)
      values($1,$2,'rait-coordinator',$3,'r25-s1-fixture') returning active`,
      [RAIT_TENANT, COORDINATOR, RaitP402ScopeFixture.UNIT],
    );
    expect(inactive.rows).toEqual([{ active: false }]);
    expect(
      (
        await get(
          `${PREFIX}/cases/${RAIT_CASE('04')}`,
          'rait-coordinator',
          COORDINATOR,
        )
      ).status,
    ).toBe(404);
  });
  it('revocation committed while request waits on an existing case lock is revalidated before command effects', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const lock = new Client({
      connectionString: process.env.STYNX_OWNER_DATABASE_URL,
    });
    await lock.connect();
    await lock.query('begin');
    await lock.query('select id from inf.rait_case where id=$1 for update', [
      RAIT_CASE('02'),
    ]);
    const before = await effects();
    const pending = request(app.getHttpServer())
      .post(`${PREFIX}/parties`)
      .set(headers('rait-secretary', RAIT_SECRETARY))
      .send({
        case_id: RAIT_CASE('02'),
        role: 'requerente',
        person_name: 'S1 concurrent probe',
      })
      .then((r) => r);
    let observed = false;
    try {
      // Observe actual waiter, not a sleep-based guess about which transaction won.
      const deadline = Date.now() + 5000;
      while (Date.now() < deadline) {
        const wait = await owner.query(
          "select 1 from pg_stat_activity where datname=current_database() and wait_event_type='Lock' and pid<>pg_backend_pid() limit 1",
        );
        if (wait.rowCount) {
          observed = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      await owner.query(
        "update inf.rait_pool_member set status='ADVERTIDO' where person_id=$1",
        [RAIT_SECRETARY],
      );
    } finally {
      await lock.query('rollback');
      await lock.end();
    }
    try {
      const response = await pending;
      expect(
        observed,
        'request must serialize source scope on the case lock',
      ).toBe(true);
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        "update inf.rait_pool_member set status='ATIVO' where person_id=$1",
        [RAIT_SECRETARY],
      );
    }
  });
});

describe('S1 actor-bound command replay and unchanged legal admissibility/routing', () => {
  let fixture: RaitP402ScopeFixture;
  const POOL = '00000000-0000-7000-8000-000020000001';
  beforeAll(async () => {
    fixture = new RaitP402ScopeFixture();
    await fixture.connect();
    await fixture.prepareScope();
  });
  beforeEach(async () => {
    await fixture.clearScopes();
    await fixture.prepareAdmitBinding(RAIT_CASE('02'));
  });
  afterAll(async () => {
    if (fixture) {
      await fixture.resetMutableState();
      await fixture.cleanupScope();
      await fixture.owner.end();
    }
  });
  const triage = () => `${PREFIX}/cases/${RAIT_CASE('02')}/commands/triage`;
  async function prepareTriage() {
    await owner.query(
      "update inf.rait_case set state='PROTOCOLADO',version=1 where id=$1",
      [RAIT_CASE('02')],
    );
  }
  it('successful same-actor exact retry retains response/ETag and does not repeat effects after state/version advances', async () => {
    await prepareTriage();
    const h = { ...headers(), 'if-match': '"1"' };
    const invoke = () =>
      request(app.getHttpServer()).post(triage()).set(h).send({});
    const first = await invoke();
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await effects();
    const retry = await invoke();
    expect(retry.status, JSON.stringify(retry.body)).toBe(200);
    expect(retry.body).toEqual(first.body);
    expect(retry.headers.etag).toBe(first.headers.etag);
    expect(await effects()).toEqual(before);
  });
  it('same key reused by another authenticated eligible actor returns safe409 without prior response', async () => {
    await prepareTriage();
    const h = { ...headers(), 'if-match': '"1"' };
    const first = await request(app.getHttpServer())
      .post(triage())
      .set(h)
      .send({});
    expect(first.status).toBe(200);
    const before = await effects();
    headers('rait-analyst', OTHER_ACTOR);
    const retry = await request(app.getHttpServer())
      .post(triage())
      .set(h)
      .send({});
    expect(retry.status, JSON.stringify(retry.body)).toBe(409);
    expect(retry.body).not.toHaveProperty('data');
    expect(JSON.stringify(retry.body)).not.toContain(RAIT_CASE('02'));
    expect(await effects()).toEqual(before);
  });
  it('current membership revocation prevents exact replay but preserves historical command evidence', async () => {
    await prepareTriage();
    const h = { ...headers(), 'if-match': '"1"' };
    const first = await request(app.getHttpServer())
      .post(triage())
      .set(h)
      .send({});
    expect(first.status).toBe(200);
    const before = await effects();
    await owner.query(
      "update inf.rait_pool_member set status='ADVERTIDO' where person_id=$1",
      [RAIT_ACTOR],
    );
    try {
      const retry = await request(app.getHttpServer())
        .post(triage())
        .set(h)
        .send({});
      expect(retry.status, JSON.stringify(retry.body)).toBe(404);
      expect(retry.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        "update inf.rait_pool_member set status='ATIVO' where person_id=$1",
        [RAIT_ACTOR],
      );
    }
  });
  it('role removal prevents exact replay while stale first-use version remains412', async () => {
    await prepareTriage();
    const h = { ...headers(), 'if-match': '"1"' };
    const first = await request(app.getHttpServer())
      .post(triage())
      .set(h)
      .send({});
    expect(first.status).toBe(200);
    const before = await effects();
    headers('CIDADAO', RAIT_ACTOR);
    expect(
      (await request(app.getHttpServer()).post(triage()).set(h).send({}))
        .status,
    ).toBe(403);
    const stale = await request(app.getHttpServer())
      .post(triage())
      .set({ ...headers(), 'if-match': '"1"' })
      .send({});
    expect(stale.status).toBe(412);
    expect(await effects()).toEqual(before);
  });
  it('existing claim exact retry reauthorizes actor/membership without invoking the future S2 selector', async () => {
    await fixture.prepareCommand('claim-next');
    await owner.query(
      `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
      values($1,$2,$3,true,'r25-s1-fixture','current-source-fixture') on conflict(tenant_id,case_id,pool_id) do update set active=true`,
      [RAIT_TENANT, RAIT_CASE('06'), POOL],
    );
    const h = { ...headers(), 'if-match': '"1"' };
    const invoke = () =>
      request(app.getHttpServer())
        .post(`${PREFIX}/pools/${POOL}/claim-next`)
        .set(h)
        .send({});
    const first = await invoke();
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const before = await effects();
    const same = await invoke();
    expect(same.status, JSON.stringify(same.body)).toBe(200);
    expect(same.body).toEqual(first.body);
    expect(await effects()).toEqual(before);
    headers('rait-analyst', OTHER_ACTOR);
    const other = await invoke();
    expect(other.status, JSON.stringify(other.body)).toBe(409);
    expect(other.body).not.toHaveProperty('data');
    expect(await effects()).toEqual(before);
    headers('rait-analyst', RAIT_ACTOR);
    await owner.query(
      "update inf.rait_pool_member set status='ADVERTIDO' where person_id=$1",
      [RAIT_ACTOR],
    );
    try {
      const revoked = await invoke();
      expect(revoked.status, JSON.stringify(revoked.body)).toBe(404);
      expect(revoked.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        "update inf.rait_pool_member set status='ATIVO' where person_id=$1",
        [RAIT_ACTOR],
      );
    }
  });
  for (const revocation of ['release', 'reassign', 'impediment'] as const)
    it(`claim replay after ${revocation} reauthorizes the selected case before returning the stored result`, async () => {
      await fixture.prepareCommand('claim-next');
      await owner.query(
        `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,true,'r25-s1-fixture','claim-replay') on conflict(tenant_id,case_id,pool_id) do update set active=true`,
        [RAIT_TENANT, RAIT_CASE('06'), POOL],
      );
      const h = { ...headers(), 'if-match': '"1"' };
      const invoke = () =>
        request(app.getHttpServer())
          .post(`${PREFIX}/pools/${POOL}/claim-next`)
          .set(h)
          .send({});
      const first = await invoke();
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      const assignment = (
        await owner.query(
          'select id,member_id,active,released_at,release_reason from inf.rait_assignment where case_id=$1 and active',
          [first.body.data.id],
        )
      ).rows[0];
      expect(assignment).toBeDefined();
      const temporary = randomUUID();
      let createdMember = false;
      if (revocation === 'release')
        await owner.query(
          "update inf.rait_assignment set active=false,released_at=now(),release_reason='afastamento' where id=$1",
          [assignment.id],
        );
      if (revocation === 'reassign') {
        const otherMember = (
          await owner.query(
            'select id from inf.rait_pool_member where tenant_id=$1 and pool_id=$2 and person_id=$3 order by id limit 1',
            [RAIT_TENANT, POOL, OTHER_ACTOR],
          )
        ).rows[0];
        if (!otherMember) {
          await owner.query(
            `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'analista','ATIVO')`,
            [temporary, RAIT_TENANT, POOL, OTHER_ACTOR],
          );
          createdMember = true;
        }
        await owner.query(
          'update inf.rait_assignment set member_id=$2 where id=$1',
          [assignment.id, otherMember?.id ?? temporary],
        );
      }
      if (revocation === 'impediment')
        await owner.query(
          `insert into inf.rait_impediment(id,tenant_id,member_id,case_id,basis,declared_at) values($1,$2,$3,$4,'foro_intimo',now())`,
          [temporary, RAIT_TENANT, assignment.member_id, first.body.data.id],
        );
      const before = await effects();
      try {
        const replay = await invoke();
        expect(replay.status, JSON.stringify(replay.body)).toBe(404);
        expect(replay.body).not.toHaveProperty('data');
        expect(JSON.stringify(replay.body)).not.toContain(first.body.data.id);
        expect(await effects()).toEqual(before);
      } finally {
        if (revocation === 'impediment')
          await owner.query('delete from inf.rait_impediment where id=$1', [
            temporary,
          ]);
        await owner.query(
          'update inf.rait_assignment set active=$2,member_id=$3,released_at=$4,release_reason=$5 where id=$1',
          [
            assignment.id,
            assignment.active,
            assignment.member_id,
            assignment.released_at,
            assignment.release_reason,
          ],
        );
        if (createdMember)
          await owner.query('delete from inf.rait_pool_member where id=$1', [
            temporary,
          ]);
      }
    });
  it('existing claim rejects a selected case routed to another pool in the same unit before any effects', async () => {
    await fixture.prepareCommand('claim-next');
    const original = (
      await owner.query(
        'select state,version,protocolled_at from inf.rait_case where id=$1',
        [RAIT_CASE('03')],
      )
    ).rows[0];
    const otherOriginal = (
      await owner.query('select state,version from inf.rait_case where id=$1', [
        RAIT_CASE('06'),
      ])
    ).rows[0];
    await owner.query("update inf.rait_case set state='ADMITIDO' where id=$1", [
      RAIT_CASE('06'),
    ]);
    await owner.query(
      "update inf.rait_case set state='DISTRIBUIDO' where id=$1",
      [RAIT_CASE('03')],
    );
    const before = await effects();
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/pools/${POOL}/claim-next`)
        .set({ ...headers(), 'if-match': '"1"' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(404);
      expect(response.body).not.toHaveProperty('data');
      expect(JSON.stringify(response.body)).not.toContain(RAIT_CASE('03'));
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        'update inf.rait_case set state=$2,version=$3 where id=$1',
        [RAIT_CASE('03'), original.state, original.version],
      );
      await owner.query(
        'update inf.rait_case set state=$2,version=$3 where id=$1',
        [RAIT_CASE('06'), otherOriginal.state, otherOriginal.version],
      );
    }
  });
  it('claim replay must still belong to the exact original requested pool after a qualified assignment transfer', async () => {
    await fixture.prepareCommand('claim-next');
    await owner.query(
      `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
      values($1,$2,$3,true,'r25-s1-fixture','fixture-current-route') on conflict(tenant_id,case_id,pool_id) do update set active=true`,
      [RAIT_TENANT, RAIT_CASE('06'), POOL],
    );
    const h = { ...headers(), 'if-match': '"1"' };
    const invoke = () =>
      request(app.getHttpServer())
        .post(`${PREFIX}/pools/${POOL}/claim-next`)
        .set(h)
        .send({});
    const first = await invoke();
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    const assignment = (
      await owner.query(
        'select id,pool_id,member_id from inf.rait_assignment where tenant_id=$1 and case_id=$2 and active',
        [RAIT_TENANT, first.body.data.id],
      )
    ).rows[0];
    const newMember = randomUUID();
    await owner.query(
      `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status)
      values($1,$2,$3,$4,'analista','ATIVO')`,
      [newMember, RAIT_TENANT, RaitP402ScopeFixture.OTHER_POOL, RAIT_ACTOR],
    );
    await owner.query(
      'update inf.rait_assignment set pool_id=$2,member_id=$3 where id=$1',
      [assignment.id, RaitP402ScopeFixture.OTHER_POOL, newMember],
    );
    await owner.query(
      'update inf.rait_case_pool_scope set active=false where case_id=$1 and pool_id=$2',
      [first.body.data.id, POOL],
    );
    const before = await effects();
    try {
      const replay = await invoke();
      expect(replay.status, JSON.stringify(replay.body)).toBe(404);
      expect(replay.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query(
        'update inf.rait_assignment set pool_id=$2,member_id=$3 where id=$1',
        [assignment.id, assignment.pool_id, assignment.member_id],
      );
      await owner.query(
        'update inf.rait_case_pool_scope set active=true where case_id=$1 and pool_id=$2',
        [first.body.data.id, POOL],
      );
      await owner.query('delete from inf.rait_pool_member where id=$1', [
        newMember,
      ]);
    }
  });
  it('multiple active secretary memberships in the SAME legal unit/instance preserve protocol success', async () => {
    const membership = randomUUID();
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    await owner.query(
      `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status)
      values($1,$2,$3,$4,'secretaria','ATIVO')`,
      [
        membership,
        RAIT_TENANT,
        RaitP402ScopeFixture.OTHER_POOL,
        RAIT_SECRETARY,
      ],
    );
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/cases`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send({
          ait_id: '00000000-0000-7000-8000-0000f0000002',
          protocol_number: `S1D-${randomUUID().replaceAll('-', '')}`,
          instance: 'defesa_previa',
          circuit: 1,
          intake_channel: 'portal',
          protocolled_at: '2026-09-11T13:00:00Z',
          unit_id: RaitP402ScopeFixture.UNIT,
          documents: [],
          proofs: [],
        });
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.events).toEqual([]);
      await owner.query(
        'delete from inf.rait_case_pool_scope where case_id=$1',
        [response.body.data.id],
      );
      await owner.query('update inf.rait_case set unit_id=null where id=$1', [
        response.body.data.id,
      ]);
    } finally {
      await owner.query('delete from inf.rait_pool_member where id=$1', [
        membership,
      ]);
    }
  });
  it('secretary memberships across different legal units do not authorize an ambiguous unspecified intake unit', async () => {
    const unit = randomUUID(),
      pool = randomUUID(),
      member = randomUUID();
    await owner.query(
      `insert into inf.rait_unit(id,tenant_id,name,judging_body) values($1,$2,$3,'jari')`,
      [unit, RAIT_TENANT, `S1 distinct-unit ${unit}`],
    );
    await owner.query(
      `insert into inf.rait_pool(id,tenant_id,name,instance,circuit,strategy,unit_id)
      values($1,$2,$3,'defesa_previa',1,'pull',$4)`,
      [pool, RAIT_TENANT, `S1 distinct pool ${pool}`, unit],
    );
    await owner.query(
      `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status)
      values($1,$2,$3,$4,'secretaria','ATIVO')`,
      [member, RAIT_TENANT, pool, RAIT_SECRETARY],
    );
    const before = await effects();
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/cases`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send({
          ait_id: '00000000-0000-7000-8000-0000f0000002',
          protocol_number: `S1A-${randomUUID().replaceAll('-', '')}`,
          instance: 'defesa_previa',
          circuit: 1,
          intake_channel: 'portal',
          protocolled_at: '2026-09-11T13:00:00Z',
          documents: [],
          proofs: [],
        });
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body).not.toHaveProperty('data');
      expect(await effects()).toEqual(before);
    } finally {
      await owner.query('delete from inf.rait_pool_member where id=$1', [
        member,
      ]);
      await owner.query('delete from inf.rait_pool where id=$1', [pool]);
      await owner.query('delete from inf.rait_unit where id=$1', [unit]);
    }
  });
  it('admission preserves a revoked pool relation and its provenance without a new routing audit', async () => {
    const existing = (
      await owner.query(
        'select * from inf.rait_case_pool_scope where case_id=$1 and pool_id=$2',
        [RAIT_CASE('02'), POOL],
      )
    ).rows[0];
    const id = existing?.id ?? randomUUID();
    if (!existing)
      await owner.query(
        `insert into inf.rait_case_pool_scope(id,tenant_id,case_id,pool_id,active,authorization_ref,source_ref) values($1,$2,$3,$4,false,'r25-s1-fixture','explicit-revoked-fixture')`,
        [id, RAIT_TENANT, RAIT_CASE('02'), POOL],
      );
    else
      await owner.query(
        'update inf.rait_case_pool_scope set active=false where id=$1',
        [id],
      );
    await owner.query('update inf.rait_pool set active=false where id=$1', [
      RaitP402ScopeFixture.OTHER_POOL,
    ]);
    const revoked = (
      await owner.query('select * from inf.rait_case_pool_scope where id=$1', [
        id,
      ])
    ).rows[0];
    const before = await effects();
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/cases/${RAIT_CASE('02')}/commands/admit`)
        .set({ ...headers(), 'if-match': '"1"' })
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      expect(response.body.data).toMatchObject({
        id: RAIT_CASE('02'),
        state: 'ADMITIDO',
        version: 2,
      });
      expect(response.body.events).toHaveLength(1);
      expect(
        (
          await owner.query(
            'select * from inf.rait_case_pool_scope where id=$1',
            [id],
          )
        ).rows[0],
      ).toEqual(revoked);
      const after = await effects();
      expect(after.admitAudit - before.admitAudit).toBe(1);
      expect(after.outbox - before.outbox).toBe(1);
      expect(after.routingAudit - before.routingAudit).toBe(0);
    } finally {
      if (existing)
        await owner.query(
          'update inf.rait_case_pool_scope set active=$2 where id=$1',
          [id, existing.active],
        );
      else
        await owner.query('delete from inf.rait_case_pool_scope where id=$1', [
          id,
        ]);
      await owner.query('update inf.rait_pool set active=true where id=$1', [
        RaitP402ScopeFixture.OTHER_POOL,
      ]);
    }
  });
  for (const mode of ['legacy-missing', 'ambiguous', 'other-actor'] as const)
    it(`actor-unbound protocol replay denies ${mode} provenance without new effects or public receipt disclosure`, async () => {
      await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
      const h = headers('rait-secretary', RAIT_SECRETARY);
      const body = {
        ait_id: '00000000-0000-7000-8000-0000f0000002',
        protocol_number: `S1B-${randomUUID().replaceAll('-', '')}`,
        instance: 'defesa_previa',
        circuit: 1,
        intake_channel: 'portal',
        protocolled_at: '2026-09-11T13:00:00Z',
        unit_id: RaitP402ScopeFixture.UNIT,
        documents: [],
        proofs: [],
      };
      const first = await request(app.getHttpServer())
        .post(`${PREFIX}/cases`)
        .set(h)
        .send(body);
      expect(first.status, JSON.stringify(first.body)).toBe(200);
      const ledger = (
        await owner.query(
          'select * from integration.idempotency_keys where tenant_id=$1 and idem_key=$2',
          [RAIT_TENANT, h['idempotency-key']],
        )
      ).rows[0];
      expect(ledger).toBeDefined();
      // Main protocol hashes command plus recursively canonical payload; actor,
      // If-Match and the transport principal must not silently change these bytes.
      const canonical = Object.fromEntries(
        Object.entries(body).sort(([a], [b]) => a.localeCompare(b)),
      );
      expect(ledger.request_fingerprint).toBe(
        createHash('sha256')
          .update(JSON.stringify({ command: 'protocol', payload: canonical }))
          .digest('hex'),
      );
      const bindings = (
        await owner.query(
          `select actor_id,actor_role,details from audit.events where tenant_id=$1 and entity='integration.idempotency_keys' and entity_id=$2 and action='INF_RAIT_COMMAND_REPLAY_BIND'`,
          [RAIT_TENANT, ledger.id],
        )
      ).rows;
      expect(bindings).toHaveLength(1);
      expect(bindings[0]).toMatchObject({
        actor_id: RAIT_SECRETARY,
        actor_role: 'rait-secretary',
        details: {
          schema_version: 1,
          command: 'protocol',
          target_id: first.body.data.id,
          request_fingerprint: ledger.request_fingerprint,
        },
      });
      expect(Object.keys(bindings[0].details).sort()).toEqual([
        'command',
        'request_fingerprint',
        'schema_version',
        'target_id',
      ]);
      let temporaryMember: string | undefined;
      let temporaryActor: string | undefined;
      if (mode === 'legacy-missing') {
        h['idempotency-key'] = `s1-legacy-${randomUUID()}`;
        await owner.query(
          `insert into integration.idempotency_keys(tenant_id,idem_key,request_fingerprint,status_code,response_body,expires_at) values($1,$2,$3,$4,$5,$6)`,
          [
            RAIT_TENANT,
            h['idempotency-key'],
            ledger.request_fingerprint,
            ledger.status_code,
            ledger.response_body,
            ledger.expires_at,
          ],
        );
      } else if (mode === 'ambiguous') {
        await owner.query(
          'select audit.write($1,$2,$3,$4,$5,$6,$7,null,null,null)',
          [
            RAIT_TENANT,
            RAIT_SECRETARY,
            'rait-secretary',
            'INF_RAIT_COMMAND_REPLAY_BIND',
            'integration.idempotency_keys',
            ledger.id,
            JSON.stringify(bindings[0].details),
          ],
        );
      } else {
        temporaryMember = randomUUID();
        temporaryActor = randomUUID();
        await owner.query(
          `insert into auth.users(id,tenant_id,email,display_name) values($1,$2,$3,'S1 replay actor')`,
          [temporaryActor, RAIT_TENANT, `${temporaryActor}@fixtures.invalid`],
        );
        await owner.query(
          'insert into auth.memberships(tenant_id,user_id) values($1,$2)',
          [RAIT_TENANT, temporaryActor],
        );
        await owner.query(
          `insert into inf.rait_pool_member(id,tenant_id,pool_id,person_id,member_role,status) values($1,$2,$3,$4,'secretaria','ATIVO')`,
          [temporaryMember, RAIT_TENANT, POOL, temporaryActor],
        );
        await fixture.scope(temporaryActor, 'rait-secretary');
        headers('rait-secretary', temporaryActor);
      }
      const before = await effects();
      try {
        const response = await request(app.getHttpServer())
          .post(`${PREFIX}/cases`)
          .set(h)
          .send(body);
        expect(response.status, JSON.stringify(response.body)).toBe(409);
        expect(response.body).not.toHaveProperty('data');
        for (const secret of [
          ledger.id,
          ledger.request_fingerprint,
          first.body.data.id,
          'schema_version',
          'REPLAY_BIND',
        ])
          expect(JSON.stringify(response.body)).not.toContain(secret);
        expect(await effects()).toEqual(before);
      } finally {
        if (temporaryActor)
          await owner.query(
            "delete from inf.rait_case_read_scope where actor_id=$1 and authorization_ref='r25-s1-fixture'",
            [temporaryActor],
          );
        if (temporaryMember)
          await owner.query('delete from inf.rait_pool_member where id=$1', [
            temporaryMember,
          ]);
        if (temporaryActor) {
          await owner.query(
            'delete from auth.memberships where tenant_id=$1 and user_id=$2',
            [RAIT_TENANT, temporaryActor],
          );
          await owner.query('delete from auth.users where id=$1', [
            temporaryActor,
          ]);
        }
      }
    });
  it('a failed actor-binding receipt atomically rolls back protocol, legal audit, routing and ledger', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    await fixture.enableAuditFailure('INF_RAIT_COMMAND_REPLAY_BIND');
    const before = await effects();
    try {
      const response = await request(app.getHttpServer())
        .post(`${PREFIX}/cases`)
        .set(headers('rait-secretary', RAIT_SECRETARY))
        .send({
          ait_id: '00000000-0000-7000-8000-0000f0000002',
          protocol_number: `S1F-${randomUUID().replaceAll('-', '')}`,
          instance: 'defesa_previa',
          circuit: 1,
          intake_channel: 'portal',
          protocolled_at: '2026-09-11T13:00:00Z',
          unit_id: RaitP402ScopeFixture.UNIT,
          documents: [],
          proofs: [],
        });
      expect(response.status).toBe(500);
      expect(await fixture.auditFailureWasInvoked()).toBe(true);
      expect(await effects()).toEqual(before);
    } finally {
      await fixture.disableAuditFailure();
    }
  });
  it('protocol exact retry remains accepted after state advances with current qualified secretary purpose and no repeated effects', async () => {
    await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
    const h = headers('rait-secretary', RAIT_SECRETARY);
    const body = {
      ait_id: '00000000-0000-7000-8000-0000f0000002',
      protocol_number: `S1R-${randomUUID().replaceAll('-', '')}`,
      instance: 'defesa_previa',
      circuit: 1,
      intake_channel: 'portal',
      protocolled_at: '2026-09-11T13:00:00Z',
      unit_id: RaitP402ScopeFixture.UNIT,
      documents: [],
      proofs: [],
    };
    const first = await request(app.getHttpServer())
      .post(`${PREFIX}/cases`)
      .set(h)
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(200);
    await owner.query(
      "update inf.rait_case set state='ADMITIDO',version=2 where id=$1",
      [first.body.data.id],
    );
    const before = await effects();
    const retry = await request(app.getHttpServer())
      .post(`${PREFIX}/cases`)
      .set(h)
      .send(body);
    expect(retry.status, JSON.stringify(retry.body)).toBe(200);
    expect(retry.body).toEqual(first.body);
    expect(retry.headers.etag).toBe(first.headers.etag);
    expect(JSON.stringify(retry.body)).not.toContain('request_fingerprint');
    expect(JSON.stringify(retry.body)).not.toContain('REPLAY_BIND');
    expect(await effects()).toEqual(before);
  });
  for (const routing of ['zero', 'one', 'multiple'] as const)
    it(`admission with ${routing} qualified routing retains legal200,v+1 and one unchanged domain event`, async () => {
      const priorLinks = (
        await owner.query(
          'select id,active from inf.rait_case_pool_scope where case_id=$1',
          [RAIT_CASE('02')],
        )
      ).rows;
      // Prepare an already-authorized active relation for the one-pool control.
      // Initial insertion is independently proved by the fresh protocol cases below;
      // admission must never reactivate a revoked relation as an implicit side effect.
      const fixtureLink =
        routing === 'one'
          ? (
              await owner.query(
                `insert into inf.rait_case_pool_scope(tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
             values($1,$2,$3,true,'r25-s1-fixture','admission-positive')
             on conflict(tenant_id,case_id,pool_id) do nothing returning id`,
                [RAIT_TENANT, RAIT_CASE('02'), POOL],
              )
            ).rows[0]?.id
          : undefined;
      await owner.query(
        'update inf.rait_case_pool_scope set active=($2::boolean and pool_id=$3) where case_id=$1',
        [RAIT_CASE('02'), routing === 'one', POOL],
      );
      await owner.query('update inf.rait_pool set strategy=$2 where id=$1', [
        POOL,
        routing === 'zero' ? 'round_robin' : 'pull',
      ]);
      await owner.query('update inf.rait_pool set active=$2 where id=$1', [
        RaitP402ScopeFixture.OTHER_POOL,
        routing === 'multiple',
      ]);
      const before = await effects();
      try {
        const response = await request(app.getHttpServer())
          .post(`${PREFIX}/cases/${RAIT_CASE('02')}/commands/admit`)
          .set({ ...headers(), 'if-match': '"1"' })
          .send({});
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        expect(response.body.data).toMatchObject({
          id: RAIT_CASE('02'),
          state: 'ADMITIDO',
          version: 2,
        });
        expect(response.headers.etag).toBe('"2"');
        expect(response.body.events).toHaveLength(1);
        const after = await effects();
        expect(after.outbox - before.outbox).toBe(1);
        expect(after.admitAudit - before.admitAudit).toBe(1);
        expect(after.routingAudit - before.routingAudit).toBe(0);
        const links = await owner.query(
          'select pool_id from inf.rait_case_pool_scope where case_id=$1 and active',
          [RAIT_CASE('02')],
        );
        expect(links.rows).toEqual(
          routing === 'one' ? [{ pool_id: POOL }] : [],
        );
      } finally {
        if (fixtureLink)
          await owner.query(
            'delete from inf.rait_case_pool_scope where id=$1',
            [fixtureLink],
          );
        for (const link of priorLinks)
          await owner.query(
            'update inf.rait_case_pool_scope set active=$2 where id=$1',
            [link.id, link.active],
          );
        await owner.query(
          "update inf.rait_pool set strategy='pull' where id=$1",
          [POOL],
        );
        await owner.query(
          'update inf.rait_pool set active=true where id=any($1::uuid[])',
          [[POOL, RaitP402ScopeFixture.OTHER_POOL]],
        );
      }
    });
  for (const routing of ['zero', 'one', 'multiple'] as const)
    it(`protocol with ${routing} routing retains existing legal response/body/events and never adds admission criterion`, async () => {
      await fixture.scope(RAIT_SECRETARY, 'rait-secretary');
      await owner.query('update inf.rait_pool set strategy=$2 where id=$1', [
        POOL,
        routing === 'zero' ? 'round_robin' : 'pull',
      ]);
      await owner.query('update inf.rait_pool set active=$2 where id=$1', [
        RaitP402ScopeFixture.OTHER_POOL,
        routing === 'multiple',
      ]);
      const before = await effects();
      try {
        const response = await request(app.getHttpServer())
          .post(`${PREFIX}/cases`)
          .set(headers('rait-secretary', RAIT_SECRETARY))
          .send({
            ait_id: '00000000-0000-7000-8000-0000f0000002',
            protocol_number: `S1-${randomUUID()}`,
            instance: 'defesa_previa',
            circuit: 1,
            intake_channel: 'portal',
            protocolled_at: '2026-09-11T13:00:00Z',
            unit_id: RaitP402ScopeFixture.UNIT,
            documents: [],
            proofs: [],
          });
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        expect(response.body.data).toMatchObject({
          state: 'PROTOCOLADO',
          version: 1,
        });
        expect(response.body.events).toEqual([]);
        const id = response.body.data.id;
        const links = await owner.query(
          'select pool_id from inf.rait_case_pool_scope where case_id=$1 and active',
          [id],
        );
        expect(links.rows).toEqual(
          routing === 'one' ? [{ pool_id: POOL }] : [],
        );
        const after = await effects();
        // Baseline protocol returns events:[] and has no outbox write. Its
        // existing priority qualification, audit and idempotency remain required.
        expect(after.outbox - before.outbox).toBe(0);
        expect(after.priority - before.priority).toBe(1);
        expect(after.idem - before.idem).toBe(1);
        expect(after.protocolAudit - before.protocolAudit).toBe(1);
        expect(after.routingAudit - before.routingAudit).toBe(
          routing === 'one' ? 1 : 0,
        );
        expect(after.replayAudit - before.replayAudit).toBe(1);
        expect(after.audit - before.audit).toBe(routing === 'one' ? 3 : 2);
        // Priority proof/audit history remains immutable in this disposable DB.
        await owner.query(
          'delete from inf.rait_case_pool_scope where case_id=$1',
          [id],
        );
        await owner.query('update inf.rait_case set unit_id=null where id=$1', [
          id,
        ]);
      } finally {
        await owner.query(
          "update inf.rait_pool set strategy='pull' where id=$1",
          [POOL],
        );
        await owner.query(
          'update inf.rait_pool set active=true where id=any($1::uuid[])',
          [[POOL, RaitP402ScopeFixture.OTHER_POOL]],
        );
      }
    });
});
