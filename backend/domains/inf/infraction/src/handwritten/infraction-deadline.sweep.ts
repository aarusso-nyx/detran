import { Injectable } from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import { withTenantContext } from '@detran/shared';

type Tx = Pick<Transaction, 'query'>;

@Injectable()
export class InfractionDeadlineSweep {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  run(
    limit = 500,
  ): Promise<{ claimed: number; expired: number; alerts: number }> {
    const bounded = Math.max(1, Math.min(500, Math.trunc(limit)));
    return withTenantContext(
      this.database,
      this.requestContext,
      async (rawTx) => {
        const tx = rawTx as Tx;
        const timers = (
          await tx.query<{ id: string; timer_code: string }>(
            `select id, timer_code from inf.infraction_timer
          where status = 'armado' and satisfied_at is null and due_on < current_date
          order by due_on, id for update skip locked limit $1`,
            [bounded],
          )
        ).rows;
        let expired = 0;
        let alerts = 0;
        for (const timer of timers) {
          const alertOnly = ['T-PAR-3A', 'T-PRESC-5A', 'T-NA-IND'].includes(
            timer.timer_code,
          );
          const updated = await tx.query(
            `update inf.infraction_timer set status = 'vencido', expired_at = clock_timestamp(),
             updated_at = clock_timestamp()
           where id = $1 and status = 'armado' and satisfied_at is null returning id`,
            [timer.id],
          );
          if (!updated.rows[0]) continue;
          expired += 1;
          if (alertOnly) alerts += 1;
        }
        return { claimed: timers.length, expired, alerts };
      },
    );
  }
}
