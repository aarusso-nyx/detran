// Generated from BP-INF-NORMATIVE-001 v1.2.0 sha256:ce4605cd48d6677dc9c5dd6373c5e2500e57fbd2f114d497422e06914a937588
import { Injectable } from '@nestjs/common';
import { NormativeDocumentTemplateRepository } from '../repositories/normative-document-template.repository.js';
import type { NormativeDocumentTemplate } from '../entities/normative-document-template.entity.js';
import type { CreateNormativeDocumentTemplateDto } from '../dto/create-normative-document-template.dto.js';

@Injectable()
export class NormativeDocumentTemplateService {
  constructor(
    private readonly repository: NormativeDocumentTemplateRepository,
  ) {}
  findAll(): Promise<NormativeDocumentTemplate[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeDocumentTemplate> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateNormativeDocumentTemplateDto,
  ): Promise<NormativeDocumentTemplate> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeDocumentTemplateDto>,
  ): Promise<NormativeDocumentTemplate> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
