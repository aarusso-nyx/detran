// R-0009 CTG-0002 §2.6, §3.3, §6.3, §11 e §13 (TASK-0006) — C-0002-40…45:
// `PortalManifestationService` (manifest nunca recusa — só `kind`; comprovante
// imediato; anônimo; acknowledge só de CIENCIA_AO_USUARIO), `PortalEvaluationService`
// (EVALUATION_NOT_OFFERED × EVALUATION_ALREADY_SUBMITTED; delegação a
// `PortalRequestsService` quando `subjectKind='request'`) e `portal-timers.ts`
// (`PORTAL_TIMER_CODES`; `durationOf` provado na integração). Fica vermelho até
// TASK-0008 criar `manifestation.service.ts`, `evaluation.service.ts` e
// `portal-timers.ts` (§14).
//
// Tx falsa em memória de `@detran/portal-requests` (`tests/support/fake-sql.ts`)
// com as 9 manifestações de CTG-0001 §10.6 e `inf.infraction_timer_ref` semeada
// com um valor FICTÍCIO para T-OUV-RESPOSTA (7): o prazo tem de sair da leitura
// do vocabulário, nunca do literal 30 (§6.3). Formas esperadas (constrangimento
// do Inspector): manifest(tx, identity | null, body, headers) · acknowledge(tx,
// identity, manifestationId) · evaluate(tx, identity, body, headers); actor do
// envelope = `RequestContext.snapshot().actorId` (o app semeia
// PORTAL_PUBLIC_ACTOR_ID, o uuid nulo, nas rotas públicas — A3(b)).
import { describe, expect, it, vi } from 'vitest';
import { PortalIdentityService } from '@detran/portal-identity';
import { PortalIdempotencyService } from '@detran/portal-requests';
import { addCalendarDays } from '@detran/inf-deadlines';
import { SqlTeatEventOutbox } from '@detran/shared';

import {
  FakeSqlDatabase,
  type Row,
} from '../../../requests/tests/support/fake-sql.js';
import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
import {
  ACT_LEVEL_POLICY_ROWS,
  FIXED_NOW,
  FIXED_TODAY,
  I18N,
  MANIFESTATION_STATES,
  NIL_UUID,
  SUBJECTS,
  TENANT_ID,
  TENANT_SLUG,
  TOPICS,
  fakeDatabase,
  fixedClock,
  identityOf,
  outboxEnvelopes,
} from '../../../requests/tests/support/portal-fixtures.js';
import {
  PortalEvaluationService,
  EVALUATION_SCORES,
} from './evaluation.service.js';
import {
  MANIFESTATION_BODY,
  PortalManifestationService,
} from './manifestation.service.js';
import { PORTAL_TIMER_CODES } from './portal-timers.js';

const MANIFESTATION_KINDS = [
  'reclamacao',
  'denuncia',
  'sugestao',
  'elogio',
  'solicitacao',
];
/** Valor fictício só deste spec: prova que o prazo é LIDO de inf.infraction_timer_ref. */
const PROBE_OUV_RESPOSTA_DAYS = 7;

/** CTG-0001 §10.6 — as 9 manifestações, uma por estado (protocolo …0000006 em diante). */
const MAN = {
  registrada: '00000000-0000-7000-8000-000070700001',
  comprovante: '00000000-0000-7000-8000-000070700002',
  emAnalise: '00000000-0000-7000-8000-000070700003',
  infoSolicitada: '00000000-0000-7000-8000-000070700004',
  decisaoElaborada: '00000000-0000-7000-8000-000070700005',
  cienciaAoUsuario: '00000000-0000-7000-8000-000070700006',
  encerrada: '00000000-0000-7000-8000-000070700007',
  avaliacaoOferecida: '00000000-0000-7000-8000-000070700008',
  avaliada: '00000000-0000-7000-8000-000070700009',
} as const;

const MANIFESTATION_FIXTURES: Row[] = [
  // …70700001 é anônima no seed (subject_id nulo, protocolo …000000e); aqui recebe um dono
  // para que o teste de estado (C-0002-43) chegue à guarda de estado em vez do 404 de posse.
  {
    id: MAN.registrada,
    state: 'MANIFESTACAO_REGISTRADA',
    kind: 'reclamacao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.bronze.id,
    received_at: new Date('2026-09-14T12:00:00-04:00'),
    agency_due_on: '2026-10-14',
    protocol: 'AM-FIXTURES-2026-000000e',
  },
  {
    id: MAN.comprovante,
    state: 'COMPROVANTE_EMITIDO',
    kind: 'denuncia',
    anonymous: false,
    confidential: true,
    subject_id: SUBJECTS.bronze.id,
    received_at: new Date('2026-09-13T12:00:00-04:00'),
    agency_due_on: '2026-10-13',
    protocol: 'AM-FIXTURES-2026-0000006',
  },
  {
    id: MAN.emAnalise,
    state: 'EM_ANALISE',
    kind: 'sugestao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.prata.id,
    received_at: new Date('2026-09-01T12:00:00-04:00'),
    agency_due_on: '2026-10-01',
    protocol: 'AM-FIXTURES-2026-0000007',
  },
  {
    id: MAN.infoSolicitada,
    state: 'INFORMACAO_SOLICITADA_AO_AGENTE',
    kind: 'reclamacao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.prata.id,
    received_at: new Date('2026-08-25T12:00:00-04:00'),
    agency_due_on: '2026-09-24',
    protocol: 'AM-FIXTURES-2026-0000008',
    info_due_on: '2026-09-21',
  },
  {
    id: MAN.decisaoElaborada,
    state: 'DECISAO_FINAL_ELABORADA',
    kind: 'solicitacao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.ouro.id,
    received_at: new Date('2026-08-20T12:00:00-04:00'),
    agency_due_on: '2026-09-19',
    protocol: 'AM-FIXTURES-2026-0000009',
    decided_at: new Date('2026-09-10T12:00:00-04:00'),
    decision_text: 'fixture',
  },
  {
    id: MAN.cienciaAoUsuario,
    state: 'CIENCIA_AO_USUARIO',
    kind: 'elogio',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.ouro.id,
    received_at: new Date('2026-08-10T12:00:00-04:00'),
    agency_due_on: '2026-09-09',
    protocol: 'AM-FIXTURES-2026-000000a',
    decided_at: new Date('2026-09-01T12:00:00-04:00'),
    decision_text: 'fixture',
  },
  {
    id: MAN.encerrada,
    state: 'ENCERRADA',
    kind: 'reclamacao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.qualificada.id,
    received_at: new Date('2026-07-20T12:00:00-04:00'),
    agency_due_on: '2026-08-19',
    protocol: 'AM-FIXTURES-2026-000000b',
    decided_at: new Date('2026-09-05T12:00:00-04:00'),
    acknowledged_at: new Date('2026-09-10T12:00:00-04:00'),
  },
  {
    id: MAN.avaliacaoOferecida,
    state: 'AVALIACAO_OFERECIDA',
    kind: 'reclamacao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.prata.id,
    received_at: new Date('2026-07-10T12:00:00-04:00'),
    agency_due_on: '2026-08-09',
    protocol: 'AM-FIXTURES-2026-000000c',
    decided_at: new Date('2026-08-01T12:00:00-04:00'),
    acknowledged_at: new Date('2026-08-05T12:00:00-04:00'),
  },
  {
    id: MAN.avaliada,
    state: 'AVALIADA',
    kind: 'sugestao',
    anonymous: false,
    confidential: false,
    subject_id: SUBJECTS.bronze.id,
    received_at: new Date('2026-06-15T12:00:00-04:00'),
    agency_due_on: '2026-07-15',
    protocol: 'AM-FIXTURES-2026-000000d',
    decided_at: new Date('2026-07-01T12:00:00-04:00'),
    acknowledged_at: new Date('2026-07-10T12:00:00-04:00'),
  },
].map((row) => ({ text: 'fixture', version: 1, ...row }));

const OWNER_BY_MANIFESTATION: Record<string, keyof typeof SUBJECTS> =
  Object.fromEntries(
    MANIFESTATION_FIXTURES.map((row) => [
      String(row.id),
      (Object.keys(SUBJECTS) as Array<keyof typeof SUBJECTS>).find(
        (key) => SUBJECTS[key].id === row.subject_id,
      )!,
    ]),
  );

/** DDL 14 (M14): T-OUV-RESPOSTA recebe um valor de sonda; os demais como no vocabulário. */
const TIMER_ROWS: Row[] = [
  {
    code: 'T-OUV-RESPOSTA',
    owner: 'portal',
    duration_value: PROBE_OUV_RESPOSTA_DAYS,
    duration_unit: 'dias_corridos',
    status: 'vigente',
  },
  {
    code: 'T-OUV-INFO',
    owner: 'portal',
    duration_value: 20,
    duration_unit: 'dias_corridos',
    status: 'vigente',
  },
  {
    code: 'T-LGPD-ACESSO',
    owner: 'portal',
    duration_value: null,
    duration_unit: 'dias_corridos',
    status: 'proposta',
  },
  {
    code: 'T-AVAL-CONVITE',
    owner: 'portal',
    duration_value: null,
    duration_unit: 'dias_corridos',
    status: 'vigente',
  },
];

interface Harness {
  db: FakeSqlDatabase;
  manifestations: {
    manifest: (
      tx: unknown,
      identity: unknown,
      body: unknown,
      headers: unknown,
    ) => Promise<Row>;
    acknowledge: (tx: unknown, identity: unknown, id: string) => Promise<Row>;
  };
  evaluations: {
    evaluate: (
      tx: unknown,
      identity: unknown,
      body: unknown,
      headers: unknown,
    ) => Promise<Row>;
  };
  requestsEvaluate: ReturnType<typeof vi.fn>;
}

function harness(options: { actorId?: string } = {}): Harness {
  const db = new FakeSqlDatabase({
    tenantId: TENANT_ID,
    tenant: { slug: TENANT_SLUG },
    now: fixedClock.now,
    sequences: { 'portal.protocol_seq': 14 },
  });
  db.seed(
    'portal.subject',
    Object.values(SUBJECTS).map((subject) => ({
      id: subject.id,
      cpf_hash: subject.cpfHash,
      name: '',
      govbr_level_observed: null,
      assurance_level_observed: subject.assurance,
      observed_at: FIXED_NOW,
      version: 1,
    })),
  );
  db.seed('portal.act_level_policy', ACT_LEVEL_POLICY_ROWS);
  db.seed(
    'portal.manifestation',
    MANIFESTATION_FIXTURES.map((row) => ({ ...row })),
  );
  db.seed(
    'inf.infraction_timer_ref',
    TIMER_ROWS.map((row) => ({ ...row })),
  );
  const outbox = new SqlTeatEventOutbox();
  const requestsEvaluate = vi.fn(async () => ({
    evaluationId: '00000000-0000-7000-8000-000071100099',
    requestId: '',
    state: 'CONCLUIDO',
    submittedAt: FIXED_NOW.toISOString(),
  }));
  const requestContext = {
    hasActiveContext: () => true,
    snapshot: () => ({
      tenantId: TENANT_ID,
      actorId: options.actorId ?? SUBJECTS.prata.id,
      requestId: '00000000-0000-4000-8000-00000000c0f1',
    }),
  };
  const providers = {
    PortalIdentityService: new PortalIdentityService(fixedClock as never),
    PortalIdempotencyService: constructInjectable(PortalIdempotencyService, {
      PortalClock: fixedClock,
    }),
    PortalRequestsService: { evaluate: requestsEvaluate },
    PortalClock: fixedClock,
    Database: fakeDatabase(db.tx),
    RequestContext: requestContext,
    SqlTeatEventOutbox: outbox,
    TEAT_EVENT_OUTBOX: outbox,
  };
  const manifestations = constructInjectable(
    PortalManifestationService,
    providers,
  ) as unknown as Harness['manifestations'];
  const evaluations = constructInjectable(PortalEvaluationService, {
    ...providers,
    PortalManifestationService: manifestations,
  }) as unknown as Harness['evaluations'];
  return { db, manifestations, evaluations, requestsEvaluate };
}

let keyCounter = 0;
const headers = () => {
  keyCounter += 1;
  return { 'idempotency-key': `m-${keyCounter}` };
};

function manifestationRow(db: FakeSqlDatabase, id: string): Row {
  return db.rows('portal.manifestation').find((row) => row.id === id)!;
}

describe('CTG-0002 §2.6 — POST manifestations nunca recusa (C-0002-40…42)', () => {
  it("C-0002-40 — dado kind 'xyz' quando manifest então 400 PORTAL.MANIFESTATION_KIND_INVALID { allowed: [5 tokens] }; dado kind ausente idem", async () => {
    const h = harness();
    for (const body of [{ kind: 'xyz', text: 'x' }, { text: 'x' }]) {
      await expect(
        h.manifestations.manifest(h.db.tx, null, body, headers()),
      ).rejects.toMatchObject({
        code: 'PORTAL.MANIFESTATION_KIND_INVALID',
        status: 400,
        context: { allowed: MANIFESTATION_KINDS },
      });
    }
    expect(h.db.rows('portal.manifestation')).toHaveLength(
      MANIFESTATION_FIXTURES.length,
    );
    expect(MANIFESTATION_BODY.safeParse({ kind: 'xyz' }).success).toBe(false);
  });

  it("C-0002-40 — dado corpo sem text, com campo extra e attachmentIds inválido então NÃO recusa (RN-PORTAL-109): text '' e extras ignorados", async () => {
    const h = harness();
    const response = await h.manifestations.manifest(
      h.db.tx,
      null,
      {
        kind: 'sugestao',
        attachmentIds: 'nao-e-lista',
        confidential: 'talvez',
        campoExtra: { x: 1 },
      },
      headers(),
    );
    expect(response).toMatchObject({
      state: 'COMPROVANTE_EMITIDO',
      anonymous: true,
    });
    const row = manifestationRow(h.db, String(response.manifestationId));
    expect(row).toMatchObject({
      kind: 'sugestao',
      text: '',
      confidential: false,
      anonymous: true,
      subject_id: null,
    });
    expect(row).not.toHaveProperty('campoExtra');
    const parsed = MANIFESTATION_BODY.parse({
      kind: 'elogio',
      attachmentIds: 12,
      text: 5,
      anonymous: 'sim',
      extra: true,
    });
    expect(parsed).toMatchObject({
      kind: 'elogio',
      attachmentIds: [],
      text: '',
      anonymous: false,
      confidential: false,
    });
  });

  it("C-0002-41 — dado manifest anônimo então state 'COMPROVANTE_EMITIDO', protocol na gramática do §3.3, received_at = relógio, agency_due_on = today + durationOf('T-OUV-RESPOSTA') (lido, não 30), subject_id null, MANIFESTACAO_REGISTRADA com actor.id = PORTAL_PUBLIC_ACTOR_ID", async () => {
    const h = harness({ actorId: NIL_UUID });
    const response = await h.manifestations.manifest(
      h.db.tx,
      null,
      { kind: 'reclamacao', text: 'atendimento demorado' },
      headers(),
    );
    const expectedDueOn = addCalendarDays(FIXED_TODAY, PROBE_OUV_RESPOSTA_DAYS);
    expect(response).toMatchObject({
      state: 'COMPROVANTE_EMITIDO',
      protocol: 'AM-FIXTURES-2026-0000015',
      agencyDueOn: expectedDueOn,
      anonymous: true,
    });
    expect(new Date(String(response.receivedAt)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const row = manifestationRow(h.db, String(response.manifestationId));
    expect(row).toMatchObject({
      state: 'COMPROVANTE_EMITIDO',
      kind: 'reclamacao',
      text: 'atendimento demorado',
      anonymous: true,
      subject_id: null,
      protocol: 'AM-FIXTURES-2026-0000015',
      info_due_on: null,
      version: 1,
    });
    expect(String(row.agency_due_on).slice(0, 10)).toBe(expectedDueOn);
    expect(new Date(String(row.received_at)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const events = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      domainEvent: 'MANIFESTACAO_REGISTRADA',
      actor: { id: NIL_UUID },
      aggregate: { kind: 'portal.manifestation', id: row.id, version: 1 },
    });
    expect(events[0]!.data).toMatchObject({
      manifestationId: row.id,
      protocol: 'AM-FIXTURES-2026-0000015',
      kind: 'reclamacao',
      anonymous: true,
      subjectId: null,
      subjectCpfHash: null,
      agencyDueOn: expectedDueOn,
      toState: 'COMPROVANTE_EMITIDO',
    });
    expect(events[0]!.data).not.toHaveProperty('text');

    const record = h.db.rows('portal.idempotency_record')[0];
    expect(record).toMatchObject({
      key: `public:m-${keyCounter}`,
      status: 201,
    });
  });

  it('C-0002-41 — dado manifest sem Idempotency-Key então 400 PORTAL.VALIDATION_FAILED { fields: ["Idempotency-Key"] } (M9, escopo public)', async () => {
    const h = harness();
    await expect(
      h.manifestations.manifest(h.db.tx, null, { kind: 'elogio' }, {}),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['Idempotency-Key'] },
    });
  });

  it('C-0002-42 — dado identity presente e anonymous false então subject_id = subject; dado identity presente e anonymous true então subject_id null e anonymous true', async () => {
    const h = harness();
    const identified = await h.manifestations.manifest(
      h.db.tx,
      identityOf('prata'),
      { kind: 'denuncia', text: 'x', confidential: true },
      headers(),
    );
    expect(identified.anonymous).toBe(false);
    expect(
      manifestationRow(h.db, String(identified.manifestationId)),
    ).toMatchObject({
      subject_id: SUBJECTS.prata.id,
      anonymous: false,
      confidential: true,
    });
    const [registered] = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
    expect(registered!.data).toMatchObject({
      anonymous: false,
      subjectId: SUBJECTS.prata.id,
      subjectCpfHash: SUBJECTS.prata.cpfHash,
    });
    expect(registered!.actor).toMatchObject({
      kind: 'user',
      id: SUBJECTS.prata.id,
    });

    const anonymous = await h.manifestations.manifest(
      h.db.tx,
      identityOf('prata'),
      { kind: 'denuncia', text: 'y', anonymous: true },
      headers(),
    );
    expect(anonymous.anonymous).toBe(true);
    expect(
      manifestationRow(h.db, String(anonymous.manifestationId)),
    ).toMatchObject({ subject_id: null, anonymous: true });
    // dois comprovantes → dois protocolos distintos da mesma sequência
    expect(identified.protocol).not.toBe(anonymous.protocol);
  });
});

describe('CTG-0002 §2.6 — acknowledge (C-0002-43)', () => {
  it("C-0002-43 — dado acknowledge × 9 estados então só CIENCIA_AO_USUARIO passa (→ AVALIACAO_OFERECIDA na mesma transação, acknowledged_at, MANIFESTACAO_ENCERRADA); demais 409 PORTAL.MANIFESTATION_STATE_INVALID { state, allowed: ['CIENCIA_AO_USUARIO'] }", async () => {
    expect(MANIFESTATION_FIXTURES.map((row) => row.state)).toEqual([
      ...MANIFESTATION_STATES,
    ]);
    for (const fixture of MANIFESTATION_FIXTURES) {
      const h = harness();
      const owner = identityOf(OWNER_BY_MANIFESTATION[String(fixture.id)]!);
      if (fixture.state === 'CIENCIA_AO_USUARIO') {
        const response = await h.manifestations.acknowledge(
          h.db.tx,
          owner,
          String(fixture.id),
        );
        expect(response).toMatchObject({
          manifestationId: fixture.id,
          state: 'AVALIACAO_OFERECIDA',
          evaluationOffered: true,
          version: 2,
        });
        expect(new Date(String(response.acknowledgedAt)).getTime()).toBe(
          FIXED_NOW.getTime(),
        );
        const row = manifestationRow(h.db, String(fixture.id));
        expect(row).toMatchObject({ state: 'AVALIACAO_OFERECIDA', version: 2 });
        expect(new Date(String(row.acknowledged_at)).getTime()).toBe(
          FIXED_NOW.getTime(),
        );
        const events = outboxEnvelopes(h.db, TOPICS.manifestationChanged);
        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
          domainEvent: 'MANIFESTACAO_ENCERRADA',
          aggregate: {
            kind: 'portal.manifestation',
            id: fixture.id,
            version: 2,
          },
        });
        expect(events[0]!.data).toMatchObject({
          manifestationId: fixture.id,
          protocol: fixture.protocol,
          fromState: 'CIENCIA_AO_USUARIO',
          toState: 'AVALIACAO_OFERECIDA',
          subjectId: fixture.subject_id,
        });
        continue;
      }
      await expect(
        h.manifestations.acknowledge(h.db.tx, owner, String(fixture.id)),
        String(fixture.state),
      ).rejects.toMatchObject({
        code: 'PORTAL.MANIFESTATION_STATE_INVALID',
        status: 409,
        context: { state: fixture.state, allowed: ['CIENCIA_AO_USUARIO'] },
      });
      expect(manifestationRow(h.db, String(fixture.id)).state).toBe(
        fixture.state,
      );
      expect(outboxEnvelopes(h.db)).toHaveLength(0);
    }
  });

  it("§2.6 — dado manifestação de outro sujeito quando acknowledge então 404 PORTAL.NOT_FOUND { kind: 'manifestation' }", async () => {
    const h = harness();
    await expect(
      h.manifestations.acknowledge(
        h.db.tx,
        identityOf('prata'),
        MAN.cienciaAoUsuario,
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'manifestation' },
    });
  });
});

describe('CTG-0002 §2.6 — POST evaluations (C-0002-44)', () => {
  const scores = {
    satisfaction: 5,
    quality: 4,
    deadline: 3,
    clarity: 4,
    channel: 5,
  };

  it("C-0002-44 — dado evaluate manifestação em EM_ANALISE então 409 PORTAL.EVALUATION_NOT_OFFERED { state: 'EM_ANALISE' }", async () => {
    const h = harness();
    await expect(
      h.evaluations.evaluate(
        h.db.tx,
        identityOf('prata'),
        { subjectKind: 'manifestation', subjectId: MAN.emAnalise, scores },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.EVALUATION_NOT_OFFERED',
      status: 409,
      context: { state: 'EM_ANALISE' },
    });
    expect(h.db.rows('portal.evaluation')).toHaveLength(0);
  });

  it("C-0002-44 — em AVALIACAO_OFERECIDA então portal.evaluation (subject_kind 'manifestation'), 'AVALIADA', AVALIACAO_REGISTRADA sem scores no data; segunda então 409 EVALUATION_ALREADY_SUBMITTED", async () => {
    const h = harness();
    const response = await h.evaluations.evaluate(
      h.db.tx,
      identityOf('prata'),
      {
        subjectKind: 'manifestation',
        subjectId: MAN.avaliacaoOferecida,
        scores,
        comment: 'resolvido',
      },
      headers(),
    );
    expect(response).toMatchObject({
      subjectKind: 'manifestation',
      subjectId: MAN.avaliacaoOferecida,
      state: 'AVALIADA',
      publicNotice: I18N.publicIndicator,
    });
    expect(typeof response.evaluationId).toBe('string');
    expect(new Date(String(response.submittedAt)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const evaluation = h.db
      .rows('portal.evaluation')
      .find((row) => row.subject_id === MAN.avaliacaoOferecida);
    expect(evaluation).toMatchObject({
      subject_kind: 'manifestation',
      scores_json: scores,
      comment: 'resolvido',
    });
    expect(manifestationRow(h.db, MAN.avaliacaoOferecida)).toMatchObject({
      state: 'AVALIADA',
      version: 2,
    });

    const events = outboxEnvelopes(h.db, TOPICS.evaluationRegistered);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      domainEvent: 'AVALIACAO_REGISTRADA',
      aggregate: { kind: 'portal.evaluation', id: evaluation!.id, version: 1 },
    });
    expect(events[0]!.data).toMatchObject({
      evaluationId: evaluation!.id,
      subjectKind: 'manifestation',
      subjectId: MAN.avaliacaoOferecida,
      citizenSubjectId: SUBJECTS.prata.id,
      subjectCpfHash: SUBJECTS.prata.cpfHash,
    });
    expect(events[0]!.data).not.toHaveProperty('scores');
    expect(events[0]!.data).not.toHaveProperty('comment');

    // segunda avaliação: a máquina já está em AVALIADA; o unique (tenant, subject_kind, subject_id) é
    // provado recolocando a linha em AVALIACAO_OFERECIDA (só a fixture muda, não o serviço)
    manifestationRow(h.db, MAN.avaliacaoOferecida).state =
      'AVALIACAO_OFERECIDA';
    await expect(
      h.evaluations.evaluate(
        h.db.tx,
        identityOf('prata'),
        {
          subjectKind: 'manifestation',
          subjectId: MAN.avaliacaoOferecida,
          scores,
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.EVALUATION_ALREADY_SUBMITTED',
      status: 409,
    });
    expect(h.db.rows('portal.evaluation')).toHaveLength(1);
  });

  it("C-0002-44 — dado subjectKind 'request' então delega a PortalRequestsService.evaluate (spy); dado manifestação de outro sujeito então 404 { kind: 'manifestation' }; sem Idempotency-Key então 400", async () => {
    const h = harness();
    const requestId = '00000000-0000-7000-8000-00007040000b';
    await h.evaluations.evaluate(
      h.db.tx,
      identityOf('qualificada'),
      { subjectKind: 'request', subjectId: requestId, scores },
      headers(),
    );
    expect(h.requestsEvaluate).toHaveBeenCalledTimes(1);
    const serialized = JSON.stringify(
      h.requestsEvaluate.mock.calls[0]!.map((arg) =>
        arg && typeof arg === 'object' && 'query' in (arg as object)
          ? 'tx'
          : arg,
      ),
    );
    expect(serialized).toContain(requestId);
    expect(serialized).toContain('"scores"');
    expect(h.db.rows('portal.evaluation')).toHaveLength(0);

    await expect(
      h.evaluations.evaluate(
        h.db.tx,
        identityOf('ouro'),
        {
          subjectKind: 'manifestation',
          subjectId: MAN.avaliacaoOferecida,
          scores,
        },
        headers(),
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'manifestation' },
    });

    await expect(
      h.evaluations.evaluate(
        h.db.tx,
        identityOf('prata'),
        {
          subjectKind: 'manifestation',
          subjectId: MAN.avaliacaoOferecida,
          scores,
        },
        {},
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['Idempotency-Key'] },
    });

    expect(EVALUATION_SCORES.safeParse(scores).success).toBe(true);
    expect(EVALUATION_SCORES.safeParse({ ...scores, extra: 1 }).success).toBe(
      false,
    );
    expect(EVALUATION_SCORES.safeParse({ satisfaction: 5 }).success).toBe(
      false,
    );
  });
});

describe('CTG-0002 §6.3 — portal-timers.ts (C-0002-45)', () => {
  it('C-0002-45 — dado portal-timers.ts então PORTAL_TIMER_CODES = exatamente os quatro códigos owner=portal de DDL 14 (M14)', () => {
    expect([...PORTAL_TIMER_CODES]).toEqual([
      'T-OUV-RESPOSTA',
      'T-OUV-INFO',
      'T-LGPD-ACESSO',
      'T-AVAL-CONVITE',
    ]);
  });
});
