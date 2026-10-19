// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
