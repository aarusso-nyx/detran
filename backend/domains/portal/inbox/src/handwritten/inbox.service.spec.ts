// R-0009 CTG-0002 §6 e §13 (TASK-0006) — C-0002-33…37: `PortalInboxService`
// (ciência idempotente na leitura, evidência de exibição, `INBOX_LIDO`/
// `NOTIFICACAO_CIENCIA`), `fictitiousAcknowledgementOn` (T-SNE-CIENCIA lido de
// `StaticTimerCatalog`, nunca 30) e `PortalSneEnrollmentService` (adesão,
// re-adesão, cancelamento, `SNE_*` com `aggregate.version` por transição).
// Fica vermelho até TASK-0008 criar `inbox.service.ts` e
// `sne-enrollment.service.ts` (§14).
//
// Tx falsa em memória de `@detran/portal-requests` (`tests/support/fake-sql.ts`
// — subconjunto de SQL no cabeçalho) com as fixtures da caixa/SNE de
// CTG-0001 §10.8; `PortalIdentityService` real; relógio fixo 2026-09-14.
// Formas esperadas (constrangimento do Inspector; §6.1/§6.2 fixam os nomes):
//   inbox.read(tx, subject, inboxItemId) → { id, readOn, acknowledgementEvidence }
//   sne.enroll(tx, subject, identity, body) · sne.cancel(tx, subject, identity, reason?)
//   sne.get(tx, subject) → { enrolled, since, channel, cancelable }
//   subject = PortalSubjectRecord de `upsertSubject` ({ subjectId, name, observedAt, version }).
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { PortalIdentityService } from '@detran/portal-identity';
import { canonicalJson } from '@detran/portal-requests';
import { StaticTimerCatalog, addCalendarDays } from '@detran/inf-deadlines';
import { SqlTeatEventOutbox } from '@detran/shared';

import {
  FakeSqlDatabase,
  type Row,
} from '../../../requests/tests/support/fake-sql.js';
import { constructInjectable } from '../../../requests/tests/support/nest-construct.js';
import {
  ACT_LEVEL_POLICY_ROWS,
  AITS,
  FIXED_NOW,
  FIXED_TODAY,
  SNE_EFFECTS as CONTRACT_SNE_EFFECTS,
  SUBJECTS,
  TENANT_ID,
  TENANT_SLUG,
  TOPICS,
  fakeDatabase,
  fakeRequestContext,
  fixedClock,
  identityOf,
  outboxEnvelopes,
} from '../../../requests/tests/support/portal-fixtures.js';
import {
  PortalInboxService,
  fictitiousAcknowledgementOn,
} from './inbox.service.js';
import {
  PortalSneEnrollmentService,
  SNE_EFFECTS,
  SNE_ENROLLMENT_BODY,
  SNE_ENROLLMENT_TRANSITIONS,
} from './sne-enrollment.service.js';

const INBOX = {
  sneUnread: '00000000-0000-7000-8000-000070c00001',
  portalRead: '00000000-0000-7000-8000-000070c00002',
} as const;
const ENROLLMENT_PRATA = '00000000-0000-7000-8000-000070e00001';

/** CTG-0001 §10.8 — as duas linhas de `portal.inbox_item`. */
const INBOX_FIXTURES: Row[] = [
  {
    id: INBOX.sneUnread,
    subject_id: SUBJECTS.prata.id,
    kind: 'SNE',
    action_required: true,
    source: 'sne',
    source_event_id: '00000000-0000-7000-8000-000071b00001',
    subject_line: 'Notificação de autuação disponível',
    summary: 'fixture',
    ait_id: AITS.f2,
    request_id: null,
    available_on: '2026-09-01',
    read_on: null,
    fictitious_acknowledgement_on: '2026-10-01',
    deadline_due_on: '2026-10-01',
    deadline_owned_by: 'citizen',
  },
  {
    id: INBOX.portalRead,
    subject_id: SUBJECTS.prata.id,
    kind: 'PROCESSO',
    action_required: false,
    source: 'portal',
    source_event_id: '00000000-0000-7000-8000-000071b00002',
    subject_line: 'Pedido em andamento',
    summary: 'fixture',
    ait_id: null,
    request_id: '00000000-0000-7000-8000-000070400009',
    available_on: '2026-09-10',
    read_on: '2026-09-11',
    fictitious_acknowledgement_on: null,
    deadline_due_on: null,
    deadline_owned_by: null,
  },
];

const SNE_FIXTURE: Row = {
  id: ENROLLMENT_PRATA,
  subject_id: SUBJECTS.prata.id,
  state: 'ADERIDO_SNE',
  channel: 'email',
  email: 'prata@fixtures.invalid',
  phone: null,
  consent_text_version: '1',
  effects_ack: {
    ciencia_ficta: true,
    canal_exclusivo: true,
    desconto_60: true,
    cancelamento: true,
  },
  since: new Date('2026-08-01T12:00:00-04:00'),
  cancelled_at: null,
  cancel_reason: null,
};

function subjectOf(key: keyof typeof SUBJECTS) {
  return {
    subjectId: SUBJECTS[key].id,
    name: null,
    observedAt: FIXED_NOW,
    version: 1,
  };
}

function harness(options: { sneRows?: Row[] } = {}) {
  const db = new FakeSqlDatabase({
    tenantId: TENANT_ID,
    tenant: { slug: TENANT_SLUG },
    now: fixedClock.now,
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
    'portal.inbox_item',
    INBOX_FIXTURES.map((row) => ({ ...row })),
  );
  db.seed(
    'portal.sne_enrollment',
    (options.sneRows ?? [SNE_FIXTURE]).map((row) => ({ ...row })),
  );
  const outbox = new SqlTeatEventOutbox();
  const providers = {
    PortalIdentityService: new PortalIdentityService(fixedClock as never),
    PortalClock: fixedClock,
    Database: fakeDatabase(db.tx),
    RequestContext: fakeRequestContext(),
    SqlTeatEventOutbox: outbox,
    TEAT_EVENT_OUTBOX: outbox,
  };
  const inbox = constructInjectable(
    PortalInboxService,
    providers,
  ) as unknown as {
    read: (tx: unknown, subject: unknown, id: string) => Promise<Row>;
  };
  const sne = constructInjectable(PortalSneEnrollmentService, {
    ...providers,
    PortalInboxService: inbox,
  }) as unknown as {
    enroll: (
      tx: unknown,
      subject: unknown,
      identity: unknown,
      body: unknown,
    ) => Promise<Row>;
    cancel: (
      tx: unknown,
      subject: unknown,
      identity: unknown,
      reason?: string,
    ) => Promise<Row>;
    get: (tx: unknown, subject: unknown) => Promise<Row>;
  };
  return { db, inbox, sne };
}

function itemRow(db: FakeSqlDatabase, id: string): Row {
  return db.rows('portal.inbox_item').find((row) => row.id === id)!;
}

const VALID_CONSENT = {
  textVersion: '1',
  effectsAck: [...CONTRACT_SNE_EFFECTS],
};

describe('CTG-0002 §6.3 — fictitiousAcknowledgementOn (C-0002-33)', () => {
  it('C-0002-33 — dado availableOn 2026-09-01 quando fictitiousAcknowledgementOn então available + duração de T-SNE-CIENCIA lida de StaticTimerCatalog', () => {
    const definition = new StaticTimerCatalog().get('T-SNE-CIENCIA');
    expect(definition.owner).toBe('infracao');
    expect(definition.durationUnit).toBe('dias_corridos');
    expect(typeof definition.durationValue).toBe('number');
    const expected = addCalendarDays('2026-09-01', definition.durationValue!);
    expect(fictitiousAcknowledgementOn('2026-09-01')).toBe(expected);
    // a fixture …70c00001 (available_on 2026-09-01 → 2026-10-01) é coerente com o catálogo
    expect(fictitiousAcknowledgementOn('2026-09-01')).toBe(
      String(INBOX_FIXTURES[0]!.fictitious_acknowledgement_on),
    );
    expect(fictitiousAcknowledgementOn('2026-12-20')).toBe(
      addCalendarDays('2026-12-20', definition.durationValue!),
    );
  });
});

describe('CTG-0002 §6.1 — PortalInboxService.read (C-0002-34, C-0002-35)', () => {
  it("C-0002-34 — dado item source 'sne' não lido quando read então read_on = today, acknowledgement_evidence (displayed_sha256 = sha256 do canonicalJson exibido), INBOX_LIDO e NOTIFICACAO_CIENCIA na outbox; quando read de novo então nenhuma escrita e mesma resposta", async () => {
    const { db, inbox } = harness();
    const first = await inbox.read(db.tx, subjectOf('prata'), INBOX.sneUnread);
    expect(first).toMatchObject({ id: INBOX.sneUnread, readOn: FIXED_TODAY });
    const evidence = first.acknowledgementEvidence as Row;
    expect(evidence).toBeTruthy();
    const displayed = canonicalJson({
      availableOn: '2026-09-01',
      fictitiousAcknowledgementOn: '2026-10-01',
      id: INBOX.sneUnread,
      subjectLine: 'Notificação de autuação disponível',
      summary: 'fixture',
    });
    const displayedSha256 = createHash('sha256')
      .update(displayed)
      .digest('hex');
    expect(evidence.displayedSha256).toBe(displayedSha256);
    expect(new Date(String(evidence.acknowledgedAt)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    expect(String(itemRow(db, INBOX.sneUnread).read_on).slice(0, 10)).toBe(
      FIXED_TODAY,
    );
    const evidences = db
      .rows('portal.acknowledgement_evidence')
      .filter((row) => row.inbox_item_id === INBOX.sneUnread);
    expect(evidences).toHaveLength(1);
    expect(evidences[0]).toMatchObject({
      displayed_sha256: displayedSha256,
      signature_ref: null,
    });

    const read = outboxEnvelopes(db, TOPICS.inboxRead);
    expect(read).toHaveLength(1);
    expect(read[0]).toMatchObject({
      domainEvent: 'INBOX_LIDO',
      aggregate: { kind: 'portal.inbox_item', id: INBOX.sneUnread, version: 1 },
    });
    expect(read[0]!.data).toMatchObject({
      inboxItemId: INBOX.sneUnread,
      subjectId: SUBJECTS.prata.id,
      subjectCpfHash: SUBJECTS.prata.cpfHash,
      source: 'sne',
      aitId: AITS.f2,
      readOn: FIXED_TODAY,
    });
    const acknowledged = outboxEnvelopes(db, TOPICS.notificationAcknowledged);
    expect(acknowledged).toHaveLength(1);
    expect(acknowledged[0]).toMatchObject({
      domainEvent: 'NOTIFICACAO_CIENCIA',
    });
    expect(acknowledged[0]!.data).toMatchObject({
      inboxItemId: INBOX.sneUnread,
      evidenceSha256: displayedSha256,
      fictitious: false,
      readOn: FIXED_TODAY,
      aitId: AITS.f2,
    });
    expect(JSON.stringify(acknowledged[0]!.data)).not.toContain(TENANT_ID);

    const writesBefore = db.log.length;
    const second = await inbox.read(db.tx, subjectOf('prata'), INBOX.sneUnread);
    expect(second).toEqual(first);
    expect(
      db
        .rows('portal.acknowledgement_evidence')
        .filter((row) => row.inbox_item_id === INBOX.sneUnread),
    ).toHaveLength(1);
    expect(outboxEnvelopes(db, TOPICS.inboxRead)).toHaveLength(1);
    expect(outboxEnvelopes(db, TOPICS.notificationAcknowledged)).toHaveLength(
      1,
    );
    const writes = db.log
      .slice(writesBefore)
      .filter((entry) => /^\s*(insert|update|delete)/i.test(entry.sql));
    expect(writes).toEqual([]);
  });

  it("C-0002-35 — dado item source 'portal' quando read então read_on, INBOX_LIDO, sem evidência e sem NOTIFICACAO_CIENCIA", async () => {
    const { db, inbox } = harness();
    itemRow(db, INBOX.portalRead).read_on = null;
    const response = await inbox.read(
      db.tx,
      subjectOf('prata'),
      INBOX.portalRead,
    );
    expect(response).toMatchObject({
      id: INBOX.portalRead,
      readOn: FIXED_TODAY,
      acknowledgementEvidence: null,
    });
    expect(String(itemRow(db, INBOX.portalRead).read_on).slice(0, 10)).toBe(
      FIXED_TODAY,
    );
    expect(db.rows('portal.acknowledgement_evidence')).toHaveLength(0);
    expect(outboxEnvelopes(db, TOPICS.inboxRead)).toHaveLength(1);
    expect(outboxEnvelopes(db, TOPICS.inboxRead)[0]!.data).toMatchObject({
      source: 'portal',
      requestId: '00000000-0000-7000-8000-000070400009',
    });
    expect(outboxEnvelopes(db, TOPICS.notificationAcknowledged)).toHaveLength(
      0,
    );
  });

  it("§6.1 — dado item de outro sujeito ou inexistente quando read então 404 PORTAL.NOT_FOUND { kind: 'inbox_item' } e nenhuma escrita", async () => {
    const { db, inbox } = harness();
    await expect(
      inbox.read(db.tx, subjectOf('ouro'), INBOX.sneUnread),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      status: 404,
      context: { kind: 'inbox_item' },
    });
    await expect(
      inbox.read(
        db.tx,
        subjectOf('prata'),
        '00000000-0000-7000-8000-000070c000ff',
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.NOT_FOUND',
      context: { kind: 'inbox_item' },
    });
    expect(itemRow(db, INBOX.sneUnread).read_on).toBeNull();
    expect(outboxEnvelopes(db)).toHaveLength(0);
  });
});

describe('CTG-0002 §6.2 — PortalSneEnrollmentService.enroll (C-0002-36)', () => {
  it("C-0002-36 — dado enroll sem email e sem phone então 422 SNE_CONTACT_REQUIRED { missing: ['email','phone'] }", async () => {
    const { db, sne } = harness();
    await expect(
      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
        consent: VALID_CONSENT,
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.SNE_CONTACT_REQUIRED',
      status: 422,
      context: { missing: ['email', 'phone'] },
    });
    expect(
      db
        .rows('portal.sne_enrollment')
        .filter((row) => row.subject_id === SUBJECTS.ouro.id),
    ).toHaveLength(0);
  });

  it("C-0002-36 — dado effectsAck com 3 efeitos então 400 VALIDATION_FAILED { fields: ['consent.effectsAck'] }; efeitos repetidos idem", async () => {
    const { db, sne } = harness();
    await expect(
      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
        email: 'ouro@fixtures.invalid',
        consent: {
          textVersion: '1',
          effectsAck: CONTRACT_SNE_EFFECTS.slice(0, 3),
        },
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['consent.effectsAck'] },
    });
    await expect(
      sne.enroll(db.tx, subjectOf('ouro'), identityOf('ouro'), {
        email: 'ouro@fixtures.invalid',
        consent: {
          textVersion: '1',
          effectsAck: [
            CONTRACT_SNE_EFFECTS[0],
            CONTRACT_SNE_EFFECTS[0],
            CONTRACT_SNE_EFFECTS[1],
            CONTRACT_SNE_EFFECTS[2],
          ],
        },
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.VALIDATION_FAILED',
      status: 400,
      context: { fields: ['consent.effectsAck'] },
    });
    expect(SNE_EFFECTS).toEqual(CONTRACT_SNE_EFFECTS);
    expect(
      SNE_ENROLLMENT_BODY.safeParse({
        email: 'a@b.invalid',
        consent: VALID_CONSENT,
      }).success,
    ).toBe(true);
    expect(
      SNE_ENROLLMENT_BODY.safeParse({
        email: 'a@b.invalid',
        consent: VALID_CONSENT,
        extra: 1,
      }).success,
    ).toBe(false);
    expect(
      SNE_ENROLLMENT_BODY.safeParse({
        phone: '9299999999',
        channel: 'push',
        consent: VALID_CONSENT,
      }).success,
    ).toBe(true);
    expect(
      SNE_ENROLLMENT_BODY.safeParse({ phone: '12', consent: VALID_CONSENT })
        .success,
    ).toBe(false);
  });

  it("C-0002-36 — dado identity 'simples' então 403 ASSURANCE_INSUFFICIENT { actKey: 'adesao_sne', resumeRoute: '/v1/portal/sne/enrollment' } (A1(a))", async () => {
    const { db, sne } = harness();
    await expect(
      sne.enroll(db.tx, subjectOf('bronze'), identityOf('bronze'), {
        email: 'bronze@fixtures.invalid',
        consent: VALID_CONSENT,
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
      status: 403,
      context: {
        actKey: 'adesao_sne',
        required: 'avancada',
        current: 'simples',
        resumeRoute: '/v1/portal/sne/enrollment',
      },
    });
  });

  it('C-0002-36 — dado ADERIDO_SNE então 409 SNE_ALREADY_ENROLLED {}', async () => {
    const { db, sne } = harness();
    await expect(
      sne.enroll(db.tx, subjectOf('prata'), identityOf('prata'), {
        email: 'prata@fixtures.invalid',
        consent: VALID_CONSENT,
      }),
    ).rejects.toMatchObject({
      code: 'PORTAL.SNE_ALREADY_ENROLLED',
      status: 409,
    });
    expect(outboxEnvelopes(db, TOPICS.sneEnrollmentChanged)).toHaveLength(0);
  });

  it('C-0002-36 — dado NAO_ADERIDO_SNE (cancelada) então re-adesão com since novo e cancelled_at null; effects_ack = os quatro true; SNE_ADESAO_SOLICITADA', async () => {
    const cancelledId = '00000000-0000-7000-8000-000070e000e1';
    const { db, sne } = harness({
      sneRows: [
        SNE_FIXTURE,
        {
          id: cancelledId,
          subject_id: SUBJECTS.ouro.id,
          state: 'NAO_ADERIDO_SNE',
          channel: null,
          email: 'antigo@fixtures.invalid',
          phone: null,
          consent_text_version: '0',
          effects_ack: null,
          since: new Date('2026-06-01T12:00:00-04:00'),
          cancelled_at: new Date('2026-07-01T12:00:00-04:00'),
          cancel_reason: 'fixture',
        },
      ],
    });
    const response = await sne.enroll(
      db.tx,
      subjectOf('ouro'),
      identityOf('ouro'),
      {
        email: 'ouro@fixtures.invalid',
        phone: '92999999999',
        channel: 'email',
        consent: { textVersion: '2', effectsAck: [...CONTRACT_SNE_EFFECTS] },
      },
    );
    expect(response).toMatchObject({ enrolled: true, channel: 'email' });
    expect(new Date(String(response.since)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const rows = db
      .rows('portal.sne_enrollment')
      .filter((row) => row.subject_id === SUBJECTS.ouro.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: cancelledId,
      state: 'ADERIDO_SNE',
      channel: 'email',
      email: 'ouro@fixtures.invalid',
      phone: '92999999999',
      consent_text_version: '2',
      cancelled_at: null,
      cancel_reason: null,
      effects_ack: {
        ciencia_ficta: true,
        canal_exclusivo: true,
        desconto_60: true,
        cancelamento: true,
      },
    });
    expect(new Date(String(rows[0]!.since)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const events = outboxEnvelopes(db, TOPICS.sneEnrollmentChanged);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      domainEvent: 'SNE_ADESAO_SOLICITADA',
      aggregate: { kind: 'portal.sne_enrollment', id: cancelledId, version: 1 },
    });
    expect(events[0]!.data).toMatchObject({
      enrollmentId: cancelledId,
      subjectId: SUBJECTS.ouro.id,
      subjectCpfHash: SUBJECTS.ouro.cpfHash,
      toState: 'ADERIDO_SNE',
      channel: 'email',
      consentTextVersion: '2',
    });
    expect(events[0]!.data).not.toHaveProperty('email');
    expect(events[0]!.data).not.toHaveProperty('phone');
  });

  it('§6.2 — dado SNE_ENROLLMENT_TRANSITIONS então as três linhas de CTG-0001 §6.3 (enroll de nada e de NAO_ADERIDO_SNE; cancel de ADERIDO_SNE)', () => {
    const rows = SNE_ENROLLMENT_TRANSITIONS as ReadonlyArray<{
      from: string | null;
      to: string;
      command: string;
    }>;
    expect(
      rows.map(({ from, to, command }) => ({ from, to, command })),
    ).toEqual([
      { from: null, to: 'ADERIDO_SNE', command: 'enroll' },
      { from: 'NAO_ADERIDO_SNE', to: 'ADERIDO_SNE', command: 'enroll' },
      { from: 'ADERIDO_SNE', to: 'NAO_ADERIDO_SNE', command: 'cancel' },
    ]);
  });
});

describe('CTG-0002 §6.2 — PortalSneEnrollmentService.cancel e get (C-0002-37)', () => {
  it('C-0002-37 — dado cancel sem linha então 409 SNE_NOT_ENROLLED {}; dado NAO_ADERIDO_SNE idem', async () => {
    const { db, sne } = harness();
    await expect(
      sne.cancel(db.tx, subjectOf('ouro'), identityOf('ouro'), 'motivo'),
    ).rejects.toMatchObject({
      code: 'PORTAL.SNE_NOT_ENROLLED',
      status: 409,
    });
    const row = db
      .rows('portal.sne_enrollment')
      .find((candidate) => candidate.id === ENROLLMENT_PRATA)!;
    row.state = 'NAO_ADERIDO_SNE';
    await expect(
      sne.cancel(db.tx, subjectOf('prata'), identityOf('prata')),
    ).rejects.toMatchObject({
      code: 'PORTAL.SNE_NOT_ENROLLED',
      status: 409,
    });
    expect(outboxEnvelopes(db, TOPICS.sneEnrollmentChanged)).toHaveLength(0);
  });

  it('C-0002-37 — dado ADERIDO_SNE então NAO_ADERIDO_SNE, cancelled_at, cancel_reason, SNE_CANCELAMENTO_SOLICITADO com aggregate.version = 2 (adesão = 1)', async () => {
    const { db, sne } = harness();
    const enrolled = await sne.enroll(
      db.tx,
      subjectOf('ouro'),
      identityOf('ouro'),
      { email: 'ouro@fixtures.invalid', consent: VALID_CONSENT },
    );
    expect(enrolled).toMatchObject({ enrolled: true, cancelable: true });
    expect(await sne.get(db.tx, subjectOf('ouro'))).toMatchObject({
      enrolled: true,
      cancelable: true,
      channel: null,
    });

    const response = await sne.cancel(
      db.tx,
      subjectOf('ouro'),
      identityOf('ouro'),
      'mudança de canal',
    );
    expect(response).toMatchObject({
      enrolled: false,
      since: null,
      cancelable: false,
    });
    expect(new Date(String(response.cancelledAt)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );

    const row = db
      .rows('portal.sne_enrollment')
      .find((candidate) => candidate.subject_id === SUBJECTS.ouro.id)!;
    expect(row).toMatchObject({
      state: 'NAO_ADERIDO_SNE',
      cancel_reason: 'mudança de canal',
    });
    expect(new Date(String(row.cancelled_at)).getTime()).toBe(
      FIXED_NOW.getTime(),
    );
    expect(row.since).not.toBeNull();

    const events = outboxEnvelopes(db, TOPICS.sneEnrollmentChanged);
    expect(
      events.map((event) => [
        event.domainEvent,
        (event.aggregate as Row).version,
      ]),
    ).toEqual([
      ['SNE_ADESAO_SOLICITADA', 1],
      ['SNE_CANCELAMENTO_SOLICITADO', 2],
    ]);
    expect(events[1]!.data).toMatchObject({
      enrollmentId: row.id,
      subjectId: SUBJECTS.ouro.id,
      fromState: 'ADERIDO_SNE',
      toState: 'NAO_ADERIDO_SNE',
    });
    expect(
      new Set(
        db.rows('integration.outbox').map((entry) => entry.idempotency_key),
      ).size,
    ).toBe(2);

    expect(await sne.get(db.tx, subjectOf('ouro'))).toMatchObject({
      enrolled: false,
      since: null,
      cancelable: false,
    });
    expect(await sne.get(db.tx, subjectOf('bronze'))).toEqual({
      enrolled: false,
      since: null,
      channel: null,
      cancelable: false,
    });
  });

  it("C-0002-37 — dado identity 'simples' quando cancel então 403 ASSURANCE_INSUFFICIENT { actKey: 'cancelamento_sne' }", async () => {
    const { db, sne } = harness();
    await expect(
      sne.cancel(db.tx, subjectOf('prata'), identityOf('prata', 'simples')),
    ).rejects.toMatchObject({
      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
      status: 403,
      context: {
        actKey: 'cancelamento_sne',
        resumeRoute: '/v1/portal/sne/enrollment',
      },
    });
  });
});
