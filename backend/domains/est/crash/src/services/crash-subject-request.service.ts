// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
import { Injectable } from '@nestjs/common';
import { CrashSubjectRequestRepository } from '../repositories/crash-subject-request.repository.js';
import type { CrashSubjectRequest } from '../entities/crash-subject-request.entity.js';
import type { CreateCrashSubjectRequestDto } from '../dto/create-crash-subject-request.dto.js';

@Injectable()
export class CrashSubjectRequestService {
  constructor(private readonly repository: CrashSubjectRequestRepository) {}
  findAll(): Promise<CrashSubjectRequest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashSubjectRequest> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashSubjectRequestDto): Promise<CrashSubjectRequest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashSubjectRequestDto>,
  ): Promise<CrashSubjectRequest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
