import {
  effect,
  inject,
  Injectable,
  InjectionToken,
  signal,
  type Signal,
} from '@angular/core';
import type {
  MobileSessionContext,
  MobileStynxSessionPort,
} from '@stynx-nyx/mobile-runtime';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { MobileBootstrapClient } from '../data/api/mobile-bootstrap.client.js';
import { ProvisioningClient } from '../data/api/provisioning.client.js';
import {
  LocalActStore,
  type ScopedAitReservation,
} from '../data/local/local-act.store.js';

export interface Principal {
  readonly id: string;
  readonly roles: readonly DetranRole[];
}

export type DetranRole =
  | 'field-agent'
  | 'field-supervisor'
  | 'processing-operator'
  | 'traffic-authority'
  | 'agency-admin'
  | 'technical-admin'
  | 'auditor'
  | 'bi-analyst'
  | 'integration-operator';

export interface MobileBootstrapQuery {
  readonly device_id: string;
  readonly installation_id?: string;
  readonly app_version: string;
  readonly protocol_version?: string;
}

export interface BootstrapSnapshot {
  readonly protocolVersion: string;
  readonly requestedProtocolVersion: string;
  readonly snapshot: Readonly<{
    capturedAt: string;
    validUntil: string | null;
    maxAgeSeconds: number | null;
    authority: unknown;
  }>;
  readonly context: Readonly<{
    tenantId: string;
    trafficAgencyId: string;
    agent: Readonly<{ id: string; operationalUnitId: string; status: string }>;
    device: Readonly<{
      id: string;
      status: string;
      homologated: boolean;
      tamperDetected: boolean;
      appVersion: string;
    }>;
    activeShift: Readonly<{ id: string; status: string }> | null;
    session: Readonly<{
      id: string;
      startedAt: string;
      exclusive: boolean;
    }> | null;
  }>;
  readonly catalog: Readonly<{
    operationalUnits: readonly unknown[];
    teams: readonly unknown[];
    patrolVehicles: readonly unknown[];
    operations: readonly unknown[];
    measurementInstruments: readonly unknown[];
  }>;
  readonly normativePackage: Readonly<{
    id: string;
    catalogId: string;
    version: string;
    manifestHash: string;
    status: string;
    publishedAt: string;
    validUntil: string;
  }>;
  readonly numberingReservations: readonly unknown[];
  readonly readiness: Readonly<{
    preShiftReady: boolean;
    offlineReady: boolean;
    blockers: readonly string[];
  }>;
  readonly capabilities: Readonly<{
    canOpenShift: boolean;
    canOperateOffline: boolean;
    canReserveNumbering: boolean;
  }>;
}

export interface ProvisioningReadiness {
  readonly device_id: string;
  readonly ready: boolean;
  readonly remaining_acts: number;
  readonly remaining_numbering_count: number;
  readonly blockers: readonly Readonly<{ code: string; resource: string }>[];
  readonly evaluated_at: string;
}

export interface GuardContext {
  readonly principal: () => Principal | undefined;
  readonly tenantId: () => string | undefined;
  readonly allowedRoles: () => readonly DetranRole[];
  readonly bootstrap: () => BootstrapSnapshot | undefined;
  readonly provisioning: () => ProvisioningReadiness | undefined;
}

export type BootstrapState =
  | Readonly<{ status: 'anonymous' }>
  | Readonly<{ status: 'loading'; query: MobileBootstrapQuery }>
  | Readonly<{
      status: 'ready';
      bootstrap: BootstrapSnapshot;
      provisioning: ProvisioningReadiness;
    }>
  | Readonly<{ status: 'blocked'; code: string }>;

const TEAT_STAFF_ROLES: readonly DetranRole[] = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'auditor',
  'bi-analyst',
  'integration-operator',
];

function claimValues(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

export const TEAT_GUARD_CONTEXT = new InjectionToken<GuardContext>(
  'TEAT_GUARD_CONTEXT',
  { providedIn: 'root', factory: createTeatGuardContext },
);

export const TEAT_MOBILE_STYNX_SESSION_PORT =
  new InjectionToken<MobileStynxSessionPort>('TEAT_MOBILE_STYNX_SESSION_PORT', {
    providedIn: 'root',
    factory: () => {
      const session = inject(StynxSessionService);
      const tenancy = inject(TenantContextService);
      return {
        currentSession: async (): Promise<MobileSessionContext> => {
          const state = session.state();
          const claims = state.claims ?? {};
          const tenantId = tenancy.tenantId();
          const subject = claims['sub'];
          if (!session.active() || !tenantId || typeof subject !== 'string') {
            throw new Error('authenticated-mobile-session-required');
          }
          return {
            tenantId,
            orgUnitId: String(claims['org_unit_id'] ?? tenantId),
            agentId: subject,
            deviceId: String(claims['device_id'] ?? ''),
            shiftId: String(claims['shift_id'] ?? ''),
            appVersion: String(claims['app_version'] ?? ''),
            roles: [
              ...claimValues(claims['cognito:groups']),
              ...claimValues(claims['roles']),
            ],
          };
        },
      };
    },
  });

@Injectable({ providedIn: 'root' })
export class BootstrapStore {
  private readonly client = inject(MobileBootstrapClient);
  private readonly provisioningClient = inject(ProvisioningClient);
  private readonly localStore = inject(LocalActStore);
  private value: BootstrapSnapshot | undefined;
  private provisioning: ProvisioningReadiness | undefined;
  private readonly stateValue = signal<BootstrapState>({ status: 'anonymous' });
  readonly state: Signal<BootstrapState> = this.stateValue.asReadonly();

  snapshot(): BootstrapSnapshot | undefined {
    return this.value;
  }

  provisioningSnapshot(): ProvisioningReadiness | undefined {
    return this.provisioning;
  }

  async refresh(
    input: MobileBootstrapQuery,
    authenticatedSession: MobileSessionContext,
  ): Promise<
    Readonly<{
      bootstrap: BootstrapSnapshot;
      provisioning: ProvisioningReadiness;
    }>
  > {
    if (!validAuthenticatedSession(authenticatedSession)) {
      this.clear();
      this.stateValue.set({
        status: 'blocked',
        code: 'authenticated-mobile-session-required',
      });
      throw new Error('authenticated-mobile-session-required');
    }
    this.stateValue.set({ status: 'loading', query: input });
    try {
      const [bootstrap, provisioning] = await Promise.all([
        this.client.getBootstrap(input),
        this.provisioningClient.readiness(
          input.device_id,
        ) as Promise<ProvisioningReadiness>,
      ]);
      this.assertAuthenticatedIdentity(bootstrap, authenticatedSession);
      await this.installNumberingAuthority(bootstrap, input);
      this.value = bootstrap;
      this.provisioning = provisioning;
      const result = { bootstrap, provisioning };
      this.stateValue.set({ status: 'ready', ...result });
      return result;
    } catch (error) {
      this.clear();
      this.stateValue.set({
        status: 'blocked',
        code: error instanceof Error ? error.message : 'bootstrap-failed',
      });
      throw error;
    }
  }

  clear(): void {
    this.value = undefined;
    this.provisioning = undefined;
    this.stateValue.set({ status: 'anonymous' });
  }

  private async installNumberingAuthority(
    bootstrap: BootstrapSnapshot,
    query: MobileBootstrapQuery,
  ): Promise<void> {
    const context = bootstrap.context;
    if (context.device.id !== query.device_id) {
      throw new Error('bootstrap-device-mismatch');
    }
    const rawContext = context as unknown as Readonly<Record<string, unknown>>;
    if (
      !Object.prototype.hasOwnProperty.call(rawContext, 'activeShift') ||
      !Object.prototype.hasOwnProperty.call(rawContext, 'session')
    ) {
      throw new Error('bootstrap-shift-session-required');
    }
    const shift = context.activeShift;
    const operationalSession = context.session;
    if (shift === null && operationalSession === null) {
      if (bootstrap.numberingReservations.length !== 0) {
        throw new Error('bootstrap-reservation-shift-required');
      }
      return;
    }
    if (!isRecord(shift) || !isRecord(operationalSession)) {
      throw new Error('bootstrap-shift-session-mismatch');
    }
    if (!nonEmpty(shift.id) || shift.status !== 'open') {
      throw new Error('bootstrap-open-shift-required');
    }
    if (
      !nonEmpty(operationalSession.id) ||
      operationalSession.id !== shift.id ||
      !nonEmpty(operationalSession.startedAt) ||
      typeof operationalSession.exclusive !== 'boolean'
    ) {
      throw new Error('bootstrap-shift-session-mismatch');
    }
    if (bootstrap.numberingReservations.length === 0) {
      throw new Error('bootstrap-numbering-reservation-required');
    }
    const authorities = bootstrap.numberingReservations.map((candidate) =>
      this.numberingAuthority(candidate, context, shift.id),
    );
    await this.localStore.installAitReservationAuthorities(authorities);
  }

  private assertAuthenticatedIdentity(
    bootstrap: BootstrapSnapshot,
    authenticated: MobileSessionContext,
  ): void {
    if (
      bootstrap.context.tenantId !== authenticated.tenantId ||
      bootstrap.context.agent.id !== authenticated.agentId ||
      bootstrap.context.device.id !== authenticated.deviceId
    ) {
      throw new Error('bootstrap-session-mismatch');
    }
  }

  private numberingAuthority(
    candidate: unknown,
    context: BootstrapSnapshot['context'],
    activeShiftId: string,
  ): ScopedAitReservation {
    if (!isRecord(candidate)) {
      throw new Error('bootstrap-reservation-invalid');
    }
    const authority: ScopedAitReservation = {
      reservationId: requiredString(candidate['id']),
      rangeId: requiredString(candidate['rangeId']),
      entityType: 'ait',
      series: requiredString(candidate['series']),
      startNumber: requiredSafeInteger(candidate['startNumber']),
      endNumber: requiredSafeInteger(candidate['endNumber']),
      nextNumber: requiredSafeInteger(candidate['startNumber']),
      validUntil: requiredString(candidate['validUntil']),
      status:
        candidate['status'] === 'reserved'
          ? 'reserved'
          : (() => {
              throw new Error('bootstrap-reservation-status-invalid');
            })(),
      tenantId: requiredString(context.tenantId),
      agentId: requiredString(context.agent.id),
      deviceId: requiredString(context.device.id),
      shiftId: requiredString(candidate['shiftId']),
    };
    const validUntil = Date.parse(authority.validUntil);
    if (
      authority.shiftId !== activeShiftId ||
      authority.startNumber > authority.endNumber ||
      !Number.isFinite(validUntil) ||
      validUntil <= Date.now()
    ) {
      throw new Error('bootstrap-reservation-authority-mismatch');
    }
    return authority;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function requiredString(value: unknown): string {
  if (!nonEmpty(value)) throw new Error('bootstrap-string-authority-required');
  return value;
}

function requiredSafeInteger(value: unknown): number {
  if (!Number.isSafeInteger(value)) {
    throw new Error('bootstrap-integer-authority-required');
  }
  return value as number;
}

function validAuthenticatedSession(
  value: MobileSessionContext | undefined,
): value is MobileSessionContext {
  return (
    value !== undefined &&
    nonEmpty(value.tenantId) &&
    nonEmpty(value.agentId) &&
    nonEmpty(value.deviceId)
  );
}

@Injectable({ providedIn: 'root' })
export class AuthBootstrapCoordinator {
  private readonly session = inject(StynxSessionService);
  private readonly mobileSession = inject(TEAT_MOBILE_STYNX_SESSION_PORT);
  private readonly store = inject(BootstrapStore);
  readonly state = this.store.state;

  private readonly sessionLifecycle = effect(() => {
    if (!this.session.active()) this.store.clear();
  });

  start(): Promise<BootstrapState> {
    return this.mobileSession.currentSession().then(async (mobile) => {
      if (!this.session.active()) {
        throw new Error('authenticated-session-required');
      }
      if (!mobile.deviceId || !mobile.appVersion) {
        throw new Error('mobile-session-context-incomplete');
      }
      const result = await this.store.refresh(
        {
          device_id: mobile.deviceId,
          app_version: mobile.appVersion,
        },
        mobile,
      );
      if (
        result.bootstrap.context.tenantId !== mobile.tenantId ||
        result.bootstrap.context.agent.id !== mobile.agentId ||
        result.bootstrap.context.device.id !== mobile.deviceId
      ) {
        this.store.clear();
        throw new Error('bootstrap-session-mismatch');
      }
      return this.store.state();
    });
  }

  clearOnSessionEnd(): void {
    this.store.clear();
  }
}

export function createTeatGuardContext(): GuardContext {
  const session = inject(StynxSessionService);
  const tenancy = inject(TenantContextService);
  const store = inject(BootstrapStore);
  const tenant = (): string | undefined => {
    if (!session.active()) return undefined;
    const resolvedTenant = tenancy.tenantId();
    return typeof resolvedTenant === 'string' && resolvedTenant !== ''
      ? resolvedTenant
      : undefined;
  };
  const roles = (): readonly DetranRole[] => {
    const claims = session.state().claims ?? {};
    const claimedRoles = new Set([
      ...claimValues(claims['cognito:groups']),
      ...claimValues(claims['roles']),
    ]);
    return TEAT_STAFF_ROLES.filter((role) => claimedRoles.has(role));
  };
  const operationalBootstrap = (): BootstrapSnapshot | undefined => {
    if (!session.active()) return undefined;
    const currentTenant = tenancy.tenantId();
    const bootstrap = store.snapshot();
    return typeof currentTenant === 'string' &&
      currentTenant !== '' &&
      bootstrap?.context.tenantId === currentTenant
      ? bootstrap
      : undefined;
  };
  return {
    principal: () => {
      const subject = session.state().claims?.['sub'];
      return session.active() &&
        tenant() !== undefined &&
        typeof subject === 'string'
        ? { id: subject, roles: roles() }
        : undefined;
    },
    tenantId: tenant,
    allowedRoles: roles,
    bootstrap: operationalBootstrap,
    provisioning: () =>
      operationalBootstrap() === undefined
        ? undefined
        : store.provisioningSnapshot(),
  };
}
