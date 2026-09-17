// CTG-0002 §2.7 e §9 (R-0009, TASK-0008; plan M18) — `GET /v1/portal/stream`.
//
// Padrão de `teat-stream.controller.ts`: `@Get` com resposta manual em
// streaming (nunca `@Sse`: o verificador de decoradores e o policy-routes
// leem `@Resource`/`@Action` num `@Get`), replay de 24 h por `Last-Event-ID`,
// `: connected` na abertura e `: heartbeat` pelo poller — nenhum `setInterval`
// aqui. Escopo = sujeito da sessão (`cpf_hash` + `subject.id`, §9.3), aplicado
// no SQL do serviço; envelope de rait-events-sse-contract.md §1 sem `tenantId`
// e com `data` reformatado por tipo (RN-PORTAL-112).
//
// O tick do poller pode rodar fora do contexto da requisição (poller manual
// em teste, ou um agendador que não herda o ALS): a transação de tenant é
// então aberta com o escopo capturado na abertura (`Database.withRequestContext`).
import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  Action,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  PortalIdentityService,
  cpfHashOf,
  portalIdentityOf,
  type PortalIdentityRequest,
} from '@detran/portal-identity';

import {
  PORTAL_STREAM_EVENT_BY_TOPIC,
  PORTAL_STREAM_POLLER,
  PORTAL_STREAM_TYPES,
  PortalStreamService,
  reshape,
  type PortalStreamPoller,
  type PortalStreamScope,
  type StreamCursor,
} from './portal-stream.service.js';
import { HEARTBEAT_INTERVAL_MS } from './teat-stream.service.js';

const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;

interface ResponseLike {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  write(chunk: string): unknown;
  end(chunk?: string): unknown;
  on(event: 'close', listener: () => void): unknown;
}

interface RequestWithClose extends RequestLike, PortalIdentityRequest {
  on(event: 'close', listener: () => void): unknown;
}

@Controller('v1/portal/stream')
@UseGuards(PortalCitizenGuard)
@Resource('portal:stream')
export class PortalStreamController {
  constructor(
    private readonly service: PortalStreamService,
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PORTAL_STREAM_POLLER) private readonly poller: PortalStreamPoller,
  ) {}

  @Get()
  @Action('read')
  async stream(
    @Req() req: RequestWithClose,
    @Res() res: ResponseLike,
    @Headers('last-event-id') lastEventId: string | undefined,
    @Query('topics') topics: string | undefined,
  ): Promise<void> {
    const identity = portalIdentityOf(req);
    const context = this.requestContext.snapshot();
    const tenantScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
    };
    const subject = await withTenantContext(
      this.database,
      this.requestContext,
      (tx) => this.identity.upsertSubject(tx, identity, null),
    );
    const scope: PortalStreamScope = {
      cpfHash: cpfHashOf(identity.cpf),
      subjectId: subject.subjectId,
    };
    const topicFilter = topics
      ? new Set(
          topics
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry): entry is (typeof PORTAL_STREAM_TYPES)[number] =>
              (PORTAL_STREAM_TYPES as readonly string[]).includes(entry),
            ),
        )
      : null;

    // Fora do contexto da requisição (tick do poller), reabre o escopo capturado.
    const inScope = <T>(work: () => Promise<T>): Promise<T> =>
      this.requestContext.hasActiveContext()
        ? work()
        : this.database.withRequestContext(tenantScope, work);

    let cursor: StreamCursor;
    if (lastEventId) {
      const row = await this.service.findById(lastEventId);
      if (!row) {
        cursor = { createdAt: await this.service.now(), id: null };
      } else {
        const ageMs = Date.now() - new Date(row.created_at).getTime();
        if (ageMs > REPLAY_WINDOW_MS) {
          res.statusCode = 204;
          res.end();
          return;
        }
        cursor = { createdAt: row.created_at, id: row.id };
      }
    } else {
      cursor = { createdAt: await this.service.now(), id: null };
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(': connected\n\n');

    let closed = false;
    let unsubscribeHeartbeat: () => void = () => undefined;
    let unsubscribePoller: () => void = () => undefined;
    // `closed` and the cancellation are kept separate on purpose
    // (delivery-review-CTG-0002 nota low): a `close` that fires between the
    // handler registration and the two `schedule` calls below marks the
    // stream closed while the subscriptions still hold the initial no-ops;
    // the explicit `cancel()` after scheduling then cancels the real ones.
    const cancel = (): void => {
      unsubscribeHeartbeat();
      unsubscribePoller();
      unsubscribeHeartbeat = () => undefined;
      unsubscribePoller = () => undefined;
    };
    const cleanup = (): void => {
      if (closed) return;
      closed = true;
      cancel();
    };
    req.on('close', cleanup);
    res.on('close', cleanup);

    // Ticks serializados: um tick pedido durante outro em curso roda logo
    // depois (nunca dois `listSince` com o mesmo cursor; nada se perde).
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
            const event = PORTAL_STREAM_EVENT_BY_TOPIC[row.topic];
            if (!event) continue;
            if (topicFilter && !topicFilter.has(event)) continue;
            const data = reshape(row.topic, row.payload, row);
            if (!data) continue;
            const frame = [
              `id: ${row.id}`,
              `event: ${event}`,
              `data: ${JSON.stringify({ aggregate: row.payload.aggregate, data })}`,
              '',
              '',
            ].join('\n');
            res.write(frame);
          }
        } while (pending && !closed);
      } finally {
        ticking = false;
      }
    };

    unsubscribeHeartbeat = this.poller.schedule(() => {
      if (!closed) res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL_MS);
    unsubscribePoller = this.poller.schedule(() => {
      void tick();
    });
    if (closed) {
      cancel();
      return;
    }

    await tick();
  }
}
