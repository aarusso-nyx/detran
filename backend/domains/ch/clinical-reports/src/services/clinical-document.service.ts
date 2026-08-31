// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
