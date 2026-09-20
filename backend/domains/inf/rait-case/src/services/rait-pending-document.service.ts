// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
