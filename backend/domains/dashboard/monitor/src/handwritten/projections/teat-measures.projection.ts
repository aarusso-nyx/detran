// Source events: measure.changed (MEDIDA_INICIADA, MEDIDA_LIBERADA, MEDIDA_CONCLUIDA, TERMO_EMITIDO; schemas/events/measure.changed.schema.json; inf/measures)
// Source events: alcohol.changed (ALCOOLEMIA_TESTE_REGISTRADO, ALCOOLEMIA_RECUSA_REGISTRADA; schemas/events/alcohol.changed.schema.json; inf/alcohol)
// Source events: ait.changed (AIT_ACEITO, AIT_REJEITADO com fromState; schemas/events/ait.changed.schema.json; inf/ait)
// Source events: ait.concurrency-suspected (AIT_SUSPEITO_CONCORRENCIA; schemas/events/ait.concurrency-suspected.schema.json; inf/ait)
// Source events: custody.event (CUSTODIA_EVENTO; schemas/events/custody.event.schema.json; ops/evidence)
// Source events: evidence.changed (EVIDENCIA_CAPTURADA, EVIDENCIA_VINCULADA; schemas/events/evidence.changed.schema.json; ops/evidence)
// Source events: package.published (PACOTE_MOBILE_PUBLICADO; schemas/events/package.published.schema.json; inf/normative)
// Source events: numbering.reservation.changed (NUMERACAO_RESERVADA; schemas/events/numbering.reservation.changed.schema.json; ops/offline-sync)
// Source events: device.posture-changed (DISPOSITIVO_BLOQUEADO; schemas/events/device.posture-changed.schema.json; ops/field)
//
// Projeção `dashboard.teat_measures` (CTG-0001 §2.18, §4.1.5; IND-DASH-
// 108…111, 311…314, 404…407). Uma célula por `(tenant_id, indicator_code,
// object_kind, object_ref)` com `object_kind` = `aggregate.kind` do TEAT (7
// valores do check da DDL) e `object_ref` = `aggregate.id` (opaco). Nunca
// grava `aitNumber`, `series`, `agentId`, `breathalyzerId`, `resultMgL`,
// `consideredMgL`, `maxErrorMgL` ([RN-DASH-170]); `detail_json` só recebe os
// campos primitivos listados por evento em §4.1.5.
//
// Indicador por evento (§4.1.5): `measure.changed` `TERMO_EMITIDO` cria a
// célula pelo token de `termType` (TEAT_MEASURE_INDICATORS, transcrito — ver
// abaixo) e `MEDIDA_INICIADA`/`MEDIDA_LIBERADA`/`MEDIDA_CONCLUIDA` só tocam
// células existentes da medida (`measureTypeId` é uuid de `inf.measure_type`,
// tabela de outro domínio que a projeção não lê — OD-D23); `alcohol.changed`
// → 311; `ait.concurrency-suspected` → 314 e `ait.changed` com `fromState =
// SUSPEITO_CONCORRENCIA` → 314; `custody.event` (eventType ∈ {validated,
// rejected, quarantined, restored, purged_unverified}) e `evidence.changed` →
// 404; `package.published` → 405 (`deadline_at = validUntil`);
// `numbering.reservation.changed` → 406; `device.posture-changed` → 407. 110 e
// 111 não têm evento (nenhuma célula).
import {
  DashboardProjectorBase,
  optionalText,
  pickPrimitives,
  requireText,
  type DashboardConsumedEvent,
  type DashboardEventVersions,
  type DashboardProjectionContext,
  type DashboardProjectionResult,
} from '../projection-contract.js';

export const consumedEvents = [
  'measure.changed',
  'alcohol.changed',
  'ait.changed',
  'ait.concurrency-suspected',
  'custody.event',
  'evidence.changed',
  'package.published',
  'numbering.reservation.changed',
  'device.posture-changed',
] as const;

export const PROJECTION_NAME = 'dashboard.teat_measures' as const;

/** `aggregate.kind` do TEAT admitidos (check `ck_dashboard_teat_measures_object_kind`). */
export const TEAT_OBJECT_KINDS = [
  'administrative-measure',
  'alcohol-procedure',
  'ait',
  'evidence',
  'normative-package',
  'numbering-reservation',
  'operational-device',
] as const;
type ObjectKind = (typeof TEAT_OBJECT_KINDS)[number];

/** Token da medida → indicador, transcrito do catálogo do TEAT tal como
 *  existe em `main` (OD-D23): os códigos de `inf.measure_type` semeados por
 *  `backend/database/seed/28-fixtures-teat-measures-alcohol.sql` (rol do art.
 *  269: `retencao`, `remocao`, `recolhimento_cnh`, `recolhimento_crlv` — rol
 *  completo `source_pending`, OD-T44) e o único `term_type` que o produtor
 *  fixa (`inf/measures/.../issue-term.command.ts`: `removal`). `retencao` →
 *  IND-DASH-108 (T-REG30, CTB art. 270); a trilha T-REG15 de IND-DASH-109
 *  (art. 271 §9º-A) não é distinguível sem o token de OD-D23 — nenhuma célula
 *  109 até lá. `remocao`/`removal` → IND-DASH-312 (notificação de remoção,
 *  T-NOTIF10; IND-DASH-313, depósito, depende de `measureTypeId` → código,
 *  OD-D23). `recolhimento_cnh` → IND-DASH-311 (T-CNH5D). `recolhimento_crlv`
 *  não tem indicador. Token fora do mapa → `ignored: not_relevant`. */
export const TEAT_MEASURE_INDICATORS: Readonly<Record<string, string>> = {
  retencao: 'IND-DASH-108',
  remocao: 'IND-DASH-312',
  removal: 'IND-DASH-312',
  recolhimento_cnh: 'IND-DASH-311',
};

/** `custody.event.eventType` que a projeção considera (§4.1.5) e o efeito em
 *  `integrity_ok` (validated → true; rejected/quarantined → false; restored e
 *  purged_unverified só registram o estado). */
export const CUSTODY_INTEGRITY: Readonly<Record<string, boolean | null>> = {
  validated: true,
  rejected: false,
  quarantined: false,
  restored: null,
  purged_unverified: null,
};

/** Estado do AIT após a suspeita (`inf.ait_status_ref`, 14-inf-lifecycle-vocabulary.sql; WF-TEAT-001). */
const AIT_SUSPECT_STATE = 'SUSPEITO_CONCORRENCIA';

interface Cell {
  indicatorCode: string;
  objectKind: ObjectKind;
  objectRef: string;
  state: string | null;
  startedAt: string | null;
  endedAt: string | null;
  deadlineAt: string | null;
  integrityOk: boolean | null;
  detail: Record<string, string | number | boolean | null>;
}

type Parsed =
  | { kind: 'upsert'; cell: Cell }
  | {
      kind: 'touch-measure';
      measureId: string;
      state: string | null;
      startedAt: string | null;
      endedAt: string | null;
    }
  | { kind: 'not_relevant' };

interface CellRow extends Record<string, unknown> {
  id: string;
  last_event_id: string;
}

const SELECT_CELL = `select id, last_event_id
     from dashboard.teat_measures
    where tenant_id = $1 and indicator_code = $2 and object_kind = $3 and object_ref = $4`;

const SELECT_OBJECT_CELLS = `select id, last_event_id
     from dashboard.teat_measures
    where tenant_id = $1 and object_kind = $2 and object_ref = $3`;

export class TeatMeasuresProjection extends DashboardProjectorBase<Parsed> {
  readonly projection = PROJECTION_NAME;
  readonly consumedEvents = consumedEvents;

  protected validate(event: DashboardConsumedEvent, eventKey: string): Parsed {
    const p = this.projection;
    const objectKind = event.aggregate?.kind;
    if (!TEAT_OBJECT_KINDS.includes(objectKind as ObjectKind)) {
      throw this.invalid(event, 'aggregate.kind');
    }
    const objectRef = event.aggregate.id;
    if (typeof objectRef !== 'string' || objectRef.length === 0) {
      throw this.invalid(event, 'aggregate.id');
    }
    const kind = objectKind as ObjectKind;
    const domainEvent = event.domainEvent ?? '';
    const cell = (
      partial: Partial<Cell> & { indicatorCode: string },
    ): Parsed => ({
      kind: 'upsert',
      cell: {
        objectKind: kind,
        objectRef,
        state: null,
        startedAt: null,
        endedAt: null,
        deadlineAt: null,
        integrityOk: null,
        detail: {},
        ...partial,
      },
    });

    switch (eventKey) {
      case 'measure.changed': {
        const measureId = requireText(p, event, 'measureId');
        switch (domainEvent) {
          case 'TERMO_EMITIDO': {
            requireText(p, event, 'termId');
            const termType = requireText(p, event, 'termType');
            const indicatorCode = TEAT_MEASURE_INDICATORS[termType];
            if (!indicatorCode) return { kind: 'not_relevant' };
            return cell({
              indicatorCode,
              startedAt: optionalText(p, event, 'issuedAt'),
              deadlineAt:
                optionalText(p, event, 'withdrawalDeadlineAt') ??
                optionalText(p, event, 'ctbDeadlineAt'),
              detail: pickPrimitives(event.data, [
                'termId',
                'termType',
                'issuedAt',
                'withdrawalDeadlineAt',
                'ctbDeadlineAt',
              ]),
            });
          }
          case 'MEDIDA_INICIADA':
            return {
              kind: 'touch-measure',
              measureId,
              state: requireText(p, event, 'currentStatus'),
              startedAt: optionalText(p, event, 'startedAt'),
              endedAt: null,
            };
          case 'MEDIDA_LIBERADA':
            return {
              kind: 'touch-measure',
              measureId,
              state: requireText(p, event, 'toState'),
              startedAt: null,
              endedAt: optionalText(p, event, 'releasedAt'),
            };
          case 'MEDIDA_CONCLUIDA':
            return {
              kind: 'touch-measure',
              measureId,
              state: requireText(p, event, 'toState'),
              startedAt: null,
              endedAt: optionalText(p, event, 'endedAt'),
            };
          default:
            return { kind: 'not_relevant' };
        }
      }
      case 'alcohol.changed': {
        requireText(p, event, 'procedureId');
        const toState = requireText(p, event, 'toState');
        return cell({
          indicatorCode: 'IND-DASH-311',
          state: toState,
          startedAt:
            optionalText(p, event, 'testedAt') ??
            optionalText(p, event, 'refusedAt'),
          detail: pickPrimitives(event.data, ['outcome', 'kind']),
        });
      }
      case 'ait.changed': {
        requireText(p, event, 'aitId');
        if (domainEvent !== 'AIT_ACEITO' && domainEvent !== 'AIT_REJEITADO') {
          return { kind: 'not_relevant' };
        }
        const fromState = requireText(p, event, 'fromState');
        if (fromState !== AIT_SUSPECT_STATE) return { kind: 'not_relevant' };
        return cell({
          indicatorCode: 'IND-DASH-314',
          state: requireText(p, event, 'toState'),
          endedAt:
            optionalText(p, event, 'acceptedAt') ??
            optionalText(p, event, 'rejectedAt'),
          detail: pickPrimitives(event.data, ['fromState', 'toState']),
        });
      }
      case 'ait.concurrency-suspected':
        requireText(p, event, 'aitId');
        return cell({
          indicatorCode: 'IND-DASH-314',
          state: AIT_SUSPECT_STATE,
          startedAt: event.occurredAt,
        });
      case 'custody.event': {
        requireText(p, event, 'evidenceId');
        requireText(p, event, 'custodyEventId');
        const eventType = requireText(p, event, 'eventType');
        if (!(eventType in CUSTODY_INTEGRITY)) return { kind: 'not_relevant' };
        return cell({
          indicatorCode: 'IND-DASH-404',
          state: eventType,
          startedAt: optionalText(p, event, 'eventAt'),
          integrityOk: CUSTODY_INTEGRITY[eventType] ?? null,
          detail: pickPrimitives(event.data, ['eventType', 'eventAt']),
        });
      }
      case 'evidence.changed':
        requireText(p, event, 'evidenceId');
        return cell({
          indicatorCode: 'IND-DASH-404',
          startedAt: optionalText(p, event, 'capturedAt'),
          detail: pickPrimitives(event.data, [
            'entityType',
            'evidenceType',
            'hashValue',
            'capturedAt',
            'uploadedAt',
          ]),
        });
      case 'package.published':
        requireText(p, event, 'packageId');
        return cell({
          indicatorCode: 'IND-DASH-405',
          startedAt: optionalText(p, event, 'publishedAt'),
          deadlineAt: optionalText(p, event, 'validUntil'),
          detail: pickPrimitives(event.data, ['catalogId', 'packageVersion']),
        });
      case 'numbering.reservation.changed':
        requireText(p, event, 'reservationId');
        return cell({
          indicatorCode: 'IND-DASH-406',
          state: optionalText(p, event, 'status'),
          deadlineAt: optionalText(p, event, 'validUntil'),
          detail: pickPrimitives(event.data, [
            'rangeId',
            'startNumber',
            'endNumber',
            'action',
          ]),
        });
      default:
        requireText(p, event, 'deviceId');
        return cell({
          indicatorCode: 'IND-DASH-407',
          state: requireText(p, event, 'toStatus'),
          detail: pickPrimitives(event.data, ['fromStatus', 'eventType']),
        });
    }
  }

  protected async project(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Parsed,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    if (parsed.kind === 'not_relevant') return this.ignored('not_relevant');
    if (parsed.kind === 'touch-measure') {
      return this.touchMeasure(event, eventKey, parsed, versions, ctx);
    }
    const { cell } = parsed;
    const existing = await ctx.tx.query<CellRow>(SELECT_CELL, [
      ctx.tenantId,
      cell.indicatorCode,
      cell.objectKind,
      cell.objectRef,
    ]);
    const current = existing.rows[0];
    if (
      current &&
      (await this.stale(ctx, current.last_event_id, eventKey, event))
    ) {
      return this.ignored('stale_version');
    }
    await ctx.tx.query(
      `insert into dashboard.teat_measures
         (tenant_id, indicator_code, object_kind, object_ref, state, started_at, ended_at, deadline_at,
          integrity_ok, detail_json, last_event_id, event_schema_version, aggregate_version)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       on conflict (tenant_id, indicator_code, object_kind, object_ref)
       do update set state = coalesce(excluded.state, dashboard.teat_measures.state),
                     started_at = coalesce(excluded.started_at, dashboard.teat_measures.started_at),
                     ended_at = coalesce(excluded.ended_at, dashboard.teat_measures.ended_at),
                     deadline_at = coalesce(excluded.deadline_at, dashboard.teat_measures.deadline_at),
                     integrity_ok = coalesce(excluded.integrity_ok, dashboard.teat_measures.integrity_ok),
                     detail_json = dashboard.teat_measures.detail_json || excluded.detail_json,
                     last_event_id = excluded.last_event_id,
                     event_schema_version = excluded.event_schema_version,
                     aggregate_version = excluded.aggregate_version,
                     updated_at = $14`,
      [
        ctx.tenantId,
        cell.indicatorCode,
        cell.objectKind,
        cell.objectRef,
        cell.state,
        cell.startedAt,
        cell.endedAt,
        cell.deadlineAt,
        cell.integrityOk,
        JSON.stringify(cell.detail),
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ],
    );
    return this.applied(1);
  }

  /** `MEDIDA_*` sem token de medida: toca as células existentes da medida. */
  private async touchMeasure(
    event: DashboardConsumedEvent,
    eventKey: string,
    parsed: Extract<Parsed, { kind: 'touch-measure' }>,
    versions: DashboardEventVersions,
    ctx: DashboardProjectionContext,
  ): Promise<DashboardProjectionResult> {
    const rows = await ctx.tx.query<CellRow>(SELECT_OBJECT_CELLS, [
      ctx.tenantId,
      'administrative-measure',
      parsed.measureId,
    ]);
    let cells = 0;
    let stale = 0;
    for (const row of rows.rows) {
      if (await this.stale(ctx, row.last_event_id, eventKey, event)) {
        stale += 1;
        continue;
      }
      const assignments = ['last_event_id = $2', 'event_schema_version = $3'];
      const values: unknown[] = [
        row.id,
        event.id,
        versions.schemaVersion,
        versions.aggregateVersion,
        ctx.now.toISOString(),
      ];
      assignments.push('aggregate_version = $4', 'updated_at = $5');
      if (parsed.state !== null) {
        values.push(parsed.state);
        assignments.push(`state = $${values.length}`);
      }
      if (parsed.startedAt !== null) {
        values.push(parsed.startedAt);
        assignments.push(`started_at = $${values.length}`);
      }
      if (parsed.endedAt !== null) {
        values.push(parsed.endedAt);
        assignments.push(`ended_at = $${values.length}`);
      }
      await ctx.tx.query(
        `update dashboard.teat_measures set ${assignments.join(', ')} where id = $1`,
        values,
      );
      cells += 1;
    }
    if (cells > 0) return this.applied(cells);
    return this.ignored(stale > 0 ? 'stale_version' : 'not_relevant');
  }
}
