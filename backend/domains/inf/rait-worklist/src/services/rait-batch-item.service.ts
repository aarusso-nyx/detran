// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
