import { describe, expect, it } from 'vitest';

import { CreateKeyChallengeCommand } from './create-key-challenge.command.js';
import { DownloadProvisioningPackageCommand } from './download-provisioning-package.command.js';
import { IssueProvisioningPackageCommand } from './issue-provisioning-package.command.js';
import { ReconcileOfflineGrantCommand } from './reconcile-offline-grant.command.js';
import { RecordProvisioningReceiptCommand } from './record-provisioning-receipt.command.js';
import { RegisterDeviceKeyCommand } from './register-device-key.command.js';
import { RevokeOfflineGrantCommand } from './revoke-offline-grant.command.js';

describe('R-0013 CTG-0003 — comandos de provisionamento offline', () => {
  const commands = [
    ['create-key-challenge', () => new CreateKeyChallengeCommand().execute({})],
    ['register-device-key', () => new RegisterDeviceKeyCommand().execute({})],
    [
      'issue-provisioning-package',
      () => new IssueProvisioningPackageCommand().execute({}),
    ],
    [
      'download-provisioning-package',
      () => new DownloadProvisioningPackageCommand().execute({}),
    ],
    [
      'record-provisioning-receipt',
      () => new RecordProvisioningReceiptCommand().execute({}),
    ],
    ['revoke-offline-grant', () => new RevokeOfflineGrantCommand().execute({})],
    [
      'reconcile-offline-grant',
      () => new ReconcileOfflineGrantCommand().execute({}),
    ],
  ] as const;

  it.each(commands)(
    'dado o comando %s quando recebe entrada vazia então rejeita sem fabricar sucesso',
    async (_operation, execute) => {
      await expect(execute()).rejects.toMatchObject({
        code: 'TEAT.VALIDATION_FAILED',
        status: 400,
      });
    },
  );
});
