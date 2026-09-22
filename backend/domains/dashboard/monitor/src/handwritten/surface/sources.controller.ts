// `/v1/dashboard/sources` (CTG-0002 §3.4, §8.2; plan M20): selo de frescor
// por fonte (`dashboard.source`, N1) e, no detalhe, os timers abertos da
// fonte (`dashboard.timer` com `owner_kind = 'source'`). Leitura de estado
// próprio: `meta.freshness` é a pior das fontes listadas (§5.5).
import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  DetranError,
  Resource,
  etagOf,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';

import type { DashboardSqlTransaction } from '../projection-contract.js';
import { SourcesQuery, pageOf } from './dto.js';
import {
  DashboardLayerGate,
  ownStateFreshness,
  paginate,
  parseWith,
  worstFreshness,
  type DashboardFreshnessMeta,
  type ResponseLike,
} from './layer-gate.js';

interface SourceRow extends Record<string, unknown> {
  id: string;
  source_key: string;
  app: string;
  state: DashboardFreshnessMeta['state'];
  last_seen_at: Date | null;
  last_read_at: Date | null;
  acceptable_latency_minutes: number | null;
  heartbeat_contract: string | null;
  stale_since: Date | null;
  hidden: boolean;
  version: number;
}

interface TimerRow extends Record<string, unknown> {
  code: string;
  status: string;
  started_at: Date;
  due_at: Date | null;
  fired_at: Date | null;
}

const iso = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

export function sourceView(row: SourceRow): Record<string, unknown> {
  return {
    id: row.id,
    sourceKey: row.source_key,
    app: row.app,
    state: row.state,
    lastSeenAt: iso(row.last_seen_at),
    lastReadAt: iso(row.last_read_at),
    acceptableLatencyMinutes: row.acceptable_latency_minutes,
    heartbeatContract: row.heartbeat_contract,
    staleSince: iso(row.stale_since),
    hidden: row.hidden,
    version: row.version,
  };
}

function freshnessOfSource(row: SourceRow): DashboardFreshnessMeta {
  return {
    state: row.state,
    asOf: iso(row.last_seen_at),
    acceptableLatency: row.acceptable_latency_minutes,
    source: row.source_key,
  };
}

@Controller('v1/dashboard/sources')
@Resource('dashboard:source')
export class DashboardSourcesController {
  constructor(
    private readonly gate: DashboardLayerGate,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get()
  @Action('read')
  async list(
    @Req() req: RequestLike,
    @Query() rawQuery: unknown,
  ): Promise<Record<string, unknown>> {
    const query = parseWith(SourcesQuery, rawQuery);
    return this.tx(async (tx) => {
      const layer = await this.gate.open(tx, req, {
        route: 'GET sources',
        policy: 'dashboard:source:read',
        requiredLayer: 'N1',
        ceiling: 'N1',
        filters: query,
      });
      const result = await tx.query<SourceRow>(
        `select * from dashboard.source
          where tenant_id = $1
            and ($2::text is null or app = $2)
            and ($3::text is null or state = $3)
            and ($4::boolean is null or hidden = $4)
          order by source_key`,
        [
          this.gate.tenantId(),
          query.app ?? null,
          query.state ?? null,
          query.hidden ?? null,
        ],
      );
      const listed = paginate(result.rows, pageOf(query));
      await this.gate.record(tx, layer, listed.items.length);
      return {
        items: listed.items.map(sourceView),
        page: listed.page,
        pageSize: listed.pageSize,
        total: listed.total,
        meta: {
          freshness: worstFreshness(
            listed.items.map(freshnessOfSource),
            ownStateFreshness(this.gate.now()),
          ),
          page: listed.page,
          pageSize: listed.pageSize,
          total: listed.total,
        },
      };
    });
  }

  @Get(':id')
  @Action('read')
  async get(
    @Req() req: RequestLike,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<Record<string, unknown>> {
    return this.tx(async (tx) => {
      const found = await tx.query<SourceRow>(
        `select * from dashboard.source where tenant_id = $1 and id = $2::uuid`,
        [this.gate.tenantId(), id],
      );
      const row = found.rows[0];
      if (!row) {
        throw new DetranError('DASH.TENANT_MISMATCH', {
          status: 404,
          context: { sourceId: id },
        });
      }
      const layer = await this.gate.open(tx, req, {
        route: 'GET sources/{id}',
        policy: 'dashboard:source:read',
        requiredLayer: 'N1',
        ceiling: 'N1',
        filters: { id },
      });
      const timers = await tx.query<TimerRow>(
        `select code, status, started_at, due_at, fired_at
           from dashboard.timer
          where tenant_id = $1 and owner_kind = 'source' and owner_id = $2::uuid and status = 'ARMADO'
          order by due_at nulls last, code`,
        [this.gate.tenantId(), id],
      );
      await this.gate.record(tx, layer, 1);
      res.setHeader('ETag', etagOf(row.version));
      return {
        ...sourceView(row),
        timers: timers.rows.map((timer) => ({
          code: timer.code,
          status: timer.status,
          startedAt: iso(timer.started_at),
          dueAt: iso(timer.due_at),
          firedAt: iso(timer.fired_at),
        })),
        meta: { freshness: freshnessOfSource(row) },
      };
    });
  }

  private tx<T>(work: (tx: DashboardSqlTransaction) => Promise<T>): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      (transaction: Transaction) =>
        work(transaction as unknown as DashboardSqlTransaction),
    );
  }
}
