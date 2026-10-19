// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
