// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
