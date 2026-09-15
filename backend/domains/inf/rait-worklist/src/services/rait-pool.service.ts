// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
