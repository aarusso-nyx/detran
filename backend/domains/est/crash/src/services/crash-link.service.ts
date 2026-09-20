// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
import { Injectable } from '@nestjs/common';
import { CrashLinkRepository } from '../repositories/crash-link.repository.js';
import type { CrashLink } from '../entities/crash-link.entity.js';
import type { CreateCrashLinkDto } from '../dto/create-crash-link.dto.js';

@Injectable()
export class CrashLinkService {
  constructor(private readonly repository: CrashLinkRepository) {}
  findAll(): Promise<CrashLink[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashLink> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashLinkDto): Promise<CrashLink> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashLinkDto>): Promise<CrashLink> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
