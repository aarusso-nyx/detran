// CTG-0002 §3.8 e §11 (R-0011, TASK-0013; plan M23) — `GET /v1/dashboard/stream`.
//
// `@Get` com resposta manual em streaming (nunca `@Sse`), política
// `dashboard:alert:read` (§3.8 — sem chave própria em `policy.ts`), filtro por
// camada/escopo NO SQL do serviço e redação de `objectRef` sem `X-Purpose`.
//
// R-0022 CTG-0004 (TASK-0007, OD-R22-45): o enquadramento é do
// `StynxEventStreamService` publicado, uma instância por fluxo construída
// aqui (R-2) sobre `DASHBOARD_STREAM_POLLER` (R-3): `: connected`, heartbeat,
// _replay_ de 24 h medido pelo relógio do banco, cinco conexões por
// (tenant, ator) → 429 com `Retry-After` (OD-R22-05, R-7), frame > 8 KB →
// `: dropped <id>`, um frame por linha. Passos anteriores à abertura que
// ficam aqui, na ordem: 401 `DASH.AUTH_REQUIRED`, `X-Purpose` (400) e
// `access_log` (R-1).
import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  type OnModuleDestroy,
} from '@nestjs/common';
import {
  StynxEventStreamService,
  type StynxSseRequest,
  type StynxSseResponse,
} from '@stynx-nyx/backend';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  Action,
  DetranError,
  Resource,
  dashboardLayerFor,
  getPrincipalFromRequest,
  type RequestLike,
} from '@detran/shared';
import { domainScopeOf } from '@detran/dashboard-monitor';

import {
  DASHBOARD_STREAM_POLLER,
  DASHBOARD_STREAM_TYPES,
  DashboardStreamService,
  DashboardStreamSource,
  MAX_CONNECTIONS_PER_USER,
  MAX_FRAME_BYTES,
  REPLAY_WINDOW_MS,
  effectiveStreamRole,
  projectionOf,
  type DashboardConnectionScope,
  type DashboardStreamPoller,
  type DashboardStreamType,
} from './dashboard-stream.service.js';
import {
  HEARTBEAT_INTERVAL_MS,
  StreamReads,
  schedulerOf,
  topicsOf,
} from './teat-stream.service.js';

/** Linhas por leitura (CTG-0004 §3: padrão atual de `listSince`). */
const BATCH_SIZE = 200;

type StreamRequest = RequestLike & StynxSseRequest;

function headerOf(req: RequestLike, name: string): string | undefined {
  const value = req.headers?.[name];
  if (Array.isArray(value))
    return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

function originOf(req: RequestLike): string | null {
  const forwarded = headerOf(req, 'x-forwarded-for');
  const address = forwarded?.split(',')[0]?.trim() || req.ip || '';
  const agent = headerOf(req, 'user-agent') ?? '';
  const origin = [address, agent].filter((part) => part.length > 0).join(' ');
  return origin.length > 0 ? origin.slice(0, 120) : null;
}

@Controller('v1/dashboard/stream')
@Resource('dashboard:alert')
export class DashboardStreamController implements OnModuleDestroy {
  private readonly reads = new StreamReads();
  private readonly events: StynxEventStreamService;

  constructor(
    private readonly service: DashboardStreamService,
    database: Database,
    private readonly requestContext: RequestContext,
    @Inject(DASHBOARD_STREAM_POLLER)
    private readonly poller: DashboardStreamPoller,
  ) {
    this.events = new StynxEventStreamService(
      database,
      schedulerOf(poller, this.reads),
    );
  }

  onModuleDestroy(): void {
    this.events.onModuleDestroy();
  }

  @Get()
  @Action('read')
  async stream(
    @Req() req: StreamRequest,
    @Res() res: StynxSseResponse,
    @Query('topics') topics: string | undefined,
  ): Promise<void> {
    const principal = getPrincipalFromRequest(req);
    if (!principal) {
      throw new DetranError('DASH.AUTH_REQUIRED', { status: 401 });
    }
    const principalId = String(principal.id);
    const roles = principal.roles ?? [];
    const layer = dashboardLayerFor(roles);
    const domains = domainScopeOf(roles);
    const requested = topicsOf(topics);
    const topicFilter = requested
      ? new Set(
          [...requested].filter((entry): entry is DashboardStreamType =>
            (DASHBOARD_STREAM_TYPES as readonly string[]).includes(entry),
          ),
        )
      : null;

    // §11: em N2, `X-Purpose` válida no handshake libera `objectRef` e grava o
    // acesso (`row_count = 0`); ausente → `data` N2 redigido; inválida → 400.
    let purpose: string | null = null;
    const rawPurpose = headerOf(req, 'x-purpose');
    if (layer === 'N2' && rawPurpose !== undefined) {
      purpose = await this.service.validatePurpose(rawPurpose);
      await this.service.recordHandshake({
        userRef: principalId,
        userRole: effectiveStreamRole(roles),
        purpose,
        origin: originOf(req),
        topics: topicFilter ? [...topicFilter] : [...DASHBOARD_STREAM_TYPES],
      });
    }

    const context = this.requestContext.snapshot();
    const scope: DashboardConnectionScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
      layer,
      domains,
      purpose,
    };
    await this.events.open(
      req,
      res,
      new DashboardStreamSource(this.service, this.reads),
      {
        scope,
        filter: (event) =>
          event.named &&
          (!topicFilter || topicFilter.has(event.event as DashboardStreamType)),
        project: (event, connection) => projectionOf(event.row, connection),
        heartbeatMs: HEARTBEAT_INTERVAL_MS,
        replayWindowMs: REPLAY_WINDOW_MS,
        tickMs: this.poller.intervalMs,
        batchSize: BATCH_SIZE,
        maxConnectionsPerActor: MAX_CONNECTIONS_PER_USER,
        maxPayloadBytes: MAX_FRAME_BYTES,
      },
    );
  }
}
