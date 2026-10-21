// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
