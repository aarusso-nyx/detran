// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
