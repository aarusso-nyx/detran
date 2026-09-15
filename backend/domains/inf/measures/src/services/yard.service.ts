// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
