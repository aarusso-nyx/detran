// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
import { Injectable } from '@nestjs/common';
import { ActLevelPolicyRepository } from '../repositories/act-level-policy.repository.js';
import type { ActLevelPolicy } from '../entities/act-level-policy.entity.js';
import type { CreateActLevelPolicyDto } from '../dto/create-act-level-policy.dto.js';

@Injectable()
export class ActLevelPolicyService {
  constructor(private readonly repository: ActLevelPolicyRepository) {}
  findAll(): Promise<ActLevelPolicy[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ActLevelPolicy> {
    return this.repository.findOne(id);
  }
  create(dto: CreateActLevelPolicyDto): Promise<ActLevelPolicy> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateActLevelPolicyDto>,
  ): Promise<ActLevelPolicy> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
