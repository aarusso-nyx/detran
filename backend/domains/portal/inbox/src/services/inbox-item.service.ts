// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
import { Injectable } from '@nestjs/common';
import { InboxItemRepository } from '../repositories/inbox-item.repository.js';
import type { InboxItem } from '../entities/inbox-item.entity.js';
import type { CreateInboxItemDto } from '../dto/create-inbox-item.dto.js';

@Injectable()
export class InboxItemService {
  constructor(private readonly repository: InboxItemRepository) {}
  findAll(): Promise<InboxItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<InboxItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInboxItemDto): Promise<InboxItem> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateInboxItemDto>): Promise<InboxItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
