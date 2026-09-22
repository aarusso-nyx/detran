// Notificador (CTG-0002 §6.4, §2.3; plan M18). A cadeia de escalonamento é
// vocabulário (`dashboard.escalation_chain_ref`, DDL 19, transcrita de
// [WF-RAIT-002] §6 para `rait`; um nível `source_pending` para os apps sem
// cadeia publicada, OD-D29); apps sem linha → nível 1 = `alert.owner_role`
// marcado `source_pending`. "Notificar" = linha de `alert_trail`
// (`note = 'notified:<level>:<role>[:source_pending]'`) + evento
// `dashboard.alert.changed` com `recipientRole`/`recipientLevel`/`chainStatus`
// na outbox — nenhum canal externo neste CTG (OD-D43). `notify` efetiva a
// transição 30 (`CLASSIFICADO → NOTIFICADO`) ou 65 (`ESCALONADO → NOTIFICADO`,
// A8) e arma o SLA de ACK `T-DASH-ACK-<severity>` (§6.8; um por notificação,
// `started_at = now`). `notifyCriticalExtinction` (transição 40) notifica toda
// a cadeia do app + `AUDITOR` (H.54, `dashboard.critical_extinction
// .notify_legal`; `LEGAL` sem código ⇒ `AUDITOR`) — anotações
// (`from_state = to_state`), sem SLA de ACK. `resolveRecipient` devolve
// `null` quando a cadeia está esgotada (OD-D40).
import { Inject, Injectable } from '@nestjs/common';
import { OpsParameterService } from '@detran/ops-parameter';

import { DashboardClockService, type DashboardTimer } from './clock.service.js';
import {
  DASHBOARD_EVENT_TYPES,
  envelopeOf,
  publish,
  type DashboardEventDataValue,
} from './events.js';
import {
  ACK_TIMER_BY_SEVERITY,
  AUDITOR_ROLE,
  dashboardParameterKey,
  readBooleanParameter,
  type AlertSeverity,
  type AlertState,
  type AlertTrack,
  type ChainStatus,
  type DashboardBlock,
  type DashboardLayer,
  query,
  type CycleSqlTransaction,
} from './tokens.js';

/** Linha de `dashboard.alert` como o ciclo a lê (DDL 80). */
export interface AlertRow extends Record<string, unknown> {
  id: string;
  tenant_id: string;
  indicator_code: string;
  track: AlertTrack;
  state: AlertState;
  severity: AlertSeverity;
  block: DashboardBlock;
  source_app: string;
  object_kind: string;
  object_ref: string;
  object_layer: DashboardLayer;
  owner_role: string;
  owner_ref: string | null;
  governing_clock: string | null;
  next_milestone_at: Date | null;
  ceiling_on: Date | string | null;
  detected_at: Date;
  classified_at: Date | null;
  notified_at: Date | null;
  acknowledged_at: Date | null;
  treating_at: Date | null;
  verified_at: Date | null;
  closed_at: Date | null;
  escalated_at: Date | null;
  critical_at: Date | null;
  incident_at: Date | null;
  ack_channel: 'origin' | 'manual' | null;
  escalation_level: number;
  incident_ref: string | null;
  source_event_id: string | null;
  version: number;
}

export interface EscalationChainRow extends Record<string, unknown> {
  source_app: string;
  level: number;
  role: string;
  status: 'vigente' | 'source_pending';
}

export interface ChainRecipient {
  role: string;
  chainStatus: 'vigente' | 'source_pending';
}

/** Contexto mínimo que o notificador precisa (subconjunto de `CycleContext`). */
export interface NotifierContext {
  tenantId: string;
  tz: string;
  now: Date;
  actor: { kind: 'user' | 'system' | 'timer'; id?: string; role?: string };
  requestId?: string;
}

export const ALERT_COLUMNS = `id, tenant_id, indicator_code, track, state, severity, block, source_app,
       object_kind, object_ref, object_layer, owner_role, owner_ref, governing_clock,
       next_milestone_at, ceiling_on, detected_at, classified_at, notified_at,
       acknowledged_at, treating_at, verified_at, closed_at, escalated_at,
       critical_at, incident_at, ack_channel, escalation_level, incident_ref,
       source_event_id, version`;

/** `dashboard.escalation_chain_ref` do app, ordenada por `level` (vazio para
 *  apps sem linha: `dashboard`, `institucional`, `benchmark`, `interno`, `todos`). */
export async function loadEscalationChain(
  tx: CycleSqlTransaction,
  sourceApp: string,
): Promise<EscalationChainRow[]> {
  const result = await query<EscalationChainRow>(
    tx,
    `select source_app, level, role, status
       from dashboard.escalation_chain_ref
      where source_app = $1
      order by level`,
    [sourceApp],
  );
  return result.rows.map((row) => ({ ...row, level: Number(row.level) }));
}

/** `YYYY-MM-DD` de uma coluna `date` (o driver devolve `Date` à meia-noite
 *  local) ou de uma string ISO. */
export function localDateOf(
  value: Date | string | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const isoOf = (value: Date | string | null | undefined): string | null =>
  value === null || value === undefined ? null : new Date(value).toISOString();

/** `data` comum de `dashboard.alert.changed` (§12), a partir da linha. */
export function alertEventData(
  alert: AlertRow,
  fromState: AlertState | null,
  toState: AlertState,
  occurredAt: Date,
  extra: Record<string, DashboardEventDataValue | undefined> = {},
): Record<string, DashboardEventDataValue | undefined> {
  return {
    alertId: alert.id,
    indicatorCode: alert.indicator_code,
    track: alert.track,
    fromState,
    toState,
    severity: alert.severity,
    block: alert.block,
    sourceApp: alert.source_app,
    objectKind: alert.object_kind,
    objectLayer: alert.object_layer,
    objectRef: alert.object_ref,
    ownerRole: alert.owner_role,
    escalationLevel: Number(alert.escalation_level),
    ackChannel: alert.ack_channel ?? undefined,
    incidentRef: alert.incident_ref ?? undefined,
    nextMilestoneAt: isoOf(alert.next_milestone_at) ?? undefined,
    ceilingOn: localDateOf(alert.ceiling_on) ?? undefined,
    occurredAt: occurredAt.toISOString(),
    sourceEventId: alert.source_event_id ?? undefined,
    ...extra,
  };
}

export interface TrailLineInput {
  fromState: AlertState | null;
  toState: AlertState;
  actorKind: 'user' | 'system' | 'timer';
  actorRef?: string | null;
  note?: string | null;
  rootCauseCategory?: string | null;
  eventId?: string | null;
}

/** Acrescenta uma linha à trilha (`seq` = último + 1) e sobe `alert.version`
 *  (toda transição/anotação = versão nova, uma linha da outbox por versão).
 *  Devolve `{ trailId, version }`. */
export async function appendAlertTrail(
  tx: CycleSqlTransaction,
  alert: AlertRow,
  line: TrailLineInput,
  now: Date,
  patch: Record<string, unknown> = {},
): Promise<{ trailId: string; version: number }> {
  const columns = Object.keys(patch);
  const setClauses = columns.map(
    (column, index) => `${column} = $${index + 4}`,
  );
  const updated = await query<{ version: number }>(
    tx,
    `update dashboard.alert
        set version = version + 1, updated_at = $3${setClauses.length ? ', ' : ''}${setClauses.join(', ')}
      where tenant_id = $1 and id = $2
      returning version`,
    [
      alert.tenant_id,
      alert.id,
      now.toISOString(),
      ...columns.map((c) => patch[c]),
    ],
  );
  const version = Number(updated.rows[0]?.version ?? Number(alert.version) + 1);
  const seq = await query<{ next: number }>(
    tx,
    `select coalesce(max(seq), 0) + 1 as next
       from dashboard.alert_trail
      where tenant_id = $1 and alert_id = $2`,
    [alert.tenant_id, alert.id],
  );
  const inserted = await query<{ id: string }>(
    tx,
    `insert into dashboard.alert_trail
       (tenant_id, alert_id, seq, from_state, to_state, actor_kind, actor_ref,
        occurred_at, note, root_cause_category, event_id)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     returning id`,
    [
      alert.tenant_id,
      alert.id,
      Number(seq.rows[0]?.next ?? 1),
      line.fromState,
      line.toState,
      line.actorKind,
      line.actorRef ?? null,
      now.toISOString(),
      line.note ?? null,
      line.rootCauseCategory ?? null,
      line.eventId ?? null,
    ],
  );
  Object.assign(alert, patch, { version });
  return { trailId: inserted.rows[0]!.id, version };
}

const chainNote = (
  level: number | 'h54',
  recipient: ChainRecipient | { role: string; chainStatus: 'h54' },
): string =>
  recipient.chainStatus === 'source_pending'
    ? `notified:${level}:${recipient.role}:source_pending`
    : `notified:${level}:${recipient.role}`;

@Injectable()
export class DashboardNotifier {
  constructor(
    private readonly timers: DashboardClockService,
    @Inject(OpsParameterService)
    private readonly parameters: OpsParameterService,
  ) {}

  /** Destinatário do nível pedido (§6.4 item 1): nível 1 = `alert.owner_role`
   *  (o dono, quando veio da célula — OD-D32 — ou o nível 1 da cadeia, que é
   *  o que o detector grava); `status` da linha da cadeia quando existe,
   *  senão `source_pending`. Nível ≥ 2 = linha da cadeia; sem linha ⇒ `null`
   *  (cadeia esgotada, OD-D40). */
  async resolveRecipient(
    tx: CycleSqlTransaction,
    alert: Pick<AlertRow, 'source_app' | 'owner_role'>,
    level: number,
  ): Promise<ChainRecipient | null> {
    const chain = await loadEscalationChain(tx, alert.source_app);
    // App sem cadeia publicada: todo nível é o dono, `source_pending` (a
    // cadeia é desconhecida, não esgotada — §2.3, OD-D29).
    if (chain.length === 0) {
      return { role: alert.owner_role, chainStatus: 'source_pending' };
    }
    const row = chain.find((candidate) => candidate.level === level);
    if (level <= 1) {
      return {
        role: alert.owner_role,
        chainStatus: row?.status ?? 'source_pending',
      };
    }
    if (!row) return null;
    return { role: row.role, chainStatus: row.status };
  }

  /** Transição 30/65 + trilha + evento + SLA de ACK (§6.4 itens 2–3). */
  async notify(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    level: number,
    ctx: NotifierContext,
    domainEvent: 'ALERTA_NOTIFICADO' | 'ALERTA_ESCALONADO',
  ): Promise<ChainRecipient> {
    const recipient = await this.resolveRecipient(tx, alert, level);
    if (!recipient) {
      throw new Error(
        `dashboard.escalation_chain_ref: sem nível ${level} para ${alert.source_app}`,
      );
    }
    const fromState = alert.state;
    const patch: Record<string, unknown> = {
      state: 'NOTIFICADO',
      escalation_level: level,
    };
    if (level <= 1) patch.notified_at = ctx.now.toISOString();
    else patch.escalated_at = ctx.now.toISOString();
    const { version } = await appendAlertTrail(
      tx,
      alert,
      {
        fromState,
        toState: 'NOTIFICADO',
        actorKind: 'system',
        actorRef: recipient.role,
        note: chainNote(level, recipient),
      },
      ctx.now,
      patch,
    );
    await publish(
      tx,
      envelopeOf({
        type: DASHBOARD_EVENT_TYPES.alertChanged,
        domainEvent,
        tenantId: ctx.tenantId,
        occurredAt: ctx.now,
        actor: ctx.actor,
        correlationId: ctx.requestId,
        causationId: alert.source_event_id,
        aggregate: { kind: 'alert', id: alert.id, version },
        data: alertEventData(alert, fromState, 'NOTIFICADO', ctx.now, {
          recipientRole: recipient.role,
          recipientLevel: level,
          chainStatus: recipient.chainStatus,
        }),
      }),
    );
    await this.armAckSla(tx, alert, ctx);
    return recipient;
  }

  /** `T-DASH-ACK-<severity>` (`owner_kind='alert'`, `started_at = now`). */
  async armAckSla(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: NotifierContext,
  ): Promise<DashboardTimer> {
    return this.timers.arm(tx, ctx.tenantId, ctx.tz, {
      ownerKind: 'alert',
      ownerId: alert.id,
      code: ACK_TIMER_BY_SEVERITY[alert.severity],
      startedAt: ctx.now,
    });
  }

  /** §6.4 item 4 / §6.7 (3): toda a cadeia do app + `AUDITOR` (H.54) quando
   *  `dashboard.critical_extinction.notify_legal`; anotações
   *  (`from_state = to_state`), um evento `ALERTA_ESCALONADO` por nível.
   *  Devolve quantos destinatários. */
  async notifyCriticalExtinction(
    tx: CycleSqlTransaction,
    alert: AlertRow,
    ctx: NotifierContext,
  ): Promise<number> {
    const chain = await loadEscalationChain(tx, alert.source_app);
    const recipients: {
      level: number | 'h54';
      role: string;
      chainStatus: ChainStatus;
    }[] =
      chain.length > 0
        ? chain.map((row) => ({
            level: row.level,
            role: row.role,
            chainStatus: row.status,
          }))
        : [{ level: 1, role: alert.owner_role, chainStatus: 'source_pending' }];
    const notifyLegal = await readBooleanParameter(
      this.parameters,
      dashboardParameterKey('critical_extinction', 'notify_legal'),
    );
    if (notifyLegal) {
      recipients.push({ level: 'h54', role: AUDITOR_ROLE, chainStatus: 'h54' });
    }
    for (const recipient of recipients) {
      const note =
        recipient.chainStatus === 'h54'
          ? `notified:h54:${recipient.role}`
          : chainNote(recipient.level, {
              role: recipient.role,
              chainStatus: recipient.chainStatus,
            });
      const { version } = await appendAlertTrail(
        tx,
        alert,
        {
          fromState: alert.state,
          toState: alert.state,
          actorKind: 'system',
          actorRef: recipient.role,
          note,
        },
        ctx.now,
      );
      await publish(
        tx,
        envelopeOf({
          type: DASHBOARD_EVENT_TYPES.alertChanged,
          domainEvent: 'ALERTA_ESCALONADO',
          tenantId: ctx.tenantId,
          occurredAt: ctx.now,
          actor: ctx.actor,
          correlationId: ctx.requestId,
          causationId: alert.source_event_id,
          aggregate: { kind: 'alert', id: alert.id, version },
          data: alertEventData(alert, alert.state, alert.state, ctx.now, {
            recipientRole: recipient.role,
            recipientLevel:
              typeof recipient.level === 'number' ? recipient.level : undefined,
            chainStatus: recipient.chainStatus,
          }),
        }),
      );
    }
    return recipients.length;
  }
}

/** Lê `notified:<level|h54>:<role>[:source_pending]` de uma nota da trilha
 *  (base de `getIncident.notified`, §6.7). */
export function parseNotifiedNote(
  note: string | null | undefined,
): { level: number | null; role: string; chainStatus: ChainStatus } | null {
  if (!note || !note.startsWith('notified:')) return null;
  const [, level, role, status] = note.split(':');
  if (!role) return null;
  if (level === 'h54') return { level: null, role, chainStatus: 'h54' };
  return {
    level: Number(level),
    role,
    chainStatus: status === 'source_pending' ? 'source_pending' : 'vigente',
  };
}
