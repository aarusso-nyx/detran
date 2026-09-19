import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  AITS,
  CPF,
  EXTERNAL,
  LOCAL,
  SNE_EFFECTS,
  TENANT_ID,
  anonymousHeaders,
  asOwner,
  auditRows,
  clearCitizenEnv,
  cpfHash,
  createPortalApp,
  headers,
  importModule,
  newClient,
  resetLocalPortalRows,
  seedLocalParameters,
  seedLocalTenant,
  setCitizen,
  subjectIdOf,
} from './portal-e2e.support.js';

/**
 * R-0009 CTG-0002 §2.2, §2.4, §2.5, §2.6, §2.8, §6, §8 e §13 (TASK-0006) —
 * C-0002-72…81: fronteira de TASK-0008 (autuações §4, caixa/SNE §6,
 * documentos/veículos/sinistros/exames §7, atendimento §8) pelo `AppModule`
 * real com `PORTAL_NATIONAL_READ_PORTS` falso (§8 "teste") e `PortalClock`
 * fixo. Fica vermelho até TASK-0008 montar os controladores de §14 e a
 * autenticação oportunista de `POST manifestations` (§2.8, A4(b)).
 *
 * Fixtures do tenant local (§12): sujeitos via `GET me` (M22); 7 linhas de
 * `infraction_view` com o cpf_hash do CPF de teste (cópia das 7 canônicas, uma
 * por situation); caixa (1 sne, 1 portal, 1 de outro sujeito); manifestações
 * em CIENCIA_AO_USUARIO, EM_ANALISE e AVALIACAO_OFERECIDA; crash_view e
 * exam_view 1 linha; vínculos inseridos no momento em que cada critério os pede.
 */
const client = newClient();
let app: INestApplication;
const subjects = { prata: '', ouro: '', bronze: '' };
const prata = { cpf: CPF.prata, level: 'avancada' as const };
const ouro = { cpf: CPF.ouro, level: 'avancada' as const };
const bronze = { cpf: CPF.bronze, level: 'simples' as const };
const SCORES = {
  satisfaction: 5,
  quality: 4,
  deadline: 5,
  clarity: 4,
  channel: 5,
};

const ports = {
  cdt: {
    getCitizenLicense: vi.fn(async (_cpf: string) => ({
      license: { category: 'B', status: 'fixture' },
    })),
    listCitizenVehicles: vi.fn(async (_cpf: string) => ({
      items: [{ plate: 'FIX2EE1', renavam: '00000000001' }],
    })),
    getPaymentQuote: vi.fn(async () => ({ tiers: [] })),
  },
  renach: { findDriverByCpf: vi.fn(async () => null) },
  wsdenatranRead: {
    findVehicleByPlate: vi.fn(async () => null),
    findVehicleByRenavam: vi.fn(async () => null),
  },
};

/** CTG-0001 §10.8 — as 7 linhas de infraction_view (uma por situation), com o cpf_hash da prata. */
const VIEW_ROWS = [
  [1, AITS.f2, '2026-05-01', 'aguardando_defesa', 'none'],
  [2, AITS.f3, '2026-05-02', 'em_defesa', 'em_disputa'],
  [3, AITS.f5, '2026-05-03', 'penalidade_aplicada', 'definitivo'],
  [4, AITS.f6, '2026-05-04', 'em_recurso', 'em_disputa'],
  [5, AITS.f9, '2026-05-05', 'encerrada', 'definitivo'],
  [6, AITS.f12, '2026-05-06', 'cancelada', 'none'],
  [7, AITS.f10, '2026-05-07', 'arquivada', 'none'],
] as const;

function api() {
  return request(app.getHttpServer());
}

async function insertEntitlement(
  nn: number,
  subjectId: string,
  targetKind: string,
  targetId: string,
): Promise<void> {
  await asOwner(client);
  await client.query(
    `insert into portal.entitlement (id, tenant_id, subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
     values ($1, $2, $3, $4, $5, 'owner', 'manual', '2026-01-01', null)
     on conflict (id) do update set subject_id = excluded.subject_id, target_id = excluded.target_id`,
    [LOCAL.entitlement(nn), TENANT_ID, subjectId, targetKind, targetId],
  );
}

beforeAll(async () => {
  process.env.DETRAN_RUNTIME_PROFILE = 'test';
  process.env.DETRAN_LOCAL_ROLES = 'CIDADAO';
  await client.connect();
  await seedLocalTenant(client);
  await seedLocalParameters(client);
  await resetLocalPortalRows(client);

  const projections = (await importModule('@detran/portal-projections')) as {
    PORTAL_NATIONAL_READ_PORTS: symbol;
  };
  app = await createPortalApp([
    { token: projections.PORTAL_NATIONAL_READ_PORTS, value: ports },
  ]);
  subjects.prata = await subjectIdOf(app, prata);
  subjects.ouro = await subjectIdOf(app, ouro);
  subjects.bronze = await subjectIdOf(app, bronze);

  await asOwner(client);
  for (const [nn, aitId, occurredOn, situation, pointsStatus] of VIEW_ROWS) {
    await client.query(
      `insert into portal.infraction_view (id, tenant_id, ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount, situation, deadlines_json, points_status, actions_json, notices_json, payment_json, last_event_id, last_event_version)
       values ($1, $2, $3, $4, $5, $6, $7::timestamptz, 'fixture', 195.23, $8, '[]'::jsonb, $9, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '00000000-0000-0000-0000-000000000000', 0)`,
      [
        LOCAL.infractionView(nn),
        TENANT_ID,
        aitId,
        cpfHash(CPF.prata),
        `FIX-00000e${nn}`,
        `FIX2E0${nn}`,
        `${occurredOn}T12:00:00-04:00`,
        situation,
        pointsStatus,
      ],
    );
  }
  await client.query(
    `insert into portal.inbox_item (id, tenant_id, subject_id, kind, action_required, source, source_event_id, subject_line, summary, ait_id, request_id, available_on, read_on, fictitious_acknowledgement_on, deadline_due_on, deadline_owned_by)
     values
       ($1, $4, $5, 'SNE', true, 'sne', $7, 'Notificação de autuação disponível', 'fixture', $10, null, '2026-09-01', null, '2026-10-01', '2026-10-01', 'citizen'),
       ($2, $4, $5, 'PROCESSO', false, 'portal', $8, 'Pedido em andamento', 'fixture', null, null, '2026-09-10', '2026-09-11', null, null, null),
       ($3, $4, $6, 'SISTEMA', false, 'portal', $9, 'Item de outro sujeito', 'fixture', null, null, '2026-09-12', null, null, null, null)`,
    [
      LOCAL.inboxSne,
      LOCAL.inboxPortal,
      LOCAL.inboxOther,
      TENANT_ID,
      subjects.prata,
      subjects.ouro,
      LOCAL.sourceEvent(1),
      LOCAL.sourceEvent(2),
      LOCAL.sourceEvent(3),
      AITS.f2,
    ],
  );
  await client.query(
    `insert into portal.manifestation (id, tenant_id, state, kind, confidential, anonymous, subject_id, text, protocol, received_at, agency_due_on, decided_at, decision_text, version)
     values
       ($1, $4, 'CIENCIA_AO_USUARIO', 'elogio', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000001', '2026-08-10T12:00:00-04:00', '2026-09-09', '2026-09-01T12:00:00-04:00', 'fixture', 1),
       ($2, $4, 'EM_ANALISE', 'sugestao', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000002', '2026-09-01T12:00:00-04:00', '2026-10-01', null, null, 1),
       ($3, $4, 'AVALIACAO_OFERECIDA', 'reclamacao', false, false, $5, 'fixture', 'LOCAL-E2E-2026-9000003', '2026-07-10T12:00:00-04:00', '2026-08-09', '2026-08-01T12:00:00-04:00', 'fixture', 1)`,
    [
      LOCAL.manifestationCiencia,
      LOCAL.manifestationEmAnalise,
      LOCAL.manifestationOferecida,
      TENANT_ID,
      subjects.prata,
    ],
  );
  await client.query(
    `insert into portal.crash_view (id, tenant_id, crash_id, subject_cpf_hash, state_label, summary_json, third_party_fields_suppressed, last_event_id)
     values ($1, $2, $3, $4, 'fixture', '{}'::jsonb, true, '00000000-0000-0000-0000-000000000000')`,
    [LOCAL.crashView, TENANT_ID, EXTERNAL.crash, cpfHash(CPF.prata)],
  );
  await client.query(
    `insert into portal.exam_view (id, tenant_id, exam_id, subject_cpf_hash, legal_label, valid_until, board_due_on, last_event_id)
     values ($1, $2, $3, $4, 'fixture', '2027-01-01', null, '00000000-0000-0000-0000-000000000000')`,
    [LOCAL.examView, TENANT_ID, EXTERNAL.exam, cpfHash(CPF.prata)],
  );
}, 60_000);

afterEach(() => {
  clearCitizenEnv();
  vi.clearAllMocks();
});

afterAll(async () => {
  await app?.close();
  // TASK-0006 iteração 4: sem isto, os `inbox_item`/`manifestation`/`entitlement`/…
  // do tenant local inseridos acima (subjects prata/ouro/bronze) sobrevivem à
  // execução e, numa 2ª rodada de `test:e2e` sem reseed, `portal-identity.e2e.spec.ts`
  // C-0001-41 (`delete from portal.subject`) viola `fk_portal_inbox_item_subject`
  // ao apagar o sujeito ouro (`LOCAL.inboxOther` ainda o referencia). Reusa o
  // helper genérico já chamado no `beforeAll` (idempotente contra banco
  // persistente; não toca `portal.subject`/`act_level_policy`/`service_catalog`/
  // brand/hostname — seguro mesmo com `portal-stream.e2e.spec.ts` rodando depois,
  // que já reseta o próprio estado no seu `beforeAll`).
  await resetLocalPortalRows(client);
  await client.end();
  delete process.env.DETRAN_LOCAL_ROLES;
  delete process.env.DETRAN_LOCAL_ASSURANCE_LEVEL;
  delete process.env.DETRAN_LOCAL_CPF;
  delete process.env.DETRAN_LOCAL_GOVBR_LEVEL;
  delete process.env.DETRAN_PORTAL_HOST_RESOLUTION;
});

describe('CTG-0002 §2.2 — autuações (C-0002-72, C-0002-73)', () => {
  it("C-0002-72 — dado infraction_view (7 linhas do tenant local) quando GET aits então total 7 em ordem occurred_at desc; ?status=em_recurso então 1; ?vehicle=FIX2E02 então 1; ?status=xyz então 400 ENUM_INVALID { field:'status' }; ?page=2&pageSize=5 então 2 itens", async () => {
    setCitizen(prata);
    const all = await api().get('/v1/portal/aits').set(headers());
    expect(all.status, JSON.stringify(all.body)).toBe(200);
    expect(all.body).toMatchObject({ total: 7, page: 1, pageSize: 20 });
    expect(all.body.items).toHaveLength(7);
    expect(all.body.items.map((item: { plate: string }) => item.plate)).toEqual(
      [
        'FIX2E07',
        'FIX2E06',
        'FIX2E05',
        'FIX2E04',
        'FIX2E03',
        'FIX2E02',
        'FIX2E01',
      ],
    );
    expect(all.body.items[0]).toMatchObject({
      aitId: AITS.f10,
      aitNumber: 'FIX-00000e7',
      situation: 'arquivada',
      pointsStatus: 'none',
      amount: 195.23,
      framingLabel: 'fixture',
      deadlines: [],
      actions: [],
    });
    expect(JSON.stringify(all.body)).not.toMatch(
      /AIT_LAVRADO|NOTIFICADO_AUTUACAO|INSTANCIA_ENCERRADA/,
    );

    const appealing = await api()
      .get('/v1/portal/aits?status=em_recurso')
      .set(headers());
    expect(appealing.status).toBe(200);
    expect(
      appealing.body.items.map((item: { aitId: string }) => item.aitId),
    ).toEqual([AITS.f6]);
    expect(appealing.body.total).toBe(1);

    const byPlate = await api()
      .get('/v1/portal/aits?vehicle=FIX2E02')
      .set(headers());
    expect(byPlate.status).toBe(200);
    expect(
      byPlate.body.items.map((item: { aitId: string }) => item.aitId),
    ).toEqual([AITS.f3]);

    const badStatus = await api()
      .get('/v1/portal/aits?status=xyz')
      .set(headers());
    expect(badStatus.status, JSON.stringify(badStatus.body)).toBe(400);
    expect(badStatus.body.code).toBe('PORTAL.ENUM_INVALID');
    expect(badStatus.body.context).toMatchObject({ field: 'status' });
    expect(badStatus.body.context.allowed).toEqual(
      expect.arrayContaining(['aguardando_defesa', 'em_recurso', 'arquivada']),
    );

    const paged = await api()
      .get('/v1/portal/aits?page=2&pageSize=5')
      .set(headers());
    expect(paged.status).toBe(200);
    expect(paged.body).toMatchObject({ total: 7, page: 2, pageSize: 5 });
    expect(paged.body.items).toHaveLength(2);

    setCitizen(bronze);
    const none = await api().get('/v1/portal/aits').set(headers());
    expect(none.status).toBe(200);
    expect(none.body).toMatchObject({ items: [], total: 0 });
  });

  it("C-0002-73 — dado GET aits/{…f0000002} sem entitlement então 404 { kind:'ait' }; com entitlement então 200 com notices [], payment default, openRequestId null, evidenceAvailable false; GET aits/{id}/points então { pointsStatus:'none', points:null }; GET points-summary sem linha então zeros; com linha então valores", async () => {
    setCitizen(prata);
    const notEntitled = await api()
      .get(`/v1/portal/aits/${AITS.f2}`)
      .set(headers());
    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
    expect(notEntitled.body.code).toBe('PORTAL.NOT_FOUND');
    expect(notEntitled.body.context).toEqual({ kind: 'ait' });

    const badId = await api().get('/v1/portal/aits/nao-uuid').set(headers());
    expect(badId.status).toBe(400);
    expect(badId.body.context).toEqual({ fields: ['aitId'] });

    await insertEntitlement(1, subjects.prata, 'ait', AITS.f2);
    const detail = await api().get(`/v1/portal/aits/${AITS.f2}`).set(headers());
    expect(detail.status, JSON.stringify(detail.body)).toBe(200);
    expect(detail.body).toMatchObject({
      aitId: AITS.f2,
      aitNumber: 'FIX-00000e1',
      plate: 'FIX2E01',
      situation: 'aguardando_defesa',
      notices: [],
      payment: { tiers: [], paid: false, paidTier: null },
      openRequestId: null,
      evidenceAvailable: false,
    });

    // vínculo sem linha na projeção → 404 (M10: mesma resposta)
    await insertEntitlement(2, subjects.prata, 'ait', AITS.f1);
    const noView = await api().get(`/v1/portal/aits/${AITS.f1}`).set(headers());
    expect(noView.status, JSON.stringify(noView.body)).toBe(404);
    expect(noView.body.context).toEqual({ kind: 'ait' });

    const points = await api()
      .get(`/v1/portal/aits/${AITS.f2}/points`)
      .set(headers());
    expect(points.status, JSON.stringify(points.body)).toBe(200);
    expect(points.body).toEqual({
      aitId: AITS.f2,
      pointsStatus: 'none',
      points: null,
    });

    const emptySummary = await api()
      .get('/v1/portal/points-summary')
      .set(headers());
    expect(emptySummary.status, JSON.stringify(emptySummary.body)).toBe(200);
    expect(emptySummary.body).toEqual({
      definitivePoints: 0,
      disputedPoints: 0,
      byVehicle: [],
      last12Months: [],
      cachedAt: null,
    });

    await asOwner(client);
    await client.query(
      `insert into portal.points_view (id, tenant_id, subject_cpf_hash, definitive_points, disputed_points, by_vehicle_json, last_12_months_json, last_event_id, cached_at)
       values ($1, $2, $3, 3, 4, '[{"plate":"FIX2E01","points":3}]'::jsonb, '[]'::jsonb, null, '2026-09-14T12:00:00-04:00')`,
      [LOCAL.pointsView, TENANT_ID, cpfHash(CPF.prata)],
    );
    const summary = await api().get('/v1/portal/points-summary').set(headers());
    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({
      definitivePoints: 3,
      disputedPoints: 4,
      byVehicle: [{ plate: 'FIX2E01', points: 3 }],
      last12Months: [],
    });
    expect(new Date(summary.body.cachedAt).toISOString()).toBe(
      '2026-09-14T16:00:00.000Z',
    );
  });
});

describe('CTG-0002 §2.4/§6 — caixa, SNE e push (C-0002-74, C-0002-75, C-0002-76)', () => {
  it('C-0002-74 — dado inbox_item sne e portal do sujeito quando GET inbox então 2 itens com kind derivado e fictitiousAcknowledgementOn só no sne; ?kind=informativo então 1; POST inbox/{sne}/read então acknowledgementEvidence; de novo então mesma resposta e 1 evidência; item de outro sujeito então 404', async () => {
    setCitizen(prata);
    const list = await api().get('/v1/portal/inbox').set(headers());
    expect(list.status, JSON.stringify(list.body)).toBe(200);
    expect(list.body.total).toBe(2);
    expect(list.body.items.map((item: { id: string }) => item.id)).toEqual([
      LOCAL.inboxPortal,
      LOCAL.inboxSne,
    ]);
    expect(list.body.items[1]).toMatchObject({
      id: LOCAL.inboxSne,
      kind: 'acao_necessaria',
      category: 'SNE',
      source: 'sne',
      aitId: AITS.f2,
      availableOn: '2026-09-01',
      readOn: null,
      fictitiousAcknowledgementOn: '2026-10-01',
      deadline: { dueOn: '2026-10-01', ownedBy: 'citizen' },
    });
    expect(list.body.items[0]).toMatchObject({
      id: LOCAL.inboxPortal,
      kind: 'informativo',
      category: 'PROCESSO',
      source: 'portal',
      readOn: '2026-09-11',
      fictitiousAcknowledgementOn: null,
      deadline: null,
    });

    const informative = await api()
      .get('/v1/portal/inbox?kind=informativo')
      .set(headers());
    expect(informative.status).toBe(200);
    expect(
      informative.body.items.map((item: { id: string }) => item.id),
    ).toEqual([LOCAL.inboxPortal]);
    const unread = await api()
      .get('/v1/portal/inbox?read=false')
      .set(headers());
    expect(unread.body.items.map((item: { id: string }) => item.id)).toEqual([
      LOCAL.inboxSne,
    ]);
    const badKind = await api().get('/v1/portal/inbox?kind=xyz').set(headers());
    expect(badKind.status).toBe(400);
    expect(badKind.body.code).toBe('PORTAL.ENUM_INVALID');
    expect(badKind.body.context).toMatchObject({
      field: 'kind',
      allowed: ['acao_necessaria', 'informativo'],
    });

    const read = await api()
      .post(`/v1/portal/inbox/${LOCAL.inboxSne}/read`)
      .set(headers())
      .send({});
    expect(read.status, JSON.stringify(read.body)).toBe(200);
    expect(read.body).toMatchObject({
      id: LOCAL.inboxSne,
      readOn: '2026-09-14',
    });
    expect(read.body.acknowledgementEvidence).toBeTruthy();
    expect(String(read.body.acknowledgementEvidence.displayedSha256)).toMatch(
      /^[0-9a-f]{64}$/,
    );

    const again = await api()
      .post(`/v1/portal/inbox/${LOCAL.inboxSne}/read`)
      .set(headers())
      .send({});
    expect(again.status).toBe(200);
    expect(again.body).toEqual(read.body);
    await asOwner(client);
    const evidence = await client.query(
      `select id from portal.acknowledgement_evidence where tenant_id = $1 and inbox_item_id = $2`,
      [TENANT_ID, LOCAL.inboxSne],
    );
    expect(evidence.rows).toHaveLength(1);
    const events = await client.query<{ topic: string; count: string }>(
      `select topic, count(*)::text as count from integration.outbox where tenant_id = $1 and aggregate_id = $2 group by topic order by topic`,
      [TENANT_ID, LOCAL.inboxSne],
    );
    expect(events.rows.map((row) => row.count)).toEqual(['1', '1']);

    const foreign = await api()
      .post(`/v1/portal/inbox/${LOCAL.inboxOther}/read`)
      .set(headers())
      .send({});
    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
    expect(foreign.body.context).toEqual({ kind: 'inbox_item' });
  });

  it('C-0002-75 — dado GET sne/enrollment sem linha então { enrolled:false, cancelable:false }; POST sem email/phone então 422 SNE_CONTACT_REQUIRED; com email e os 4 efeitos então 201; de novo então 409 SNE_ALREADY_ENROLLED; DELETE então 200; DELETE de novo então 409 SNE_NOT_ENROLLED; simples então 403; sem Idempotency-Key então 400', async () => {
    setCitizen(prata);
    const before = await api().get('/v1/portal/sne/enrollment').set(headers());
    expect(before.status, JSON.stringify(before.body)).toBe(200);
    expect(before.body).toEqual({
      enrolled: false,
      since: null,
      channel: null,
      cancelable: false,
    });

    const consent = { textVersion: '1', effectsAck: [...SNE_EFFECTS] };
    const noContact = await api()
      .post('/v1/portal/sne/enrollment')
      .set(headers())
      .send({ consent });
    expect(noContact.status, JSON.stringify(noContact.body)).toBe(422);
    expect(noContact.body.code).toBe('PORTAL.SNE_CONTACT_REQUIRED');
    expect(noContact.body.context).toEqual({ missing: ['email', 'phone'] });

    const enrolled = await api()
      .post('/v1/portal/sne/enrollment')
      .set(headers())
      .send({ email: 'prata@local-e2e.invalid', channel: 'email', consent });
    expect(enrolled.status, JSON.stringify(enrolled.body)).toBe(201);
    expect(enrolled.body).toMatchObject({
      enrolled: true,
      channel: 'email',
      cancelable: true,
    });
    expect(String(enrolled.body.since).slice(0, 10)).toBe('2026-09-14');

    const twice = await api()
      .post('/v1/portal/sne/enrollment')
      .set(headers())
      .send({ email: 'prata@local-e2e.invalid', consent });
    expect(twice.status, JSON.stringify(twice.body)).toBe(409);
    expect(twice.body.code).toBe('PORTAL.SNE_ALREADY_ENROLLED');

    const cancelled = await api()
      .delete('/v1/portal/sne/enrollment')
      .set(headers())
      .send({ reason: 'teste' });
    expect(cancelled.status, JSON.stringify(cancelled.body)).toBe(200);
    expect(cancelled.body).toMatchObject({
      enrolled: false,
      since: null,
      cancelable: false,
    });
    expect(String(cancelled.body.cancelledAt).slice(0, 10)).toBe('2026-09-14');

    const cancelledAgain = await api()
      .delete('/v1/portal/sne/enrollment')
      .set(headers())
      .send({});
    expect(cancelledAgain.status, JSON.stringify(cancelledAgain.body)).toBe(
      409,
    );
    expect(cancelledAgain.body.code).toBe('PORTAL.SNE_NOT_ENROLLED');

    setCitizen(bronze);
    const insufficient = await api()
      .post('/v1/portal/sne/enrollment')
      .set(headers())
      .send({ email: 'bronze@local-e2e.invalid', consent });
    expect(insufficient.status, JSON.stringify(insufficient.body)).toBe(403);
    expect(insufficient.body.code).toBe('PORTAL.ASSURANCE_INSUFFICIENT');
    expect(insufficient.body.context).toMatchObject({
      actKey: 'adesao_sne',
      resumeRoute: '/v1/portal/sne/enrollment',
    });

    setCitizen(prata);
    const withoutKey = await api()
      .post('/v1/portal/sne/enrollment')
      .set({ authorization: 'Bearer local', 'x-tenant-id': TENANT_ID })
      .send({ email: 'prata@local-e2e.invalid', consent });
    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });

    await asOwner(client);
    const events = await client.query<{
      payload: { domainEvent: string; aggregate: { version: number } };
    }>(
      `select payload from integration.outbox where tenant_id = $1 and topic = $2 order by created_at, id`,
      [TENANT_ID, 'portal.sne-enrollment.changed'],
    );
    expect(
      events.rows.map((row) => [
        row.payload.domainEvent,
        row.payload.aggregate.version,
      ]),
    ).toEqual([
      ['SNE_ADESAO_SOLICITADA', 1],
      ['SNE_CANCELAMENTO_SOLICITADO', 2],
    ]);
  });

  it('C-0002-76 — dado POST push-subscriptions { endpoint, keys } duas vezes então 201 e uma única linha por endpoint', async () => {
    setCitizen(prata);
    const body = {
      endpoint: 'https://push.local-e2e.invalid/sub/e2e-1',
      keys: { p256dh: 'p', auth: 'a' },
    };
    const first = await api()
      .post('/v1/portal/push-subscriptions')
      .set(headers())
      .send(body);
    expect(first.status, JSON.stringify(first.body)).toBe(201);
    expect(first.body).toMatchObject({ endpoint: body.endpoint });
    expect(typeof first.body.id).toBe('string');
    const second = await api()
      .post('/v1/portal/push-subscriptions')
      .set(headers())
      .send(body);
    expect(second.status, JSON.stringify(second.body)).toBe(201);
    await asOwner(client);
    const rows = await client.query(
      `select id, subject_id from portal.push_subscription where tenant_id = $1 and endpoint = $2`,
      [TENANT_ID, body.endpoint],
    );
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0]).toMatchObject({ subject_id: subjects.prata });

    const invalid = await api()
      .post('/v1/portal/push-subscriptions')
      .set(headers())
      .send({ endpoint: 'nao-e-url', keys: { p256dh: 'p', auth: 'a' } });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe('PORTAL.VALIDATION_FAILED');
  });
});

describe('CTG-0002 §2.5/§8 — documentos, veículos, sinistros, exames (C-0002-77, C-0002-78)', () => {
  it("C-0002-77 — dado PORTAL_NATIONAL_READ_PORTS falso quando GET documents/cnh então 200 { license, cachedAt, category:'C' }; ?documentBytes=true então 422; GET vehicles então 200 { items, cachedAt }; clearance com vínculo então 503; sem vínculo então 404 { kind:'vehicle' }; crlv-e então 422; auditoria gravada", async () => {
    setCitizen(prata);
    const cnh = await api().get('/v1/portal/documents/cnh').set(headers());
    expect(cnh.status, JSON.stringify(cnh.body)).toBe(200);
    expect(cnh.body).toMatchObject({
      // A20: forma normalizada (CTG-0004 §3) substitui o repasse bruto de R-0009.
      license: {
        status: null,
        validUntil: null,
        categories: [],
        restrictions: [],
      },
      qrVerification: null,
      documentBytes: null,
      category: 'C',
    });
    expect(typeof cnh.body.cachedAt).toBe('string');
    expect(ports.cdt.getCitizenLicense).toHaveBeenCalledWith(CPF.prata);
    const cached = await api().get('/v1/portal/documents/cnh').set(headers());
    expect(cached.status).toBe(200);
    expect(ports.cdt.getCitizenLicense).toHaveBeenCalledTimes(1);
    expect(cached.body.cachedAt).toBe(cnh.body.cachedAt);

    const bytes = await api()
      .get('/v1/portal/documents/cnh?documentBytes=true')
      .set(headers());
    expect(bytes.status, JSON.stringify(bytes.body)).toBe(422);
    expect(bytes.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(bytes.body.context).toEqual({
      unavailableReason: 'documento_assinado_pendente_r0014',
      alternativeChannelNote: null,
    });

    const vehicles = await api().get('/v1/portal/vehicles').set(headers());
    expect(vehicles.status, JSON.stringify(vehicles.body)).toBe(200);
    // A20: item sem chassi não é projetado (CTG-0004 §3).
    expect(vehicles.body).toMatchObject({
      items: [],
    });
    expect(typeof vehicles.body.cachedAt).toBe('string');
    expect(JSON.stringify(vehicles.body)).not.toContain('renavam');

    const notEntitled = await api()
      .get(`/v1/portal/vehicles/${randomUUID()}/clearance`)
      .set(headers());
    expect(notEntitled.status, JSON.stringify(notEntitled.body)).toBe(404);
    expect(notEntitled.body.context).toEqual({ kind: 'vehicle' });

    await insertEntitlement(3, subjects.prata, 'vehicle', EXTERNAL.vehicle);
    const clearance = await api()
      .get(`/v1/portal/vehicles/${EXTERNAL.vehicle}/clearance`)
      .set(headers());
    expect(clearance.status, JSON.stringify(clearance.body)).toBe(503);
    expect(clearance.body.code).toBe('PORTAL.NATIONAL_READ_UNAVAILABLE');
    expect(clearance.body.context).toMatchObject({ cachedAt: null });
    expect(typeof clearance.body.context.retryAfter).toBe('number');
    expect(clearance.body.context.retryAfter).toBeGreaterThan(0);

    const crlv = await api()
      .post(`/v1/portal/vehicles/${EXTERNAL.vehicle}/crlv-e`)
      .set(headers())
      .send({});
    expect(crlv.status, JSON.stringify(crlv.body)).toBe(422);
    expect(crlv.body.code).toBe('PORTAL.SERVICE_UNAVAILABLE');
    expect(crlv.body.context).toMatchObject({
      unavailableReason: 'documento_assinado_pendente_r0014',
    });

    expect((await auditRows(client, 'PORTAL_DOCUMENT_READ'))[0]).toMatchObject({
      entity: 'portal.national_read_cache',
    });
    expect((await auditRows(client, 'PORTAL_VEHICLE_READ'))[0]).toMatchObject({
      entity: 'portal.national_read_cache',
    });
  });

  it("C-0002-78 — dado crash_view/exam_view do sujeito quando GET crashes | GET exams então 1 item; GET crashes/{id} sem entitlement então 404 { kind:'crash' }; com então 200 thirdPartyFieldsSuppressed true; GET exams/{id} idem; auditoria PORTAL_CRASH_READ / PORTAL_EXAM_READ", async () => {
    setCitizen(prata);
    const crashes = await api().get('/v1/portal/crashes').set(headers());
    expect(crashes.status, JSON.stringify(crashes.body)).toBe(200);
    expect(crashes.body.items).toEqual([
      {
        crashId: EXTERNAL.crash,
        stateLabel: 'fixture',
        summary: {},
        thirdPartyFieldsSuppressed: true,
      },
    ]);
    const exams = await api().get('/v1/portal/exams').set(headers());
    expect(exams.status, JSON.stringify(exams.body)).toBe(200);
    expect(exams.body.items).toEqual([
      {
        examId: EXTERNAL.exam,
        legalLabel: 'fixture',
        validUntil: '2027-01-01',
        boardDueOn: null,
      },
    ]);

    const crashNotEntitled = await api()
      .get(`/v1/portal/crashes/${EXTERNAL.crash}`)
      .set(headers());
    expect(crashNotEntitled.status, JSON.stringify(crashNotEntitled.body)).toBe(
      404,
    );
    expect(crashNotEntitled.body.context).toEqual({ kind: 'crash' });
    const examNotEntitled = await api()
      .get(`/v1/portal/exams/${EXTERNAL.exam}`)
      .set(headers());
    expect(examNotEntitled.status, JSON.stringify(examNotEntitled.body)).toBe(
      404,
    );
    expect(examNotEntitled.body.context).toEqual({ kind: 'exam' });

    await insertEntitlement(4, subjects.prata, 'crash', EXTERNAL.crash);
    await insertEntitlement(5, subjects.prata, 'exam', EXTERNAL.exam);
    const crash = await api()
      .get(`/v1/portal/crashes/${EXTERNAL.crash}`)
      .set(headers());
    expect(crash.status, JSON.stringify(crash.body)).toBe(200);
    expect(crash.body).toEqual({
      crashId: EXTERNAL.crash,
      stateLabel: 'fixture',
      summary: {},
      thirdPartyFieldsSuppressed: true,
    });
    const exam = await api()
      .get(`/v1/portal/exams/${EXTERNAL.exam}`)
      .set(headers());
    expect(exam.status, JSON.stringify(exam.body)).toBe(200);
    expect(exam.body).toEqual({
      examId: EXTERNAL.exam,
      legalLabel: 'fixture',
      validUntil: '2027-01-01',
      boardDueOn: null,
    });

    setCitizen(bronze);
    expect(
      (await api().get('/v1/portal/crashes').set(headers())).body.items,
    ).toEqual([]);

    expect((await auditRows(client, 'PORTAL_CRASH_READ'))[0]).toMatchObject({
      entity: 'portal.crash_view',
    });
    expect((await auditRows(client, 'PORTAL_EXAM_READ'))[0]).toMatchObject({
      entity: 'portal.exam_view',
    });
  });
});

describe('CTG-0002 §2.6/§2.8 — atendimento (C-0002-79, C-0002-80, C-0002-81)', () => {
  it("C-0002-79 — dado POST manifestations SEM Authorization então 201 anonymous true; com Authorization CIDADAO então anonymous false e GET manifestations lista; { kind:'xyz' } então 400; { kind:'elogio' } sem text então 201; sem Idempotency-Key então 400; GET manifestations sem sessão então 401/403", async () => {
    const anonymous = await request(app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(anonymousHeaders())
      .send({ kind: 'reclamacao', text: 'x' });
    expect(anonymous.status, JSON.stringify(anonymous.body)).toBe(201);
    expect(anonymous.body).toMatchObject({
      state: 'COMPROVANTE_EMITIDO',
      anonymous: true,
    });
    expect(String(anonymous.body.protocol)).toMatch(/^LOCAL-E2E-2026-\d{7}$/);
    expect(typeof anonymous.body.receivedAt).toBe('string');
    expect(typeof anonymous.body.agencyDueOn).toBe('string');
    expect(typeof anonymous.body.manifestationId).toBe('string');

    setCitizen(prata);
    const identified = await api()
      .post('/v1/portal/manifestations')
      .set(headers())
      .send({ kind: 'sugestao', text: 'y' });
    expect(identified.status, JSON.stringify(identified.body)).toBe(201);
    expect(identified.body.anonymous).toBe(false);
    const list = await api().get('/v1/portal/manifestations').set(headers());
    expect(list.status, JSON.stringify(list.body)).toBe(200);
    const listed = list.body.items.find(
      (item: { manifestationId: string }) =>
        item.manifestationId === identified.body.manifestationId,
    );
    expect(listed).toMatchObject({
      state: 'COMPROVANTE_EMITIDO',
      kind: 'sugestao',
      protocol: identified.body.protocol,
      evaluationOffered: false,
      evaluated: false,
      decision: null,
    });
    expect(listed.deadlines).toMatchObject({
      agencyDueOn: identified.body.agencyDueOn,
      extended: null,
    });
    expect(listed).not.toHaveProperty('infoDueOn');
    expect(
      list.body.items.some(
        (item: { manifestationId: string }) =>
          item.manifestationId === anonymous.body.manifestationId,
      ),
    ).toBe(false);

    const detail = await api()
      .get(`/v1/portal/manifestations/${identified.body.manifestationId}`)
      .set(headers());
    expect(detail.status).toBe(200);
    expect(detail.body).toMatchObject({
      manifestationId: identified.body.manifestationId,
      text: 'y',
      confidential: false,
    });

    const badKind = await request(app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(anonymousHeaders())
      .send({ kind: 'xyz', text: 'x' });
    expect(badKind.status, JSON.stringify(badKind.body)).toBe(400);
    expect(badKind.body.code).toBe('PORTAL.MANIFESTATION_KIND_INVALID');
    expect(badKind.body.context).toEqual({
      allowed: ['reclamacao', 'denuncia', 'sugestao', 'elogio', 'solicitacao'],
    });

    const noText = await request(app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set(anonymousHeaders())
      .send({ kind: 'elogio', campoExtra: 1 });
    expect(noText.status, JSON.stringify(noText.body)).toBe(201);

    const withoutKey = await request(app.getHttpServer())
      .post('/v1/portal/manifestations')
      .set({ 'x-tenant-id': TENANT_ID })
      .send({ kind: 'elogio' });
    expect(withoutKey.status, JSON.stringify(withoutKey.body)).toBe(400);
    expect(withoutKey.body.code).toBe('PORTAL.VALIDATION_FAILED');
    expect(withoutKey.body.context).toEqual({ fields: ['Idempotency-Key'] });

    // C-0002-79 / A6(e) (TASK-0006 iteração 3): sem `Authorization`, o
    // verificador local (`DetranLocalTokenVerifier`, perfil `test`) sintetiza
    // um principal mesmo assim, com os papéis correntes de
    // `DETRAN_LOCAL_ROLES` (aqui ainda 'CIDADAO', herdado do `setCitizen`
    // acima) — o que passaria pela política e devolveria 200. Como em
    // `portal-stream.e2e.spec.ts` (C-0002-82), usa-se um papel fora da
    // matriz `portal:*` para expor a ausência de sessão; o valor anterior é
    // restaurado depois.
    const previousLocalRoles = process.env.DETRAN_LOCAL_ROLES;
    process.env.DETRAN_LOCAL_ROLES = 'field-agent';
    const noSession = await request(app.getHttpServer())
      .get('/v1/portal/manifestations')
      .set({ 'x-tenant-id': TENANT_ID });
    expect([401, 403]).toContain(noSession.status);
    process.env.DETRAN_LOCAL_ROLES = previousLocalRoles;
  });

  it("C-0002-80 — dado manifestação CIENCIA_AO_USUARIO quando POST acknowledge então 200 'AVALIACAO_OFERECIDA'; de novo então 409; POST evaluations { subjectKind:'manifestation' } então 201 'AVALIADA'; de novo então 409; manifestação EM_ANALISE então 409 EVALUATION_NOT_OFFERED { state:'EM_ANALISE' }", async () => {
    setCitizen(prata);
    const acknowledged = await api()
      .post(
        `/v1/portal/manifestations/${LOCAL.manifestationCiencia}/acknowledge`,
      )
      .set(headers())
      .send({});
    expect(acknowledged.status, JSON.stringify(acknowledged.body)).toBe(200);
    expect(acknowledged.body).toMatchObject({
      manifestationId: LOCAL.manifestationCiencia,
      state: 'AVALIACAO_OFERECIDA',
      evaluationOffered: true,
      version: 2,
    });
    expect(acknowledged.headers.etag).toBe('"2"');

    const again = await api()
      .post(
        `/v1/portal/manifestations/${LOCAL.manifestationCiencia}/acknowledge`,
      )
      .set(headers())
      .send({});
    expect(again.status, JSON.stringify(again.body)).toBe(409);
    expect(again.body.code).toBe('PORTAL.MANIFESTATION_STATE_INVALID');
    expect(again.body.context).toEqual({
      state: 'AVALIACAO_OFERECIDA',
      allowed: ['CIENCIA_AO_USUARIO'],
    });

    const evaluated = await api()
      .post('/v1/portal/evaluations')
      .set(headers())
      .send({
        subjectKind: 'manifestation',
        subjectId: LOCAL.manifestationCiencia,
        scores: SCORES,
      });
    expect(evaluated.status, JSON.stringify(evaluated.body)).toBe(201);
    expect(evaluated.body).toMatchObject({
      subjectKind: 'manifestation',
      subjectId: LOCAL.manifestationCiencia,
      state: 'AVALIADA',
      publicNotice: 'portal.evaluations.publicIndicator',
    });

    // depois de AVALIADA tanto o passo "state ≠ AVALIACAO_OFERECIDA" (EVALUATION_NOT_OFFERED) quanto o
    // unique da avaliação (EVALUATION_ALREADY_SUBMITTED — texto de C-0002-80) respondem 409 (relatório)
    const evaluatedAgain = await api()
      .post('/v1/portal/evaluations')
      .set(headers())
      .send({
        subjectKind: 'manifestation',
        subjectId: LOCAL.manifestationCiencia,
        scores: SCORES,
      });
    expect(evaluatedAgain.status, JSON.stringify(evaluatedAgain.body)).toBe(
      409,
    );
    expect([
      'PORTAL.EVALUATION_ALREADY_SUBMITTED',
      'PORTAL.EVALUATION_NOT_OFFERED',
    ]).toContain(evaluatedAgain.body.code);

    const notOffered = await api()
      .post('/v1/portal/evaluations')
      .set(headers())
      .send({
        subjectKind: 'manifestation',
        subjectId: LOCAL.manifestationEmAnalise,
        scores: SCORES,
      });
    expect(notOffered.status, JSON.stringify(notOffered.body)).toBe(409);
    expect(notOffered.body.code).toBe('PORTAL.EVALUATION_NOT_OFFERED');
    expect(notOffered.body.context).toEqual({ state: 'EM_ANALISE' });

    const offered = await api()
      .post('/v1/portal/evaluations')
      .set(headers())
      .send({
        subjectKind: 'manifestation',
        subjectId: LOCAL.manifestationOferecida,
        scores: SCORES,
        comment: 'ok',
      });
    expect(offered.status, JSON.stringify(offered.body)).toBe(201);
    expect(offered.body.state).toBe('AVALIADA');

    setCitizen(ouro);
    const foreign = await api()
      .post('/v1/portal/evaluations')
      .set(headers())
      .send({
        subjectKind: 'manifestation',
        subjectId: LOCAL.manifestationEmAnalise,
        scores: SCORES,
      });
    expect(foreign.status, JSON.stringify(foreign.body)).toBe(404);
    expect(foreign.body.context).toEqual({ kind: 'manifestation' });

    expect(
      (await auditRows(client, 'PORTAL_MANIFESTATION_ACKNOWLEDGE'))[0],
    ).toMatchObject({ entity: 'portal.manifestation' });
    expect(
      (await auditRows(client, 'PORTAL_EVALUATION_EVALUATE'))[0],
    ).toMatchObject({ entity: 'portal.evaluation' });
  });

  it("C-0002-81 — dado GET service-charter/manifestar/deadline então 200 { legalDeadline: <do catálogo do tenant local> }; /nao_existe/deadline então 404 { kind:'service' }", async () => {
    setCitizen(prata);
    const charter = await api()
      .get('/v1/portal/service-charter/manifestar/deadline')
      .set(headers());
    expect(charter.status, JSON.stringify(charter.body)).toBe(200);
    expect(charter.body).toEqual({
      serviceKey: 'manifestar',
      legalDeadline: 'resposta em 30 dias, prorrogável 1x — Lei 13.460 art. 16',
      normativeReference: 'fixture e2e',
      availability: 'available',
    });
    const missing = await api()
      .get('/v1/portal/service-charter/nao_existe/deadline')
      .set(headers());
    expect(missing.status, JSON.stringify(missing.body)).toBe(404);
    expect(missing.body.code).toBe('PORTAL.NOT_FOUND');
    expect(missing.body.context).toEqual({ kind: 'service' });
  });
});
