import { executeProvisioning } from './provisioning.engine.js';
import type {
  ProvisioningCommand,
  ProvisioningResult,
} from './provisioning.contract.js';

export class RegisterDeviceKeyCommand implements ProvisioningCommand<
  unknown,
  ProvisioningResult
> {
  execute(input: unknown): Promise<ProvisioningResult> {
    return executeProvisioning('register', input);
  }
}
