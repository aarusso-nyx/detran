// CTG-0002 §2.7 e §9 (R-0009, TASK-0008; plan M18) — `GET /v1/portal/stream`.
//
// `@Get` com resposta manual em streaming (nunca `@Sse`: o verificador de
// decoradores e o policy-routes leem `@Resource`/`@Action` num `@Get`).
// Escopo = sujeito da sessão (`cpf_hash` + `subject.id`, §9.3), aplicado no
// SQL do serviço; envelope de rait-events-sse-contract.md §1 sem `tenantId`
// e com `data` reformatado por tipo (RN-PORTAL-112).
//
// R-0022 CTG-0004 (TASK-0007, OD-R22-45): o enquadramento é do
// `StynxEventStreamService` publicado, uma instância por fluxo construída
// aqui (R-2) sobre `PORTAL_STREAM_POLLER` (R-3). O serviço reabre o contexto
// da conexão (tenant, ator) em cada leitura (R-4), sem ALS herdado nem
// `inScope` local. Passo anterior à abertura que fica aqui: `upsertSubject`.
import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
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
  PORTAL_STREAM_POLLER,
  PORTAL_STREAM_TYPES,
  PortalStreamService,
  PortalStreamSource,
  reshape,
  type PortalConnectionScope,
  type PortalStreamPoller,
} from './portal-stream.service.js';
import {
  HEARTBEAT_INTERVAL_MS,
  REPLAY_WINDOW_MS,
  StreamReads,
  schedulerOf,
  topicsOf,
} from './teat-stream.service.js';

/** Linhas por leitura (CTG-0004 §3: padrão atual de `listSince`). */
const BATCH_SIZE = 200;

type StreamRequest = RequestLike & PortalIdentityRequest & StynxSseRequest;

@Controller('v1/portal/stream')
@UseGuards(PortalCitizenGuard)
@Resource('portal:stream')
export class PortalStreamController implements OnModuleDestroy {
  private readonly reads = new StreamReads();
  private readonly events: StynxEventStreamService;

  constructor(
    private readonly service: PortalStreamService,
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PORTAL_STREAM_POLLER) private readonly poller: PortalStreamPoller,
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
    const identity = portalIdentityOf(req);
    const context = this.requestContext.snapshot();
    const subject = await withTenantContext(
      this.database,
      this.requestContext,
      (tx) => this.identity.upsertSubject(tx, identity, null),
    );
    const scope: PortalConnectionScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
      cpfHash: cpfHashOf(identity.cpf),
      subjectId: subject.subjectId,
    };
    const requested = topicsOf(topics);
    const topicFilter = requested
      ? new Set(
          [...requested].filter((entry) =>
            (PORTAL_STREAM_TYPES as readonly string[]).includes(entry),
          ),
        )
      : null;
    await this.events.open(
      req,
      res,
      new PortalStreamSource(this.service, this.reads),
      {
        scope,
        filter: (event) =>
          event.named &&
          (!topicFilter || topicFilter.has(event.event)) &&
          reshape(event.row.topic, event.row.payload, event.row) !== null,
        project: (event) => ({
          aggregate: event.row.payload.aggregate,
          data: reshape(event.row.topic, event.row.payload, event.row),
        }),
        heartbeatMs: HEARTBEAT_INTERVAL_MS,
        replayWindowMs: REPLAY_WINDOW_MS,
        tickMs: this.poller.intervalMs,
        batchSize: BATCH_SIZE,
      },
    );
  }
}
