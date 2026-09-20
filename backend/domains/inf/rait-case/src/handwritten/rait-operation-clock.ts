import { Injectable } from '@nestjs/common';
import type { Clock, LocalDate } from '@detran/inf-deadlines';

/** One immutable instant and its tenant-local civil day for one RAIT operation. */
export interface RaitOperationClockSnapshot extends Clock {
  readonly instant: Date;
  readonly tenantTz: string;
}

class Snapshot implements RaitOperationClockSnapshot {
  readonly instant: Date;
  readonly tenantTz: string;
  private readonly localDay: LocalDate;

  constructor(instant: Date, tenantTz: string) {
    if (!Number.isFinite(instant.valueOf())) {
      throw new RangeError('RAIT operation clock requires a valid instant.');
    }
    if (tenantTz.trim().length === 0) {
      throw new RangeError('RAIT operation clock requires a tenant timezone.');
    }

    this.instant = new Date(instant.valueOf());
    this.tenantTz = tenantTz;
    this.localDay = civilDay(this.instant, tenantTz);
  }

  now(): Date {
    return new Date(this.instant.valueOf());
  }

  today(tenantTz: string): LocalDate {
    if (tenantTz !== this.tenantTz) {
      throw new RangeError(
        'RAIT operation clock timezone differs from its snapshot.',
      );
    }
    return this.localDay;
  }
}

function civilDay(instant: Date, tenantTz: string): LocalDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tenantTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, value]),
  );
  return `${values.year!}-${values.month!}-${values.day!}`;
}

/**
 * Production Clock provider. Consumers must capture once at the operation
 * boundary and pass the resulting Clock to every temporal collaborator.
 * Wiring that boundary into the command factory is intentionally separate.
 */
@Injectable()
export class RaitOperationClock {
  capture(tenantTz: string, instant = new Date()): RaitOperationClockSnapshot {
    return new Snapshot(instant, tenantTz);
  }
}
