// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
import { Injectable } from '@nestjs/common';
import { CrashViewRepository } from '../repositories/crash-view.repository.js';
import type { CrashView } from '../entities/crash-view.entity.js';
import type { CreateCrashViewDto } from '../dto/create-crash-view.dto.js';

@Injectable()
export class CrashViewService {
  constructor(private readonly repository: CrashViewRepository) {}
  findAll(): Promise<CrashView[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashView> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashViewDto): Promise<CrashView> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashViewDto>): Promise<CrashView> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
