// R-0009 CTG-0002 §7.1, §7.3, §7.5 e §13 (TASK-0006) — C-0002-46…51, 55, 56:
// projetor `infraction_view` (`INFRACTION_SITUATION_MAP` com os 15 códigos de
// `inf.infraction_state_ref`, `POINTS_STATUS_BY_SITUATION`, `actions[]` pelo
// catálogo, enriquecimento pela porta, notices/payment, ordem por
// `aggregate.version`, idempotência por `event.id`, `payment_json.methods`
// pelos parâmetros). Fica vermelho até TASK-0008 criar `projectors.service.ts`,
// `infraction-view.projection.ts` e `national-reads.service.ts` (§14).
//
// Os 15 códigos abaixo são a lista `STATES` de
// `backend/domains/inf/infraction/src/handwritten/events.ts` (= DDL 14
// `inf.infraction_state_ref`, ordem de `sort_order`) — transcrita porque o
// módulo não a exporta.
import { describe, expect, it } from 'vitest';

import { type Row } from '../../../requests/tests/support/fake-sql.js';
import {
  AITS,
  INFRACTIONS,
  SUBJECTS,
} from '../../../requests/tests/support/portal-fixtures.js';
import {
  AIT_F1,
  AIT_F2,
  AIT_F9,
  CONSUMED_TYPES,
  EVENT_IDS,
  NOTICE_103,
  OUTBOX_EVENTS,
  eventById,
} from '../../tests/fixtures/outbox-events.js';
import { projectorsHarness } from '../../tests/support/projectors-harness.js';
import {
  ACTION_PHASE_MATRIX,
  ACTION_SERVICE_KEY,
  INFRACTION_SITUATION_MAP,
  POINTS_STATUS_BY_SITUATION,
} from './infraction-view.projection.js';

/** `inf.infraction_state_ref.code` (DDL 14; events.ts STATES) — 15 tokens. */
const INFRACTION_STATES = [
  'AIT_LAVRADO',
  'NOTIFICADO_AUTUACAO',
  'DEFESA_EM_JULGAMENTO',
  'PENALIDADE_A_APLICAR',
  'NOTIFICADO_PENALIDADE',
  'RECURSO_1A_INSTANCIA',
  'AGUARDANDO_RECURSO_2A',
  'RECURSO_2A_INSTANCIA',
  'INSTANCIA_ENCERRADA',
  'ARQUIVADO',
  'CANCELADO_POS_INTEGRACAO',
  'AIT_CANCELADO',
  'EXTINTO_DECADENCIA',
  'EXTINTO_PRESCRICAO',
  'CANCELADO_DEFINITIVO',
] as const;

/** `portal.infraction_view.situation` (DDL 65; M16) — 7 rótulos cidadãos. */
const SITUATIONS = [
  'aguardando_defesa',
  'em_defesa',
  'penalidade_aplicada',
  'em_recurso',
  'encerrada',
  'cancelada',
  'arquivada',
];
const PROJECTION = 'infraction_view';

function infractionChanged(overrides: {
  id: string;
  aitId: string;
  infractionId: string;
  version: number;
  fromState: string | null;
  toState: string;
  substate?: string;
}) {
  return {
    ...eventById(EVENT_IDS.e1),
    id: overrides.id,
    aggregate: {
      kind: 'infraction',
      id: overrides.infractionId,
      version: overrides.version,
    },
    data: {
      infractionId: overrides.infractionId,
      aitId: overrides.aitId,
      fromState: overrides.fromState,
      toState: overrides.toState,
      ...(overrides.substate ? { substate: overrides.substate } : {}),
    },
  };
}

const eventId = (nn: number) =>
  `00000000-0000-7000-8000-0070007000${nn.toString(16).padStart(2, '0')}`;

describe('CTG-0002 §7.3 — INFRACTION_SITUATION_MAP e POINTS_STATUS_BY_SITUATION (C-0002-46, C-0002-47)', () => {
  it('C-0002-46 — dado os 15 códigos de inf.infraction_state_ref então o mapa tem 15 chaves, 12 com situation do DDL 65 e exatamente AIT_LAVRADO, PENALIDADE_A_APLICAR, AGUARDANDO_RECURSO_2A undefined (OD-P20)', () => {
    expect(Object.keys(INFRACTION_SITUATION_MAP).sort()).toEqual(
      [...INFRACTION_STATES].sort(),
    );
    const undefinedStates = INFRACTION_STATES.filter(
      (state) => INFRACTION_SITUATION_MAP[state] === undefined,
    );
    expect(undefinedStates).toEqual([
      'AIT_LAVRADO',
      'PENALIDADE_A_APLICAR',
      'AGUARDANDO_RECURSO_2A',
    ]);
    const mapped = INFRACTION_STATES.filter(
      (state) => INFRACTION_SITUATION_MAP[state] !== undefined,
    );
    expect(mapped).toHaveLength(12);
    for (const state of mapped)
      expect(SITUATIONS, state).toContain(INFRACTION_SITUATION_MAP[state]);
    expect(INFRACTION_SITUATION_MAP).toMatchObject({
      NOTIFICADO_AUTUACAO: 'aguardando_defesa',
      DEFESA_EM_JULGAMENTO: 'em_defesa',
      NOTIFICADO_PENALIDADE: 'penalidade_aplicada',
      RECURSO_1A_INSTANCIA: 'em_recurso',
      RECURSO_2A_INSTANCIA: 'em_recurso',
      INSTANCIA_ENCERRADA: 'encerrada',
      ARQUIVADO: 'arquivada',
      CANCELADO_POS_INTEGRACAO: 'cancelada',
      AIT_CANCELADO: 'cancelada',
      EXTINTO_DECADENCIA: 'arquivada',
      EXTINTO_PRESCRICAO: 'arquivada',
      CANCELADO_DEFINITIVO: 'cancelada',
    });
  });

  it("C-0002-46 — dado evento com toState sem rótulo (AIT_LAVRADO, …7000700010) então applied_event.last_error começa com 'PORTAL.INTERNAL:situation:' e a view não muda", async () => {
    const h = projectorsHarness({
      seed: (db) =>
        db.seed('portal.infraction_view', [
          {
            ...h0View(),
            ait_id: AIT_F1,
            id: '00000000-0000-7000-8000-000070f000e1',
            ait_number: 'FIX-00000e1',
            plate: 'FIX2EE1',
          },
        ]),
    });
    const before = { ...h.view(AIT_F1)! };
    const outcome = await h.apply(eventById(EVENT_IDS.e10), PROJECTION);
    expect(outcome.applied).toBe(false);
    expect(String(outcome.error)).toMatch(
      /^PORTAL\.INTERNAL:situation:AIT_LAVRADO/,
    );
    const applied = h.appliedEvents(EVENT_IDS.e10);
    expect(applied).toHaveLength(1);
    expect(String(applied[0]!.last_error)).toMatch(
      /^PORTAL\.INTERNAL:situation:/,
    );
    expect(h.view(AIT_F1)).toEqual(before);
  });

  it('C-0002-47 — dado cada situation então POINTS_STATUS_BY_SITUATION conforme §7.3 (7 linhas)', () => {
    expect(POINTS_STATUS_BY_SITUATION).toEqual({
      aguardando_defesa: 'none',
      em_defesa: 'em_disputa',
      penalidade_aplicada: 'definitivo',
      em_recurso: 'em_disputa',
      encerrada: 'definitivo',
      cancelada: 'none',
      arquivada: 'none',
    });
  });
});

function h0View(): Row {
  return {
    subject_cpf_hash: SUBJECTS.bronze.cpfHash,
    framing_label: 'fixture',
    amount: 195.23,
    occurred_at: new Date('2026-05-01T12:00:00-04:00'),
    situation: 'aguardando_defesa',
    deadlines_json: [],
    points_status: 'none',
    actions_json: [],
    notices_json: [],
    payment_json: {},
    last_event_id: '00000000-0000-0000-0000-000000000000',
    last_event_version: 0,
  };
}

describe('CTG-0002 §7.3 — actions[] pelo catálogo e pela fase (C-0002-48)', () => {
  it('C-0002-48 — dado ACTION_PHASE_MATRIX e ACTION_SERVICE_KEY então a tabela do §7.3', () => {
    expect(ACTION_SERVICE_KEY).toEqual({
      defend: 'defesa_previa',
      indicate_driver: 'indicacao_condutor',
      pay: 'pagamento',
      appeal_jari: 'recurso_jari',
      appeal_cetran: 'recurso_cetran',
    });
    const matrix = ACTION_PHASE_MATRIX as Record<
      string,
      Record<string, boolean>
    >;
    expect(Object.keys(matrix).sort()).toEqual([...SITUATIONS].sort());
    const expected: Record<
      string,
      [boolean, boolean, boolean, boolean, boolean]
    > = {
      aguardando_defesa: [true, true, true, false, false],
      em_defesa: [false, false, true, false, false],
      penalidade_aplicada: [false, false, true, true, false],
      em_recurso: [false, false, true, false, false],
      encerrada: [false, false, true, false, false],
      cancelada: [false, false, false, false, false],
      arquivada: [false, false, false, false, false],
    };
    for (const [
      situation,
      [defend, indicate, pay, jari, cetran],
    ] of Object.entries(expected)) {
      expect(matrix[situation], situation).toEqual({
        defend,
        indicate_driver: indicate,
        pay,
        appeal_jari: jari,
        appeal_cetran: cetran,
      });
    }
  });

  it("C-0002-48 — dado catálogo das fixtures (9/2/4) e situation 'aguardando_defesa' então defend/indicate_driver indisponíveis por 'delegacao_indisponivel_r0007', pay disponível, appeal_* 'fase_nao_admite'", async () => {
    const h = projectorsHarness();
    const outcome = await h.apply(eventById(EVENT_IDS.e1), PROJECTION);
    expect(outcome.applied).toBe(true);
    const view = h.view(AIT_F2)!;
    expect(view.situation).toBe('aguardando_defesa');
    const actions = Object.fromEntries(
      (view.actions_json as Row[]).map((action) => [action.key, action]),
    );
    expect(Object.keys(actions).sort()).toEqual([
      'appeal_cetran',
      'appeal_jari',
      'defend',
      'indicate_driver',
      'pay',
    ]);
    expect(actions.defend).toEqual({
      key: 'defend',
      available: false,
      reason: 'delegacao_indisponivel_r0007',
      minimumAssurance: 'avancada',
    });
    expect(actions.indicate_driver).toEqual({
      key: 'indicate_driver',
      available: false,
      reason: 'delegacao_indisponivel_r0007',
      minimumAssurance: 'avancada',
    });
    expect(actions.pay).toEqual({
      key: 'pay',
      available: true,
      reason: null,
      minimumAssurance: 'simples',
    });
    expect(actions.appeal_jari).toMatchObject({
      available: false,
      reason: 'fase_nao_admite',
    });
    expect(actions.appeal_cetran).toMatchObject({
      available: false,
      reason: 'fase_nao_admite',
    });
  });

  it("C-0002-48 — dado 'cancelada' então os cinco false; dado serviço ausente do catálogo então reason 'servico_ausente_no_catalogo'", async () => {
    const h = projectorsHarness();
    const cancel = infractionChanged({
      id: eventId(0x21),
      aitId: AITS.f12,
      infractionId: '00000000-0000-7000-8000-0000d0000012',
      version: 5,
      fromState: 'NOTIFICADO_AUTUACAO',
      toState: 'AIT_CANCELADO',
    });
    expect((await h.apply(cancel, PROJECTION)).applied).toBe(true);
    const cancelled = h.view(AITS.f12)!;
    expect(cancelled.situation).toBe('cancelada');
    expect(
      (cancelled.actions_json as Row[]).every(
        (action) => action.available === false,
      ),
    ).toBe(true);
    expect(
      (cancelled.actions_json as Row[]).map((action) => action.reason),
    ).toEqual(Array(5).fill('fase_nao_admite'));

    const withoutPayment = projectorsHarness({
      catalog: (rows) => rows.filter((row) => row.service_key !== 'pagamento'),
    });
    expect(
      (await withoutPayment.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied,
    ).toBe(true);
    const pay = (withoutPayment.view(AIT_F2)!.actions_json as Row[]).find(
      (action) => action.key === 'pay',
    );
    expect(pay).toMatchObject({
      available: false,
      reason: 'servico_ausente_no_catalogo',
    });
  });
});

describe('CTG-0002 §7.3 — INFRACAO_ESTADO_ALTERADO: versão, enriquecimento, vínculo (C-0002-49)', () => {
  it("C-0002-49 — dado view …70f00001 (last_event_version 0) e toState DEFESA_EM_JULGAMENTO v3 então situation 'em_defesa', points_status 'em_disputa', last_event_id/version; dado evento v2 depois do v3 então skipped 'stale_version' sem applied_event", async () => {
    const h = projectorsHarness();
    const v3 = eventById(EVENT_IDS.e2);
    const outcome = await h.apply(v3, PROJECTION);
    expect(outcome).toMatchObject({ projection: PROJECTION, applied: true });
    expect(h.view(AIT_F2)).toMatchObject({
      situation: 'em_defesa',
      points_status: 'em_disputa',
      last_event_id: EVENT_IDS.e2,
      last_event_version: 3,
    });
    expect(h.appliedEvents(EVENT_IDS.e2)).toHaveLength(1);
    expect(h.appliedEvents(EVENT_IDS.e2)[0]).toMatchObject({
      projection: PROJECTION,
      last_error: null,
    });

    const stale = await h.apply(eventById(EVENT_IDS.e1), PROJECTION);
    expect(stale).toMatchObject({ applied: false, skipped: 'stale_version' });
    expect(h.view(AIT_F2)).toMatchObject({
      situation: 'em_defesa',
      last_event_id: EVENT_IDS.e2,
      last_event_version: 3,
    });
    expect(h.appliedEvents(EVENT_IDS.e1)).toHaveLength(0);
  });

  it("C-0002-49 — dado aitId sem view e source.loadAitIdentity → null então last_error 'PORTAL.INTERNAL:ait_identity:<aitId>'", async () => {
    const h = projectorsHarness({ identities: { [AIT_F1]: null } });
    const event = infractionChanged({
      id: eventId(0x22),
      aitId: AIT_F1,
      infractionId: INFRACTIONS.d1,
      version: 2,
      fromState: 'AIT_LAVRADO',
      toState: 'NOTIFICADO_AUTUACAO',
    });
    const outcome = await h.apply(event, PROJECTION);
    expect(outcome.applied).toBe(false);
    expect(outcome.error).toBe(`PORTAL.INTERNAL:ait_identity:${AIT_F1}`);
    expect(h.source.loadAitIdentity).toHaveBeenCalledTimes(1);
    expect(h.view(AIT_F1)).toBeUndefined();
    expect(h.appliedEvents(eventId(0x22))[0]).toMatchObject({
      last_error: `PORTAL.INTERNAL:ait_identity:${AIT_F1}`,
    });
  });

  it("C-0002-49 — dado source com identidade e portal.subject existente para o cpf_hash então view inserida e entitlement (owner, origin 'infraction')", async () => {
    const h = projectorsHarness({
      identities: {
        [AIT_F1]: {
          aitNumber: 'FIX-00000e1',
          plate: 'FIX2EE1',
          occurredAt: '2026-05-20T12:00:00-04:00',
          framingLabel: 'fixture',
          amount: 130.16,
          subjectCpfHashes: [SUBJECTS.bronze.cpfHash, 'f'.repeat(64)],
        },
      },
      deadlines: [],
    });
    const event = infractionChanged({
      id: eventId(0x23),
      aitId: AIT_F1,
      infractionId: INFRACTIONS.d1,
      version: 2,
      fromState: 'AIT_LAVRADO',
      toState: 'NOTIFICADO_AUTUACAO',
      substate: 'PRAZO_DEFESA_ABERTO',
    });
    const outcome = await h.apply(event, PROJECTION);
    expect(outcome.applied).toBe(true);
    const view = h.view(AIT_F1)!;
    expect(view).toMatchObject({
      subject_cpf_hash: SUBJECTS.bronze.cpfHash,
      ait_number: 'FIX-00000e1',
      plate: 'FIX2EE1',
      framing_label: 'fixture',
      amount: 130.16,
      situation: 'aguardando_defesa',
      points_status: 'none',
      notices_json: [],
      deadlines_json: [],
      last_event_id: eventId(0x23),
      last_event_version: 2,
    });
    expect(view.payment_json).toMatchObject({
      paid: false,
      paidTier: null,
      tiers: [],
    });
    const entitlements = h.db
      .rows('portal.entitlement')
      .filter((row) => row.target_id === AIT_F1);
    // só o cpf_hash com portal.subject existente gera vínculo ('f'*64 não tem sujeito)
    expect(entitlements).toHaveLength(1);
    expect(entitlements[0]).toMatchObject({
      subject_id: SUBJECTS.bronze.id,
      target_kind: 'ait',
      relation: 'owner',
      origin: 'infraction',
    });
    expect(String(entitlements[0]!.valid_from).slice(0, 10)).toBe('2026-05-20');
  });
});

describe('CTG-0002 §7.3/§7.5 — notices e pagamento (C-0002-50, C-0002-51)', () => {
  it("C-0002-50 — dado NOTIFICACAO_EXPEDIDA NA então notices_json += { kind 'NA', channel, dispatchedOn, effectiveOn null, fictitious false, printedDeadline }; dado NOTIFICACAO_CIENCIA inf.notice.acknowledged então effectiveOn/fictitious da entrada", async () => {
    const h = projectorsHarness();
    expect((await h.apply(eventById(EVENT_IDS.e3), PROJECTION)).applied).toBe(
      true,
    );
    expect(h.view(AIT_F2)!.notices_json).toEqual([
      {
        noticeId: NOTICE_103,
        kind: 'NA',
        channel: 'sne',
        dispatchedOn: '2026-09-01',
        effectiveOn: null,
        fictitious: false,
        printedDeadline: '2026-10-01',
      },
    ]);
    expect(h.view(AIT_F2)!.last_event_id).toBe(EVENT_IDS.e3);

    expect((await h.apply(eventById(EVENT_IDS.e4), PROJECTION)).applied).toBe(
      true,
    );
    expect(h.view(AIT_F2)!.notices_json).toEqual([
      {
        noticeId: NOTICE_103,
        kind: 'NA',
        channel: 'sne',
        dispatchedOn: '2026-09-01',
        effectiveOn: '2026-09-11',
        fictitious: false,
        printedDeadline: '2026-10-01',
      },
    ]);
    expect(h.view(AIT_F2)!.situation).toBe('aguardando_defesa');
  });

  it("C-0002-50 — dado NOTIFICACAO_CIENCIA com type portal.notification.acknowledged então skipped 'not_consumed'; DILIGENCIA/EDITAL então só last_event_id; view ausente então last_error", async () => {
    const h = projectorsHarness();
    const portalAck = {
      ...eventById(EVENT_IDS.e4),
      id: eventId(0x31),
      type: CONSUMED_TYPES.portalNotificationAcknowledged,
    };
    const outcome = await h.apply(portalAck, PROJECTION);
    expect(outcome).toMatchObject({ applied: false, skipped: 'not_consumed' });
    expect(h.appliedEvents(eventId(0x31))).toHaveLength(0);
    expect(h.view(AIT_F2)!.notices_json).toEqual([]);

    for (const [index, kind] of (['DILIGENCIA', 'EDITAL'] as const).entries()) {
      const id = eventId(0x32 + index);
      const dispatched = {
        ...eventById(EVENT_IDS.e3),
        id,
        data: {
          ...eventById(EVENT_IDS.e3).data,
          noticeId: `00000000-0000-7000-8000-0070007001${index + 10}`,
          kind,
        },
      };
      expect((await h.apply(dispatched, PROJECTION)).applied, kind).toBe(true);
      expect(h.view(AIT_F2)!.notices_json).toEqual([]);
      expect(h.view(AIT_F2)!.last_event_id).toBe(id);
    }

    const missingView = {
      ...eventById(EVENT_IDS.e3),
      id: eventId(0x34),
      data: {
        ...eventById(EVENT_IDS.e3).data,
        aitId: AIT_F1,
        infractionId: INFRACTIONS.d1,
      },
    };
    const failed = await h.apply(missingView, PROJECTION);
    expect(failed.applied).toBe(false);
    expect(String(failed.error)).toMatch(/^PORTAL\.INTERNAL:/);
    expect(h.appliedEvents(eventId(0x34))[0]!.last_error).toMatch(
      /^PORTAL\.INTERNAL:/,
    );
  });

  it("C-0002-51 — dado PAGAMENTO_CONFIRMADO então payment_json.paid true, paidTier, paidOn e situation inalterada; dado request AGUARDANDO_PAGAMENTO com target ait então 'PROTOCOLADO'", async () => {
    const requestId = '00000000-0000-7000-8000-0000704000e1';
    const h = projectorsHarness({
      seed: (db) =>
        db.seed('portal.request', [
          {
            id: requestId,
            state: 'AGUARDANDO_PAGAMENTO',
            service_key: 'emissao_crlv',
            subject_id: SUBJECTS.qualificada.id,
            target_kind: 'ait',
            target_id: AIT_F9,
            minimum_assurance: 'simples',
            delegation_status: 'pending',
            version: 3,
          },
        ]),
    });
    const before = h.view(AIT_F9)!;
    expect(before.situation).toBe('encerrada');
    expect((await h.apply(eventById(EVENT_IDS.e5), PROJECTION)).applied).toBe(
      true,
    );
    const after = h.view(AIT_F9)!;
    expect(after.situation).toBe('encerrada');
    expect(after.points_status).toBe(before.points_status);
    expect(after.payment_json).toMatchObject({
      paid: true,
      paidTier: 'desconto_80',
      paidOn: '2026-09-10',
    });
    expect(after.last_event_id).toBe(EVENT_IDS.e5);
    const request = h.db
      .rows('portal.request')
      .find((row) => row.id === requestId)!;
    expect(request.state).toBe('PROTOCOLADO');
    expect(Number(request.version)).toBeGreaterThan(3);
  });

  it.todo(
    'dado AGUARDANDO_PAGAMENTO quando PAGAMENTO_CONFIRMADO real de inf/collection então PROTOCOLADO e delegação da emissão — R-0007',
  );
});

describe('CTG-0002 §7.1 — idempotência por event.id (C-0002-55) e parâmetros (C-0002-56)', () => {
  it("C-0002-55 — dado o mesmo evento aplicado duas vezes então a segunda é skipped 'already_applied' e nenhuma coluna muda; projection_applied_event único por (event_id, projection)", async () => {
    const h = projectorsHarness();
    const first = await h.apply(eventById(EVENT_IDS.e2), PROJECTION);
    expect(first.applied).toBe(true);
    const snapshot = JSON.stringify(h.view(AIT_F2));
    const second = await h.apply(eventById(EVENT_IDS.e2), PROJECTION);
    expect(second).toMatchObject({
      projection: PROJECTION,
      applied: false,
      skipped: 'already_applied',
    });
    expect(JSON.stringify(h.view(AIT_F2))).toBe(snapshot);
    expect(h.appliedEvents(EVENT_IDS.e2)).toHaveLength(1);

    // aplicar por fora da API o mesmo par (event_id, projection) viola o unique do DDL 65
    await expect(
      h.db.tx.query(
        `insert into portal.projection_applied_event (event_id, projection, applied_at) values ($1, $2, now())`,
        [EVENT_IDS.e2, PROJECTION],
      ),
    ).rejects.toMatchObject({ code: '23505' });
  });

  it('C-0002-56 — dado leitor de parâmetros falso com card_payment true então payment_json.methods.card = true; demais conforme os valores injetados (chaves lidas pela porta, nunca literais no spec)', async () => {
    const h = projectorsHarness({
      parameters: {
        card_payment: true,
        installments: false,
        waiver_40_term: true,
        discount_40_outside_sne: false,
      },
    });
    expect((await h.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied).toBe(
      true,
    );
    const methods = (h.view(AIT_F2)!.payment_json as Row).methods as Row;
    expect(methods).toEqual({
      card: true,
      installments: false,
      waiver40: true,
      discount40OutsideSne: false,
    });
    const suffixes = h.parameterCalls.map((key) => key.split('.').pop()).sort();
    expect(suffixes).toEqual([
      'card_payment',
      'discount_40_outside_sne',
      'installments',
      'waiver_40_term',
    ]);
    expect(
      h.parameterCalls.every(
        (key) => key.startsWith('portal.') || key.startsWith('collection.'),
      ),
    ).toBe(true);

    const flipped = projectorsHarness({
      parameters: {
        card_payment: false,
        installments: true,
        waiver_40_term: false,
        discount_40_outside_sne: true,
      },
    });
    expect(
      (await flipped.apply(eventById(EVENT_IDS.e1), PROJECTION)).applied,
    ).toBe(true);
    expect((flipped.view(AIT_F2)!.payment_json as Row).methods).toEqual({
      card: false,
      installments: true,
      waiver40: false,
      discount40OutsideSne: true,
    });
  });

  it('§7.1 — dado os 12 eventos de fixture então PORTAL_CONSUMED_ENVELOPE aceita todos (permissivo, OD-P28) e recusa envelope sem aggregate', async () => {
    const { PORTAL_CONSUMED_ENVELOPE } =
      await import('./projectors.service.js');
    for (const event of OUTBOX_EVENTS) {
      expect(PORTAL_CONSUMED_ENVELOPE.safeParse(event).success, event.id).toBe(
        true,
      );
    }
    const { aggregate: _aggregate, ...withoutAggregate } = OUTBOX_EVENTS[0]!;
    expect(PORTAL_CONSUMED_ENVELOPE.safeParse(withoutAggregate).success).toBe(
      false,
    );
  });
});
