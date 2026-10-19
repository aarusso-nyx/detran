// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
