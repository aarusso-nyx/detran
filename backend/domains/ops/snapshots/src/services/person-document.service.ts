// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
import { Injectable } from '@nestjs/common';
import { PersonDocumentRepository } from '../repositories/person-document.repository.js';
import type { PersonDocument } from '../entities/person-document.entity.js';
import type { CreatePersonDocumentDto } from '../dto/create-person-document.dto.js';

@Injectable()
export class PersonDocumentService {
  constructor(private readonly repository: PersonDocumentRepository) {}
  findAll(): Promise<PersonDocument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PersonDocument> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePersonDocumentDto): Promise<PersonDocument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePersonDocumentDto>,
  ): Promise<PersonDocument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
