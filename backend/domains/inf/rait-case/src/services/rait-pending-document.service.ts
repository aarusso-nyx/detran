// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
