// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
