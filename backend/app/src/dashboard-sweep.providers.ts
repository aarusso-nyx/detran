// CTG-0002 §13.3 e §14.2 (R-0011, TASK-0013; plan M15/M16) — composição no
// app do relógio, do calendário, da discovery e das dependências do
// `DashboardClockSweeper` de `@detran/dashboard-monitor`, no padrão de
// `boat-renaest-job.providers.ts` (discovery = tenants ativos + ator técnico)
// e de `portal-national-read.providers.ts` (módulo `@Global()` porque quem
// consome os tokens vive no `MonitorModule`, gerado sem `imports`).
//
// - `DASHBOARD_CLOCK`: relógio do sistema (`Clock` de `@detran/inf-deadlines`;
//   `today(tz)` = dia civil no fuso do tenant). Único `new Date()` do
//   DASHBOARD em produção; testes injetam `FixedClock`.
// - `DASHBOARD_CALENDAR`: `InMemoryCalendar(calendar-2026.json)` (M15, OD-D28).
// - `DASHBOARD_SWEEP_DISCOVERY`: `auth.tenants` ativos × membro ativo com o
//   papel `integration-operator` (o ator técnico — TECH de `policy.ts`,
//   precedente do harness do ciclo, A21) como ator do sweep; leitura de
//   controle fora do caminho da requisição (`withSystemContext`, precedente
//   `detran-runtime.ts` PortalHostnameDirectory). No perfil `test` a
//   discovery não lista tenant algum — o sweeper fica parado, como o job do
//   BOAT sem identidade semeada (premissa declarada no relatório).
// - `DASHBOARD_SWEEPER_DEPENDENCIES`: o objeto `deps` (forma do harness
//   `buildSweeper`, A21). O `MonitorModule` gerado não exporta os serviços do
//   ciclo, logo o app compõe aqui uma segunda instância (sem estado) de
//   `DashboardClockService`/`Notifier`/`Freshness`/`Alert`/`DutyService` —
//   exatamente como `buildCycle` do Inspector (OD proposta: `exports` no
//   blueprint para injetar os providers do módulo).
// - `OpsParameterService` (`ParameterModule` não é `@Global`) é reexportado
//   daqui para o `MonitorModule` (§1.3.7).
import { Global, Module } from '@nestjs/common';
import { RequestContextMutator } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { createProductionCalendar } from '@detran/inf-measures';
import { OpsParameterService, ParameterModule } from '@detran/ops-parameter';
import {
  DASHBOARD_CALENDAR,
  DASHBOARD_CLOCK,
  DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS,
  DASHBOARD_SWEEP_DISCOVERY,
  DASHBOARD_SWEEP_INTERVAL_MS,
  DASHBOARD_SWEEPER_DEPENDENCIES,
  DashboardAlertService,
  DashboardClockService,
  DashboardDutyService,
  DashboardFreshnessService,
  DashboardNotifier,
  civilDateOf,
  type DashboardSweepDiscovery,
  type DashboardSweepTarget,
  type DashboardSweeperDependencies,
} from '@detran/dashboard-monitor';

import { detranRuntimeProfile } from './detran-runtime.js';

/** `Clock`/`Calendar` de `@detran/inf-deadlines` (o app não os importa pelo nome: chegam pelos tipos do ciclo). */
type Clock = DashboardSweeperDependencies['clock'];
type Calendar = DashboardSweeperDependencies['calendar'];
type SweepTransaction = Parameters<
  Parameters<DashboardSweeperDependencies['database']['tx']>[0]
>[0];

/** Papel canônico do ator técnico do sweep (TECH de `policy.ts`; harness A21). */
const SWEEP_ACTOR_ROLE = 'integration-operator';

/** `Clock` de produção: instante do sistema e dia civil no fuso do tenant. */
export class SystemDashboardClock implements Clock {
  now(): Date {
    return new Date();
  }

  today(tenantTz: string): string {
    return civilDateOf(this.now(), tenantTz);
  }
}

/** `InMemoryCalendar(calendar-2026.json)` (M15) — a mesma fábrica de produção de `@detran/inf-measures`. */
export function createDashboardCalendar(): Calendar {
  return createProductionCalendar();
}

interface SweepTargetRow {
  tenant_id: string;
  actor_id: string;
  timezone: string;
}

export class SqlDashboardSweepDiscovery implements DashboardSweepDiscovery {
  constructor(
    private readonly database: Database,
    private readonly enabled: boolean,
  ) {}

  async listEligible(): Promise<readonly DashboardSweepTarget[]> {
    if (!this.enabled) return [];
    const rows = await this.database.withSystemContext(
      'DASHBOARD sweep discovery',
      () =>
        this.database.tx(
          async (transaction) =>
            (
              await transaction.query<SweepTargetRow>(
                `select distinct on (tenant.id)
                        tenant.id as tenant_id, membership.user_id as actor_id, tenant.timezone
                   from auth.tenants tenant
                   join auth.memberships membership on membership.tenant_id = tenant.id
                   join auth.membership_roles membership_role on membership_role.membership_id = membership.id
                   join auth.roles role on role.id = membership_role.role_id
                   join auth.users app_user on app_user.id = membership.user_id
                  where tenant.state = 'active' and tenant.is_active = true
                    and membership.is_active = true and app_user.is_active = true
                    and role.key = $1
                  order by tenant.id, membership.created_at, membership.user_id`,
                [SWEEP_ACTOR_ROLE],
              )
            ).rows,
          { role: 'owner', readonly: true, retry: false },
        ),
    );
    return rows.map((row) => ({
      tenantId: row.tenant_id,
      actorId: row.actor_id,
      timezone: row.timezone,
    }));
  }
}

export function sweepIntervalMs(): number {
  const raw = process.env.DETRAN_DASHBOARD_SWEEP_INTERVAL_MS;
  if (raw === undefined || raw.trim().length === 0) {
    return DASHBOARD_SWEEP_DEFAULT_INTERVAL_MS;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      'DETRAN_DASHBOARD_SWEEP_INTERVAL_MS must be a non-negative number',
    );
  }
  return parsed;
}

export function createDashboardSweeperDependencies(
  clock: Clock,
  calendar: Calendar,
  discovery: DashboardSweepDiscovery,
  database: Database,
  requestContext: RequestContextMutator,
  parameters: OpsParameterService,
  intervalMs: number,
): DashboardSweeperDependencies {
  const timers = new DashboardClockService(clock, calendar);
  const notifier = new DashboardNotifier(timers, parameters);
  const freshness = new DashboardFreshnessService(clock, parameters);
  const alerts = new DashboardAlertService(
    timers,
    notifier,
    freshness,
    parameters,
  );
  const duties = new DashboardDutyService(timers, alerts);
  return {
    clock,
    calendar,
    discovery,
    database: {
      tx: <T>(work: (tx: SweepTransaction) => Promise<T>): Promise<T> =>
        database.tx(
          (transaction) => work(transaction as unknown as SweepTransaction),
          { role: 'app' },
        ),
    },
    requestContext: {
      run: (context, work) =>
        requestContext.runWithRequestContext(context, work),
    },
    timers,
    alerts,
    duties,
    freshness,
    intervalMs,
  };
}

export const DASHBOARD_CLOCK_PROVIDER = {
  provide: DASHBOARD_CLOCK,
  useFactory: (): Clock => new SystemDashboardClock(),
};

export const DASHBOARD_CALENDAR_PROVIDER = {
  provide: DASHBOARD_CALENDAR,
  useFactory: (): Calendar => createDashboardCalendar(),
};

export const DASHBOARD_SWEEP_DISCOVERY_PROVIDER = {
  provide: DASHBOARD_SWEEP_DISCOVERY,
  useFactory: (database: Database): DashboardSweepDiscovery =>
    new SqlDashboardSweepDiscovery(database, detranRuntimeProfile() !== 'test'),
  inject: [Database],
};

export const DASHBOARD_SWEEP_INTERVAL_PROVIDER = {
  provide: DASHBOARD_SWEEP_INTERVAL_MS,
  useFactory: (): number => sweepIntervalMs(),
};

export const DASHBOARD_SWEEPER_DEPENDENCIES_PROVIDER = {
  provide: DASHBOARD_SWEEPER_DEPENDENCIES,
  useFactory: createDashboardSweeperDependencies,
  inject: [
    DASHBOARD_CLOCK,
    DASHBOARD_CALENDAR,
    DASHBOARD_SWEEP_DISCOVERY,
    Database,
    RequestContextMutator,
    OpsParameterService,
    DASHBOARD_SWEEP_INTERVAL_MS,
  ],
};

@Global()
@Module({
  imports: [ParameterModule],
  providers: [
    DASHBOARD_CLOCK_PROVIDER,
    DASHBOARD_CALENDAR_PROVIDER,
    DASHBOARD_SWEEP_DISCOVERY_PROVIDER,
    DASHBOARD_SWEEP_INTERVAL_PROVIDER,
    DASHBOARD_SWEEPER_DEPENDENCIES_PROVIDER,
  ],
  exports: [
    ParameterModule,
    DASHBOARD_CLOCK,
    DASHBOARD_CALENDAR,
    DASHBOARD_SWEEP_DISCOVERY,
    DASHBOARD_SWEEP_INTERVAL_MS,
    DASHBOARD_SWEEPER_DEPENDENCIES,
  ],
})
export class DashboardSweepModule {}
