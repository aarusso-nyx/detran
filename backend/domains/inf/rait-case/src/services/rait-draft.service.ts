// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
