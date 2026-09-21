import { executeProvisioning } from './provisioning.engine.js';
import type { ProvisioningResult } from './provisioning.contract.js';
export type ProvisioningReadiness = ProvisioningResult;
export function readProvisioningReadiness(
  input?: unknown,
): Promise<ProvisioningReadiness> {
  return executeProvisioning('readiness', input);
}
