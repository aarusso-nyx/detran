// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
