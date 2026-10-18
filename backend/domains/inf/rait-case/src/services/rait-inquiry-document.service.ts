// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
