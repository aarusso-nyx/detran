// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
