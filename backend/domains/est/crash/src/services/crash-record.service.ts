// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
import { Injectable } from '@nestjs/common';
import { CrashRecordRepository } from '../repositories/crash-record.repository.js';
import type { CrashRecord } from '../entities/crash-record.entity.js';
import type { CreateCrashRecordDto } from '../dto/create-crash-record.dto.js';

@Injectable()
export class CrashRecordService {
  constructor(private readonly repository: CrashRecordRepository) {}
  findAll(): Promise<CrashRecord[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashRecord> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashRecordDto): Promise<CrashRecord> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateCrashRecordDto>): Promise<CrashRecord> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
