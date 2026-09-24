import { inject, Injectable, InjectionToken } from '@angular/core';
import type {
  BootstrapSnapshot,
  ProvisioningReadiness,
} from './bootstrap.store.js';
import { TeatErrorBoundaryState } from './field-shell.component.js';

export interface ReadinessInput {
  readonly bootstrap: BootstrapSnapshot | undefined;
  readonly provisioning: ProvisioningReadiness | undefined;
  readonly now: string;
  readonly destination?: string;
  readonly preShift?: boolean;
}

export interface ReadinessResult {
  readonly allowed: boolean;
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  readonly validUntil?: string;
}

export interface ReadinessWarningSink {
  record(code: string): void;
}

export const TEAT_READINESS_WARNING_SINK =
  new InjectionToken<ReadinessWarningSink>('TEAT_READINESS_WARNING_SINK', {
    providedIn: 'root',
    factory: () => {
      const boundary = inject(TeatErrorBoundaryState);
      return {
        record: (code: string) => boundary.recordWarning(code),
      };
    },
  });

@Injectable({ providedIn: 'root' })
export class ReadinessGateService {
  private readonly diagnostics = inject(TEAT_READINESS_WARNING_SINK);

  evaluate(input: ReadinessInput): ReadinessResult {
    const { bootstrap, provisioning } = input;
    const blockers: string[] = [];
    if (bootstrap === undefined) blockers.push('bootstrap-missing');
    if (provisioning === undefined) blockers.push('provisioning-missing');
    if (Number.isNaN(Date.parse(input.now))) blockers.push('clock-invalid');
    if (bootstrap !== undefined) {
      const rawContext = bootstrap.context as unknown as Readonly<
        Record<string, unknown>
      >;
      const hasShift = Object.prototype.hasOwnProperty.call(
        rawContext,
        'activeShift',
      );
      const hasSession = Object.prototype.hasOwnProperty.call(
        rawContext,
        'session',
      );
      const activeShift = hasShift ? bootstrap.context.activeShift : undefined;
      const operationalSession = hasSession
        ? bootstrap.context.session
        : undefined;
      const preShiftPair = activeShift === null && operationalSession === null;
      const operationalPair =
        activeShift !== undefined &&
        activeShift !== null &&
        operationalSession !== undefined &&
        operationalSession !== null;
      if (!hasShift || !hasSession || (!preShiftPair && !operationalPair)) {
        blockers.push('shift-session-context-invalid');
      }
      const preShiftAllowed =
        input.preShift === true &&
        preShiftPair &&
        bootstrap.readiness.preShiftReady === true &&
        bootstrap.capabilities.canOpenShift === true;
      if (input.preShift === true && !preShiftAllowed)
        blockers.push('pre-shift-not-ready');
      const snapshotValidUntil = Date.parse(
        bootstrap.snapshot?.validUntil ?? '',
      );
      if (
        !Number.isFinite(snapshotValidUntil) ||
        snapshotValidUntil <= Date.parse(input.now)
      ) {
        blockers.push('bootstrap-snapshot-expired');
      }
      if (operationalPair && operationalSession.exclusive !== true)
        blockers.push('session-not-exclusive');
      if (!preShiftPair && !operationalPair)
        blockers.push('session-not-exclusive');
      if (bootstrap.context.device.status !== 'authorized')
        blockers.push('device-not-authorized');
      if (bootstrap.context.device.homologated !== true)
        blockers.push('device-not-homologated');
      if (bootstrap.context.device.tamperDetected)
        blockers.push('device-tamper');
      if (!bootstrap.normativePackage.manifestHash)
        blockers.push('normative-package-missing');
      if (bootstrap.numberingReservations.length === 0 && !preShiftAllowed)
        blockers.push('numbering-reservation-missing');
      if (activeShift?.status !== 'open' && !preShiftAllowed)
        blockers.push('shift-not-open');
      blockers.push(
        ...bootstrap.readiness.blockers.filter(
          (blocker) =>
            !preShiftAllowed ||
            !['NUMBERING_RESERVATION_REQUIRED', 'SHIFT_NOT_OPEN'].includes(
              blocker,
            ),
        ),
      );
    }
    if (provisioning !== undefined) {
      if (!provisioning.ready) blockers.push('provisioning-not-ready');
      blockers.push(...provisioning.blockers.map((blocker) => blocker.code));
    }
    const warnings: string[] = [];
    const validUntil = bootstrap?.snapshot?.validUntil;
    const normativeValidUntil = bootstrap?.normativePackage.validUntil;
    if (
      normativeValidUntil !== undefined &&
      !Number.isNaN(Date.parse(input.now)) &&
      Date.parse(input.now) >= Date.parse(normativeValidUntil)
    ) {
      warnings.push('warning-expired');
      this.diagnostics.record('warning-expired');
    }
    return {
      allowed: blockers.length === 0,
      blockers,
      warnings,
      ...(typeof validUntil === 'string' ? { validUntil } : {}),
    };
  }
}
