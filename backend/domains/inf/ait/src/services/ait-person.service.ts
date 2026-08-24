// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
