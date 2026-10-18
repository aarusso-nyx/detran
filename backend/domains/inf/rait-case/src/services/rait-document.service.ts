// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
