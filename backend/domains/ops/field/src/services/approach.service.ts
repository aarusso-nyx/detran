// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
