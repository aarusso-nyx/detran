import type { TeatStaffRole } from './route-contract.fixture';
import type { GuardContext } from '../app/core/bootstrap.store';

export interface GuardContextFixture {
  readonly principal:
    | { readonly id: string; readonly roles: readonly TeatStaffRole[] }
    | undefined;
  readonly tenantId: string | undefined;
  readonly allowedRoles: readonly TeatStaffRole[];
  readonly bootstrap:
    | {
        readonly protocolVersion: string;
        readonly requestedProtocolVersion: string;
        readonly snapshot: {
          readonly capturedAt: string;
          readonly validUntil: string;
          readonly maxAgeSeconds: number;
          readonly authority: unknown;
        };
        readonly context: {
          readonly tenantId: string;
          readonly trafficAgencyId: string;
          readonly agent: {
            readonly id: string;
            readonly operationalUnitId: string;
            readonly status: string;
          };
          readonly device: {
            readonly id: string;
            readonly status: string;
            readonly homologated: boolean;
            readonly tamperDetected: boolean;
            readonly appVersion: string;
          };
          readonly activeShift: {
            readonly id: string;
            readonly status: string;
          } | null;
          readonly session: {
            readonly id: string;
            readonly startedAt: string;
            readonly exclusive: boolean;
          } | null;
        };
        readonly catalog: {
          readonly operationalUnits: readonly unknown[];
          readonly teams: readonly unknown[];
          readonly patrolVehicles: readonly unknown[];
          readonly operations: readonly unknown[];
          readonly measurementInstruments: readonly unknown[];
        };
        readonly normativePackage: {
          readonly id: string;
          readonly catalogId: string;
          readonly version: string;
          readonly manifestHash: string;
          readonly status: string;
          readonly publishedAt: string;
          readonly validUntil: string;
        };
        readonly numberingReservations: readonly unknown[];
        readonly readiness: {
          readonly preShiftReady: boolean;
          readonly offlineReady: boolean;
          readonly blockers: readonly string[];
        };
        readonly capabilities: {
          readonly canOpenShift: boolean;
          readonly canOperateOffline: boolean;
          readonly canReserveNumbering: boolean;
        };
      }
    | undefined;
  readonly provisioning:
    | {
        readonly device_id: string;
        readonly ready: boolean;
        readonly remaining_acts: number;
        readonly remaining_numbering_count: number;
        readonly blockers: readonly {
          readonly code: string;
          readonly resource: string;
        }[];
        readonly evaluated_at: string;
      }
    | undefined;
}

export function guardContextPort(fixture: GuardContextFixture): GuardContext {
  return {
    principal: () => fixture.principal,
    tenantId: () => fixture.tenantId,
    allowedRoles: () => fixture.allowedRoles,
    bootstrap: () => fixture.bootstrap,
    provisioning: () => fixture.provisioning,
  };
}

const bootstrap = {
  protocolVersion: '1',
  requestedProtocolVersion: '1',
  snapshot: {
    capturedAt: '2026-09-22T00:00:00Z',
    validUntil: '2999-01-01T00:00:00Z',
    maxAgeSeconds: 60,
    authority: {},
  },
  context: {
    tenantId: 'tenant-001',
    trafficAgencyId: 'agency-001',
    agent: { id: 'agent-001', operationalUnitId: 'unit-001', status: 'active' },
    device: {
      id: 'device-001',
      status: 'authorized',
      homologated: true,
      tamperDetected: false,
      appVersion: '1.0.0',
    },
    activeShift: { id: 'shift-001', status: 'open' },
    session: {
      id: 'shift-001',
      startedAt: '2026-09-22T00:00:00Z',
      exclusive: true,
    },
  },
  catalog: {
    operationalUnits: [],
    teams: [],
    patrolVehicles: [],
    operations: [],
    measurementInstruments: [],
  },
  normativePackage: {
    id: 'pkg-001',
    catalogId: 'catalog-001',
    version: '1',
    manifestHash: 'manifest-001',
    status: 'valid',
    publishedAt: '2026-09-22T00:00:00Z',
    validUntil: '2999-01-01T00:00:00Z',
  },
  numberingReservations: [{ id: 'reserve-001' }],
  readiness: { preShiftReady: true, offlineReady: true, blockers: [] },
  capabilities: {
    canOpenShift: true,
    canOperateOffline: true,
    canReserveNumbering: true,
  },
} as const;
const readyGrant = {
  device_id: 'device-001',
  ready: true,
  remaining_acts: 1,
  remaining_numbering_count: 1,
  blockers: [],
  evaluated_at: '2026-09-22T00:00:00Z',
} as const;

export function fixtureAuthenticatedFieldAgent(): GuardContextFixture {
  return {
    principal: { id: 'agent-001', roles: ['field-agent'] },
    tenantId: 'tenant-001',
    allowedRoles: ['field-agent'],
    bootstrap,
    provisioning: readyGrant,
  };
}
export function fixtureNoPrincipal(): GuardContextFixture {
  return { ...fixtureAuthenticatedFieldAgent(), principal: undefined };
}
export function fixtureTenantContext(): GuardContextFixture {
  return fixtureAuthenticatedFieldAgent();
}
export function fixtureNoTenantContext(): GuardContextFixture {
  return { ...fixtureAuthenticatedFieldAgent(), tenantId: undefined };
}
export function fixtureRoleDenied(): GuardContextFixture {
  return {
    ...fixtureAuthenticatedFieldAgent(),
    principal: { id: 'agent-002', roles: ['auditor'] },
  };
}
export function fixtureBootstrapReady(): GuardContextFixture {
  return fixtureAuthenticatedFieldAgent();
}
export function fixtureBootstrapBlocked(code: string): GuardContextFixture {
  return {
    ...fixtureAuthenticatedFieldAgent(),
    bootstrap: {
      ...bootstrap,
      readiness: { ...bootstrap.readiness, blockers: [code] },
    },
  };
}
export function fixtureOpenShift(): GuardContextFixture {
  return fixtureAuthenticatedFieldAgent();
}
export function fixtureNoOpenShift(): GuardContextFixture {
  return {
    ...fixtureAuthenticatedFieldAgent(),
    bootstrap: {
      ...bootstrap,
      context: { ...bootstrap.context, activeShift: null, session: null },
      numberingReservations: [],
      readiness: {
        blockers: ['NUMBERING_RESERVATION_REQUIRED'],
        preShiftReady: true,
        offlineReady: false,
      },
      capabilities: {
        canOpenShift: true,
        canOperateOffline: false,
        canReserveNumbering: false,
      },
    },
  };
}
export function fixtureGrantReady(): GuardContextFixture {
  return fixtureAuthenticatedFieldAgent();
}
export function fixtureGrantBlocked(code: string): GuardContextFixture {
  return {
    ...fixtureAuthenticatedFieldAgent(),
    provisioning: {
      ...readyGrant,
      ready: false,
      blockers: [{ code, resource: 'device' }],
    },
  };
}
export function fixtureRoleContext(
  role: TeatStaffRole,
  allowedRoles: readonly TeatStaffRole[],
): GuardContextFixture {
  return {
    ...fixtureAuthenticatedFieldAgent(),
    principal: { id: 'agent-role', roles: [role] },
    allowedRoles,
  };
}
