// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
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
