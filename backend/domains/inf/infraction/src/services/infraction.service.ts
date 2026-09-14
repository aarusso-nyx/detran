// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
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
