// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
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
