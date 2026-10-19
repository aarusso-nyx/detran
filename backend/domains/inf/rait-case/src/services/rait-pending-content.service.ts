// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
