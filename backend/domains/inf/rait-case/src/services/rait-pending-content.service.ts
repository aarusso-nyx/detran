// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitPendingContentRepository } from '../repositories/rait-pending-content.repository.js';
import type { RaitPendingContent } from '../entities/rait-pending-content.entity.js';
import type { CreateRaitPendingContentDto } from '../dto/create-rait-pending-content.dto.js';

@Injectable()
export class RaitPendingContentService {
  constructor(private readonly repository: RaitPendingContentRepository) {}
  findAll(): Promise<RaitPendingContent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPendingContent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPendingContentDto): Promise<RaitPendingContent> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPendingContentDto>,
  ): Promise<RaitPendingContent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
