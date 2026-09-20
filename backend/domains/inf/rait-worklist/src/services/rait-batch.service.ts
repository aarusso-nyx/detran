// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
import { Injectable } from '@nestjs/common';
import { RaitBatchRepository } from '../repositories/rait-batch.repository.js';
import type { RaitBatch } from '../entities/rait-batch.entity.js';
import type { CreateRaitBatchDto } from '../dto/create-rait-batch.dto.js';

@Injectable()
export class RaitBatchService {
  constructor(private readonly repository: RaitBatchRepository) {}
  findAll(): Promise<RaitBatch[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBatch> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBatchDto): Promise<RaitBatch> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitBatchDto>): Promise<RaitBatch> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
