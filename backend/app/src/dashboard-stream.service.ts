// CTG-0002 §11 (R-0011, TASK-0013; plan M23) — leitura de `integration.outbox`
// para o SSE `GET /v1/dashboard/stream`, no padrão de `portal-stream.service.ts`.
// Sem escrita de domínio: o stream só reemite o que o ciclo/superfície já
// gravaram na mesma transação do efeito; a única escrita é o `access_log` da
// abertura em N2 com `X-Purpose` (§11, [RN-DASH-171]). O filtro por camada e
// por escopo de domínio (§5.3) é aplicado NO SQL de `listSince` — nunca em
// memória — e `data` de um evento N2 é redigido (`objectRef: null`) quando a
// camada do papel é N2 mas não houve `X-Purpose` no handshake. Os `topic`
// técnicos são montados por concatenação (§1.3.8, A14).
import { Inject, Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  DETRAN_POLICY_MATRIX,
  DetranError,
  canonicalRoles,
  dashboardLayerFor,
  withTenantContext,
  type DashboardLayer,
} from '@detran/shared';
import { OpsParameterService } from '@detran/ops-parameter';
import {
  DASHBOARD_CLOCK,
  DASHBOARD_EVENT_TYPES,
  DASHBOARD_PURPOSES_N2_H54,
  dashboardParameterKey,
  type DomainScope,
} from '@detran/dashboard-monitor';

import type { TeatStreamPoller } from './teat-stream.service.js';

/** Fatia do `Clock` injetado por `DASHBOARD_CLOCK` (relógio do sistema no app; `FixedClock` nos testes). */
interface ClockLike {
  now(): Date;
}

export interface DashboardOutboxRow {
  [key: string]: unknown;
  id: string;
  created_at: string;
  topic: string;
  payload: Record<string, unknown>;
  /** Idade da linha em ms segundo o relógio do banco (`findById`). */
  age_ms?: string;
}

interface SqlQueryable {
  query<T extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}

function asQueryable(tx: Transaction): SqlQueryable {
  return tx as unknown as SqlQueryable;
}

/** Tipos SSE do DASHBOARD (§11). */
export const DASHBOARD_STREAM_TYPES = [
  'alert.changed',
  'alert.escalated',
  'duty.changed',
  'source.freshness',
  'integration.health',
] as const;
export type DashboardStreamType = (typeof DASHBOARD_STREAM_TYPES)[number];

/** `topic` técnico do produtor → evento SSE base (§11); `alert.escalated` e `integration.health` derivam por `data`. */
export const DASHBOARD_STREAM_EVENT_BY_TOPIC: Readonly<
  Record<string, DashboardStreamType>
> = {
  [DASHBOARD_EVENT_TYPES.alertChanged]: 'alert.changed',
  [DASHBOARD_EVENT_TYPES.dutyChanged]: 'duty.changed',
  [DASHBOARD_EVENT_TYPES.sourceFreshness]: 'source.freshness',
};

export const DASHBOARD_STREAM_TOPICS: readonly string[] = Object.keys(
  DASHBOARD_STREAM_EVENT_BY_TOPIC,
);

/** `integration.health` (OD-D54): frescor de `teat`/adapter ou da fonte `teat.offline-sync`. */
const INTEGRATION_HEALTH_APPS: ReadonlySet<string> = new Set([
  'teat',
  'senatran-adapter',
]);
const INTEGRATION_HEALTH_SOURCE_KEY = ['teat', 'offline-sync'].join('.');

/** Janela de replay do `Last-Event-ID` (§11). */
export const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Conexões simultâneas por usuário (§11). */
export const MAX_CONNECTIONS_PER_USER = 5;
/** Payload máximo de um frame (§11): evento maior é omitido com `: dropped <id>`. */
export const MAX_FRAME_BYTES = 8 * 1024;

export interface DashboardStreamScope {
  layer: DashboardLayer;
  domains: DomainScope;
  /** `X-Purpose` válida no handshake — sem ela, `data` N2 é redigido. */
  purpose: string | null;
}

export interface StreamCursor {
  createdAt: string;
  id: string | null;
}

/** Porta do poller (mesma de `teat-stream.service.ts`); token próprio do DASHBOARD (A20 a). */
export const DASHBOARD_STREAM_POLLER = Symbol('DASHBOARD_STREAM_POLLER');
export type DashboardStreamPoller = TeatStreamPoller;

function dataOf(payload: Record<string, unknown>): Record<string, unknown> {
  const data = payload.data;
  return typeof data === 'object' && data !== null && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};
}

/** Eventos SSE que uma linha produz (§11 tabela): um `topic` pode render dois frames. */
export function eventsOf(row: DashboardOutboxRow): DashboardStreamType[] {
  const base = DASHBOARD_STREAM_EVENT_BY_TOPIC[row.topic];
  if (!base) return [];
  const data = dataOf(row.payload);
  if (base === 'alert.changed') {
    return row.payload.domainEvent === 'ALERTA_ESCALONADO'
      ? ['alert.escalated']
      : ['alert.changed'];
  }
  if (base === 'source.freshness') {
    const app = typeof data.app === 'string' ? data.app : '';
    const sourceKey = typeof data.sourceKey === 'string' ? data.sourceKey : '';
    return INTEGRATION_HEALTH_APPS.has(app) ||
      sourceKey === INTEGRATION_HEALTH_SOURCE_KEY
      ? ['source.freshness', 'integration.health']
      : ['source.freshness'];
  }
  return [base];
}

/**
 * `data` do frame: o `data` do envelope (§12 — só ids, tokens e datas), com
 * `objectRef` redigido quando o evento é N2 e o handshake não trouxe
 * `X-Purpose`. `tenantId` nunca sai (rait-events-sse-contract §1).
 */
export function reshape(
  payload: Record<string, unknown>,
  scope: DashboardStreamScope,
): Record<string, unknown> {
  const data = { ...dataOf(payload) };
  if ('tenantId' in data) delete data.tenantId;
  if (data.objectLayer === 'N2' && (scope.layer !== 'N2' || !scope.purpose)) {
    data.objectRef = null;
  }
  return data;
}

/** Frame SSE (§11 formato); `null` quando excede `MAX_FRAME_BYTES`. */
export function frameOf(
  row: DashboardOutboxRow,
  event: DashboardStreamType,
  scope: DashboardStreamScope,
): string | null {
  const body = JSON.stringify({
    aggregate: row.payload.aggregate,
    domainEvent: row.payload.domainEvent,
    data: reshape(row.payload, scope),
  });
  if (Buffer.byteLength(body, 'utf8') > MAX_FRAME_BYTES) return null;
  return [`id: ${row.id}`, `event: ${event}`, `data: ${body}`, '', ''].join(
    '\n',
  );
}

/** Papel efetivo do handshake (§2.2): o canônico que concede `dashboard:alert:read` com a maior camada. */
export function effectiveStreamRole(roles: readonly string[]): string {
  const key = 'dashboard:alert:read';
  const granting = canonicalRoles(roles).filter((role) =>
    (DETRAN_POLICY_MATRIX[key] ?? []).includes(role),
  );
  const candidates = granting.length > 0 ? granting : canonicalRoles(roles);
  const rank: Readonly<Record<DashboardLayer, number>> = {
    N0: 0,
    N1: 1,
    N2: 2,
  };
  let chosen = candidates[0] ?? roles[0] ?? '';
  for (const role of candidates) {
    if (rank[dashboardLayerFor([role])] > rank[dashboardLayerFor([chosen])]) {
      chosen = role;
    }
  }
  return chosen;
}

@Injectable()
export class DashboardStreamService {
  private readonly connections = new Map<string, number>();

  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    private readonly parameters: OpsParameterService,
    @Inject(DASHBOARD_CLOCK) private readonly clock: ClockLike,
  ) {}

  /** Limite de conexões por usuário (§11): contagem em memória, liberada no `close`. */
  acquire(principalId: string): boolean {
    const current = this.connections.get(principalId) ?? 0;
    if (current >= MAX_CONNECTIONS_PER_USER) return false;
    this.connections.set(principalId, current + 1);
    return true;
  }

  release(principalId: string): void {
    const current = this.connections.get(principalId) ?? 0;
    if (current <= 1) this.connections.delete(principalId);
    else this.connections.set(principalId, current - 1);
  }

  /** Catálogo de finalidades (§5.4.1) — o mesmo fallback do `DashboardLayerGate` (OD-D30). */
  async purposes(): Promise<readonly string[]> {
    try {
      const parameter = await this.parameters.get(
        dashboardParameterKey('purposes_n2'),
      );
      const value: unknown = parameter.value_json;
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string' && item.length > 0)
      ) {
        return value as string[];
      }
    } catch {
      // parâmetro ausente: fallback declarado
    }
    return DASHBOARD_PURPOSES_N2_H54;
  }

  async validatePurpose(raw: string | undefined): Promise<string> {
    const allowed = await this.purposes();
    const purpose = raw?.trim().toLowerCase();
    if (!purpose) {
      throw new DetranError('DASH.PURPOSE_REQUIRED', {
        status: 400,
        context: { allowed: [...allowed] },
      });
    }
    if (!allowed.includes(purpose)) {
      throw new DetranError('DASH.PURPOSE_INVALID', {
        status: 400,
        context: { allowed: [...allowed] },
      });
    }
    return purpose;
  }

  /** `access_log` da abertura em N2 com finalidade (§11): `resource = 'GET stream'`, `row_count = 0`. */
  async recordHandshake(input: {
    userRef: string;
    userRole: string;
    purpose: string;
    origin: string | null;
    topics: readonly string[];
  }): Promise<void> {
    await withTenantContext(this.database, this.requestContext, async (tx) => {
      await asQueryable(tx).query(
        `insert into dashboard.access_log
           (tenant_id, user_ref, user_role, at, resource, filters_json, layer, row_count, origin, purpose)
         values ($1, $2, $3, $8, $4, $5::jsonb, 'N2', 0, $6, $7)`,
        [
          this.requestContext.snapshot().tenantId,
          input.userRef,
          input.userRole,
          'GET stream',
          JSON.stringify({ topics: [...input.topics].sort() }),
          input.origin,
          input.purpose,
          this.clock.now().toISOString(),
        ],
      );
    });
  }

  /** `now()` do servidor de banco — marco inicial de uma conexão sem `Last-Event-ID`. */
  async now(): Promise<string> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<{ now: string }>(
        'select now()::text as now',
      );
      return result.rows[0]!.now;
    });
  }

  /** Linha do `Last-Event-ID` com a idade medida pelo relógio do banco (nunca o do processo). */
  async findById(id: string): Promise<DashboardOutboxRow | undefined> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const result = await asQueryable(tx).query<DashboardOutboxRow>(
        `select id, created_at::text as created_at, topic, payload,
                (extract(epoch from (now() - created_at)) * 1000)::text as age_ms
           from integration.outbox
          where id = $1::uuid`,
        [id],
      );
      return result.rows[0];
    });
  }

  /**
   * Linhas do tenant posteriores a `cursor`, dos `topic` do DASHBOARD, na
   * camada do papel e no seu escopo de domínio (§11: filtro NO SQL —
   * `objectLayer` ≤ camada, e evento N2 só de `sourceApp` no escopo), em
   * ordem `(created_at, id)` — uma consulta por tick.
   */
  async listSince(
    cursor: StreamCursor,
    scope: DashboardStreamScope,
    limit = 200,
  ): Promise<DashboardOutboxRow[]> {
    return withTenantContext(this.database, this.requestContext, async (tx) => {
      const tenantId = this.requestContext.snapshot().tenantId;
      const cursorClause = cursor.id
        ? '(o.created_at, o.id) > ($3::timestamptz, $4::uuid)'
        : 'o.created_at > $3::timestamptz';
      const values: unknown[] = [
        tenantId,
        DASHBOARD_STREAM_TOPICS,
        cursor.createdAt,
      ];
      if (cursor.id) values.push(cursor.id);
      const layerIndex = values.push(scope.layer);
      const allIndex = values.push(scope.domains === 'all' ? 'all' : 'scoped');
      const appsIndex = values.push(
        scope.domains === 'all' ? [] : [...scope.domains],
      );
      const limitIndex = values.push(limit);
      const result = await asQueryable(tx).query<DashboardOutboxRow>(
        `select o.id, o.created_at::text as created_at, o.topic, o.payload
           from integration.outbox o
          where o.tenant_id = $1
            and o.topic = any($2::text[])
            and ${cursorClause}
            and (o.payload->'data'->>'objectLayer' is null
                 or o.payload->'data'->>'objectLayer' <= $${layerIndex})
            and (o.payload->'data'->>'objectLayer' is distinct from 'N2'
                 or $${allIndex} = 'all'
                 or o.payload->'data'->>'sourceApp' is null
                 or o.payload->'data'->>'sourceApp' = any($${appsIndex}::text[]))
          order by o.created_at, o.id
          limit $${limitIndex}`,
        values,
      );
      return result.rows;
    });
  }
}
