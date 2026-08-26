// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
