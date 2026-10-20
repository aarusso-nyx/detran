// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashVictimRepository } from '../repositories/crash-victim.repository.js';
import type { CrashVictim } from '../entities/crash-victim.entity.js';
import type { CreateCrashVictimDto } from '../dto/create-crash-victim.dto.js';

@Injectable()
export class CrashVictimService {
  constructor(private readonly repository: CrashVictimRepository) {}
  findAll(): Promise<CrashVictim[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashVictim> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashVictimDto): Promise<CrashVictim> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashVictimDto>): Promise<CrashVictim> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
