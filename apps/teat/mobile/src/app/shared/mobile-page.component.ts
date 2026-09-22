import { inject, Injectable, Injector, type Type } from '@angular/core';
import type { Route } from '@angular/router';
import { AitClient } from '../data/api/ait.client.js';
import { AlcoholClient } from '../data/api/alcohol.client.js';
import { MeasuresClient } from '../data/api/measures.client.js';
import { MobileBootstrapClient } from '../data/api/mobile-bootstrap.client.js';
import { OfflineSyncClient } from '../data/api/offline-sync.client.js';
import { OpsSnapshotsClient } from '../data/api/ops-snapshots.client.js';
import { ProvisioningClient } from '../data/api/provisioning.client.js';
import { aitCancelRequestSchema } from '../data/local/ait-cancel-request.schema.js';
import { aitDriverSchema } from '../data/local/ait-driver.schema.js';
import { aitEvidenceSchema } from '../data/local/ait-evidence.schema.js';
import { aitFrameSchema } from '../data/local/ait-frame.schema.js';
import { aitLocationSchema } from '../data/local/ait-location.schema.js';
import { aitReviewSchema } from '../data/local/ait-review.schema.js';
import { aitSignatureSchema } from '../data/local/ait-signature.schema.js';
import { aitVehicleSchema } from '../data/local/ait-vehicle.schema.js';
import { alcoholDeviceSchema } from '../data/local/alcohol-device.schema.js';
import { alcoholRefusalSchema } from '../data/local/alcohol-refusal.schema.js';
import { alcoholResultSchema } from '../data/local/alcohol-result.schema.js';
import { measureTermSchema } from '../data/local/measure-term.schema.js';
import { openShiftSchema } from '../data/local/open-shift.schema.js';
import { syncConflictSchema } from '../data/local/sync-conflict.schema.js';
import { authGuard } from '../navigation/guards/auth.guard.js';
import { readinessGuard } from '../navigation/guards/readiness.guard.js';
import { roleGuard } from '../navigation/guards/role.guard.js';
import { shiftGuard } from '../navigation/guards/shift.guard.js';
import { tenantGuard } from '../navigation/guards/tenant.guard.js';

export interface TeatRouteContract {
  readonly path: string;
  readonly uxCode: string;
  readonly sourceSheet: string;
  readonly guardPlan: string;
  readonly allowedRoles: readonly string[];
  readonly component: string;
  readonly featureEnabled?: false;
  readonly state?: 'unavailable';
  readonly boatExtension?: true;
}

export function teatRoute(
  data: TeatRouteContract,
  loadComponent?: Route['loadComponent'],
): Route {
  const plan = data.guardPlan.split(',')[0]?.trim();
  return {
    path: data.path,
    canMatch: [
      authGuard,
      tenantGuard,
      roleGuard,
      ...(plan === 'R' ? [] : [readinessGuard]),
      ...(plan === 'B+S' ? [shiftGuard] : []),
    ],
    ...(loadComponent === undefined ? {} : { loadComponent }),
    data:
      data.boatExtension === true
        ? { ...data, state: 'unavailable' as const }
        : data,
  };
}

export interface MobilePageContract {
  readonly screenId: string;
  readonly sourceSheet: string;
  readonly schemaId?: string;
  readonly clientId?: string;
}

export interface MobilePageIntegration {
  readonly screenId: string;
  readonly schema?: unknown;
  readonly client: object;
}

const SCHEMA_RUNTIME_BY_SCREEN: Readonly<Record<string, unknown>> = {
  'open-shift': openShiftSchema,
  'ait-vehicle': aitVehicleSchema,
  'ait-driver': aitDriverSchema,
  'ait-frame': aitFrameSchema,
  'ait-location': aitLocationSchema,
  'ait-evidence': aitEvidenceSchema,
  'ait-signature': aitSignatureSchema,
  'ait-review': aitReviewSchema,
  'ait-cancel-request': aitCancelRequestSchema,
  'alcohol-device': alcoholDeviceSchema,
  'alcohol-result': alcoholResultSchema,
  'alcohol-refusal': alcoholRefusalSchema,
  'measure-term': measureTermSchema,
  'sync-conflict': syncConflictSchema,
};

const CLIENT_RUNTIME_BY_ID: Readonly<Record<string, Type<object>>> = {
  MobileBootstrapClient,
  OpsSnapshotsClient,
  OfflineSyncClient,
  AitClient,
  MeasuresClient,
  AlcoholClient,
  ProvisioningClient,
};

@Injectable({ providedIn: 'root' })
export class MobilePageRuntime {
  private readonly injector = inject(Injector);

  load(contract: MobilePageContract): MobilePageIntegration {
    const clientType =
      contract.clientId === undefined
        ? undefined
        : CLIENT_RUNTIME_BY_ID[contract.clientId];
    if (clientType === undefined) {
      throw new Error(`page-integration-missing:${contract.screenId}`);
    }
    const schema = SCHEMA_RUNTIME_BY_SCREEN[contract.screenId];
    return {
      screenId: contract.screenId,
      ...(schema === undefined ? {} : { schema }),
      client: this.injector.get(clientType),
    };
  }
}

const SCHEMA_BY_SCREEN: Readonly<Record<string, string>> = {
  'open-shift': 'openShiftSchema',
  'ait-vehicle': 'aitVehicleSchema',
  'ait-driver': 'aitDriverSchema',
  'ait-frame': 'aitFrameSchema',
  'ait-location': 'aitLocationSchema',
  'ait-evidence': 'aitEvidenceSchema',
  'ait-signature': 'aitSignatureSchema',
  'ait-review': 'aitReviewSchema',
  'ait-cancel-request': 'aitCancelRequestSchema',
  'alcohol-device': 'alcoholDeviceSchema',
  'alcohol-result': 'alcoholResultSchema',
  'alcohol-refusal': 'alcoholRefusalSchema',
  'measure-term': 'measureTermSchema',
  'sync-conflict': 'syncConflictSchema',
};

function clientFor(screenId: string): string | undefined {
  if (
    /^(auth-|device-|shift-|operation-|open-shift|home|close-shift)/.test(
      screenId,
    )
  ) {
    return 'MobileBootstrapClient';
  }
  if (/^(vehicle-|driver-|query-)/.test(screenId)) return 'OpsSnapshotsClient';
  if (screenId.startsWith('ait-')) return 'AitClient';
  if (/^(measure-|retention|removal|inventory|transshipment)/.test(screenId)) {
    return 'MeasuresClient';
  }
  if (screenId.startsWith('alcohol-')) return 'AlcoholClient';
  if (/^(sync|diagnostics|support|messages)/.test(screenId)) {
    return 'OfflineSyncClient';
  }
  return 'OpsSnapshotsClient';
}

function schemaFor(screenId: string): string {
  return (
    SCHEMA_BY_SCREEN[screenId] ??
    `${screenId.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())}Schema`
  );
}

export function mobilePageContract(screenId: string): MobilePageContract {
  return Object.freeze({
    screenId,
    sourceSheet:
      screenId === 'device-handoff'
        ? 'ARCH-TEAT-FRONTENDS §4 (D-01)'
        : `IU-TEAT-${screenId}.md`,
    schemaId: schemaFor(screenId),
    clientId: clientFor(screenId),
  });
}
