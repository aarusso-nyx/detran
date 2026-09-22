// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
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
