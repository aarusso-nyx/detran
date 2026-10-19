// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitDocumentRepository } from '../repositories/rait-document.repository.js';
import type { RaitDocument } from '../entities/rait-document.entity.js';
import type { CreateRaitDocumentDto } from '../dto/create-rait-document.dto.js';

@Injectable()
export class RaitDocumentService {
  constructor(private readonly repository: RaitDocumentRepository) {}
  findAll(): Promise<RaitDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitDocumentDto): Promise<RaitDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitDocumentDto>,
  ): Promise<RaitDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
