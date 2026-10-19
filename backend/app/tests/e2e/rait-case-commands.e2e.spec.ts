import { createServer, type Server } from 'node:http';
import { randomUUID } from 'node:crypto';

import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { RequestContextMutator } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { DETRAN_ROLES } from '@detran/shared';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  assertDedicatedDatabaseEnvironment,
  type EvidenceScenario,
  RAIT_ACTOR,
  RAIT_AIT,
  RAIT_AUTHORITY,
  RAIT_CASE,
  RaitCaseCommandFixture,
  RAIT_INQUIRY,
  RAIT_POOL,
  RAIT_RAPPORTEUR,
  RAIT_SECRETARY,
  RAIT_TENANT,
} from '../shared/rait-case-command.fixture.js';

type Command = {
  name: string;
  path: string;
  target: string;
  body: Record<string, unknown>;
  roles: string[];
  eventCount: number;
};

const commands: Command[] = [
  {
    name: 'admit',
    path: 'cases/:id/commands/admit',
    target: RAIT_CASE('02'),
    body: {},
    roles: ['rait-analyst'],
    eventCount: 1,
  },
  {
    name: 'non-admission',
    path: 'cases/:id/commands/non-admission',
    target: RAIT_CASE('02'),
    body: { reason: 'intempestivo', legalBasis: 'Res. CONTRAN 900 art. 4' },
    roles: ['rait-analyst'],
    eventCount: 1,
  },
  {
    name: 'remit',
    path: 'cases/:id/commands/remit',
    target: RAIT_CASE('05'),
    body: {},
    roles: ['rait-secretary'],
    eventCount: 1,
  },
  {
    name: 'receive',
    path: 'cases/:id/commands/receive',
    target: RAIT_CASE('05'),
    body: { receivedOn: '2026-09-15', body: 'jari' },
    roles: ['rait-secretary'],
    eventCount: 2,
  },
  {
    name: 'ready',
    path: 'cases/:id/commands/ready',
    target: RAIT_CASE('07'),
    body: { draftId: '00000000-0000-7000-8000-000038000001' },
    roles: ['rait-analyst'],
    eventCount: 1,
  },
  {
    name: 'decide',
    path: 'cases/:id/commands/decide',
    target: RAIT_CASE('09'),
    body: {
      decisionKind: 'indeferida',
      grounds: 'Fundamentação canônica da fixture C3.',
      signatureRef: 'opaque-r7-c3-signature',
    },
    roles: ['rait-signing-authority'],
    eventCount: 1,
  },
  {
    name: 'return-draft',
    path: 'cases/:id/commands/return-draft',
    target: RAIT_CASE('09'),
    body: {
      draftId: '00000000-0000-7000-8000-000038000002',
      guidance: 'Complementar o fundamento canônico.',
    },
    roles: ['rait-signing-authority'],
    eventCount: 1,
  },
  {
    name: 'withdraw',
    path: 'cases/:id/commands/withdraw',
    target: RAIT_CASE('07'),
    body: {
      withdrawalDocumentId: '00000000-0000-7000-8000-000012000007',
    },
    roles: ['rait-secretary'],
    eventCount: 2,
  },
  {
    name: 'redirect',
    path: 'cases/:id/commands/redirect',
    target: RAIT_CASE('02'),
    body: {
      targetBody: '00000000-0000-7000-8000-0000e2000099',
      reason: 'outro_orgao_autuador',
      receiptDocumentId: '00000000-0000-7000-8000-000012000002',
    },
    roles: ['rait-secretary'],
    eventCount: 0,
  },
  {
    name: 'resolve-pending',
    path: 'cases/:id/commands/resolve-pending',
    target: RAIT_CASE('01'),
    body: {
      pendingId: '00000000-0000-7000-8000-000036000001',
      documentIds: ['00000000-0000-7000-8000-000012000001'],
    },
    roles: ['rait-secretary'],
    eventCount: 1,
  },
  {
    name: 'claim-next',
    path: 'pools/:id/claim-next',
    target: RAIT_POOL,
    body: {},
    roles: ['rait-analyst'],
    eventCount: 2,
  },
  {
    name: 'answer',
    path: 'inquiries/:id/commands/answer',
    target: RAIT_INQUIRY,
    body: {
      documentIds: ['00000000-0000-7000-8000-000012000008'],
      answeredOn: '2026-09-15',
    },
    roles: ['rait-analyst', 'rait-rapporteur'],
    eventCount: 2,
  },
  {
    name: 'extend',
    path: 'inquiries/:id/commands/extend',
    target: RAIT_INQUIRY,
    body: { reason: 'Diligência complementar canônica.' },
    roles: ['rait-analyst', 'rait-rapporteur'],
    eventCount: 2,
  },
];

const protocolPath = '/v1/inf/rait/cases';

function protocolBody(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ait_id: RAIT_AIT,
    protocol_number: `RAIT-R7-${randomUUID().replaceAll('-', '')}`,
    instance: 'defesa_previa',
    circuit: 1,
    intake_channel: 'portal',
    protocolled_at: '2026-09-15T12:00:00.000Z',
    documents: [],
    proofs: [],
    ...overrides,
  };
}

async function protocolForAdmit(
  scenario: {
    instance?: 'defesa_previa' | 'jari' | 'cetran';
    channel?: string;
    protocolledAt?: string;
  } = {},
): Promise<string> {
  const instance = scenario.instance ?? 'defesa_previa';
  const requestedChannel = scenario.channel ?? 'portal';
  const intakeChannel = ['balcao', 'portal', 'sne', 'postal'].includes(
    requestedChannel,
  )
    ? requestedChannel
    : 'portal';
  await fixture.prepareProtocolScope(instance);
  const response = await request(app.getHttpServer())
    .post(protocolPath)
    .set(headers('rait-secretary'))
    .send(
      protocolBody({
        ait_id: '00000000-0000-7000-8000-0000f0000002',
        instance,
        circuit: instance === 'defesa_previa' ? 1 : 2,
        intake_channel: intakeChannel,
        protocolled_at: scenario.protocolledAt ?? '2026-09-11T13:00:00Z',
      }),
    );
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  expect(response.body.data.id).toMatch(/^[0-9a-f-]{36}$/u);
  return response.body.data.id as string;
}

function commandPath(command: Command): string {
  return `/v1/inf/rait/${command.path.replace(':id', command.target)}`;
}

function headers(role: string) {
  process.env.DETRAN_LOCAL_ROLES = role;
  process.env.DETRAN_LOCAL_ACTOR_ID =
    role === 'rait-signing-authority'
      ? RAIT_AUTHORITY
      : role === 'rait-rapporteur'
        ? RAIT_RAPPORTEUR
        : role === 'rait-secretary'
          ? RAIT_SECRETARY
          : RAIT_ACTOR;
  return {
    authorization: 'Bearer local',
    'x-tenant-id': RAIT_TENANT,
    'if-match': '"1"',
    'idempotency-key': `r7-c3-${role}-${randomUUID()}`,
  };
}

async function persistentEffectCounts(): Promise<{
  outbox: number;
  audit: number;
  replayBindings: number;
  poolActivations: number;
  auditTotal: number;
}> {
  const result = await fixture.owner.query<{
    outbox_count: string;
    audit_count: string;
    replay_binding_count: string;
    pool_activation_count: string;
    audit_total_count: string;
  }>(
    `select
       (select count(*)::text from integration.outbox
         where tenant_id = $1 and idempotency_key like 'r7-c3-%') as outbox_count,
       (select count(*)::text from audit.events
         where tenant_id = $1 and action not in ('INF_RAIT_COMMAND_REPLAY_BIND','INF_RAIT_CASE_POOL_SCOPE_ACTIVATE')) as audit_count,
       (select count(*)::text from audit.events
         where tenant_id = $1 and action='INF_RAIT_COMMAND_REPLAY_BIND') as replay_binding_count,
       (select count(*)::text from audit.events
         where tenant_id = $1 and action='INF_RAIT_CASE_POOL_SCOPE_ACTIVATE') as pool_activation_count,
       (select count(*)::text from audit.events where tenant_id=$1) as audit_total_count`,
    [RAIT_TENANT],
  );
  return {
    outbox: Number(result.rows[0]?.outbox_count ?? 0),
    audit: Number(result.rows[0]?.audit_count ?? 0),
    replayBindings: Number(result.rows[0]?.replay_binding_count ?? 0),
    poolActivations: Number(result.rows[0]?.pool_activation_count ?? 0),
    auditTotal: Number(result.rows[0]?.audit_total_count ?? 0),
  };
}

async function casePoolScopes(caseId: string) {
  return (
    await fixture.owner.query<{
      id: string;
      tenant_id: string;
      case_id: string;
      pool_id: string;
      active: boolean;
      authorization_ref: string;
      source_ref: string;
    }>(
      `select id,tenant_id,case_id,pool_id,active,authorization_ref,source_ref
       from inf.rait_case_pool_scope where tenant_id=$1 and case_id=$2 order by id`,
      [RAIT_TENANT, caseId],
    )
  ).rows;
}

let app: INestApplication;
let fixture: RaitCaseCommandFixture;
let trustServer: Server;

// ADR0047/T0: a procedural role requires an explicit, independently sourced
// pool purpose and exact case/pool relation; null-unit fixtures stay null-unit.
const createdAnalystMemberships: string[] = [];
async function qualifyAdmitAnalyst(instance: string) {
  const inserted = await fixture.owner.query<{ id: string }>(
    `insert into inf.rait_pool_member
       (tenant_id,pool_id,person_id,member_role,status,is_substitute)
     select $1,p.id,$2,'analista','ATIVO',false from inf.rait_pool p
      where p.tenant_id=$1 and p.instance=$3 and p.unit_id is null and p.active
        and not exists(select 1 from inf.rait_pool_member m
          where m.tenant_id=$1 and m.pool_id=p.id and m.person_id=$2
            and m.member_role='analista' and m.status='ATIVO') returning id`,
    [RAIT_TENANT, RAIT_ACTOR, instance],
  );
  createdAnalystMemberships.push(...inserted.rows.map((row) => row.id));
}

// Independent inquiry parents preserve the original defence fixture and give
// each authenticated actor its own assignment in the matching legal instance.
async function qualifiedInquiry(
  role: string,
): Promise<{ target: string; documentId: string }> {
  const rapporteur = role === 'rait-rapporteur';
  const suffix = rapporteur ? '2' : '1';
  const caseId = `71000000-0000-7000-8000-00000000320${suffix}`;
  const inquiryId = `71000000-0000-7000-8000-00000000330${suffix}`;
  const documentId = `71000000-0000-7000-8000-00000000340${suffix}`;
  const actor = rapporteur ? RAIT_RAPPORTEUR : RAIT_ACTOR;
  const instance = rapporteur ? 'jari' : 'defesa_previa';
  await fixture.owner.query('begin');
  try {
    const existing = await fixture.owner.query(
      'select id from inf.rait_case where id=$1',
      [caseId],
    );
    if (!existing.rowCount) {
      await fixture.owner.query(
        `insert into inf.rait_case(id,tenant_id,ait_id,protocol_number,instance,circuit,state,intake_channel,protocolled_at,unit_id)
         select $1,tenant_id,ait_id,$2,$3,$4,'DILIGENCIA',intake_channel,protocolled_at,unit_id
           from inf.rait_case where tenant_id=$5 and id=$6`,
        [
          caseId,
          `R7-C3-INQUIRY-${suffix}`,
          instance,
          rapporteur ? 2 : 1,
          RAIT_TENANT,
          RAIT_CASE('08'),
        ],
      );
      await fixture.owner.query(
        'select inf.rait_record_initial_priority($1,$2,clock_timestamp(),$3::jsonb)',
        [caseId, RAIT_SECRETARY, '[]'],
      );
    }
    await fixture.owner.query(
      "update inf.rait_case set state='DILIGENCIA',version=1 where id=$1",
      [caseId],
    );
    await fixture.owner.query(
      `insert into inf.rait_assignment(tenant_id,case_id,pool_id,member_id,assigned_by,active)
       select $1,$2,p.id,m.id,$3,true from inf.rait_pool_member m join inf.rait_pool p on p.id=m.pool_id and p.tenant_id=m.tenant_id
        where m.tenant_id=$1 and m.person_id=$3 and m.member_role=$4 and m.status='ATIVO'
          and p.instance=$5 and p.unit_id is null and p.active
          and not exists(select 1 from inf.rait_assignment a where a.case_id=$2 and a.active)`,
      [
        RAIT_TENANT,
        caseId,
        actor,
        rapporteur ? 'relator' : 'analista',
        instance,
      ],
    );
    await fixture.owner.query(
      `insert into inf.rait_document(id,tenant_id,case_id,kind,origin,filename,storage_key,content_hash,attached_by)
       select $1,tenant_id,$2,kind,origin,filename,storage_key,content_hash,attached_by
         from inf.rait_document where id='00000000-0000-7000-8000-000012000008'
       on conflict(id) do nothing`,
      [documentId, caseId],
    );
    await fixture.owner.query(
      `insert into inf.rait_inquiry(id,tenant_id,case_id,addressee,subject,requested_at,requested_by,due_on)
       select $1,tenant_id,$2,addressee,subject,requested_at,requested_by,'2026-09-23'
         from inf.rait_inquiry where id=$3
       on conflict(id) do update set answered_at=null,answered_on=null,outcome=null,extension_count=0,due_on='2026-09-23'`,
      [inquiryId, caseId, RAIT_INQUIRY],
    );
    await fixture.owner.query(
      `insert into inf.rait_deadline(tenant_id,case_id,timer_code,start_basis,started_on,raw_due_on,due_on,business_days,extension_count,legal_basis)
       select tenant_id,$1,timer_code,start_basis,started_on,'2026-09-23','2026-09-23',business_days,0,legal_basis
         from inf.rait_deadline where case_id=$2 and timer_code='T-DIL'
       on conflict(tenant_id,case_id,timer_code) do update set due_on='2026-09-23',raw_due_on='2026-09-23',extension_count=0,satisfied_at=null`,
      [caseId, RAIT_CASE('08')],
    );
    await fixture.owner.query('commit');
  } catch (error) {
    await fixture.owner.query('rollback');
    throw error;
  }
  return { target: inquiryId, documentId };
}

async function prepareProceduralScope() {
  await fixture.owner.query(
    `insert into inf.rait_case_read_scope
       (tenant_id,actor_id,role,pool_id,active,authorization_ref)
     select $1,$2,'rait-secretary',p.id,true,'r7-c3-procedural-duty'
       from inf.rait_pool p where p.tenant_id=$1 and p.active
         and exists(select 1 from inf.rait_pool_member m
           where m.tenant_id=p.tenant_id and m.pool_id=p.id
             and m.person_id=$2 and m.member_role='secretaria' and m.status='ATIVO')
         and not exists(select 1 from inf.rait_case_read_scope rs
           where rs.tenant_id=$1 and rs.actor_id=$2 and rs.pool_id=p.id
             and rs.role='rait-secretary' and rs.active)`,
    [RAIT_TENANT, RAIT_SECRETARY],
  );
  await fixture.owner.query(
    `insert into inf.rait_case_pool_scope
       (tenant_id,case_id,pool_id,active,authorization_ref,source_ref)
     select c.tenant_id,c.id,p.id,true,'r7-c3-procedural-duty','CTG-0001 canonical fixture routing'
       from inf.rait_case c join inf.rait_pool p
         on p.tenant_id=c.tenant_id and p.instance=c.instance
           and p.unit_id is not distinct from c.unit_id and p.active
       where c.tenant_id=$1 and c.id=any($2::uuid[])
       on conflict(tenant_id,case_id,pool_id) do nothing`,
    [RAIT_TENANT, [RAIT_CASE('05'), RAIT_CASE('06'), RAIT_CASE('07')]],
  );
}

beforeAll(async () => {
  assertDedicatedDatabaseEnvironment();
  process.env.DETRAN_LOCAL_TENANT_ID = RAIT_TENANT;
  process.env.DETRAN_LOCAL_ACTOR_ID = RAIT_ACTOR;
  trustServer = createServer((incoming, outgoing) => {
    const chunks: Buffer[] = [];
    incoming.on('data', (chunk: Buffer) => chunks.push(chunk));
    incoming.on('end', () => {
      const body = chunks.length
        ? (JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<
            string,
            unknown
          >)
        : {};
      outgoing.setHeader('content-type', 'application/json');
      if (incoming.url === '/health') {
        outgoing.end(
          JSON.stringify({
            documentManifest: true,
            padesLt: true,
            tsa: true,
            withdrawalEvidence: true,
            certificateValidation: ['OCSP'],
          }),
        );
        return;
      }
      if (body.kind === 'draft-manifest') {
        outgoing.end(
          JSON.stringify({
            documentId: body.documentId,
            contentHash: body.contentHash,
            kind: 'DECISAO_DEFESA',
            sections: ['fatos', 'fundamentos', 'dispositivo'],
          }),
        );
        return;
      }
      if (body.kind === 'withdrawal-evidence') {
        outgoing.end(
          JSON.stringify({
            tenantId: body.tenantId,
            caseId: body.caseId,
            documentId: body.documentId,
            contentHash: body.contentHash,
            signerPartyId: Array.isArray(body.eligiblePartyIds)
              ? body.eligiblePartyIds[0]
              : undefined,
            verificationMethod: 'physical_verified',
            evidenceRef: 'opaque-r7-c3-withdrawal',
            verifiedAt: '2026-09-15T12:00:00.000Z',
          }),
        );
        return;
      }
      outgoing.end(
        JSON.stringify({
          signatureRef: body.signatureRef,
          documentId: body.documentId,
          contentHash: body.contentHash,
          signerPersonId: body.expectedSignerPersonId,
          documentKind: 'DECISAO_DEFESA',
          padesLevel: 'PAdES-B-LT',
          tsaAt: '2026-09-15T12:00:00.000Z',
          certificateValidationSource: 'OCSP',
          certificateValidationStatus: 'GOOD',
          certificateValidatedAt: '2026-09-15T12:00:00.000Z',
        }),
      );
    });
  });
  await new Promise<void>((resolve) =>
    trustServer.listen(0, '127.0.0.1', resolve),
  );
  const address = trustServer.address();
  if (!address || typeof address === 'string')
    throw new Error('trust server failed');
  process.env.DETRAN_DOCUMENT_TRUST_URL = `http://127.0.0.1:${address.port}/verify`;
  process.env.DETRAN_DOCUMENT_TRUST_HEALTH_URL = `http://127.0.0.1:${address.port}/health`;
  process.env.DETRAN_DOCUMENT_TRUST_TOKEN = 'test-only-r7-c3';

  fixture = new RaitCaseCommandFixture();
  await fixture.connect();
  const { AppModule } = await import('../../src/app.module.js');
  app = await NestFactory.create(AppModule.forRoot(), {
    logger: false,
    abortOnError: false,
  });
  await app.init();
});

beforeEach(async () => {
  process.env.DETRAN_LOCAL_ROLES = 'bi-analyst';
  await fixture.resetMutableState();
  await prepareProceduralScope();
});

afterAll(async () => {
  await app?.close();
  if (fixture) {
    const inquiryCases = [
      '71000000-0000-7000-8000-000000003201',
      '71000000-0000-7000-8000-000000003202',
    ];
    await fixture.owner.query(
      'delete from inf.rait_inquiry_document where inquiry_id in (select id from inf.rait_inquiry where case_id=any($1::uuid[]))',
      [inquiryCases],
    );
    await fixture.owner.query(
      'delete from inf.rait_inquiry where case_id=any($1::uuid[])',
      [inquiryCases],
    );
    await fixture.owner.query(
      'delete from inf.rait_document where case_id=any($1::uuid[])',
      [inquiryCases],
    );
    await fixture.owner.query(
      'delete from inf.rait_deadline where case_id=any($1::uuid[])',
      [inquiryCases],
    );
    await fixture.owner.query(
      'delete from inf.rait_assignment where case_id=any($1::uuid[])',
      [inquiryCases],
    );
    // Immutable priority parent/assessment receipts intentionally remain in this
    // disposable DB; restore non-claimable state for subsequent regression runs.
    await fixture.owner.query(
      "update inf.rait_case set state='DILIGENCIA',version=1 where id=any($1::uuid[])",
      [inquiryCases],
    );
    await fixture.owner.query(
      'delete from inf.rait_pool_member where id=any($1::uuid[])',
      [createdAnalystMemberships],
    );
    await fixture.owner.query(
      "delete from inf.rait_case_read_scope where authorization_ref='r7-c3-procedural-duty'",
    );
    await fixture.owner.query(
      "delete from inf.rait_case_pool_scope where authorization_ref='r7-c3-procedural-duty'",
    );
  }
  await fixture?.close();
  await new Promise<void>((resolve, reject) =>
    trustServer?.close((error) => (error ? reject(error) : resolve())),
  );
  delete process.env.DETRAN_LOCAL_ROLES;
});

describe('CTG-0001 §10.8 — HTTP real, política e PostgreSQL', () => {
  it('dado Database STYNX do app quando abre transação de comando então usa banco dedicado, role_app_backend, tenant e ator na mesma conexão', async () => {
    const database = app.get(Database);
    const mutator = app.get(RequestContextMutator);
    const identity = await mutator.runWithRequestContext(
      {
        requestId: 'r7-c3-db-identity',
        tenantId: RAIT_TENANT,
        actorId: RAIT_ACTOR,
        startedAt: new Date('2026-09-15T12:00:00.000Z'),
      },
      () =>
        database.tx(
          async (transaction) =>
            (
              await transaction.query<{
                database_name: string;
                current_user_name: string;
                current_role_name: string;
                tenant_id: string;
                actor_id: string;
              }>(
                `select current_database() as database_name,
                        current_user as current_user_name,
                        current_role as current_role_name,
                        current_setting('app.tenant_id', true) as tenant_id,
                        current_setting('app.actor_id', true) as actor_id`,
              )
            ).rows[0],
          { role: 'app' },
        ),
    );
    expect(identity).toEqual({
      database_name: 'detran_r7_ctg1_a2',
      current_user_name: 'role_app_backend',
      current_role_name: 'role_app_backend',
      tenant_id: RAIT_TENANT,
      actor_id: RAIT_ACTOR,
    });
  });

  it('dado secretaria com vínculo ativo quando protocol atravessa HTTP então cria atomicamente o intake qualificado', async () => {
    const before = await persistentEffectCounts();
    const response = await request(app.getHttpServer())
      .post(protocolPath)
      .set(headers('rait-secretary'))
      .send(protocolBody());
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.headers.etag).toMatch(/^"\d+"$/u);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('events');
    const after = await persistentEffectCounts();
    expect(after.audit - before.audit).toBe(1);
    // ADR0050 adds private replay provenance and the existing scoped routing
    // writer records activation; neither replaces the single legal audit.
    expect(after.replayBindings - before.replayBindings).toBe(1);
    expect(after.poolActivations - before.poolActivations).toBe(1);
    expect(after.auditTotal - before.auditTotal).toBe(3);
  });

  it.each(DETRAN_ROLES.filter((role) => role !== 'rait-secretary'))(
    'dado papel isolado %s quando protocol atravessa HTTP então responde 403 sem efeito persistido',
    async (role) => {
      const before = await persistentEffectCounts();
      const response = await request(app.getHttpServer())
        .post(protocolPath)
        .set(headers(role))
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body).toMatchObject({ code: 'RAIT.FORBIDDEN_ACTION' });
      expect(await persistentEffectCounts()).toEqual(before);
    },
  );

  it.each([
    ['actor', RAIT_ACTOR],
    ['actorId', RAIT_ACTOR],
    ['assessed_by', RAIT_SECRETARY],
    ['verified_by', RAIT_SECRETARY],
    ['tenant_id', RAIT_TENANT],
    ['policy', 'ADR-0024-2026-09-16'],
    ['rank', 2],
  ])(
    'dado payload que tenta controlar %s quando protocol atravessa HTTP então rejeita sem efeito persistido',
    async (field, value) => {
      const before = await persistentEffectCounts();
      const response = await request(app.getHttpServer())
        .post(protocolPath)
        .set(headers('rait-secretary'))
        .send({ ...protocolBody(), [field]: value });
      expect(response.status, JSON.stringify(response.body)).toBe(400);
      expect(await persistentEffectCounts()).toEqual(before);
    },
  );

  it('dado secretary sem vínculo do ator autenticado quando protocol atravessa HTTP então responde 403 sem efeito persistido', async () => {
    const before = await persistentEffectCounts();
    const requestHeaders = headers('rait-secretary');
    process.env.DETRAN_LOCAL_ACTOR_ID = RAIT_ACTOR;
    const response = await request(app.getHttpServer())
      .post(protocolPath)
      .set(requestHeaders)
      .send(protocolBody());
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body).toMatchObject({ code: 'RAIT.FORBIDDEN_CASE_SCOPE' });
    expect(await persistentEffectCounts()).toEqual(before);
  });

  for (const command of commands) {
    for (const role of command.roles) {
      it(`dado papel mínimo ${role} quando ${command.name} atravessa HTTP, PolicyGuard e banco então responde 200, ETag só no header e efeitos atômicos`, async () => {
        await fixture.prepareCommand(command.name);
        if (command.name === 'return-draft')
          await fixture.prepareCommand('decide');
        const inquiry = ['answer', 'extend'].includes(command.name)
          ? await qualifiedInquiry(role)
          : undefined;
        const invocation = inquiry
          ? {
              ...command,
              target: inquiry.target,
              body:
                command.name === 'answer'
                  ? { ...command.body, documentIds: [inquiry.documentId] }
                  : command.body,
            }
          : command;
        // Admission can create initial routing on a fresh database, while an
        // existing active OR revoked disposition must remain unchanged. Fix the
        // candidate precondition and expectation before invoking the handler.
        const routingBefore =
          command.name === 'admit'
            ? await casePoolScopes(command.target)
            : undefined;
        if (routingBefore) {
          const candidates = await fixture.owner.query<{ id: string }>(
            `select p.id from inf.rait_pool p join inf.rait_case c
               on c.tenant_id=p.tenant_id and c.id=$2
             where p.tenant_id=$1 and p.active and p.strategy='pull'
               and p.instance='defesa_previa' and c.instance=p.instance
               and p.unit_id is not distinct from c.unit_id order by p.id`,
            [RAIT_TENANT, command.target],
          );
          expect(candidates.rows).toEqual([{ id: RAIT_POOL }]);
        }
        const expectedRoutingActivations = routingBefore?.length === 0 ? 1 : 0;
        const before = await persistentEffectCounts();
        const response = await request(app.getHttpServer())
          .post(commandPath(invocation))
          .set(headers(role))
          .send(invocation.body);
        expect(response.status, JSON.stringify(response.body)).toBe(200);
        expect(response.headers.etag).toMatch(/^"\d+"$/u);
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('events');
        expect(response.body).not.toHaveProperty('etag');
        expect(response.body.events).toHaveLength(command.eventCount);
        const after = await persistentEffectCounts();
        expect(after.outbox - before.outbox).toBe(command.eventCount);
        expect(after.audit - before.audit).toBe(1);
        const actorBound = ['admit', 'non-admission', 'claim-next'].includes(
          command.name,
        );
        expect(after.replayBindings - before.replayBindings).toBe(
          actorBound ? 0 : 1,
        );
        expect(after.poolActivations - before.poolActivations).toBe(
          expectedRoutingActivations,
        );
        expect(after.auditTotal - before.auditTotal).toBe(
          (actorBound ? 1 : 2) + expectedRoutingActivations,
        );
        if (routingBefore) {
          const routingAfter = await casePoolScopes(command.target);
          if (expectedRoutingActivations === 0) {
            expect(routingAfter).toEqual(routingBefore);
          } else {
            expect(routingAfter).toHaveLength(1);
            expect(routingAfter[0]).toMatchObject({
              tenant_id: RAIT_TENANT,
              case_id: command.target,
              pool_id: RAIT_POOL,
              active: true,
              authorization_ref: `command:admit:${RAIT_ACTOR}`,
              source_ref: `pool:${RAIT_POOL}`,
            });
            const activation = await fixture.owner.query(
              `select actor_id,details from audit.events
                where tenant_id=$1 and action='INF_RAIT_CASE_POOL_SCOPE_ACTIVATE'
                  and entity='inf.rait_case_pool_scope' and entity_id=$2`,
              [RAIT_TENANT, routingAfter[0]!.id],
            );
            expect(activation.rows).toEqual([
              {
                actor_id: RAIT_ACTOR,
                details: {
                  caseId: command.target,
                  parentVersion: 2,
                  poolId: RAIT_POOL,
                  authorizationRef: `command:admit:${RAIT_ACTOR}`,
                  sourceRef: `pool:${RAIT_POOL}`,
                },
              },
            ]);
          }
        }
      });
    }

    it(`dado papel omitido quando ${command.name} atravessa PolicyGuard então responde 403 RAIT.FORBIDDEN_ACTION sem escrita`, async () => {
      await fixture.prepareCommand(command.name);
      const before = await persistentEffectCounts();
      const response = await request(app.getHttpServer())
        .post(commandPath(command))
        .set(headers('bi-analyst'))
        .send(command.body);
      expect(response.status, JSON.stringify(response.body)).toBe(403);
      expect(response.body).toMatchObject({
        code: 'RAIT.FORBIDDEN_ACTION',
        status: 403,
      });
      expect(await persistentEffectCounts()).toEqual(before);
    });
  }

  it('dado principal humano quando expire é chamado pela rota então permanece negado e não ganha grant', async () => {
    const response = await request(app.getHttpServer())
      .post(`/v1/inf/rait/inquiries/${RAIT_INQUIRY}/commands/expire`)
      .set(headers('rait-analyst'))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(403);
    expect(response.body).toMatchObject({ code: 'RAIT.FORBIDDEN_ACTION' });
  });
});

describe('CTG-0001 §10.9 — binding real de tempestividade de admit', () => {
  for (const scenario of [
    { instance: 'defesa_previa' as const, channel: 'balcao', code: 'T-DEF' },
    { instance: 'jari' as const, channel: 'portal', code: 'T-NP-VENC' },
    { instance: 'cetran' as const, channel: 'sne', code: 'T-R2' },
  ]) {
    it(`dado ${scenario.instance}/${scenario.channel} quando há exatamente um ${scenario.code} armado então usa a infração e admite`, async () => {
      const caseId = await protocolForAdmit(scenario);
      await fixture.prepareAdmitBinding(caseId, scenario);
      await qualifyAdmitAnalyst(scenario.instance);
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/rait/cases/${caseId}/commands/admit`)
        .set(headers('rait-analyst'))
        .send({});
      expect(response.status, JSON.stringify(response.body)).toBe(200);
      const synthetic = await fixture.owner.query<{ count: string }>(
        `select count(*)::text as count from inf.rait_deadline
          where tenant_id = $1 and case_id = $2 and timer_code = 'T-REM10'`,
        [RAIT_TENANT, RAIT_CASE('02')],
      );
      expect(Number(synthetic.rows[0]?.count ?? 0)).toBe(0);
    });
  }

  it('converte protocolled_at para dia civil America/Manaus na fronteira UTC sem usar today', async () => {
    const caseId = await protocolForAdmit({
      channel: 'portal',
      protocolledAt: '2026-09-15T02:30:00Z',
    });
    await fixture.prepareAdmitBinding(caseId, {
      channel: 'portal',
      protocolledAt: '2026-09-15T02:30:00Z',
      timezone: 'America/Manaus',
      dueOn: '2026-09-14',
    });
    const response = await request(app.getHttpServer())
      .post(`/v1/inf/rait/cases/${caseId}/commands/admit`)
      .set(headers('rait-analyst'))
      .send({});
    expect(response.status, JSON.stringify(response.body)).toBe(200);
  });

  for (const scenario of [
    { label: 'timer ausente', fixture: { timer: 'missing' as const } },
    { label: 'timer fechado', fixture: { timer: 'closed' as const } },
    {
      label: 'timers armados múltiplos',
      fixture: { timer: 'multiple' as const },
    },
    { label: 'canal postal', fixture: { channel: 'postal' } },
    { label: 'canal não suportado', fixture: { channel: 'carrier-pigeon' } },
    { label: 'timezone vazio', fixture: { timezone: '' } },
    { label: 'timezone IANA inválido', fixture: { timezone: 'Mars/Olympus' } },
  ]) {
    it(`dado ${scenario.label} quando admit é solicitado então bloqueia sem efeito parcial`, async () => {
      const caseId = await protocolForAdmit(scenario.fixture);
      await fixture.prepareAdmitBinding(caseId, scenario.fixture);
      const before = await persistentEffectCounts();
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/rait/cases/${caseId}/commands/admit`)
        .set(headers('rait-analyst'))
        .send({});
      expect(response.status, JSON.stringify(response.body)).not.toBe(200);
      expect(await persistentEffectCounts()).toEqual(before);
    });
  }
});

describe('CTG-0001 §10.9 — auditoria transacional e replay HTTP', () => {
  const nonAdmissionPath = `/v1/inf/rait/cases/${RAIT_CASE('02')}/commands/non-admission`;
  const nonAdmissionBody = {
    reason: 'intempestivo',
    legalBasis: 'Res. CONTRAN 900 art. 4',
  };

  async function caseSnapshot() {
    const result = await fixture.owner.query<{
      state: string;
      version: number;
    }>(
      `select state, version from inf.rait_case
        where tenant_id = $1 and id = $2`,
      [RAIT_TENANT, RAIT_CASE('02')],
    );
    return result.rows[0];
  }

  for (const mode of ['serial', 'parallel'] as const) {
    it(`dado replay ${mode} com a mesma chave quando o comando completa então persiste uma única auditoria/outbox/versão`, async () => {
      await fixture.prepareCommand('non-admission');
      const beforeEffects = await persistentEffectCounts();
      const requestHeaders = {
        ...headers('rait-analyst'),
        'idempotency-key': `r7-c3-replay-${mode}`,
      };
      const invoke = () =>
        request(app.getHttpServer())
          .post(nonAdmissionPath)
          .set(requestHeaders)
          .send(nonAdmissionBody);
      const responses =
        mode === 'serial'
          ? [await invoke(), await invoke()]
          : await Promise.all([invoke(), invoke()]);

      expect(
        responses.map((response) => response.status),
        JSON.stringify(responses.map((response) => response.body)),
      ).toEqual([200, 200]);
      expect(responses[1]?.body).toEqual(responses[0]?.body);
      const afterEffects = await persistentEffectCounts();
      expect(afterEffects.outbox - beforeEffects.outbox).toBe(1);
      expect(afterEffects.audit - beforeEffects.audit).toBe(1);
      expect(afterEffects.replayBindings - beforeEffects.replayBindings).toBe(
        0,
      );
      expect(afterEffects.poolActivations - beforeEffects.poolActivations).toBe(
        0,
      );
      expect(afterEffects.auditTotal - beforeEffects.auditTotal).toBe(1);
      await expect(caseSnapshot()).resolves.toMatchObject({
        state: 'NAO_CONHECIDO',
        version: 2,
      });
    });
  }

  it('dado audit.write falhando após a primeira escrita quando comando executa então domínio/outbox/ledger/audit sofrem rollback', async () => {
    await fixture.prepareCommand('non-admission');
    const key = 'r7-c3-audit-failure';
    const beforeCase = await caseSnapshot();
    const beforeEffects = await persistentEffectCounts();
    await fixture.enableAuditFailure();
    let response: { status: number; body: unknown } | undefined;
    let auditAttempted = false;
    try {
      response = await request(app.getHttpServer())
        .post(nonAdmissionPath)
        .set({ ...headers('rait-analyst'), 'idempotency-key': key })
        .send(nonAdmissionBody);
      auditAttempted = await fixture.auditFailureWasInvoked();
    } finally {
      await fixture.disableAuditFailure();
    }

    expect(auditAttempted).toBe(true);
    expect(response?.status).toBeGreaterThanOrEqual(500);
    await expect(caseSnapshot()).resolves.toEqual(beforeCase);
    expect(await persistentEffectCounts()).toEqual(beforeEffects);
    const ledger = await fixture.owner.query<{ count: string }>(
      `select count(*)::text as count from integration.idempotency_keys
        where tenant_id = $1 and idem_key = $2`,
      [RAIT_TENANT, key],
    );
    expect(Number(ledger.rows[0]?.count ?? 0)).toBe(0);
  });
});

const evidenceScenarios: Array<{
  scenario: EvidenceScenario;
  teatMissing: boolean;
}> = [
  { scenario: 'empty', teatMissing: true },
  { scenario: 'valid-optional', teatMissing: false },
  { scenario: 'invalid-optional', teatMissing: true },
  { scenario: 'mandatory-cross-tenant', teatMissing: true },
  { scenario: 'mandatory-invalid', teatMissing: true },
  { scenario: 'mandatory-all-valid', teatMissing: false },
  { scenario: 'valid-plus-invalid-mandatory', teatMissing: true },
  { scenario: 'wrong-entity', teatMissing: true },
  { scenario: 'blank-storage', teatMissing: true },
  { scenario: 'packaged-valid', teatMissing: false },
];

describe('OD-R7-FJ0-001 — 10 categorias reais e isoladas de TEAT_EVIDENCE', () => {
  for (const item of evidenceScenarios) {
    it(`dado cenário ${item.scenario} quando remit valida F-J-0 então TEAT_EVIDENCE ${item.teatMissing ? 'bloqueia' : 'satisfaz'} o piso fail-closed`, async () => {
      await fixture.prepareCommand('remit');
      await fixture.evidenceScenario(item.scenario);
      const response = await request(app.getHttpServer())
        .post(`/v1/inf/rait/cases/${RAIT_CASE('05')}/commands/remit`)
        .set(headers('rait-secretary'))
        .send({});
      const missing = Array.isArray(response.body?.context?.missing)
        ? (response.body.context.missing as string[])
        : [];
      expect(missing.includes('TEAT_EVIDENCE')).toBe(item.teatMissing);
      if (item.teatMissing) {
        expect(response.status).toBe(422);
        expect(response.body.code).toBe('RAIT.REMIT_CHECKLIST_INCOMPLETE');
      }
    });
  }
});
