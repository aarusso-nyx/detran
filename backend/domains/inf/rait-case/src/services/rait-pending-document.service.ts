// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
import { Injectable } from '@nestjs/common';
import { RaitPendingDocumentRepository } from '../repositories/rait-pending-document.repository.js';
import type { RaitPendingDocument } from '../entities/rait-pending-document.entity.js';
import type { CreateRaitPendingDocumentDto } from '../dto/create-rait-pending-document.dto.js';

@Injectable()
export class RaitPendingDocumentService {
  constructor(private readonly repository: RaitPendingDocumentRepository) {}
  findAll(): Promise<RaitPendingDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPendingDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPendingDocumentDto): Promise<RaitPendingDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitPendingDocumentDto>,
  ): Promise<RaitPendingDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
