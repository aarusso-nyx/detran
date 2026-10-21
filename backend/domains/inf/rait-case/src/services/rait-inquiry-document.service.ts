// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
import { Injectable } from '@nestjs/common';
import { RaitInquiryDocumentRepository } from '../repositories/rait-inquiry-document.repository.js';
import type { RaitInquiryDocument } from '../entities/rait-inquiry-document.entity.js';
import type { CreateRaitInquiryDocumentDto } from '../dto/create-rait-inquiry-document.dto.js';

@Injectable()
export class RaitInquiryDocumentService {
  constructor(private readonly repository: RaitInquiryDocumentRepository) {}
  findAll(): Promise<RaitInquiryDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitInquiryDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitInquiryDocumentDto): Promise<RaitInquiryDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitInquiryDocumentDto>,
  ): Promise<RaitInquiryDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
