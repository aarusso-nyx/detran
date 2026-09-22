import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Action, Resource } from '@detran/shared';
import type { TeatStreamPoller } from '../../teat-stream.service.js';
import { HEARTBEAT_INTERVAL_MS } from '../../teat-stream.service.js';
import {
  RAIT_STREAM_POLLER,
  RAIT_STREAM_TOPICS,
  RaitStreamService,
  sanitizeRaitEvent,
} from './rait-stream.service.js';

const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;
interface RequestLike {
  on(event: 'close', listener: () => void): unknown;
}
interface ResponseLike {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  write(chunk: string): unknown;
  end(): unknown;
  on(event: 'close', listener: () => void): unknown;
}

@Controller('v1/inf/rait/stream')
@Resource('inf:rait-stream')
export class RaitStreamController {
  constructor(
    private readonly service: RaitStreamService,
    @Inject(RAIT_STREAM_POLLER) private readonly poller: TeatStreamPoller,
  ) {}

  @Get()
  @Action('read')
  async stream(
    @Req() req: RequestLike,
    @Res() res: ResponseLike,
    @Headers('last-event-id') lastEventId: string | undefined,
    @Query('topics') topics: string | undefined,
  ): Promise<void> {
    const filter = topics
      ? new Set(
          topics
            .split(',')
            .map((item) => item.trim())
            .filter((item): item is (typeof RAIT_STREAM_TOPICS)[number] =>
              RAIT_STREAM_TOPICS.includes(item as never),
            ),
        )
      : null;
    let cursor = {
      createdAt: await this.service.now(),
      id: null as string | null,
    };
    if (lastEventId) {
      const previous = await this.service.findById(lastEventId);
      if (
        previous &&
        Date.now() - new Date(previous.created_at).getTime() > REPLAY_WINDOW_MS
      ) {
        res.statusCode = 204;
        res.end();
        return;
      }
      if (previous)
        cursor = { createdAt: previous.created_at, id: previous.id };
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(': connected\n\n');
    let closed = false;
    let cancelHeartbeat: () => void = () => undefined;
    let cancelPoll: () => void = () => undefined;
    const close = () => {
      if (closed) return;
      closed = true;
      cancelHeartbeat();
      cancelPoll();
    };
    req.on('close', close);
    res.on('close', close);
    const tick = async () => {
      if (closed) return;
      for (const row of await this.service.listSince(
        cursor.createdAt,
        cursor.id,
      )) {
        cursor = { createdAt: row.created_at, id: row.id };
        const topic = row.topic.split('.')[1] ?? 'outbox';
        if (filter && !filter.has(topic as never)) continue;
        res.write(
          `id: ${row.id}\nevent: ${topic}\ndata: ${JSON.stringify(sanitizeRaitEvent(row.payload))}\n\n`,
        );
      }
    };
    cancelHeartbeat = this.poller.schedule(() => {
      if (!closed) res.write(': heartbeat\n\n');
    }, HEARTBEAT_INTERVAL_MS);
    cancelPoll = this.poller.schedule(tick);
    await tick();
  }
}
