// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable } from '@nestjs/common';
import { ProvisioningReceiptRepository } from '../repositories/provisioning-receipt.repository.js';
import type { ProvisioningReceipt } from '../entities/provisioning-receipt.entity.js';
import type { CreateProvisioningReceiptDto } from '../dto/create-provisioning-receipt.dto.js';

@Injectable()
export class ProvisioningReceiptService {
  constructor(private readonly repository: ProvisioningReceiptRepository) {}
  findAll(): Promise<ProvisioningReceipt[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningReceipt> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProvisioningReceiptDto): Promise<ProvisioningReceipt> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningReceiptDto>,
  ): Promise<ProvisioningReceipt> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
