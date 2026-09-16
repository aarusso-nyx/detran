// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
import { Injectable } from '@nestjs/common';
import { YardRepository } from '../repositories/yard.repository.js';
import type { Yard } from '../entities/yard.entity.js';
import type { CreateYardDto } from '../dto/create-yard.dto.js';

@Injectable()
export class YardService {
  constructor(private readonly repository: YardRepository) {}
  findAll(): Promise<Yard[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Yard> {
    return this.repository.findOne(id);
  }
  create(dto: CreateYardDto): Promise<Yard> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateYardDto>): Promise<Yard> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
