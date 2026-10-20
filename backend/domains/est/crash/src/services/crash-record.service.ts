// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
