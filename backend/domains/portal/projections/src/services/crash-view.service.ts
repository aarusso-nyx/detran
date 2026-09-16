// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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
