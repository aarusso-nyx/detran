// Sweeper do DASHBOARD (CTG-0002 §13.3; plan M15; padrão
// `backend/app/src/boat-renaest-job.service.ts`: `OnModuleInit`/
// `runDue(now)`, discovery de tenants como porta explícita, timer `unref`).
// Por tenant, em `requestContext.run` (`runWithRequestContext` em produção;
// `run(context, work)` é a forma que o harness do Inspector fixa, A21) e
// `database.tx` — uma transação por passo, na ordem: (1) timers vencidos
// (`due` → efeito por família: `T-DASH-ACK-*` → 60 → 65; `T-DASH-MARCO-*`
// → reclassificação/90 → 65; `T-DASH-DUTY-*` → `ATRASADO`), (2) viradas de
// dever (§7.2), (3) frescor (§8.1), (4) detector fallback (§6.2/§8.5 sobre as
// tabelas próprias; `last_read_at = now`). Falha num passo não impede os
// seguintes (`skipped`). `fire` que devolve `false` (outro sweeper já venceu)
// ⇒ sem efeito: duas execuções com o mesmo `now` produzem uma transição e um
// evento por timer. Nos testes: `new DashboardClockSweeper(deps)` com
// `FixedClock` e discovery em memória; `runDue(now)` explícito; nunca
// `setInterval` (o tick só existe em `onModuleInit`, e com `intervalMs = 0`
// não é agendado).
import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { generateRequestId } from '@stynx-nyx/core';
import type { Calendar, Clock } from '@detran/inf-deadlines';

import { DashboardAlertService, type CycleContext } from './alert.service.js';
import { DashboardClockService, civilDateOf } from './clock.service.js';
import { DashboardDutyService } from './duty.service.js';
import { DashboardFreshnessService } from './freshness.service.js';
import {
  DASHBOARD_SWEEPER_DEPENDENCIES,
  DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS,
  query,
  type CycleSqlTransaction,
} from './tokens.js';

export interface DashboardSweepTarget {
  tenantId: string;
  actorId: string;
  timezone: string;
}

export interface DashboardSweepDiscovery {
  listEligible(): Promise<readonly DashboardSweepTarget[]>;
}

export interface DashboardSweepReport {
  tenantId: string;
  firedTimers: number;
  dutyCyclesOpened: number;
  dutyCyclesLate: number;
  dutyCyclesUnfulfilled: number;
  sourcesChanged: number;
  alertsDetected: number;
  skipped: number;
}

export interface DashboardSweepRequestContext {
  run<T>(
    context: {
      requestId: string;
      tenantId: string;
      actorId: string;
      startedAt: Date;
    },
    work: () => Promise<T>,
  ): Promise<T> | T;
}

export interface DashboardSweepDatabase {
  tx<T>(work: (tx: CycleSqlTransaction) => Promise<T>): Promise<T>;
}

/** `deps` (forma do harness `buildSweeper`, A21). */
export interface DashboardSweeperDependencies {
  clock: Clock;
  calendar: Calendar;
  discovery: DashboardSweepDiscovery;
  database: DashboardSweepDatabase;
  requestContext: DashboardSweepRequestContext;
  timers: DashboardClockService;
  alerts: DashboardAlertService;
  duties: DashboardDutyService;
  freshness: DashboardFreshnessService;
  /** `DASHBOARD_SWEEP_INTERVAL_MS`; `0` desliga o tick (testes). */
  intervalMs?: number;
}

@Injectable()
export class DashboardClockSweeper implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | undefined;

  constructor(
    @Inject(DASHBOARD_SWEEPER_DEPENDENCIES)
    private readonly deps: DashboardSweeperDependencies,
  ) {}

  async onModuleInit(): Promise<void> {
    const interval =
      this.deps.intervalMs ?? DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS;
    if (interval <= 0) return;
    this.schedule(interval);
  }

  onModuleDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private schedule(interval: number): void {
    this.timer = setTimeout(() => {
      void this.runDue(this.deps.clock.now())
        .catch(() => undefined)
        .finally(() => this.schedule(interval));
    }, interval);
    this.timer.unref();
  }

  /** Por tenant elegível, na ordem da discovery. */
  async runDue(
    now: Date = this.deps.clock.now(),
  ): Promise<readonly DashboardSweepReport[]> {
    const targets = await this.deps.discovery.listEligible();
    const reports: DashboardSweepReport[] = [];
    for (const target of targets) {
      const report = await this.deps.requestContext.run(
        {
          requestId: generateRequestId(),
          tenantId: target.tenantId,
          actorId: target.actorId,
          startedAt: now,
        },
        () => this.runTenant(target, now),
      );
      reports.push(report);
    }
    return reports;
  }

  /** Passos 1→4, cada um na sua transação e idempotente. */
  async runTenant(
    target: DashboardSweepTarget,
    now: Date,
  ): Promise<DashboardSweepReport> {
    const report: DashboardSweepReport = {
      tenantId: target.tenantId,
      firedTimers: 0,
      dutyCyclesOpened: 0,
      dutyCyclesLate: 0,
      dutyCyclesUnfulfilled: 0,
      sourcesChanged: 0,
      alertsDetected: 0,
      skipped: 0,
    };
    const ctx: CycleContext = {
      tenantId: target.tenantId,
      tz: target.timezone,
      actor: { kind: 'system', id: target.actorId, roles: [] },
      now,
      requestId: generateRequestId(),
    };
    const today = civilDateOf(now, target.timezone);

    // (1) timers vencidos
    await this.step(report, (tx) => this.fireDue(tx, ctx, report));
    // (2) viradas de dever
    await this.step(report, async (tx) => {
      const turned = await this.deps.duties.turnOver(tx, today, ctx);
      report.dutyCyclesOpened += turned.opened;
      report.dutyCyclesUnfulfilled += turned.unfulfilled;
    });
    // (3) frescor
    await this.step(report, async (tx) => {
      report.sourcesChanged += await this.deps.freshness.sweep(tx, ctx);
    });
    // (4) detector fallback (degradação declarada, §8.5)
    await this.step(report, async (tx) => {
      const cells = [
        ...(await this.deps.alerts.fallbackCells(tx, ctx, today)),
        ...(await this.deps.duties.fallbackCells(tx, ctx)),
      ];
      for (const cell of cells) {
        const result = await this.deps.alerts.detect(tx, cell, ctx);
        if (result.kind === 'detected') report.alertsDetected += 1;
      }
      await this.deps.freshness.markRead(tx, ctx.tenantId, now);
    });
    return report;
  }

  private async step(
    report: DashboardSweepReport,
    work: (tx: CycleSqlTransaction) => Promise<void>,
  ): Promise<void> {
    try {
      await this.deps.database.tx(work);
    } catch {
      report.skipped += 1;
    }
  }

  /** Passo 1: `due(now)` → efeito por família (o próprio serviço faz o
   *  `fire`; `false` = outro sweeper já venceu). */
  private async fireDue(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
    report: DashboardSweepReport,
  ): Promise<void> {
    const due = await this.deps.timers.due(tx, ctx.tenantId, ctx.now);
    for (const timer of due) {
      if (timer.ownerKind === 'alert') {
        if (await this.deps.alerts.onTimerFired(tx, timer, ctx)) {
          report.firedTimers += 1;
        }
        continue;
      }
      if (timer.ownerKind === 'duty_cycle') {
        const lateBefore = await this.isLate(tx, ctx, timer.ownerId);
        if (await this.deps.duties.onTimerFired(tx, timer, ctx)) {
          report.firedTimers += 1;
          if (!lateBefore && (await this.isLate(tx, ctx, timer.ownerId))) {
            report.dutyCyclesLate += 1;
          }
        }
        continue;
      }
      // `source` (T-DASH-PENDING-FLOOR): métrica de §6.3, nunca armado (§13.2)
      if (await this.deps.timers.fire(tx, ctx.tenantId, timer.id, ctx.now)) {
        report.firedTimers += 1;
      }
    }
  }

  private async isLate(
    tx: CycleSqlTransaction,
    ctx: CycleContext,
    cycleId: string,
  ): Promise<boolean> {
    const result = await query<{ state: string }>(
      tx,
      `select state from dashboard.duty_cycle where tenant_id = $1 and id = $2`,
      [ctx.tenantId, cycleId],
    );
    return result.rows[0]?.state === 'ATRASADO';
  }
}
