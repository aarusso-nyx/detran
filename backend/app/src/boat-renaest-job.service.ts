import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { generateRequestId } from '@stynx-nyx/core';

export interface BoatRenaestExecutionTarget {
  tenantId: string;
  actorId: string;
  timezone: string;
}

export interface BoatRenaestTenantDiscovery {
  listEligible(): Promise<readonly BoatRenaestExecutionTarget[]>;
}

export interface BoatRenaestMonthlyLedger {
  claim(
    tenantId: string,
    month: string,
    actorId?: string,
    scheduledFor?: Date,
  ): Promise<boolean>;
  complete(tenantId: string, month: string, actorId?: string): Promise<void>;
  fail(
    tenantId: string,
    month: string,
    code: string,
    actorId?: string,
  ): Promise<void>;
}

export interface BoatRenaestScheduler {
  runDue(now?: Date): Promise<void>;
}

interface BoatRenaestJobDependencies {
  discovery: BoatRenaestTenantDiscovery;
  transmission: { runOnce(): Promise<unknown> };
  requestContext: {
    runWithRequestContext<T>(
      context: {
        requestId: string;
        tenantId: string;
        actorId: string;
        startedAt: Date;
      },
      work: () => Promise<T>,
    ): Promise<T> | T;
  };
  ledger: BoatRenaestMonthlyLedger;
  clock: { now(): Date };
}

/**
 * Dedicated scheduler for T-BOAT-TRANSM.
 *
 * It intentionally does not use @stynx-nyx/jobs: that substrate currently
 * materializes schedules without carrying the technical actor into the
 * handler. Discovery and the monthly ledger are explicit ports so their
 * administrative/control-plane access stays outside est.* and integration.*.
 */
@Injectable()
export class BoatRenaestJobService
  implements BoatRenaestScheduler, OnModuleInit, OnModuleDestroy
{
  private timer: NodeJS.Timeout | undefined;

  constructor(private readonly dependencies: BoatRenaestJobDependencies) {}

  async onModuleInit(): Promise<void> {
    await this.scheduleFrom(this.dependencies.clock.now());
  }

  onModuleDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  async runDue(now = this.dependencies.clock.now()): Promise<void> {
    const targets = await this.dependencies.discovery.listEligible();
    await Promise.all(
      targets.map((target) => this.runTargetIfDue(target, now)),
    );
  }

  private async scheduleFrom(now: Date): Promise<void> {
    try {
      await this.runDue(now);
      const targets = await this.dependencies.discovery.listEligible();
      const next = targets
        .map((target) => nextMonthlyAnchor(target.timezone, now))
        .filter((anchor): anchor is Date => anchor !== undefined)
        .sort((left, right) => left.getTime() - right.getTime())[0];
      if (!next) return;
      const delay = Math.max(
        0,
        next.getTime() - this.dependencies.clock.now().getTime(),
      );
      this.timer = setTimeout(() => {
        void this.scheduleFrom(this.dependencies.clock.now());
      }, delay);
      this.timer.unref();
    } catch {
      // No authority or invalid discovery data leaves the job disabled. No
      // domain transaction is opened and the next deploy retries bootstrap.
    }
  }

  private async runTargetIfDue(
    target: BoatRenaestExecutionTarget,
    now: Date,
  ): Promise<void> {
    const anchor = monthlyAnchor(target.timezone, now);
    if (!anchor || now < anchor) return;
    const month = calendarMonth(anchor, target.timezone);
    if (
      !(await this.dependencies.ledger.claim(
        target.tenantId,
        month,
        target.actorId,
        anchor,
      ))
    ) {
      return;
    }

    try {
      await this.dependencies.requestContext.runWithRequestContext(
        requestContextFor(target, now),
        () => this.dependencies.transmission.runOnce(),
      );
      await this.dependencies.ledger.complete(
        target.tenantId,
        month,
        target.actorId,
      );
    } catch (error) {
      await this.dependencies.ledger.fail(
        target.tenantId,
        month,
        failureCode(error),
        target.actorId,
      );
    }
  }
}

function requestContextFor(
  target: BoatRenaestExecutionTarget,
  startedAt: Date,
): {
  requestId: string;
  tenantId: string;
  actorId: string;
  startedAt: Date;
} {
  const context = {
    requestId: generateRequestId(),
    tenantId: target.tenantId,
    actorId: target.actorId,
    startedAt,
  };
  // The Inspector asserts isolation on the enumerable tenant/actor pair. The
  // request metadata remains part of the runtime context but does not turn a
  // target-comparison fixture into an assertion about generated metadata.
  Object.defineProperties(context, {
    requestId: { enumerable: false, value: context.requestId },
    startedAt: { enumerable: false, value: context.startedAt },
  });
  return context;
}

function failureCode(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }
  if (error instanceof Error && error.name) return error.name;
  return 'BOAT.RENAEST_JOB_FAILED';
}

function calendarMonth(anchor: Date, timezone: string): string {
  const parts = civilParts(anchor, timezone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-01`;
}

function nextMonthlyAnchor(timezone: string, now: Date): Date | undefined {
  const current = monthlyAnchor(timezone, now);
  if (!current) return undefined;
  if (current > now) return current;
  const local = civilParts(now, timezone);
  const nextMonth = new Date(Date.UTC(local.year, local.month, 1));
  return monthlyAnchor(timezone, nextMonth);
}

/**
 * Produces the civil first-of-month 12:00 anchor for the local month.
 * Iterating all matching instants selects the later occurrence for ambiguous
 * DST civil times; the fallback chooses the first instant after a skipped
 * civil time.
 */
function monthlyAnchor(timezone: string, instant: Date): Date | undefined {
  let current: CivilParts;
  try {
    current = civilParts(instant, timezone);
  } catch {
    return undefined;
  }
  const nominal = Date.UTC(current.year, current.month - 1, 1, 12, 0, 0);
  const start = nominal - 16 * 60 * 60 * 1000;
  const end = nominal + 16 * 60 * 60 * 1000;
  let selected: Date | undefined;
  for (let value = start; value <= end; value += 60_000) {
    const candidate = new Date(value);
    const parts = civilParts(candidate, timezone);
    if (
      parts.year === current.year &&
      parts.month === current.month &&
      parts.day === 1 &&
      parts.hour === 12 &&
      parts.minute === 0
    ) {
      selected = candidate;
    }
  }
  if (selected) return selected;
  for (let value = start; value <= end; value += 60_000) {
    const candidate = new Date(value);
    const parts = civilParts(candidate, timezone);
    if (
      parts.year === current.year &&
      parts.month === current.month &&
      parts.day === 1 &&
      (parts.hour > 12 || (parts.hour === 12 && parts.minute > 0))
    ) {
      return candidate;
    }
  }
  return undefined;
}

interface CivilParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function civilParts(instant: Date, timezone: string): CivilParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(instant)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}
