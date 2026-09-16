// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
