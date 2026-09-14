// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
