import type {
  BootstrapSnapshot,
  ProvisioningReadiness,
} from './bootstrap.store.js';

export interface ReadinessInput {
  readonly bootstrap: BootstrapSnapshot | undefined;
  readonly provisioning: ProvisioningReadiness | undefined;
  readonly now: string;
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

export class ReadinessGateService {
  constructor(private readonly diagnostics: ReadinessWarningSink) {}

  evaluate(input: ReadinessInput): ReadinessResult {
    const { bootstrap, provisioning } = input;
    const blockers: string[] = [];
    if (bootstrap === undefined) blockers.push('bootstrap-missing');
    if (provisioning === undefined) blockers.push('provisioning-missing');
    if (Number.isNaN(Date.parse(input.now))) blockers.push('clock-invalid');
    if (bootstrap !== undefined) {
      if (bootstrap.context.session.exclusive !== true)
        blockers.push('session-not-exclusive');
      if (bootstrap.context.device.status !== 'authorized')
        blockers.push('device-not-authorized');
      if (bootstrap.context.device.homologated !== true)
        blockers.push('device-not-homologated');
      if (bootstrap.context.device.tamperDetected)
        blockers.push('device-tamper');
      if (!bootstrap.normativePackage.manifestHash)
        blockers.push('normative-package-missing');
      if (bootstrap.numberingReservations.length === 0)
        blockers.push('numbering-reservation-missing');
      if (bootstrap.context.activeShift?.status !== 'open')
        blockers.push('shift-not-open');
      blockers.push(...bootstrap.readiness.blockers);
    }
    if (provisioning !== undefined) {
      if (!provisioning.ready) blockers.push('provisioning-not-ready');
      blockers.push(...provisioning.blockers.map((blocker) => blocker.code));
    }
    const warnings: string[] = [];
    const validUntil = bootstrap?.normativePackage.validUntil;
    if (
      validUntil !== undefined &&
      !Number.isNaN(Date.parse(input.now)) &&
      Date.parse(input.now) >= Date.parse(validUntil)
    ) {
      warnings.push('warning-expired');
      this.diagnostics.record('warning-expired');
    }
    return {
      allowed: blockers.length === 0,
      blockers,
      warnings,
      ...(validUntil === undefined ? {} : { validUntil }),
    };
  }
}
