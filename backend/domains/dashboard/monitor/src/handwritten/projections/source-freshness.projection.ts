// Source events: source.heartbeat (proposta OD-D07, H.54 — produzido por este pacote só a partir do CTG-0002)
//
// Projeção `dashboard.source_freshness` → tabela `dashboard.source` (CTG-0001
// §2.10, §4.1.8; IND-DASH-408, `connected = false`). Evento proposto: `type =
// 'source.heartbeat'`, `data = { sourceKey, app, observedAt }`,
// `aggregate.kind = 'source'`. Efeito: upsert de `dashboard.source` por
// `(tenant_id, source_key)` com `last_seen_at = observedAt`, `last_event_id`
// e `state = 'FRESCO'` **somente se** `heartbeat_contract` da linha não é nulo
// ([WF-DASH-003]; `DASH.SOURCE_HEARTBEAT_UNDEFINED`) — senão a linha fica
// `INDISPONIVEL` (= "fonte desconectada", M5). `ATRASADO`/`INDISPONIVEL` por
// ausência de heartbeat e `DESATUALIZADO_MARCADO`/`hidden` são do serviço de
// frescor (CTG-0002): o projetor nunca decide ocultar; ao voltar a `FRESCO`
// só desfaz `hidden` porque o check `ck_dashboard_source_hidden` da DDL o
// exige (`hidden` só com INDISPONIVEL/DESATUALIZADO_MARCADO). `version`
// (ETag) sobe a cada aplicação. Ledger: `projection_name =
// 'dashboard.source_freshness'`; `dashboard.source` não tem
// `aggregate_version`, por isso a comparação `stale_version` vai ao ledger
// pelo `last_event_id` (projection-contract `isStaleAgainst`).
import {
  DashboardProjectorBase,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = ['source.heartbeat'] as const;

export const PROJECTION_NAME = 'dashboard.source_freshness' as const;

/** Estados de `freshness_state_ref` que o projetor escreve ([WF-DASH-003]). */
export const HEARTBEAT_STATES = {
  fresh: 'FRESCO',
  unavailable: 'INDISPONIVEL',
} as const;

interface Parsed {
  sourceKey: string;
  app: string;
  observedAt: string;
}

interface SourceRow extends Record<string, unknown> {
  id: string;
  last_event_id: string | null;
}

const SELECT_SOURCE = `select id, last_event_id
     from dashboard.source
    where tenant_id = $1 and source_key = $2`;

export class SourceFreshnessProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent): Parsed {
    const p = this.projection;
    return {
      sourceKey: requireText(p, event, 'sourceKey'),
      app: requireText(p, event, 'app'),
      observedAt: requireText(p, event, 'observedAt'),
    };
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    _versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const existing = await ctx.tx.query<SourceRow>(SELECT_SOURCE, [
      ctx.tenantId,
      parsed.sourceKey,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    // Linha nova nasce sem `heartbeat_contract` → INDISPONIVEL; a existente
    // vira FRESCO só se o contrato de heartbeat estiver definido.
    await ctx.tx.query(
      `insert into dashboard.source
         (tenant_id, source_key, app, state, last_seen_at, last_event_id)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (tenant_id, source_key)
       do update set last_seen_at = excluded.last_seen_at,
                     last_event_id = excluded.last_event_id,
                     state = case
                       when dashboard.source.heartbeat_contract is not null then $7
                       else $4
                     end,
                     hidden = case
                       when dashboard.source.heartbeat_contract is not null then false
                       else dashboard.source.hidden
                     end,
                     version = dashboard.source.version + 1,
                     updated_at = $8`,
      [
        ctx.tenantId,
        parsed.sourceKey,
        parsed.app,
        HEARTBEAT_STATES.unavailable,
        parsed.observedAt,
        event.id,
        HEARTBEAT_STATES.fresh,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }
}
