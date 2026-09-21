// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable } from '@nestjs/common';
import { ProvisioningReconciliationRepository } from '../repositories/provisioning-reconciliation.repository.js';
import type { ProvisioningReconciliation } from '../entities/provisioning-reconciliation.entity.js';
import type { CreateProvisioningReconciliationDto } from '../dto/create-provisioning-reconciliation.dto.js';

@Injectable()
export class ProvisioningReconciliationService {
  constructor(
    private readonly repository: ProvisioningReconciliationRepository,
  ) {}
  findAll(): Promise<ProvisioningReconciliation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningReconciliation> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateProvisioningReconciliationDto,
  ): Promise<ProvisioningReconciliation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningReconciliationDto>,
  ): Promise<ProvisioningReconciliation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
