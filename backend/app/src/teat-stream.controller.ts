// CTG-0004 §7.1 (M17, R-0008, TASK-0009) — `GET /v1/ops/stream`.
//
// `@Get` com resposta manual em streaming (nota do maestro, item e): o
// verificador de decoradores lê `@Resource`/`@Action` normalmente num
// `@Get`, mas não veria a rota se fosse `@Sse` — por isso a resposta é
// escrita à mão em vez de usar o helper `@Sse` do Nest.
import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  Action,
  getPrincipalFromRequest,
  Resource,
  type RequestLike,
} from '@detran/shared';

import {
  HEARTBEAT_INTERVAL_MS,
  isTypeReadableBy,
  TEAT_STREAM_POLLER,
  TeatStreamService,
  type StreamCursor,
  type TeatStreamPoller,
} from './teat-stream.service.js';

const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;

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

@Controller('v1/ops/stream')
@Resource('ops:stream')
export class TeatStreamController {
  constructor(
    private readonly service: TeatStreamService,
    @Inject(TEAT_STREAM_POLLER) private readonly poller: TeatStreamPoller,
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
    const topicFilter = topics
      ? new Set(
          topics
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
        )
      : null;

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
    const cleanup = (): void => {
      if (closed) return;
      closed = true;
      unsubscribeHeartbeat();
      unsubscribePoller();
    };

    const unsubscribeHeartbeat = this.poller.schedule(() => {
      if (!closed) res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL_MS);

    const tick = async (): Promise<void> => {
      if (closed) return;
      let rows;
      try {
        rows = await this.service.listSince(cursor);
      } catch {
        return;
      }
      for (const row of rows) {
        cursor = { createdAt: row.created_at, id: row.id };
        const envelope = row.payload;
        const type = typeof envelope.type === 'string' ? envelope.type : '';
        if (!type) continue;
        if (topicFilter && !topicFilter.has(type)) continue;
        if (!isTypeReadableBy(principal, type)) continue;
        const frame = [
          `id: ${row.id}`,
          `event: ${type}`,
          `data: ${JSON.stringify({ aggregate: envelope.aggregate, data: envelope.data })}`,
          '',
          '',
        ].join('\n');
        res.write(frame);
      }
    };

    await tick();
    const unsubscribePoller = this.poller.schedule(() => {
      void tick();
    });

    req.on('close', cleanup);
    res.on('close', cleanup);
  }
}
