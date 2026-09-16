// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
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
