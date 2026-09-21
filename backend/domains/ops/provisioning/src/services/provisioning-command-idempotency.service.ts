// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
import { Injectable } from '@nestjs/common';
import { ProvisioningCommandIdempotencyRepository } from '../repositories/provisioning-command-idempotency.repository.js';
import type { ProvisioningCommandIdempotency } from '../entities/provisioning-command-idempotency.entity.js';
import type { CreateProvisioningCommandIdempotencyDto } from '../dto/create-provisioning-command-idempotency.dto.js';

@Injectable()
export class ProvisioningCommandIdempotencyService {
  constructor(
    private readonly repository: ProvisioningCommandIdempotencyRepository,
  ) {}
  findAll(): Promise<ProvisioningCommandIdempotency[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningCommandIdempotency> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateProvisioningCommandIdempotencyDto,
  ): Promise<ProvisioningCommandIdempotency> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningCommandIdempotencyDto>,
  ): Promise<ProvisioningCommandIdempotency> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
