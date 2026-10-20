// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
import { Injectable } from '@nestjs/common';
import { ApproachRepository } from '../repositories/approach.repository.js';
import type { Approach } from '../entities/approach.entity.js';
import type { CreateApproachDto } from '../dto/create-approach.dto.js';

@Injectable()
export class ApproachService {
  constructor(private readonly repository: ApproachRepository) {}
  findAll(): Promise<Approach[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Approach> {
    return this.repository.findOne(id);
  }
  create(dto: CreateApproachDto): Promise<Approach> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateApproachDto>): Promise<Approach> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
