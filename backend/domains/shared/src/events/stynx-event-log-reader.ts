// Consumer read boundary over the published event source; native payload stays immutable.
import {
  RequestContextMissingError,
  type RequestContext,
} from '@stynx-nyx/core';
import type {
  OutboxEventStreamSource,
  OutboxStreamCursor,
  OutboxStreamRow,
  OutboxStreamScope,
} from '@stynx-nyx/outbox';

export class StynxEventLogReader {
  constructor(
    private readonly source: Pick<
      OutboxEventStreamSource,
      'now' | 'findById' | 'listSince'
    >,
    private readonly context: Pick<
      RequestContext,
      'hasActiveContext' | 'snapshot'
    >,
  ) {}

  private scope(): OutboxStreamScope {
    if (!this.context.hasActiveContext())
      throw new RequestContextMissingError();
    const snapshot = this.context.snapshot();
    const { tenantId, actorId } = snapshot;
    if (
      typeof tenantId !== 'string' ||
      !tenantId.trim() ||
      typeof actorId !== 'string' ||
      !actorId.trim()
    )
      throw new RequestContextMissingError();
    return {
      tenantId,
      actorId,
      ...(Object.hasOwn(snapshot, 'sessionId')
        ? { sessionId: snapshot.sessionId }
        : {}),
    };
  }

  /** The public source may advance its tenant clock in its independent app operation. */
  async now(): Promise<Date> {
    return this.source.now(this.scope());
  }

  async findById(id: string): Promise<OutboxStreamRow | null> {
    const row = await this.source.findById(id, this.scope());
    return row === null ? null : this.project(row);
  }

  async listSince(
    cursor: OutboxStreamCursor,
    limit: number,
  ): Promise<readonly OutboxStreamRow[]> {
    const rows = await this.source.listSince(cursor, this.scope(), limit);
    return rows.map((row) => this.project(row));
  }

  private project(row: OutboxStreamRow): OutboxStreamRow {
    return { ...row, payload: { ...row.payload, id: row.id } };
  }
}
