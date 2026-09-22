// Source events: rait.case.changed (RAIT_CASO_ESTADO_ALTERADO; rait-events-sse-contract §2.1; inf/rait-case)
// Source events: rait.case.received (RAIT_RECURSO_RECEBIDO_JULGADOR; §2.1; inf/rait-case)
// Source events: rait.session.changed (§2.3; inf/rait-session)
// Source events: rait.agenda-item.changed (§2.3; inf/rait-session)
// Source events: rait.minutes.published (RAIT_DECISAO_PUBLICADA por item; §2.3; inf/rait-session)
// Source events: rait.decision.published (RAIT_DECISAO_PUBLICADA; §2.1 — sem produtor em main, OD-D17)
//
// Projeção `dashboard.production` (CTG-0001 §2.15, §4.1.2; IND-DASH-304/305,
// comparativo; `connected = true`). Uma célula por `(tenant_id, case_id)`,
// criada por `rait.case.changed` (`period_start` = 1º dia do mês de
// `state_changed_at`, `transitions` += 1 por transição aplicada); os demais
// eventos só tocam a célula existente (sem célula → `ignored: not_relevant`):
// recebimento (`received_on`, `instance`), item de pauta (`session_id`,
// `agenda_outcome`), ata (`decision_published_on` por `caseId` de `caseIds[]`)
// e decisão singular (`decision_kind`, `decided_on`). Tempo por fase, SLA-30,
// 30 dias úteis e taxa de provimento são leituras (CTG-0002), não colunas.
// `rait.session.changed` não deriva coluna alguma de §2.15 (sessão sem caso
// no payload): consumido, sempre `ignored: not_relevant` — registrado no
// relatório de TASK-0010 como questão.
import {
  DashboardProjectorBase,
  monthStartOf,
  optionalText,
  requireText,
  requireTextArray,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = [
  'rait.case.changed',
  'rait.case.received',
  'rait.session.changed',
  'rait.agenda-item.changed',
  'rait.minutes.published',
  'rait.decision.published',
] as const;

export const PROJECTION_NAME = 'dashboard.production' as const;

/** Rótulos do despacho por índice do literal (ver prescription-risk). */
const [
  CASE_CHANGED,
  CASE_RECEIVED,
  SESSION_CHANGED,
  AGENDA_ITEM_CHANGED,
  MINUTES_PUBLISHED,
] = consumedEvents;

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

type Parsed =
  | {
      kind: 'case-changed';
      caseId: string;
      fromState: string | null;
      toState: string;
      instance: string | null;
      decisionKind: string | null;
    }
  | { kind: 'case-received'; caseId: string; body: string; receivedOn: string }
  | { kind: 'session'; sessionId: string }
  | {
      kind: 'agenda-item';
      caseId: string;
      sessionId: string;
      outcome: string | null;
    }
  | {
      kind: 'minutes';
      sessionId: string;
      publishedOn: string;
      caseIds: string[];
    }
  | {
      kind: 'decision';
      caseId: string;
      decisionKind: string;
      publishedOn: string | null;
    };

const SELECT_CELL = `select id, last_event_id
     from dashboard.production
    where tenant_id = $1 and case_id = $2`;

export class ProductionProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent, eventKey: string): Parsed {
    const p = this.projection;
    switch (eventKey) {
      case CASE_CHANGED:
        return {
          kind: 'case-changed',
          caseId: requireText(p, event, 'caseId'),
          fromState: optionalText(p, event, 'fromState'),
          toState: requireText(p, event, 'toState'),
          instance: optionalText(p, event, 'instance'),
          decisionKind: optionalText(p, event, 'decisionKind'),
        };
      case CASE_RECEIVED:
        return {
          kind: 'case-received',
          caseId: requireText(p, event, 'caseId'),
          body: requireText(p, event, 'body'),
          receivedOn: requireText(p, event, 'receivedOn'),
        };
      case SESSION_CHANGED:
        return {
          kind: 'session',
          sessionId: requireText(p, event, 'sessionId'),
        };
      case AGENDA_ITEM_CHANGED:
        return {
          kind: 'agenda-item',
          caseId: requireText(p, event, 'caseId'),
          sessionId: requireText(p, event, 'sessionId'),
          outcome: optionalText(p, event, 'outcome'),
        };
      case MINUTES_PUBLISHED:
        return {
          kind: 'minutes',
          sessionId: requireText(p, event, 'sessionId'),
          publishedOn: requireText(p, event, 'publishedOn'),
          caseIds: requireTextArray(p, event, 'caseIds'),
        };
      default:
        return {
          kind: 'decision',
          caseId: requireText(p, event, 'caseId'),
          decisionKind: requireText(p, event, 'decisionKind'),
          publishedOn: optionalText(p, event, 'publishedOn'),
        };
    }
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    switch (parsed.kind) {
      case 'case-changed':
        return this.upsertCase(event, eventKey, parsed, versions, ctx);
      case 'case-received':
        return this.patchCase(event, eventKey, versions, ctx, parsed.caseId, {
          set: 'received_on = $2, instance = $3',
          values: [parsed.receivedOn, parsed.body],
        });
      case 'session':
        return this.ignored('not_relevant');
      case 'agenda-item':
        return this.patchCase(
          event,
          eventKey,
          versions,
          ctx,
          parsed.caseId,
          parsed.outcome === null
            ? { set: 'session_id = $2', values: [parsed.sessionId] }
            : {
                set: 'session_id = $2, agenda_outcome = $3',
                values: [parsed.sessionId, parsed.outcome],
              },
        );
      case 'minutes': {
        let cells = 0;
        let stale = 0;
        for (const caseId of parsed.caseIds) {
          const result = await this.patchCase(
            event,
            eventKey,
            versions,
            ctx,
            caseId,
            {
              set: 'decision_published_on = $2, session_id = $3',
              values: [parsed.publishedOn, parsed.sessionId],
            },
          );
          if (result.kind === 'applied') cells += result.cells;
          else if (
            result.kind === 'ignored' &&
            result.reason === 'stale_version'
          )
            stale += 1;
        }
        if (cells > 0) return this.applied(cells);
        return this.ignored(stale > 0 ? 'stale_version' : 'not_relevant');
      }
      case 'decision':
        return this.patchCase(event, eventKey, versions, ctx, parsed.caseId, {
          set: 'decision_kind = $2, decided_on = $3',
          values: [parsed.decisionKind, parsed.publishedOn],
        });
    }
  }

  private async upsertCase(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Extract<Parsed, { kind: 'case-changed' }>,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      parsed.caseId,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    await ctx.tx.query(
      `insert into dashboard.production
         (tenant_id, case_id, instance, period_start, from_state, current_state, state_changed_at,
          decision_kind, transitions, last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10, $11)
       on conflict (tenant_id, case_id)
       do update set instance = coalesce(excluded.instance, dashboard.production.instance),
                     period_start = excluded.period_start,
                     from_state = excluded.from_state,
                     current_state = excluded.current_state,
                     state_changed_at = excluded.state_changed_at,
                     decision_kind = coalesce(excluded.decision_kind, dashboard.production.decision_kind),
                     transitions = dashboard.production.transitions + 1,
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $12`,
      [
        ctx.tenantId,
        parsed.caseId,
        parsed.instance,
        monthStartOf(event.occurredAt),
        parsed.fromState,
        parsed.toState,
        event.occurredAt,
        parsed.decisionKind,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }

  /** Toca a célula existente do caso; sem célula → `not_relevant`. */
  private async patchCase(
    event: DashboardConsumedEvent,
    eventKey: string,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
    caseId: string,
    change: { set: string; values: unknown[] },
  ): Promise<DashboardProjectionResult> {
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      caseId,
    ]);
    const current = existing.rows[0];
    if (!current) return this.ignored('not_relevant');
    if (await this.stale(ctx, current.last_event_id, eventKey, event)) {
      return this.ignored('stale_version');
    }
    const base = change.values.length + 1;
    await ctx.tx.query(
      `update dashboard.production
          set ${change.set}, last_event_id = $${base + 1}, event_schema_version = $${base + 2},
              aggregate_version = $${base + 3}, updated_at = $${base + 4}
        where id = $1`,
      [
        current.id,
        ...change.values,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }
}
