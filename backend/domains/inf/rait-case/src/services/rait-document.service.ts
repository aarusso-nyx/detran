// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
