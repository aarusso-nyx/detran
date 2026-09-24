import { inject, Injectable, Injector, type Type } from '@angular/core';
import { Router, type Route } from '@angular/router';
import type {
  MobileEntityDraft,
  MobileLocationContext,
  MobileSessionContext,
  MobileSyncQueueItem,
} from '@stynx-nyx/mobile-runtime';
import {
  BootstrapStore,
  type BootstrapSnapshot,
} from '../core/bootstrap.store.js';
import { ReadinessGateService } from '../core/readiness-gate.service.js';
import { AitClient } from '../data/api/ait.client.js';
import { AlcoholClient } from '../data/api/alcohol.client.js';
import { MeasuresClient } from '../data/api/measures.client.js';
import { MobileBootstrapClient } from '../data/api/mobile-bootstrap.client.js';
import { OfflineSyncClient } from '../data/api/offline-sync.client.js';
import { OpsSnapshotsClient } from '../data/api/ops-snapshots.client.js';
import {
  LocalActStore,
  type LocalAitDraft,
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
import {
  type InstalledNormativePackage,
  NormativePackageService,
} from '../data/normative/normative-package.service.js';
import { authGuard } from '../navigation/guards/auth.guard.js';
import { readinessGuard } from '../navigation/guards/readiness.guard.js';
import { roleGuard } from '../navigation/guards/role.guard.js';
import { shiftGuard } from '../navigation/guards/shift.guard.js';
import { tenantGuard } from '../navigation/guards/tenant.guard.js';
import { TEAT_HOMOLOGATION_AIT } from './homologation-ait.port.js';

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
    | Readonly<{ kind: 'demonstrated'; localEntityId: string }>
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

export interface AitReviewAuthorityInput {
  readonly payload: Readonly<Record<string, unknown>>;
  readonly context: MobileCommandContext;
  readonly snapshot: BootstrapSnapshot | undefined;
  readonly installed: InstalledNormativePackage | undefined;
  readonly now: string;
}

export type AitReviewAuthorityResult =
  | Readonly<{ allowed: true }>
  | Readonly<{
      allowed: false;
      reason: 'context-invalid' | 'numbering-invalid' | 'package-invalid';
    }>;

export function evaluateAitReviewAuthority(
  input: AitReviewAuthorityInput,
): AitReviewAuthorityResult {
  const { context, installed, payload, snapshot } = input;
  const now = Date.parse(input.now);
  if (
    !hasCompleteReviewContext(context) ||
    !Number.isFinite(now) ||
    snapshot === undefined ||
    !Number.isFinite(Date.parse(snapshot.snapshot?.validUntil ?? '')) ||
    Date.parse(snapshot.snapshot?.validUntil ?? '') <= now ||
    snapshot.context.tenantId !== context.session.tenantId ||
    snapshot.context.device.id !== context.session.deviceId ||
    snapshot.context.agent.id !== context.session.agentId ||
    snapshot.context.activeShift?.id !== context.session.shiftId ||
    snapshot.context.activeShift.status !== 'open' ||
    payload['explicit_action'] !== 'finalize'
  ) {
    return { allowed: false, reason: 'context-invalid' };
  }

  const reservation = snapshot.numberingReservations.find(
    (candidate) =>
      isRecord(candidate) &&
      candidate['id'] === context.reservationId &&
      candidate['status'] === 'reserved' &&
      Number.isSafeInteger(candidate['startNumber']) &&
      Number.isSafeInteger(candidate['endNumber']) &&
      context.reservedNumber >= Number(candidate['startNumber']) &&
      context.reservedNumber <= Number(candidate['endNumber']) &&
      typeof candidate['validUntil'] === 'string' &&
      Number.isFinite(Date.parse(candidate['validUntil'])) &&
      Date.parse(candidate['validUntil']) > now,
  );
  if (
    reservation === undefined ||
    payload['reserved_number'] !== String(context.reservedNumber)
  ) {
    return { allowed: false, reason: 'numbering-invalid' };
  }

  const normativeAuthority = snapshot.normativePackage;
  if (
    installed === undefined ||
    normativeAuthority?.status !== 'published' ||
    installed.id !== context.normativePackageId ||
    installed.id !== normativeAuthority.id ||
    installed.version !== context.normativePackageVersion ||
    installed.version !== normativeAuthority.version ||
    !nonEmptyString(installed.manifestHash) ||
    installed.manifestHash !== normativeAuthority.manifestHash
  ) {
    return { allowed: false, reason: 'package-invalid' };
  }
  return { allowed: true };
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
  private readonly bootstrap = inject(BootstrapStore, { optional: true });
  private readonly readiness = inject(ReadinessGateService);
  private readonly normativePackages = inject(NormativePackageService, {
    optional: true,
  });
  private readonly homologationAit = inject(TEAT_HOMOLOGATION_AIT, {
    optional: true,
  });

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
        if (this.homologationAit?.profile === 'homologation') {
          if (contract.screenId === 'ait-start') {
            return this.homologationAit.start(input, context);
          }
          if (contract.screenId === 'ait-review') {
            return this.homologationAit.review(input, context);
          }
        }
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
        if (
          contract.screenId === 'ait-review' &&
          !(await this.reviewCanFinalize(payload, context))
        ) {
          return { kind: 'blocked', reason: 'not-ready' };
        }
        const location = context.location;
        const finalizing =
          contract.screenId === 'ait-review' &&
          payload['explicit_action'] === 'finalize';
        if (contract.screenId === 'ait-start') {
          if (context.entityType !== 'ait') {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          if (!(await this.currentAitAuthorityMatches(context))) {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          const unnumberedPayload = { ...payload };
          delete unnumberedPayload['reserved_number'];
          const firstDraft = {
            localId: context.localEntityId,
            entityType: 'ait' as const,
            tenantId: context.session.tenantId,
            orgUnitId: context.session.orgUnitId,
            agentId: context.session.agentId,
            deviceId: context.session.deviceId,
            shiftId: context.session.shiftId,
            idempotencyKey: context.idempotencyKey,
            normativePackageId: context.normativePackageId,
            normativePackageVersion: context.normativePackageVersion,
            localContentHash: context.payloadHash,
            payload: unnumberedPayload,
            location: context.location,
            evidence: [],
            createdAt: context.createdLocallyAt,
            updatedAt: context.createdLocallyAt,
            status: 'draft' as const,
          };
          const pin = this.localStore.pinAitNumberAndPutFirstDraft;
          if (typeof pin !== 'function') {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          try {
            const pinned = await pin.call(this.localStore, {
              reservationId: context.reservationId,
              now: new Date().toISOString(),
              scope: {
                tenantId: context.session.tenantId,
                agentId: context.session.agentId,
                deviceId: context.session.deviceId,
                shiftId: context.session.shiftId,
              },
              draft: firstDraft,
            });
            return {
              kind: 'persisted',
              localEntityId: pinned.localId,
            };
          } catch {
            return { kind: 'blocked', reason: 'not-ready' };
          }
        }
        if (AIT_DRAFT_EDIT_SCREENS.has(contract.screenId)) {
          if (context.entityType !== 'ait') {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          const pinned = await this.localStore.draft(context.localEntityId);
          if (!pinnedAitMatchesContext(pinned, context)) {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          const current = pinned as LocalAitDraft;
          if (
            !Number.isSafeInteger(current.localRevision) ||
            context.version !== current.localRevision
          ) {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          const replacement: LocalAitDraft = {
            ...pinned,
            localRevision: current.localRevision + 1,
            payload: {
              ...pinned.payload,
              ...payload,
              reserved_number: String(pinned.reservedNumber),
            },
            localContentHash: context.payloadHash,
            updatedAt: context.createdLocallyAt,
          };
          try {
            await this.localStore.transitionDraft(pinned, replacement);
          } catch {
            return { kind: 'blocked', reason: 'not-ready' };
          }
          return {
            kind: 'persisted',
            localEntityId: context.localEntityId,
          };
        }
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

  private async reviewCanFinalize(
    payload: Readonly<Record<string, unknown>>,
    context: MobileCommandContext,
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const snapshot = this.bootstrap?.snapshot();
    const installed = await this.normativePackages?.usable(now);
    const authority = evaluateAitReviewAuthority({
      payload,
      context,
      snapshot,
      installed,
      now,
    });
    if (!authority.allowed) return false;

    const aggregate = await this.localStore.draft(context.localEntityId);
    if (aggregate === undefined) return false;
    // No executable authoritative AIT aggregate validator exists yet. A durable
    // generic payload cannot prove that every blocking validation is green.
    return false;
  }

  private async currentAitAuthorityMatches(
    context: MobileCommandContext,
  ): Promise<boolean> {
    if (this.bootstrap?.state().status !== 'ready') return false;
    const snapshot = this.bootstrap.snapshot();
    const provisioning = this.bootstrap.provisioningSnapshot();
    const now = new Date().toISOString();
    if (
      snapshot === undefined ||
      snapshot.capabilities.canOperateOffline !== true ||
      !this.readiness.evaluate({
        bootstrap: snapshot,
        provisioning,
        now,
        destination: 'ait-start',
        preShift: false,
      }).allowed ||
      snapshot.context.tenantId !== context.session.tenantId ||
      snapshot.context.agent.id !== context.session.agentId ||
      snapshot.context.device.id !== context.session.deviceId ||
      snapshot.context.activeShift?.status !== 'open' ||
      snapshot.context.activeShift.id !== context.session.shiftId
    ) {
      return false;
    }
    const candidate = snapshot.numberingReservations.find(
      (value) => isRecord(value) && value['id'] === context.reservationId,
    );
    const installed = await this.localStore.reservationAuthority(
      context.reservationId,
    );
    if (!isRecord(candidate) || installed === undefined) return false;
    const validUntil = Date.parse(String(candidate['validUntil'] ?? ''));
    return (
      candidate['status'] === 'reserved' &&
      candidate['shiftId'] === snapshot.context.activeShift.id &&
      candidate['rangeId'] === installed.rangeId &&
      candidate['series'] === installed.series &&
      candidate['startNumber'] === installed.startNumber &&
      candidate['endNumber'] === installed.endNumber &&
      candidate['validUntil'] === installed.validUntil &&
      installed.tenantId === context.session.tenantId &&
      installed.agentId === context.session.agentId &&
      installed.deviceId === context.session.deviceId &&
      installed.shiftId === context.session.shiftId &&
      installed.status === 'reserved' &&
      Number.isFinite(validUntil) &&
      validUntil > Date.now()
    );
  }
}

function hasCompleteReviewContext(context: MobileCommandContext): boolean {
  return (
    isRecord(context) &&
    isRecord(context.session) &&
    nonEmptyString(context.session.tenantId) &&
    nonEmptyString(context.session.agentId) &&
    nonEmptyString(context.session.deviceId) &&
    nonEmptyString(context.session.shiftId) &&
    nonEmptyString(context.localEntityId) &&
    context.entityType === 'ait' &&
    nonEmptyString(context.createdLocallyAt) &&
    Number.isFinite(Date.parse(context.createdLocallyAt)) &&
    nonEmptyString(context.normativePackageId) &&
    nonEmptyString(context.normativePackageVersion) &&
    nonEmptyString(context.reservationId) &&
    Number.isSafeInteger(context.reservedNumber) &&
    context.reservedNumber > 0
  );
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null;
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

const AIT_DRAFT_EDIT_SCREENS = new Set([
  'ait-vehicle',
  'ait-driver',
  'ait-frame',
  'ait-frame-detail',
  'ait-location',
  'ait-notes',
  'ait-validations',
  'ait-evidence',
  'ait-measures',
  'ait-signature',
]);

function pinnedAitMatchesContext(
  draft: MobileEntityDraft<LocalEntityType> | undefined,
  context: MobileCommandContext,
): draft is MobileEntityDraft<'ait'> {
  return (
    draft !== undefined &&
    draft.entityType === 'ait' &&
    draft.status === 'draft' &&
    draft.localId === context.localEntityId &&
    draft.tenantId === context.session.tenantId &&
    draft.agentId === context.session.agentId &&
    draft.deviceId === context.session.deviceId &&
    draft.shiftId === context.session.shiftId &&
    draft.reservationId === context.reservationId &&
    Number.isSafeInteger(draft.reservedNumber) &&
    draft.reservedNumber > 0
  );
}

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
