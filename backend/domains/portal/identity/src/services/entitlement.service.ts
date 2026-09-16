// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
import { Injectable } from '@nestjs/common';
import { EntitlementRepository } from '../repositories/entitlement.repository.js';
import type { Entitlement } from '../entities/entitlement.entity.js';
import type { CreateEntitlementDto } from '../dto/create-entitlement.dto.js';

@Injectable()
export class EntitlementService {
  constructor(private readonly repository: EntitlementRepository) {}
  findAll(): Promise<Entitlement[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Entitlement> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEntitlementDto): Promise<Entitlement> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateEntitlementDto>): Promise<Entitlement> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
