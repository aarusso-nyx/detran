import { executeProvisioning } from './provisioning.engine.js';
import type {
  ProvisioningCommand,
  ProvisioningResult,
} from './provisioning.contract.js';

export class RevokeOfflineGrantCommand implements ProvisioningCommand<
  unknown,
  ProvisioningResult
> {
  execute(input: unknown): Promise<ProvisioningResult> {
    return executeProvisioning('revoke', input);
  }
}
