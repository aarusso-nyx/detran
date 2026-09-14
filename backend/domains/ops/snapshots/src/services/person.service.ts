// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
import { Injectable } from '@nestjs/common';
import { PersonRepository } from '../repositories/person.repository.js';
import type { Person } from '../entities/person.entity.js';
import type { CreatePersonDto } from '../dto/create-person.dto.js';

@Injectable()
export class PersonService {
  constructor(private readonly repository: PersonRepository) {}
  findAll(): Promise<Person[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Person> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePersonDto): Promise<Person> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreatePersonDto>): Promise<Person> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
