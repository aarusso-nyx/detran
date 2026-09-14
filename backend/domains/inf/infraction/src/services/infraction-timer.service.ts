// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
import { Injectable } from '@nestjs/common';
import { InfractionTimerRepository } from '../repositories/infraction-timer.repository.js';
import type { InfractionTimer } from '../entities/infraction-timer.entity.js';
import type { CreateInfractionTimerDto } from '../dto/create-infraction-timer.dto.js';

@Injectable()
export class InfractionTimerService {
  constructor(private readonly repository: InfractionTimerRepository) {}
  findAll(): Promise<InfractionTimer[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<InfractionTimer> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInfractionTimerDto): Promise<InfractionTimer> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateInfractionTimerDto>,
  ): Promise<InfractionTimer> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
