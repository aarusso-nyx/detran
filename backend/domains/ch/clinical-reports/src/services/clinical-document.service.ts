// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { ClinicalDocumentRepository } from '../repositories/clinical-document.repository.js';
import type { ClinicalDocument } from '../entities/clinical-document.entity.js';
import type { CreateClinicalDocumentDto } from '../dto/create-clinical-document.dto.js';

@Injectable()
export class ClinicalDocumentService {
  constructor(private readonly repository: ClinicalDocumentRepository) {}
  findAll(): Promise<ClinicalDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ClinicalDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateClinicalDocumentDto): Promise<ClinicalDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateClinicalDocumentDto>,
  ): Promise<ClinicalDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
