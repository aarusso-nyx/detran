// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashDamageRepository } from '../repositories/crash-damage.repository.js';
import type { CrashDamage } from '../entities/crash-damage.entity.js';
import type { CreateCrashDamageDto } from '../dto/create-crash-damage.dto.js';

@Injectable()
export class CrashDamageService {
  constructor(private readonly repository: CrashDamageRepository) {}
  findAll(): Promise<CrashDamage[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashDamage> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashDamageDto): Promise<CrashDamage> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashDamageDto>): Promise<CrashDamage> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
