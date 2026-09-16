// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
import { Injectable } from '@nestjs/common';
import { CrashWitnessRepository } from '../repositories/crash-witness.repository.js';
import type { CrashWitness } from '../entities/crash-witness.entity.js';
import type { CreateCrashWitnessDto } from '../dto/create-crash-witness.dto.js';

@Injectable()
export class CrashWitnessService {
  constructor(private readonly repository: CrashWitnessRepository) {}
  findAll(): Promise<CrashWitness[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashWitness> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashWitnessDto): Promise<CrashWitness> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashWitnessDto>,
  ): Promise<CrashWitness> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
