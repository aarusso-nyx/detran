// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashSceneDutyRepository } from '../repositories/crash-scene-duty.repository.js';
import type { CrashSceneDuty } from '../entities/crash-scene-duty.entity.js';
import type { CreateCrashSceneDutyDto } from '../dto/create-crash-scene-duty.dto.js';

@Injectable()
export class CrashSceneDutyService {
  constructor(private readonly repository: CrashSceneDutyRepository) {}
  findAll(): Promise<CrashSceneDuty[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashSceneDuty> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashSceneDutyDto): Promise<CrashSceneDuty> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashSceneDutyDto>,
  ): Promise<CrashSceneDuty> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
