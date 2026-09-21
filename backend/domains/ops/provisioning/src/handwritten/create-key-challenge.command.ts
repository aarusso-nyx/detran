import { executeProvisioning } from './provisioning.engine.js';
import type {
  ProvisioningCommand,
  ProvisioningResult,
} from './provisioning.contract.js';

export class CreateKeyChallengeCommand implements ProvisioningCommand<
  unknown,
  ProvisioningResult
> {
  execute(input: unknown): Promise<ProvisioningResult> {
    return executeProvisioning('challenge', input);
  }
}
