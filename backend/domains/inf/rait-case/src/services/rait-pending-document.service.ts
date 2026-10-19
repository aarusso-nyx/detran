// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
