// `GET /v1/inf/rait/stream` (rait-events-sse-contract.md §3).
//
// R-0022 CTG-0004 (TASK-0007, OD-R22-45): o enquadramento é do
// `StynxEventStreamService` publicado, uma instância por fluxo construída
// aqui (R-2) sobre `RAIT_STREAM_POLLER` (R-3), com o escopo explícito da
// conexão (R-4). Ficam locais: `event:` = `type` do envelope (OD-R22-04),
// `?topics=` pelo 2º segmento do `topic`, filtro por chave de leitura do
// agregado (OD-R22-04, OD-R22-52) e a projeção sem tenant/PII. A cláusula de
// _pool_ de `rait-analyst`/`rait-rapporteur` está em checkpoint (OD-R22-53);
// `?caseId=`/`?sessionId=` continuam ignorados (OD-R22-54).
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
  StreamReads,
  schedulerOf,
  topicsOf,
  type TeatStreamPoller,
} from '../../teat-stream.service.js';
import {
  RAIT_STREAM_BATCH_SIZE,
  RAIT_STREAM_POLLER,
  RAIT_STREAM_TOPICS,
  RaitStreamService,
  RaitStreamSource,
  isRaitKindReadableBy,
  raitTopicOf,
  sanitizeRaitEvent,
  type RaitStreamScope,
} from './rait-stream.service.js';

type StreamRequest = RequestLike & StynxSseRequest;

function aggregateKindOf(payload: Record<string, unknown>): unknown {
  const aggregate = payload.aggregate;
  return typeof aggregate === 'object' && aggregate !== null
    ? (aggregate as Record<string, unknown>).kind
    : undefined;
}

@Controller('v1/inf/rait/stream')
@Resource('inf:rait-stream')
export class RaitStreamController implements OnModuleDestroy {
  private readonly reads = new StreamReads();
  private readonly events: StynxEventStreamService;

  constructor(
    private readonly service: RaitStreamService,
    @Inject(RAIT_STREAM_POLLER) private readonly poller: TeatStreamPoller,
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
    const scope: RaitStreamScope = {
      tenantId: context.tenantId ?? '',
      actorId: context.actorId ?? '',
      principal: getPrincipalFromRequest(req),
    };
    const requested = topicsOf(topics);
    const topicFilter = requested
      ? new Set(
          [...requested].filter((entry) =>
            (RAIT_STREAM_TOPICS as readonly string[]).includes(entry),
          ),
        )
      : null;
    await this.events.open(
      req,
      res,
      new RaitStreamSource(this.service, this.reads),
      {
        scope,
        filter: (event, connection) =>
          event.named &&
          (!topicFilter || topicFilter.has(raitTopicOf(event.row.topic))) &&
          isRaitKindReadableBy(
            connection.principal,
            aggregateKindOf(event.row.payload),
          ),
        project: (event) => sanitizeRaitEvent(event.row.payload),
        heartbeatMs: HEARTBEAT_INTERVAL_MS,
        replayWindowMs: REPLAY_WINDOW_MS,
        tickMs: this.poller.intervalMs,
        batchSize: RAIT_STREAM_BATCH_SIZE,
      },
    );
  }
}
