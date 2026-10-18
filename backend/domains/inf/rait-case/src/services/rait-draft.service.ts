// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
