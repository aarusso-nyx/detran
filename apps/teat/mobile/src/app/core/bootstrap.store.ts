import { inject, Injectable, InjectionToken } from '@angular/core';
import { TenantContextService } from '@stynx-nyx/angular-tenancy';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { MobileBootstrapClient } from '../data/api/mobile-bootstrap.client.js';

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
    validUntil: string;
    maxAgeSeconds: number;
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
    activeShift?: Readonly<{ id: string; status: string }>;
    session: Readonly<{ id: string; startedAt: string; exclusive: boolean }>;
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
  readonly principal: Principal | undefined;
  readonly tenantId: string | undefined;
  readonly allowedRoles: readonly DetranRole[];
  readonly bootstrap: BootstrapSnapshot | undefined;
  readonly provisioning: ProvisioningReadiness | undefined;
}

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
);

@Injectable({ providedIn: 'root' })
export class BootstrapStore {
  private readonly client = inject(MobileBootstrapClient);
  private value: BootstrapSnapshot | undefined;
  private provisioning: ProvisioningReadiness | undefined;

  snapshot(): BootstrapSnapshot | undefined {
    return this.value;
  }

  provisioningSnapshot(): ProvisioningReadiness | undefined {
    return this.provisioning;
  }

  async refresh(input: MobileBootstrapQuery): Promise<BootstrapSnapshot> {
    const snapshot = await this.client.getBootstrap(input);
    this.value = snapshot;
    return snapshot;
  }

  setProvisioning(readiness: ProvisioningReadiness | undefined): void {
    this.provisioning = readiness;
  }

  clear(): void {
    this.value = undefined;
    this.provisioning = undefined;
  }
}

export function createTeatGuardContext(): GuardContext {
  const session = inject(StynxSessionService);
  const tenancy = inject(TenantContextService);
  const store = inject(BootstrapStore);
  const state = session.state();
  const claims = state.claims ?? {};
  const claimedRoles = new Set([
    ...claimValues(claims['cognito:groups']),
    ...claimValues(claims['roles']),
  ]);
  const roles = TEAT_STAFF_ROLES.filter((role) => claimedRoles.has(role));
  const bootstrap = store.snapshot();
  const resolvedTenant = tenancy.tenantId();
  const tenantMatches =
    typeof resolvedTenant === 'string' &&
    resolvedTenant !== '' &&
    bootstrap?.context.tenantId === resolvedTenant;
  const subject = claims['sub'];
  const principal =
    session.active() && tenantMatches && typeof subject === 'string'
      ? { id: subject, roles }
      : undefined;
  return {
    principal,
    tenantId: tenantMatches ? resolvedTenant : undefined,
    allowedRoles: roles,
    bootstrap,
    provisioning: store.provisioningSnapshot(),
  };
}
