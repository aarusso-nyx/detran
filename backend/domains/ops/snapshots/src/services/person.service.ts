// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
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
