import { inject, Injectable, Injector, type Type } from '@angular/core';
import { Router, type Route } from '@angular/router';
import type {
  MobileEntityDraft,
  MobileLocationContext,
  MobileSessionContext,
  MobileSyncQueueItem,
} from '@stynx-nyx/mobile-runtime';
import { AitClient } from '../data/api/ait.client.js';
import { AlcoholClient } from '../data/api/alcohol.client.js';
import { MeasuresClient } from '../data/api/measures.client.js';
import { MobileBootstrapClient } from '../data/api/mobile-bootstrap.client.js';
import { OfflineSyncClient } from '../data/api/offline-sync.client.js';
import { OpsSnapshotsClient } from '../data/api/ops-snapshots.client.js';
import {
  LocalActStore,
  type LocalEntityType,
} from '../data/local/local-act.store.js';
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
  const entryRoute = plan === 'E';
  if (data.featureEnabled === false) {
    return {
      path: data.path,
      redirectTo: () => {
        const current = inject(Router).url;
        return current === '/' ? '/auth-login' : current;
      },
      data,
    };
  }
  return {
    path: data.path,
    canMatch: entryRoute
      ? []
      : [
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
  readonly client?: object;
  readonly store?: LocalActStore;
  load(): Promise<Readonly<{ kind: 'loaded'; value?: unknown }>>;
  submit?(
    input: unknown,
    context?: MobileCommandContext,
  ): Promise<
    | Readonly<{ kind: 'persisted'; localEntityId: string }>
    | Readonly<{ kind: 'blocked'; reason: 'source_pending' | 'not-ready' }>
  >;
}

export interface MobileCommandContext {
  readonly session: MobileSessionContext;
  readonly localEntityId: string;
  readonly entityType: LocalEntityType;
  readonly version: number;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly createdLocallyAt: string;
  readonly normativePackageId: string;
  readonly normativePackageVersion: string;
  readonly reservationId: string;
  readonly reservedNumber: number;
  readonly ifMatch: string;
  readonly location: MobileLocationContext;
}

export interface DurableMobileSyncQueueItem extends MobileSyncQueueItem<LocalEntityType> {
  readonly commandContext: MobileCommandContext;
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

@Injectable({ providedIn: 'root' })
export class MobilePageRuntime {
  private readonly injector = inject(Injector);
  private readonly localStore = inject(LocalActStore);

  load(contract: MobilePageContract): MobilePageIntegration {
    const clientType = clientTypeForScreen(contract.screenId);
    const schema = SCHEMA_RUNTIME_BY_SCREEN[contract.screenId];
    const client =
      clientType === undefined
        ? undefined
        : this.injector.get(clientType, undefined, { optional: true });
    const usesStore = STORE_SCREEN.test(contract.screenId);
    const sourcePending = ['support', 'messages', 'local-settings'].includes(
      contract.screenId,
    );
    return {
      screenId: contract.screenId,
      ...(schema === undefined ? {} : { schema }),
      ...(client == null ? {} : { client }),
      ...(usesStore ? { store: this.localStore } : {}),
      load: async () =>
        usesStore
          ? { kind: 'loaded', value: await this.localStore.pending() }
          : { kind: 'loaded' },
      submit: async (input: unknown, context?: MobileCommandContext) => {
        if (sourcePending) return { kind: 'blocked', reason: 'source_pending' };
        if (schema !== undefined && 'safeParse' in Object(schema)) {
          const parsed = (
            schema as {
              safeParse(
                value: unknown,
              ):
                | Readonly<{ success: true; data: unknown }>
                | Readonly<{ success: false }>;
            }
          ).safeParse(input);
          if (!parsed.success) return { kind: 'blocked', reason: 'not-ready' };
          input = parsed.data;
        }
        if (!usesStore || context === undefined) {
          return { kind: 'blocked', reason: 'not-ready' };
        }
        if (typeof input !== 'object' || input === null) {
          return { kind: 'blocked', reason: 'not-ready' };
        }
        const payload = input as Record<string, unknown>;
        const location = context.location;
        const finalizing =
          contract.screenId === 'ait-review' &&
          payload['explicit_action'] === 'finalize';
        const targetVersion = finalizing
          ? context.version + 1
          : context.version;
        const draft: MobileEntityDraft<LocalEntityType> = {
          localId: context.localEntityId,
          entityType: context.entityType,
          tenantId: context.session.tenantId,
          orgUnitId: context.session.orgUnitId,
          agentId: context.session.agentId,
          deviceId: context.session.deviceId,
          shiftId: context.session.shiftId,
          status: finalizing ? 'finalized' : 'draft',
          reservedNumber: context.reservedNumber,
          reservationId: context.reservationId,
          idempotencyKey: context.idempotencyKey,
          normativePackageId: context.normativePackageId,
          normativePackageVersion: context.normativePackageVersion,
          localContentHash: context.payloadHash,
          payload,
          location,
          evidence: [],
          createdAt: context.createdLocallyAt,
          updatedAt: context.createdLocallyAt,
          ...(finalizing ? { finalizedAt: context.createdLocallyAt } : {}),
        };
        const queueItem: DurableMobileSyncQueueItem = {
          queueItemId: `${context.localEntityId}:v${targetVersion}`,
          entityType: context.entityType,
          localEntityId: context.localEntityId,
          status: 'pending',
          attempts: 0,
          idempotencyKey: context.idempotencyKey,
          payloadHash: context.payloadHash,
          payloadJson: payload,
          deviceId: context.session.deviceId,
          agentId: context.session.agentId,
          tenantId: context.session.tenantId,
          orgUnitId: context.session.orgUnitId,
          normativePackageId: context.normativePackageId,
          reservedNumber: context.reservedNumber,
          location,
          createdLocallyAt: context.createdLocallyAt,
          commandContext: { ...context, version: targetVersion },
        };
        const existingDraft = await this.localStore.draft(
          context.localEntityId,
        );
        if (existingDraft === undefined) {
          await this.localStore.putDraft(draft);
        } else if (finalizing && existingDraft.status === 'draft') {
          if (!draftCanTransition(existingDraft, draft)) {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          await this.localStore.transitionDraft(existingDraft, draft);
        } else {
          await this.localStore.putDraft(draft);
        }
        await this.localStore.putQueueItem(queueItem);
        return { kind: 'persisted', localEntityId: context.localEntityId };
      },
    };
  }
}

function draftCanTransition(
  current: MobileEntityDraft<LocalEntityType>,
  finalized: MobileEntityDraft<LocalEntityType>,
): boolean {
  return (
    current.localId === finalized.localId &&
    current.entityType === finalized.entityType &&
    current.tenantId === finalized.tenantId &&
    current.orgUnitId === finalized.orgUnitId &&
    current.agentId === finalized.agentId &&
    current.deviceId === finalized.deviceId &&
    current.shiftId === finalized.shiftId &&
    current.idempotencyKey === finalized.idempotencyKey &&
    current.localContentHash === finalized.localContentHash &&
    current.normativePackageId === finalized.normativePackageId &&
    current.normativePackageVersion === finalized.normativePackageVersion &&
    current.reservationId === finalized.reservationId &&
    current.reservedNumber === finalized.reservedNumber &&
    JSON.stringify(current.payload) === JSON.stringify(finalized.payload) &&
    JSON.stringify(current.location) === JSON.stringify(finalized.location)
  );
}

const STORE_SCREEN =
  /^(ait-|removal$|inventory$|transshipment$|measure-term$|measure-done$|alcohol-(device|result|refusal|signs|forward|links|term)$|sync$|sync-item$|diagnostics$|approach-no-ait$|document-check$|special-inspection$)/;

function clientTypeForScreen(screenId: string): Type<object> | undefined {
  if (/^(open-shift|close-shift|device-handoff)$/.test(screenId)) {
    return MobileBootstrapClient;
  }
  if (
    /^(vehicle-search|driver-search|vehicle-result|vehicle-divergence|driver-result|query-failure)$/.test(
      screenId,
    )
  ) {
    return OpsSnapshotsClient;
  }
  if (screenId === 'ait-cancel-request') return AitClient;
  if (/^(measure-start|retention)$/.test(screenId)) return MeasuresClient;
  if (screenId === 'alcohol-start') return AlcoholClient;
  if (screenId === 'sync-conflict') return OfflineSyncClient;
  return undefined;
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
  return clientTypeForScreen(screenId)?.name;
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
