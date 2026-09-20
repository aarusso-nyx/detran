import { RequestContextMutator } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  BoatRenaestJobService,
  type BoatRenaestExecutionTarget,
  type BoatRenaestMonthlyLedger,
  type BoatRenaestTenantDiscovery,
} from './boat-renaest-job.service.js';
import { BoatRenaestTransmissionService } from './boat-renaest-transmission.service.js';

export const BOAT_RENAEST_TENANT_DISCOVERY = Symbol(
  'BOAT_RENAEST_TENANT_DISCOVERY',
);
export const BOAT_RENAEST_MONTHLY_LEDGER = Symbol(
  'BOAT_RENAEST_MONTHLY_LEDGER',
);

interface BoatRenaestExecutionTargetRow {
  tenant_id: string;
  actor_id: string;
  timezone: string;
}

export class SqlBoatRenaestTenantDiscovery implements BoatRenaestTenantDiscovery {
  constructor(private readonly database: Database) {}

  async listEligible(): Promise<readonly BoatRenaestExecutionTarget[]> {
    const result = await this.database.tx((transaction) =>
      transaction.query<BoatRenaestExecutionTargetRow>(
        `select tenant_id, actor_id, timezone
           from jobs.discover_active_boat_renaest_tenants()`,
      ),
    );
    return result.rows.map((row) => ({
      tenantId: row.tenant_id,
      actorId: row.actor_id,
      timezone: row.timezone,
    }));
  }
}

export class SqlBoatRenaestMonthlyLedger implements BoatRenaestMonthlyLedger {
  constructor(
    private readonly database: Database,
    private readonly requestContext: RequestContextMutator,
  ) {}

  async claim(
    tenantId: string,
    month: string,
    actorId?: string,
    scheduledFor?: Date,
  ): Promise<boolean> {
    if (!actorId) return false;
    return this.inTenant(tenantId, actorId, async () => {
      const result = await this.database.tx((transaction) =>
        transaction.query<{ tenant_id: string }>(
          `insert into jobs.boat_renaest_execution
             (tenant_id, calendar_month, actor_id, request_id, scheduled_for, status)
           values ($1::uuid, $2::date, $3::uuid, $4, $5::timestamptz, 'processing')
           on conflict (tenant_id, calendar_month) do update
             set actor_id = excluded.actor_id,
                 request_id = excluded.request_id,
                 scheduled_for = excluded.scheduled_for,
                 status = 'processing',
                 started_at = clock_timestamp(),
                 completed_at = null,
                 failure_code = null,
                 updated_at = clock_timestamp()
             where jobs.boat_renaest_execution.status = 'failed'
           returning tenant_id`,
          [
            tenantId,
            month,
            actorId,
            `boat-renaest:${tenantId}:${month}`,
            (scheduledFor ?? new Date(`${month}T12:00:00Z`)).toISOString(),
          ],
        ),
      );
      return result.rows.length === 1;
    });
  }

  async complete(
    tenantId: string,
    month: string,
    actorId?: string,
  ): Promise<void> {
    await this.inTenant(tenantId, requiredActor(actorId), async () => {
      await this.database.tx((transaction) =>
        transaction.query(
          `update jobs.boat_renaest_execution
              set status = 'completed', completed_at = clock_timestamp(),
                  failure_code = null, updated_at = clock_timestamp()
            where tenant_id = $1::uuid and calendar_month = $2::date
              and status = 'processing'`,
          [tenantId, month],
        ),
      );
    });
  }

  async fail(
    tenantId: string,
    month: string,
    code: string,
    actorId?: string,
  ): Promise<void> {
    await this.inTenant(tenantId, requiredActor(actorId), async () => {
      await this.database.tx((transaction) =>
        transaction.query(
          `update jobs.boat_renaest_execution
              set status = 'failed', completed_at = clock_timestamp(),
                  failure_code = $3, updated_at = clock_timestamp()
            where tenant_id = $1::uuid and calendar_month = $2::date
              and status = 'processing'`,
          [tenantId, month, code],
        ),
      );
    });
  }

  private async inTenant<T>(
    tenantId: string,
    actorId: string,
    work: () => Promise<T>,
  ): Promise<T> {
    return this.requestContext.runWithRequestContext(
      {
        requestId: `boat-renaest-ledger:${tenantId}`,
        tenantId,
        actorId,
        startedAt: new Date(),
      },
      work,
    );
  }
}

function requiredActor(actorId: string | undefined): string {
  if (actorId) return actorId;
  throw new Error('BOAT RENAEST ledger requires a technical actor');
}

export function createBoatRenaestJobService(
  discovery: BoatRenaestTenantDiscovery,
  ledger: BoatRenaestMonthlyLedger,
  transmission: BoatRenaestTransmissionService,
  requestContext: RequestContextMutator,
): BoatRenaestJobService {
  return new BoatRenaestJobService({
    discovery,
    ledger,
    transmission,
    requestContext,
    clock: { now: () => new Date() },
  });
}
