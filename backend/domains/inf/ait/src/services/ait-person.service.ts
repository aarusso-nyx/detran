// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
