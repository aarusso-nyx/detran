// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
import { Injectable } from '@nestjs/common';
import { AitRepository } from '../repositories/ait.repository.js';
import type { Ait } from '../entities/ait.entity.js';
import type { CreateAitDto } from '../dto/create-ait.dto.js';

@Injectable()
export class AitService {
  constructor(private readonly repository: AitRepository) {}
  findAll(): Promise<Ait[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Ait> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitDto): Promise<Ait> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAitDto>): Promise<Ait> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
