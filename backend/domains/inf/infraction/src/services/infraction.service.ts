// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
import { Injectable } from '@nestjs/common';
import { InfractionRepository } from '../repositories/infraction.repository.js';
import type { Infraction } from '../entities/infraction.entity.js';
import type { CreateInfractionDto } from '../dto/create-infraction.dto.js';

@Injectable()
export class InfractionService {
  constructor(private readonly repository: InfractionRepository) {}
  findAll(): Promise<Infraction[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Infraction> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInfractionDto): Promise<Infraction> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateInfractionDto>): Promise<Infraction> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
