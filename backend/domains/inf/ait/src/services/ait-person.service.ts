// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
