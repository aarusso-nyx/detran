// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
import { Injectable } from '@nestjs/common';
import { RaitBenchRepository } from '../repositories/rait-bench.repository.js';
import type { RaitBench } from '../entities/rait-bench.entity.js';
import type { CreateRaitBenchDto } from '../dto/create-rait-bench.dto.js';

@Injectable()
export class RaitBenchService {
  constructor(private readonly repository: RaitBenchRepository) {}
  findAll(): Promise<RaitBench[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBench> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBenchDto): Promise<RaitBench> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitBenchDto>): Promise<RaitBench> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
