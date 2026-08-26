// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
