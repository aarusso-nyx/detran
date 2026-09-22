// Source events: INFRACAO_ESTADO_ALTERADO (inf.infraction.changed), NOTIFICACAO_EXPEDIDA (inf.notice.dispatched), NOTIFICACAO_CIENCIA (inf.notice.acknowledged), PAGAMENTO_CONFIRMADO (inf.payment.confirmed)
// Source tables: inf.ait_ait, inf.normative_framing, inf.ait_vehicle, ops.snapshots_vehicle, inf.ait_person, ops.snapshots_person
//
// Projeção `portal.infraction_view` (work/rounds/R-0009/contracts/CTG-0002.md
// §7.1, §7.3, §7.5; plan R-0009 M10, M16, M17, adenda A5(a); ADR-0020 §4 —
// este arquivo é o ÚNICO do pacote autorizado a ler `inf.*`, pelo
// `SqlInfractionViewSource`). A tradução estado interno → `situation` cidadã
// é a tabela única `INFRACTION_SITUATION_MAP` (chave = `inf.infraction_state_ref`
// .code, 15 tokens do DDL 14); tokens sem rótulo fixado (OD-P20) ficam
// `undefined` e o evento falha com `PORTAL.INTERNAL:situation:<token>` —
// nunca um rótulo inventado. `actions[]` vem da fase (`ACTION_PHASE_MATRIX`)
// e do catálogo de serviços; `payment_json.methods` dos quatro parâmetros
// (H.53), nunca literal `false`.
export const consumedEvents = [
  'inf.infraction.changed',
  'inf.notice.dispatched',
  'inf.notice.acknowledged',
  'inf.payment.confirmed',
] as const;

import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { cpfHashOf, localDateOf } from '@detran/portal-identity';
import type { PortalSqlTransaction } from '@detran/portal-identity';

import {
  PROJECTION_SENTINEL_EVENT_ID,
  asArray,
  asObject,
  projectionError,
  type PortalConsumedEvent,
  type PortalParameterReader,
  type ProjectionContext,
  type ProjectionResult,
  type Projector,
} from './projection-contract.js';

// ---------------------------------------------------------------------------
// vocabulários (§7.3)
// ---------------------------------------------------------------------------

/** `portal.infraction_view.situation` (DDL 65; M16) — os 7 rótulos cidadãos. */
export const INFRACTION_SITUATIONS = [
  'aguardando_defesa',
  'em_defesa',
  'penalidade_aplicada',
  'em_recurso',
  'encerrada',
  'cancelada',
  'arquivada',
] as const;
export type Situation = (typeof INFRACTION_SITUATIONS)[number];

export type PointsStatus = 'em_disputa' | 'definitivo' | 'none';

// chave = inf.infraction_state_ref.code (15 tokens, DDL 14); valor = situation
// cidadã (M16) com a fonte da tradução. Tokens sem linha → applied_event.last_error
// (PORTAL.INTERNAL) e OD-P20 — nunca rótulo inventado.
export const INFRACTION_SITUATION_MAP: Readonly<
  Record<string, Situation | undefined>
> = {
  AIT_LAVRADO: undefined, // OD-P20: NA não expedida; nenhum dos 7 rótulos cabe
  NOTIFICADO_AUTUACAO: 'aguardando_defesa', // CTG-0001 §10.8 (…70f00001); legal_regime "prazos de defesa … correndo"
  DEFESA_EM_JULGAMENTO: 'em_defesa', // CTG-0001 §10.8 (…70f00002); phase primeiro_circuito
  PENALIDADE_A_APLICAR: undefined, // OD-P20: defesa indeferida, NP não expedida — sem rótulo cidadão fixado
  NOTIFICADO_PENALIDADE: 'penalidade_aplicada', // CTG-0001 §10.8 (…70f00003)
  RECURSO_1A_INSTANCIA: 'em_recurso', // CTG-0001 §10.8 (…70f00004)
  AGUARDANDO_RECURSO_2A: undefined, // OD-P20: intervalo recursal (JARI decidida, CETRAN aberto)
  RECURSO_2A_INSTANCIA: 'em_recurso', // mesma família segundo_circuito_* de RECURSO_1A (efeito suspensivo mantido)
  INSTANCIA_ENCERRADA: 'encerrada', // CTG-0001 §10.8 (…70f00005); penalty_definitive
  ARQUIVADO: 'arquivada', // CTG-0001 §10.8 (…70f00007)
  CANCELADO_POS_INTEGRACAO: 'cancelada', // legal_regime "cancelamento deferido …" (terminal_sem_penalidade)
  AIT_CANCELADO: 'cancelada', // CTG-0001 §10.8 (…70f00006)
  EXTINTO_DECADENCIA: 'arquivada', // renainf_situacao = ARQUIVADO (mesmo espelho de ARQUIVADO)
  EXTINTO_PRESCRICAO: 'arquivada', // renainf_situacao = ARQUIVADO
  CANCELADO_DEFINITIVO: 'cancelada', // legal_regime "decisão final favorável ao administrado"
};

/** CTG-0001 §10.8: em disputa nos circuitos; definitivo após penalidade; nenhum nos demais. */
export const POINTS_STATUS_BY_SITUATION: Readonly<
  Record<Situation, PointsStatus>
> = {
  aguardando_defesa: 'none',
  em_defesa: 'em_disputa',
  penalidade_aplicada: 'definitivo',
  em_recurso: 'em_disputa',
  encerrada: 'definitivo',
  cancelada: 'none',
  arquivada: 'none',
};

export const INFRACTION_ACTIONS = [
  'defend',
  'indicate_driver',
  'pay',
  'appeal_jari',
  'appeal_cetran',
] as const;
export type InfractionAction = (typeof INFRACTION_ACTIONS)[number];

/**
 * Fase admite o ato (legal_regime de infraction_state_ref; [WF-PORTAL-001]
 * §Catálogo coluna Prazo; UC-PORTAL-015 AC-5 "pagar antes não prejudica o recurso").
 */
export const ACTION_PHASE_MATRIX: Readonly<
  Record<Situation, Readonly<Record<InfractionAction, boolean>>>
> = {
  aguardando_defesa: {
    defend: true,
    indicate_driver: true,
    pay: true,
    appeal_jari: false,
    appeal_cetran: false,
  },
  em_defesa: {
    defend: false,
    indicate_driver: false,
    pay: true,
    appeal_jari: false,
    appeal_cetran: false,
  },
  penalidade_aplicada: {
    defend: false,
    indicate_driver: false,
    pay: true,
    appeal_jari: true,
    appeal_cetran: false,
  },
  em_recurso: {
    defend: false,
    indicate_driver: false,
    pay: true,
    appeal_jari: false,
    appeal_cetran: false,
  },
  encerrada: {
    defend: false,
    indicate_driver: false,
    pay: true,
    appeal_jari: false,
    appeal_cetran: false,
  },
  cancelada: {
    defend: false,
    indicate_driver: false,
    pay: false,
    appeal_jari: false,
    appeal_cetran: false,
  },
  arquivada: {
    defend: false,
    indicate_driver: false,
    pay: false,
    appeal_jari: false,
    appeal_cetran: false,
  },
};

export const ACTION_SERVICE_KEY: Readonly<Record<InfractionAction, string>> = {
  defend: 'defesa_previa',
  indicate_driver: 'indicacao_condutor',
  pay: 'pagamento',
  appeal_jari: 'recurso_jari',
  appeal_cetran: 'recurso_cetran',
};

/** Parâmetros de `payment_json.methods` (H.53; DT-031) — chaves do catálogo. */
export const PAYMENT_METHOD_PARAMETERS = {
  card: 'portal.card_payment',
  installments: 'portal.installments',
  waiver40: 'portal.waiver_40_term',
  discount40OutsideSne: 'collection.discount_40_outside_sne',
} as const;

export interface InfractionActionEntry {
  key: InfractionAction;
  available: boolean;
  reason: string | null;
  minimumAssurance: string | null;
}

export interface InfractionNoticeEntry {
  noticeId: string;
  kind: 'NA' | 'NP' | 'decisao';
  channel: string | null;
  dispatchedOn: string | null;
  effectiveOn: string | null;
  fictitious: boolean;
  printedDeadline: string | null;
}

// ---------------------------------------------------------------------------
// porta de enriquecimento (§7.3)
// ---------------------------------------------------------------------------

export interface AitIdentity {
  aitNumber: string;
  plate: string;
  occurredAt: string | Date;
  framingLabel: string;
  amount: number | null;
  /** Índice 0 = proprietário; os demais condutores/interessados (M10). */
  subjectCpfHashes: string[];
}

export interface InfractionDeadline {
  kind: string;
  dueOn: string;
  ownedBy: string;
}

export interface InfractionViewSource {
  loadAitIdentity(
    tx: PortalSqlTransaction,
    aitId: string,
  ): Promise<AitIdentity | null>;
  loadDeadlines(
    tx: PortalSqlTransaction,
    infractionId: string,
  ): Promise<InfractionDeadline[]>;
}

export const INFRACTION_VIEW_SOURCE = Symbol('INFRACTION_VIEW_SOURCE');

const AIT_IDENTITY_SQL = `select a.ait_number, a.infraction_at, f.description as framing_label
     from inf.ait_ait a
     join inf.normative_framing f on f.id = a.framing_id
    where a.id = $1
    limit 1`;

const AIT_PLATE_SQL = `select v.plate
     from inf.ait_vehicle av
     join ops.snapshots_vehicle v on v.id = av.vehicle_snapshot_id
    where av.ait_id = $1
    order by av.created_at asc, av.id asc
    limit 1`;

/** `proprietario` (token de `inf.infraction_subject_kind_ref`) primeiro; depois por ordem de registro. */
const AIT_PERSONS_SQL = `select p.cpf
     from inf.ait_person ap
     join ops.snapshots_person p on p.id = ap.person_id
    where ap.ait_id = $1 and p.cpf is not null
    order by case when ap.role = 'proprietario' then 0 else 1 end, ap.created_at asc, ap.id asc`;

/**
 * Implementação SQL da porta sobre as tabelas do dono (cabeçalho `Source
 * tables:`). `amount` é `null` nesta rodada: o catálogo normativo não guarda
 * valor numérico da multa (cotação nacional — OD-P41). Sem veículo ou sem
 * pessoa identificada → `null` (o evento fica com `last_error`).
 */
@Injectable()
export class SqlInfractionViewSource implements InfractionViewSource {
  async loadAitIdentity(
    tx: PortalSqlTransaction,
    aitId: string,
  ): Promise<AitIdentity | null> {
    const ait = (
      await tx.query<{
        ait_number: string;
        infraction_at: Date | string;
        framing_label: string;
      }>(AIT_IDENTITY_SQL, [aitId])
    ).rows[0];
    if (!ait) return null;
    const vehicle = (await tx.query<{ plate: string }>(AIT_PLATE_SQL, [aitId]))
      .rows[0];
    if (!vehicle) return null;
    const persons = (await tx.query<{ cpf: string }>(AIT_PERSONS_SQL, [aitId]))
      .rows;
    const hashes = persons
      .map((person) => person.cpf.replace(/\D/g, ''))
      .filter((cpf) => cpf.length === 11)
      .map(cpfHashOf);
    if (hashes.length === 0) return null;
    return {
      aitNumber: ait.ait_number,
      plate: vehicle.plate,
      occurredAt: ait.infraction_at,
      framingLabel: ait.framing_label,
      amount: null,
      subjectCpfHashes: [...new Set(hashes)],
    };
  }

  /** `ownedBy` por timer é `source_pending` (OD-P39): nesta rodada `[]`. */
  async loadDeadlines(): Promise<InfractionDeadline[]> {
    return [];
  }
}

// ---------------------------------------------------------------------------
// dados dos eventos (§7.3, §7.5 — só os campos usados)
// ---------------------------------------------------------------------------

const STATE_CHANGED_DATA = z
  .object({
    infractionId: z.string(),
    aitId: z.uuid(),
    fromState: z.string().nullable().optional(),
    toState: z.string(),
    substate: z.string().nullable().optional(),
  })
  .passthrough();

const NOTICE_DISPATCHED_DATA = z
  .object({
    noticeId: z.string(),
    aitId: z.uuid(),
    kind: z.string(),
    channel: z.string().nullable().optional(),
    dispatchedOn: z.string().nullable().optional(),
    printedDeadlineOn: z.string().nullable().optional(),
  })
  .passthrough();

const NOTICE_ACKNOWLEDGED_DATA = z
  .object({
    noticeId: z.string(),
    aitId: z.uuid(),
    effectiveOn: z.string().nullable().optional(),
    fictitious: z.boolean().optional(),
  })
  .passthrough();

const PAYMENT_CONFIRMED_DATA = z
  .object({
    aitId: z.uuid(),
    tier: z.string().nullable().optional(),
    paidOn: z.string().nullable().optional(),
  })
  .passthrough();

const NOTICE_KIND_LABEL: Readonly<
  Record<string, InfractionNoticeEntry['kind']>
> = { NA: 'NA', NP: 'NP', DECISAO: 'decisao' };

// ---------------------------------------------------------------------------
// SQL (subconjunto de tests/support/fake-sql.ts)
// ---------------------------------------------------------------------------

const VIEW_FOR_UPDATE_SQL = `select id, ait_id, subject_cpf_hash, plate, situation, points_status,
          deadlines_json, actions_json, notices_json, payment_json,
          last_event_id, last_event_version
     from portal.infraction_view
    where ait_id = $1
    for update`;

const UPDATE_STATE_SQL = `update portal.infraction_view
      set situation = $2, points_status = $3, actions_json = $4::jsonb,
          payment_json = $5::jsonb, deadlines_json = $6::jsonb,
          last_event_id = $7, last_event_version = $8, updated_at = $9
    where id = $1`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
const INSERT_VIEW_SQL = `insert into portal.infraction_view
      (ait_id, subject_cpf_hash, ait_number, plate, occurred_at, framing_label, amount,
       situation, deadlines_json, points_status, actions_json, notices_json, payment_json,
       last_event_id, last_event_version, created_at)
    values ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9::jsonb, $10, $11::jsonb, '[]'::jsonb,
            $12::jsonb, $13, $14, $15)`;

const UPDATE_NOTICES_SQL = `update portal.infraction_view
      set notices_json = $2::jsonb, last_event_id = $3, updated_at = $4
    where id = $1`;

const UPDATE_LAST_EVENT_SQL = `update portal.infraction_view
      set last_event_id = $2, updated_at = $3
    where id = $1`;

const UPDATE_PAYMENT_SQL = `update portal.infraction_view
      set payment_json = $2::jsonb, last_event_id = $3, updated_at = $4
    where id = $1`;

const SUBJECT_BY_HASH_SQL = `select id from portal.subject where cpf_hash = $1 limit 1`;

const INSERT_ENTITLEMENT_SQL = `insert into portal.entitlement
      (subject_id, target_kind, target_id, relation, origin, valid_from, valid_until)
    values ($1, 'ait', $2, $3, 'infraction', $4::date, null)
    on conflict (tenant_id, subject_id, target_kind, target_id, relation) do nothing`;

/** CTG-0001 §6.1: `AGUARDANDO_PAGAMENTO` → `PROTOCOLADO` por PAGAMENTO_CONFIRMADO (SQL condicional). */
const REQUEST_PAID_SQL = `update portal.request
      set state = 'PROTOCOLADO', version = version + 1, updated_at = $2
    where target_kind = 'ait' and target_id = $1 and state = 'AGUARDANDO_PAGAMENTO'`;

const CATALOG_SQL = `select service_key, availability, unavailable_reason, minimum_assurance
     from portal.service_catalog
    where service_key = any($1)`;

const RESET_SQL = `update portal.infraction_view
      set deadlines_json = '[]'::jsonb, actions_json = '[]'::jsonb, notices_json = '[]'::jsonb,
          payment_json = '{}'::jsonb, last_event_id = $2, last_event_version = 0, updated_at = $3
    where last_event_id = any($1)`;

interface ViewRow extends Record<string, unknown> {
  id: string;
  ait_id: string;
  subject_cpf_hash: string;
  plate: string;
  situation: Situation;
  points_status: PointsStatus;
  deadlines_json: unknown;
  actions_json: unknown;
  notices_json: unknown;
  payment_json: unknown;
  last_event_id: string;
  last_event_version: number | string;
}

interface CatalogRow extends Record<string, unknown> {
  service_key: string;
  availability: 'available' | 'partially_available' | 'unavailable';
  unavailable_reason: string | null;
  minimum_assurance: string | null;
}

export const ACTION_REASONS = {
  phase: 'fase_nao_admite',
  missingService: 'servico_ausente_no_catalogo',
} as const;

// ---------------------------------------------------------------------------
// projetor
// ---------------------------------------------------------------------------

export class InfractionViewProjector implements Projector {
  readonly projection = 'infraction_view' as const;
  readonly sourceEvents = [
    'INFRACAO_ESTADO_ALTERADO',
    'NOTIFICACAO_EXPEDIDA',
    'NOTIFICACAO_CIENCIA',
    'PAGAMENTO_CONFIRMADO',
  ] as const;

  constructor(private readonly source: InfractionViewSource) {}

  async apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    switch (event.domainEvent) {
      case 'INFRACAO_ESTADO_ALTERADO':
        return this.stateChanged(event, context);
      case 'NOTIFICACAO_EXPEDIDA':
        return this.noticeDispatched(event, context);
      case 'NOTIFICACAO_CIENCIA':
        return this.noticeAcknowledged(event, context);
      case 'PAGAMENTO_CONFIRMADO':
        return this.paymentConfirmed(event, context);
      default:
        return { kind: 'skipped', reason: 'not_consumed' };
    }
  }

  async reset(
    context: ProjectionContext,
    windowEventIds: readonly string[],
  ): Promise<void> {
    if (windowEventIds.length === 0) return;
    await context.tx.query(RESET_SQL, [
      [...windowEventIds],
      PROJECTION_SENTINEL_EVENT_ID,
      context.now,
    ]);
  }

  // -------------------------------------------------------------------------
  // INFRACAO_ESTADO_ALTERADO
  // -------------------------------------------------------------------------

  private async stateChanged(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    const parsed = STATE_CHANGED_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const data = parsed.data;
    const situation = INFRACTION_SITUATION_MAP[data.toState];
    if (situation === undefined) {
      return projectionError('situation', data.toState);
    }
    const row = await this.viewOf(context.tx, data.aitId);
    if (
      row &&
      event.aggregate.kind === 'infraction' &&
      event.aggregate.version <= Number(row.last_event_version)
    ) {
      return { kind: 'skipped', reason: 'stale_version' };
    }
    const methods = await paymentMethods(context.parameters);
    if ('error' in methods) return methods.error;
    const actions = await this.actionsOf(context.tx, situation);
    const deadlines = await this.source.loadDeadlines(
      context.tx,
      data.infractionId,
    );
    const pointsStatus = POINTS_STATUS_BY_SITUATION[situation];
    if (row) {
      const payment = { ...asObject(row.payment_json), methods: methods.value };
      await context.tx.query(UPDATE_STATE_SQL, [
        row.id,
        situation,
        pointsStatus,
        JSON.stringify(actions),
        JSON.stringify(payment),
        JSON.stringify(deadlines),
        event.id,
        event.aggregate.version,
        context.now,
      ]);
      return { kind: 'applied' };
    }
    const identity = await this.source.loadAitIdentity(context.tx, data.aitId);
    if (!identity || identity.subjectCpfHashes.length === 0) {
      return projectionError('ait_identity', data.aitId);
    }
    const occurredAt =
      identity.occurredAt instanceof Date
        ? identity.occurredAt
        : new Date(identity.occurredAt);
    await context.tx.query(INSERT_VIEW_SQL, [
      data.aitId,
      identity.subjectCpfHashes[0],
      identity.aitNumber,
      identity.plate,
      occurredAt.toISOString(),
      identity.framingLabel,
      identity.amount,
      situation,
      JSON.stringify(deadlines),
      pointsStatus,
      JSON.stringify(actions),
      JSON.stringify({
        paid: false,
        paidTier: null,
        tiers: [],
        methods: methods.value,
      }),
      event.id,
      event.aggregate.version,
      context.now,
    ]);
    // M10: vínculo pelo evento (proprietário = índice 0; demais = condutor)
    const validFrom = localDateOf(occurredAt, context.tenantTz);
    for (const [index, cpfHash] of identity.subjectCpfHashes.entries()) {
      const subject = (
        await context.tx.query<{ id: string }>(SUBJECT_BY_HASH_SQL, [cpfHash])
      ).rows[0];
      if (!subject) continue;
      await context.tx.query(INSERT_ENTITLEMENT_SQL, [
        subject.id,
        data.aitId,
        index === 0 ? 'owner' : 'driver',
        validFrom,
      ]);
    }
    return { kind: 'applied' };
  }

  // -------------------------------------------------------------------------
  // NOTIFICACAO_EXPEDIDA / NOTIFICACAO_CIENCIA / PAGAMENTO_CONFIRMADO
  // -------------------------------------------------------------------------

  private async noticeDispatched(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    const parsed = NOTICE_DISPATCHED_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const data = parsed.data;
    const row = await this.viewOf(context.tx, data.aitId);
    if (!row) return projectionError('infraction_view', data.aitId);
    const kind = NOTICE_KIND_LABEL[data.kind];
    if (!kind) {
      await context.tx.query(UPDATE_LAST_EVENT_SQL, [
        row.id,
        event.id,
        context.now,
      ]);
      return { kind: 'applied' };
    }
    const notices = [...asArray<InfractionNoticeEntry>(row.notices_json)];
    notices.push({
      noticeId: data.noticeId,
      kind,
      channel: data.channel ?? null,
      dispatchedOn: data.dispatchedOn ?? null,
      effectiveOn: null,
      fictitious: false,
      printedDeadline: data.printedDeadlineOn ?? null,
    });
    await context.tx.query(UPDATE_NOTICES_SQL, [
      row.id,
      JSON.stringify(notices),
      event.id,
      context.now,
    ]);
    return { kind: 'applied' };
  }

  private async noticeAcknowledged(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    const parsed = NOTICE_ACKNOWLEDGED_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const data = parsed.data;
    const row = await this.viewOf(context.tx, data.aitId);
    if (!row) return projectionError('infraction_view', data.aitId);
    const notices = asArray<InfractionNoticeEntry>(row.notices_json).map(
      (notice) =>
        notice.noticeId === data.noticeId
          ? {
              ...notice,
              effectiveOn: data.effectiveOn ?? null,
              fictitious: data.fictitious ?? false,
            }
          : notice,
    );
    await context.tx.query(UPDATE_NOTICES_SQL, [
      row.id,
      JSON.stringify(notices),
      event.id,
      context.now,
    ]);
    return { kind: 'applied' };
  }

  private async paymentConfirmed(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    const parsed = PAYMENT_CONFIRMED_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const data = parsed.data;
    const row = await this.viewOf(context.tx, data.aitId);
    if (!row) return projectionError('infraction_view', data.aitId);
    const payment = {
      ...asObject(row.payment_json),
      paid: true,
      paidTier: data.tier ?? null,
      paidOn: data.paidOn ?? null,
    };
    await context.tx.query(UPDATE_PAYMENT_SQL, [
      row.id,
      JSON.stringify(payment),
      event.id,
      context.now,
    ]);
    await context.tx.query(REQUEST_PAID_SQL, [data.aitId, context.now]);
    return { kind: 'applied' };
  }

  // -------------------------------------------------------------------------
  // apoio
  // -------------------------------------------------------------------------

  private async viewOf(
    tx: PortalSqlTransaction,
    aitId: string,
  ): Promise<ViewRow | undefined> {
    return (await tx.query<ViewRow>(VIEW_FOR_UPDATE_SQL, [aitId])).rows[0];
  }

  /** §7.3 `actions_json[i] = { key, available, reason, minimumAssurance }`. */
  private async actionsOf(
    tx: PortalSqlTransaction,
    situation: Situation,
  ): Promise<InfractionActionEntry[]> {
    const keys = INFRACTION_ACTIONS.map((action) => ACTION_SERVICE_KEY[action]);
    const catalog = new Map(
      (await tx.query<CatalogRow>(CATALOG_SQL, [keys])).rows.map((row) => [
        row.service_key,
        row,
      ]),
    );
    return INFRACTION_ACTIONS.map((key) => {
      const service = catalog.get(ACTION_SERVICE_KEY[key]);
      const minimumAssurance = service?.minimum_assurance ?? null;
      if (!service) {
        return {
          key,
          available: false,
          reason: ACTION_REASONS.missingService,
          minimumAssurance,
        };
      }
      if (!ACTION_PHASE_MATRIX[situation][key]) {
        return {
          key,
          available: false,
          reason: ACTION_REASONS.phase,
          minimumAssurance,
        };
      }
      if (service.availability === 'unavailable') {
        return {
          key,
          available: false,
          reason: service.unavailable_reason,
          minimumAssurance,
        };
      }
      return { key, available: true, reason: null, minimumAssurance };
    });
  }
}

/** §7.3 `payment_json.methods` — os quatro parâmetros lidos, nunca literais. */
async function paymentMethods(
  parameters: PortalParameterReader,
): Promise<
  | { value: Record<keyof typeof PAYMENT_METHOD_PARAMETERS, boolean> }
  | { error: ProjectionResult }
> {
  const value = {} as Record<keyof typeof PAYMENT_METHOD_PARAMETERS, boolean>;
  for (const [method, key] of Object.entries(
    PAYMENT_METHOD_PARAMETERS,
  ) as Array<[keyof typeof PAYMENT_METHOD_PARAMETERS, string]>) {
    try {
      const parameter = await parameters.get(key);
      value[method] = parameter.value_json === true;
    } catch {
      return { error: projectionError('parameter', key) };
    }
  }
  return { value };
}
