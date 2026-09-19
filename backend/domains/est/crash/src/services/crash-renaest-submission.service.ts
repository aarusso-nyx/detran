// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
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
