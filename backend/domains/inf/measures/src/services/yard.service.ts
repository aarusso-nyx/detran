// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
