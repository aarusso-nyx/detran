// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
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
