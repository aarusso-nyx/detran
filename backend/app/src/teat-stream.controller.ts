// CTG-0004 §7.1 (M17, R-0008, TASK-0009) — `GET /v1/ops/stream`.
//
// `@Get` com resposta manual em streaming (nota do maestro, item e): o
// verificador de decoradores lê `@Resource`/`@Action` normalmente num
// `@Get`, mas não veria a rota se fosse `@Sse`.
//
// R-0022 CTG-0004 (TASK-0007, OD-R22-45): o enquadramento (cabeçalhos,
// `: connected`, heartbeat, _ticks_ serializados, janela de _replay_,
// `Last-Event-ID`, cancelamento) é do `StynxEventStreamService` publicado,
// uma instância por fluxo construída aqui (R-2) sobre a porta de agendamento
// `TEAT_STREAM_POLLER` (R-3). Ficam locais só a fonte fina sobre as leituras
// atuais (R-5), o filtro por tipo/chave de leitura, a projeção sem
// `tenantId` (R-6) e o escopo explícito da conexão (R-4).
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
  getPrincipalFromRequest,
  Resource,
  type RequestLike,
} from '@detran/shared';

import {
  HEARTBEAT_INTERVAL_MS,
  REPLAY_WINDOW_MS,
  TEAT_STREAM_POLLER,
  TeatStreamService,
  TeatStreamSource,
  isTypeReadableBy,
  StreamReads,
  schedulerOf,
  topicsOf,
  type TeatStreamPoller,
  type TeatStreamScope,
} from './teat-stream.service.js';

/** Linhas por leitura (CTG-0004 §3: padrão atual de `listSince`). */
const BATCH_SIZE = 200;

type StreamRequest = RequestLike & StynxSseRequest;

@Controller('v1/ops/stream')
@Resource('ops:stream')
export class TeatStreamController implements OnModuleDestroy {
  private readonly reads = new StreamReads();
  private readonly events: StynxEventStreamService;

  constructor(
    private readonly service: TeatStreamService,
    @Inject(TEAT_STREAM_POLLER) private readonly poller: TeatStreamPoller,
    database: Database,
    private readonly requestContext: RequestContext,
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
    const context = this.requestContext.snapshot();
    const scope: TeatStreamScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
      principal: getPrincipalFromRequest(req),
    };
    const topicFilter = topicsOf(topics);
    await this.events.open(
      req,
      res,
      new TeatStreamSource(this.service, this.reads),
      {
        scope,
        filter: (event, connection) =>
          event.named &&
          (!topicFilter || topicFilter.has(event.event)) &&
          isTypeReadableBy(connection.principal, event.event),
        project: (event) => ({
          aggregate: event.row.payload.aggregate,
          data: event.row.payload.data,
        }),
        heartbeatMs: HEARTBEAT_INTERVAL_MS,
        replayWindowMs: REPLAY_WINDOW_MS,
        tickMs: this.poller.intervalMs,
        batchSize: BATCH_SIZE,
      },
    );
  }
}
