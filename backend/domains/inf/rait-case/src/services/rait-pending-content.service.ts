// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
