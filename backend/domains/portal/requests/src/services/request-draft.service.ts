// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
import { Injectable } from '@nestjs/common';
import { RequestDraftRepository } from '../repositories/request-draft.repository.js';
import type { RequestDraft } from '../entities/request-draft.entity.js';
import type { CreateRequestDraftDto } from '../dto/create-request-draft.dto.js';

@Injectable()
export class RequestDraftService {
  constructor(private readonly repository: RequestDraftRepository) {}
  findAll(): Promise<RequestDraft[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RequestDraft> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRequestDraftDto): Promise<RequestDraft> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRequestDraftDto>,
  ): Promise<RequestDraft> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
