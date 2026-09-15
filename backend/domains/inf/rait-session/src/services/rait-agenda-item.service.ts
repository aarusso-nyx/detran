// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
