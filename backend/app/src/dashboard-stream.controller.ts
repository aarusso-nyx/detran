// CTG-0002 §3.8 e §11 (R-0011, TASK-0013; plan M23) — `GET /v1/dashboard/stream`.
//
// Padrão de `portal-stream.controller.ts`: `@Get` com resposta manual em
// streaming (nunca `@Sse`), política `dashboard:alert:read` (§3.8 — sem chave
// própria em `policy.ts`), `: connected` na abertura, `: heartbeat` a cada
// `HEARTBEAT_INTERVAL_MS` (20 s) pelo poller, replay de 24 h por
// `Last-Event-ID` (204 além — idade medida pelo relógio do banco), cinco
// conexões por usuário (429), payload ≤ 8 KB (`: dropped <id>`), filtro por
// camada/escopo NO SQL do serviço e redação de `objectRef` sem `X-Purpose`.
// O tick do poller roda fora do contexto da requisição: a transação de tenant
// é reaberta com o escopo capturado na abertura (`Database.withRequestContext`).
import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Req,
  Res,
} from '@nestjs/common';
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
  REPLAY_WINDOW_MS,
  effectiveStreamRole,
  eventsOf,
  frameOf,
  type DashboardStreamPoller,
  type DashboardStreamScope,
  type DashboardStreamType,
  type StreamCursor,
} from './dashboard-stream.service.js';
import { HEARTBEAT_INTERVAL_MS } from './teat-stream.service.js';

interface ResponseLike {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  write(chunk: string): unknown;
  end(chunk?: string): unknown;
  on(event: 'close', listener: () => void): unknown;
}

interface RequestWithClose extends RequestLike {
  on(event: 'close', listener: () => void): unknown;
}

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
export class DashboardStreamController {
  constructor(
    private readonly service: DashboardStreamService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(DASHBOARD_STREAM_POLLER)
    private readonly poller: DashboardStreamPoller,
  ) {}

  @Get()
  @Action('read')
  async stream(
    @Req() req: RequestWithClose,
    @Res() res: ResponseLike,
    @Headers('last-event-id') lastEventId: string | undefined,
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
    const topicFilter = topics
      ? new Set(
          topics
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry): entry is DashboardStreamType =>
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
    const scope: DashboardStreamScope = { layer, domains, purpose };

    const context = this.requestContext.snapshot();
    const tenantScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
    };
    // Fora do contexto da requisição (tick do poller), reabre o escopo capturado.
    // Contexto utilizável = ativo e com tenant (STYNX 1.5.0 abre o contexto no
    // middleware, antes de tenant/ator).
    const inScope = <T>(work: () => Promise<T>): Promise<T> =>
      this.requestContext.hasActiveContext() &&
      this.requestContext.snapshot().tenantId
        ? work()
        : this.database.withRequestContext(tenantScope, work);

    let cursor: StreamCursor;
    if (lastEventId) {
      const row = await this.service.findById(lastEventId);
      if (!row) {
        cursor = { createdAt: await this.service.now(), id: null };
      } else {
        if (Number(row.age_ms ?? 0) > REPLAY_WINDOW_MS) {
          res.statusCode = 204;
          res.end();
          return;
        }
        cursor = { createdAt: row.created_at, id: row.id };
      }
    } else {
      cursor = { createdAt: await this.service.now(), id: null };
    }

    if (!this.service.acquire(principalId)) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          status: 429,
          message: 'limite de conexões simultâneas do usuário (CTG-0002 §11)',
        }),
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(': connected\n\n');

    let closed = false;
    let released = false;
    let unsubscribeHeartbeat: () => void = () => undefined;
    let unsubscribePoller: () => void = () => undefined;
    const cancel = (): void => {
      unsubscribeHeartbeat();
      unsubscribePoller();
      unsubscribeHeartbeat = () => undefined;
      unsubscribePoller = () => undefined;
    };
    const release = (): void => {
      if (released) return;
      released = true;
      this.service.release(principalId);
    };
    const cleanup = (): void => {
      if (closed) return;
      closed = true;
      cancel();
      release();
    };
    req.on('close', cleanup);
    res.on('close', cleanup);

    // Ticks serializados (padrão portal): nunca dois `listSince` com o mesmo cursor.
    let ticking = false;
    let pending = false;
    const tick = async (): Promise<void> => {
      if (closed) return;
      if (ticking) {
        pending = true;
        return;
      }
      ticking = true;
      try {
        do {
          pending = false;
          let rows;
          try {
            rows = await inScope(() => this.service.listSince(cursor, scope));
          } catch {
            return;
          }
          if (closed) return;
          for (const row of rows) {
            cursor = { createdAt: row.created_at, id: row.id };
            for (const event of eventsOf(row)) {
              if (topicFilter && !topicFilter.has(event)) continue;
              const frame = frameOf(row, event, scope);
              if (frame === null) {
                res.write(`: dropped ${row.id}\n\n`);
                continue;
              }
              res.write(frame);
            }
          }
        } while (pending && !closed);
      } finally {
        ticking = false;
      }
    };

    unsubscribeHeartbeat = this.poller.schedule(() => {
      if (!closed) res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL_MS);
    // O tick é devolvido ao poller (não `void`): o poller manual dos testes
    // (`firePolling`) aguarda a consulta `listSince` antes de continuar.
    unsubscribePoller = this.poller.schedule(() => tick());
    if (closed) {
      cancel();
      return;
    }

    await tick();
  }
}
