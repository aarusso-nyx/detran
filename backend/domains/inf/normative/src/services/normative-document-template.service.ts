// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:41cbbec5aa5c5c6aa56495204f1b421d456abe78852bb03fd76a03715cbde6b1
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
