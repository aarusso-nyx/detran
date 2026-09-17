// Source events: RAIT_CASO_PROTOCOLADO (rait.case.created), RAIT_CASO_ESTADO_ALTERADO (rait.case.changed), RAIT_EFEITO_SUSPENSIVO_INSTAURADO (rait.case.admitted), RAIT_RECURSO_RECEBIDO_JULGADOR (rait.case.received), RAIT_CASO_TRANSITADO (rait.case.transited), ENCERRADO_DESISTENCIA (rait.case.withdrawn), RAIT_DECISAO_PUBLICADA (rait.decision.published), rait.inquiry.changed (sem domainEvent)
//
// Projeção `portal.process_timeline` (work/rounds/R-0009/contracts/CTG-0002.md
// §7.2, §7.4; plan R-0009 M16; ADR-0019: o caso é do RAIT). Uma linha por
// `case_id`, ligada ao pedido pelo `delegation_external_id` (null quando o
// caso nasceu no balcão — RN-PORTAL-105 3, OD-P29); `entries_json` só com
// ids/tokens/datas e `visibility: 'citizen'`; `RAIT_DECISAO_PUBLICADA`
// preenche `decision_json` (OD-P43) e avança o pedido EM_ANDAMENTO_NO_ORGAO →
// RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (T-AVAL-CONVITE imediato; SQL
// condicional; version += 2); `rait.inquiry.changed` sem `outcome` abre um
// prazo de diligência.
import { z } from 'zod';

import {
  asArray,
  primitiveData,
  projectionError,
  type PortalConsumedEvent,
  type ProjectionContext,
  type ProjectionResult,
  type Projector,
} from './projection-contract.js';

/** `type` técnico da diligência (sem `domainEvent`) — concatenado (verify:parameter-catalogue). */
export const RAIT_INQUIRY_CHANGED_TYPE = ['rait', 'inquiry', 'changed'].join(
  '.',
);

export const PROCESS_TIMELINE_DOMAIN_EVENTS = [
  'RAIT_CASO_PROTOCOLADO',
  'RAIT_CASO_ESTADO_ALTERADO',
  'RAIT_EFEITO_SUSPENSIVO_INSTAURADO',
  'RAIT_RECURSO_RECEBIDO_JULGADOR',
  'RAIT_CASO_TRANSITADO',
  'ENCERRADO_DESISTENCIA',
  'RAIT_DECISAO_PUBLICADA',
] as const;

export interface TimelineEntry {
  at: string;
  type: string;
  domainEvent: string | null;
  visibility: 'citizen';
  data: Record<string, string | number | boolean | null>;
}

export interface TimelineDeadline {
  kind: 'diligencia';
  dueOn: string;
  ownedBy: 'citizen' | 'agency';
}

export interface TimelineDecision {
  outcome: string;
  summary: null;
  publishedOn: string | null;
  documentUrl: null;
  nextStep: { kind: null; serviceKey: null; dueOn: null };
  refundDue: null;
  finalInstance: null;
}

const CASE_DATA = z.object({ caseId: z.string().min(1) }).passthrough();

const DECISION_DATA = z
  .object({
    caseId: z.string().min(1),
    decisionKind: z.string(),
    publishedOn: z.string().nullable().optional(),
  })
  .passthrough();

const INQUIRY_DATA = z
  .object({
    caseId: z.string().min(1),
    addressee: z.string().nullable().optional(),
    dueOn: z.string().nullable().optional(),
    outcome: z.string().nullable().optional(),
  })
  .passthrough();

/** Vocabulário de `addressee` vem de R-0007 (OD-P43): só `cidadao` é o cidadão. */
const CITIZEN_ADDRESSEE = 'cidadao';

const TIMELINE_FOR_UPDATE_SQL = `select id, request_id, case_id, entries_json, deadlines_json, decision_json, last_event_id
     from portal.process_timeline
    where case_id = $1
    for update`;

const LINKED_REQUEST_SQL = `select id
     from portal.request
    where delegation_external_id = $1
    order by created_at desc
    limit 1`;

/** `tenant_id` pela trigger `auth.enforce_tenant_id` (DDL 65). */
const INSERT_TIMELINE_SQL = `insert into portal.process_timeline
      (request_id, case_id, entries_json, deadlines_json, decision_json, last_event_id, created_at)
    values ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7)`;

const UPDATE_TIMELINE_SQL = `update portal.process_timeline
      set entries_json = $2::jsonb, deadlines_json = $3::jsonb, decision_json = $4::jsonb,
          last_event_id = $5, updated_at = $6
    where id = $1`;

/** CTG-0001 §6.1: EM_ANDAMENTO_NO_ORGAO → RESULTADO_DISPONIVEL → AVALIACAO_OFERECIDA (version += 2). */
const REQUEST_DECIDED_SQL = `update portal.request
      set state = 'AVALIACAO_OFERECIDA', version = version + 2, updated_at = $2
    where id = $1 and state = 'EM_ANDAMENTO_NO_ORGAO'`;

const RESET_SQL = `delete from portal.process_timeline where last_event_id = any($1)`;

interface TimelineRow extends Record<string, unknown> {
  id: string;
  request_id: string | null;
  case_id: string;
  entries_json: unknown;
  deadlines_json: unknown;
  decision_json: unknown;
  last_event_id: string;
}

export class ProcessTimelineProjector implements Projector {
  readonly projection = 'process_timeline' as const;
  readonly sourceEvents = [
    ...PROCESS_TIMELINE_DOMAIN_EVENTS,
    RAIT_INQUIRY_CHANGED_TYPE,
  ] as const;

  async apply(
    event: PortalConsumedEvent,
    context: ProjectionContext,
  ): Promise<ProjectionResult> {
    const parsed = CASE_DATA.safeParse(event.data);
    if (!parsed.success) return projectionError('data', event.id);
    const caseId = parsed.data.caseId;
    const entry: TimelineEntry = {
      at: event.occurredAt,
      type: event.type,
      domainEvent: event.domainEvent ?? null,
      visibility: 'citizen',
      data: primitiveData(event.data),
    };
    const row = (
      await context.tx.query<TimelineRow>(TIMELINE_FOR_UPDATE_SQL, [caseId])
    ).rows[0];
    const entries = [...asArray<TimelineEntry>(row?.entries_json), entry];
    const deadlines = [...asArray<TimelineDeadline>(row?.deadlines_json)];
    let decision = (row?.decision_json ?? null) as TimelineDecision | null;
    let requestId = row?.request_id ?? null;
    if (!row) {
      const linked = (
        await context.tx.query<{ id: string }>(LINKED_REQUEST_SQL, [caseId])
      ).rows[0];
      requestId = linked?.id ?? null;
    }

    if (event.domainEvent === 'RAIT_DECISAO_PUBLICADA') {
      const decided = DECISION_DATA.safeParse(event.data);
      if (!decided.success) return projectionError('data', event.id);
      decision = {
        outcome: decided.data.decisionKind,
        summary: null,
        publishedOn: decided.data.publishedOn ?? null,
        documentUrl: null,
        nextStep: { kind: null, serviceKey: null, dueOn: null },
        refundDue: null,
        finalInstance: null,
      };
    } else if (!event.domainEvent && event.type === RAIT_INQUIRY_CHANGED_TYPE) {
      const inquiry = INQUIRY_DATA.safeParse(event.data);
      if (!inquiry.success) return projectionError('data', event.id);
      if (
        (inquiry.data.outcome === undefined || inquiry.data.outcome === null) &&
        inquiry.data.dueOn
      ) {
        deadlines.push({
          kind: 'diligencia',
          dueOn: inquiry.data.dueOn,
          ownedBy:
            inquiry.data.addressee === CITIZEN_ADDRESSEE ? 'citizen' : 'agency',
        });
      }
    }

    if (row) {
      await context.tx.query(UPDATE_TIMELINE_SQL, [
        row.id,
        JSON.stringify(entries),
        JSON.stringify(deadlines),
        decision === null ? null : JSON.stringify(decision),
        event.id,
        context.now,
      ]);
    } else {
      await context.tx.query(INSERT_TIMELINE_SQL, [
        requestId,
        caseId,
        JSON.stringify(entries),
        JSON.stringify(deadlines),
        decision === null ? null : JSON.stringify(decision),
        event.id,
        context.now,
      ]);
    }
    if (event.domainEvent === 'RAIT_DECISAO_PUBLICADA' && requestId) {
      await context.tx.query(REQUEST_DECIDED_SQL, [requestId, context.now]);
    }
    return { kind: 'applied' };
  }

  async reset(
    context: ProjectionContext,
    windowEventIds: readonly string[],
  ): Promise<void> {
    if (windowEventIds.length === 0) return;
    await context.tx.query(RESET_SQL, [[...windowEventIds]]);
  }
}
