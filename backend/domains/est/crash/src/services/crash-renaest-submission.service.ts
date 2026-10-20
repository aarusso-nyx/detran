// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
import { Injectable } from '@nestjs/common';
import { CrashRenaestSubmissionRepository } from '../repositories/crash-renaest-submission.repository.js';
import type { CrashRenaestSubmission } from '../entities/crash-renaest-submission.entity.js';
import type { CreateCrashRenaestSubmissionDto } from '../dto/create-crash-renaest-submission.dto.js';

@Injectable()
export class CrashRenaestSubmissionService {
  constructor(private readonly repository: CrashRenaestSubmissionRepository) {}
  findAll(): Promise<CrashRenaestSubmission[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashRenaestSubmission> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateCrashRenaestSubmissionDto,
  ): Promise<CrashRenaestSubmission> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashRenaestSubmissionDto>,
  ): Promise<CrashRenaestSubmission> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
