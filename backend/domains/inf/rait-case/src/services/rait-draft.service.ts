// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitDraftRepository } from '../repositories/rait-draft.repository.js';
import type { RaitDraft } from '../entities/rait-draft.entity.js';
import type { CreateRaitDraftDto } from '../dto/create-rait-draft.dto.js';

@Injectable()
export class RaitDraftService {
  constructor(private readonly repository: RaitDraftRepository) {}
  findAll(): Promise<RaitDraft[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitDraft> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitDraftDto): Promise<RaitDraft> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitDraftDto>): Promise<RaitDraft> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
