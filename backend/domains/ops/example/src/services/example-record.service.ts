// Generated from BP-OPS-EXAMPLE-001 v1.0.0 sha256:a70ca6e407f469de7c4926ee3eea5364795e84c1934982d0662dcaf70341cb29
import { Injectable } from '@nestjs/common';
import { ExampleRecordRepository } from '../repositories/example-record.repository.js';
import type { ExampleRecord } from '../entities/example-record.entity.js';
import type { CreateExampleRecordDto } from '../dto/create-example-record.dto.js';

@Injectable()
export class ExampleRecordService {
  constructor(private readonly repository: ExampleRecordRepository) {}
  findAll(): Promise<ExampleRecord[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ExampleRecord> {
    return this.repository.findOne(id);
  }
  create(dto: CreateExampleRecordDto): Promise<ExampleRecord> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateExampleRecordDto>,
  ): Promise<ExampleRecord> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
