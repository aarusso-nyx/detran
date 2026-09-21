// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Module } from '@nestjs/common';
import { DeviceKeyController } from './controllers/device-key.controller.js';
import { DeviceKeyService } from './services/device-key.service.js';
import { DeviceKeyRepository } from './repositories/device-key.repository.js';
import { OfflineAuthorizationGrantController } from './controllers/offline-authorization-grant.controller.js';
import { OfflineAuthorizationGrantService } from './services/offline-authorization-grant.service.js';
import { OfflineAuthorizationGrantRepository } from './repositories/offline-authorization-grant.repository.js';
import { ProvisioningPackageController } from './controllers/provisioning-package.controller.js';
import { ProvisioningPackageService } from './services/provisioning-package.service.js';
import { ProvisioningPackageRepository } from './repositories/provisioning-package.repository.js';
import { ProvisioningReceiptController } from './controllers/provisioning-receipt.controller.js';
import { ProvisioningReceiptService } from './services/provisioning-receipt.service.js';
import { ProvisioningReceiptRepository } from './repositories/provisioning-receipt.repository.js';
import { DeviceRevocationController } from './controllers/device-revocation.controller.js';
import { DeviceRevocationService } from './services/device-revocation.service.js';
import { DeviceRevocationRepository } from './repositories/device-revocation.repository.js';
import { ProvisioningCommandIdempotencyController } from './controllers/provisioning-command-idempotency.controller.js';
import { ProvisioningCommandIdempotencyService } from './services/provisioning-command-idempotency.service.js';
import { ProvisioningCommandIdempotencyRepository } from './repositories/provisioning-command-idempotency.repository.js';
import { ProvisioningReconciliationController } from './controllers/provisioning-reconciliation.controller.js';
import { ProvisioningReconciliationService } from './services/provisioning-reconciliation.service.js';
import { ProvisioningReconciliationRepository } from './repositories/provisioning-reconciliation.repository.js';
import { ProvisioningGrantReservationBindingController } from './controllers/provisioning-grant-reservation-binding.controller.js';
import { ProvisioningGrantReservationBindingService } from './services/provisioning-grant-reservation-binding.service.js';
import { ProvisioningGrantReservationBindingRepository } from './repositories/provisioning-grant-reservation-binding.repository.js';
import { ProvisioningController } from './handwritten/provisioning.controller.js';
import { OPS_PROVISIONING_PROVIDER } from './handwritten/provisioning.provider.js';

@Module({
  controllers: [
    ProvisioningController,
    DeviceKeyController,
    OfflineAuthorizationGrantController,
    ProvisioningPackageController,
    ProvisioningReceiptController,
    DeviceRevocationController,
    ProvisioningCommandIdempotencyController,
    ProvisioningReconciliationController,
    ProvisioningGrantReservationBindingController,
  ],
  providers: [
    DeviceKeyService,
    DeviceKeyRepository,
    OfflineAuthorizationGrantService,
    OfflineAuthorizationGrantRepository,
    ProvisioningPackageService,
    ProvisioningPackageRepository,
    ProvisioningReceiptService,
    ProvisioningReceiptRepository,
    DeviceRevocationService,
    DeviceRevocationRepository,
    ProvisioningCommandIdempotencyService,
    ProvisioningCommandIdempotencyRepository,
    ProvisioningReconciliationService,
    ProvisioningReconciliationRepository,
    ProvisioningGrantReservationBindingService,
    ProvisioningGrantReservationBindingRepository,
    OPS_PROVISIONING_PROVIDER,
  ],
})
export class ProvisioningModule {}
