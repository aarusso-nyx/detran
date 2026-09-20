// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
import { Injectable } from '@nestjs/common';
import { RaitBatchItemRepository } from '../repositories/rait-batch-item.repository.js';
import type { RaitBatchItem } from '../entities/rait-batch-item.entity.js';
import type { CreateRaitBatchItemDto } from '../dto/create-rait-batch-item.dto.js';

@Injectable()
export class RaitBatchItemService {
  constructor(private readonly repository: RaitBatchItemRepository) {}
  findAll(): Promise<RaitBatchItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBatchItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBatchItemDto): Promise<RaitBatchItem> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitBatchItemDto>,
  ): Promise<RaitBatchItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
