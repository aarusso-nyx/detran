// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
