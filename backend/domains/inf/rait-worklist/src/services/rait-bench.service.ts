// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
