// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
import { Injectable } from '@nestjs/common';
import { CollectionDocumentRepository } from '../repositories/collection-document.repository.js';
import type { CollectionDocument } from '../entities/collection-document.entity.js';
import type { CreateCollectionDocumentDto } from '../dto/create-collection-document.dto.js';

@Injectable()
export class CollectionDocumentService {
  constructor(private readonly repository: CollectionDocumentRepository) {}
  findAll(): Promise<CollectionDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CollectionDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCollectionDocumentDto): Promise<CollectionDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCollectionDocumentDto>,
  ): Promise<CollectionDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
