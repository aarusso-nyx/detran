// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
