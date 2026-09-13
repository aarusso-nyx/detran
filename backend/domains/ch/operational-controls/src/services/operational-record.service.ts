// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
import { Injectable } from '@nestjs/common';
import { OperationalRecordRepository } from '../repositories/operational-record.repository.js';
import type { OperationalRecord } from '../entities/operational-record.entity.js';
import type { CreateOperationalRecordDto } from '../dto/create-operational-record.dto.js';

@Injectable()
export class OperationalRecordService {
  constructor(private readonly repository: OperationalRecordRepository) {}
  findAll(): Promise<OperationalRecord[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<OperationalRecord> {
    return this.repository.findOne(id);
  }
  create(dto: CreateOperationalRecordDto): Promise<OperationalRecord> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateOperationalRecordDto>,
  ): Promise<OperationalRecord> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
