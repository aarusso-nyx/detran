// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitAgendaItemRepository } from '../repositories/rait-agenda-item.repository.js';
import type { RaitAgendaItem } from '../entities/rait-agenda-item.entity.js';
import type { CreateRaitAgendaItemDto } from '../dto/create-rait-agenda-item.dto.js';

@Injectable()
export class RaitAgendaItemService {
  constructor(private readonly repository: RaitAgendaItemRepository) {}
  findAll(): Promise<RaitAgendaItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitAgendaItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitAgendaItemDto): Promise<RaitAgendaItem> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitAgendaItemDto>,
  ): Promise<RaitAgendaItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
