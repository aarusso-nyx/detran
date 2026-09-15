// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
