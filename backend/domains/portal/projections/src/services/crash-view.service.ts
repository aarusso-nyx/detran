// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
