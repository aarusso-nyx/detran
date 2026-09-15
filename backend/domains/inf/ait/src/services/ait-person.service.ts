// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
import { Injectable } from '@nestjs/common';
import { AitPersonRepository } from '../repositories/ait-person.repository.js';
import type { AitPerson } from '../entities/ait-person.entity.js';
import type { CreateAitPersonDto } from '../dto/create-ait-person.dto.js';

@Injectable()
export class AitPersonService {
  constructor(private readonly repository: AitPersonRepository) {}
  findAll(): Promise<AitPerson[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitPerson> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitPersonDto): Promise<AitPerson> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAitPersonDto>): Promise<AitPerson> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
