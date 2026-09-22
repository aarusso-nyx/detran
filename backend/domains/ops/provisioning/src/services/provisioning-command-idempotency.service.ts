// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
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
