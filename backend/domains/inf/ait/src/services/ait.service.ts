// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
