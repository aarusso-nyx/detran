// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
import { Injectable } from '@nestjs/common';
import { RaitPoolRepository } from '../repositories/rait-pool.repository.js';
import type { RaitPool } from '../entities/rait-pool.entity.js';
import type { CreateRaitPoolDto } from '../dto/create-rait-pool.dto.js';

@Injectable()
export class RaitPoolService {
  constructor(private readonly repository: RaitPoolRepository) {}
  findAll(): Promise<RaitPool[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitPool> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitPoolDto): Promise<RaitPool> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateRaitPoolDto>): Promise<RaitPool> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
