// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
