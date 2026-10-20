// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
