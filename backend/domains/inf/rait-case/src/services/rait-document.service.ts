// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
