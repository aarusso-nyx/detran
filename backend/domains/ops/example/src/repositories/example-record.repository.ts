// Generated from BP-OPS-EXAMPLE-001 v1.0.0 sha256:a70ca6e407f469de7c4926ee3eea5364795e84c1934982d0662dcaf70341cb29
import { Injectable } from '@nestjs/common';
import { withTenantContext } from '@detran/shared';

/** Database port intentionally has no optional or in-memory implementation. */
export interface ExampleDatabase {
  tx<T>(
    work: (transaction: unknown) => Promise<T>,
    options: { role: 'app' },
  ): Promise<T>;
}
export interface ExampleRequestContext {
  hasActiveContext(): boolean;
  snapshot(): { tenantId?: string; actorId?: string };
}

@Injectable()
export class ExampleRecordRepository {
  constructor(
    private readonly database: ExampleDatabase,
    private readonly requestContext: ExampleRequestContext,
  ) {}

  findAll(): Promise<unknown[]> {
    return withTenantContext(
      this.database as never,
      this.requestContext as never,
      async (tx) =>
        (
          await (
            tx as { query(sql: string): Promise<{ rows: unknown[] }> }
          ).query(
            'select * from ops.example_record order by created_at desc limit 500',
          )
        ).rows,
    );
  }
}
