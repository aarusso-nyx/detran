import { RequestContextMutator } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import {
  BoatRenaestJobService,
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

/**
 * The administrative discovery function has deliberately no application-role
 * grant in DDL 75. Until the Owner supplies a separately authorized control
 * plane port, booting this provider must not enumerate tenants by owner role.
 */
export class UnconfiguredBoatRenaestTenantDiscovery implements BoatRenaestTenantDiscovery {
  async listEligible(): Promise<readonly never[]> {
    throw new Error('BOAT RENAEST administrative discovery is not configured');
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
