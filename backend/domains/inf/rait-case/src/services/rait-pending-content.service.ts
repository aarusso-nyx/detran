// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
