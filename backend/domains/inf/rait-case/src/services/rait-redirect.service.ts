// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
import { Injectable } from '@nestjs/common';
import { RaitRedirectRepository } from '../repositories/rait-redirect.repository.js';
import type { RaitRedirect } from '../entities/rait-redirect.entity.js';
import type { CreateRaitRedirectDto } from '../dto/create-rait-redirect.dto.js';

@Injectable()
export class RaitRedirectService {
  constructor(private readonly repository: RaitRedirectRepository) {}
  findAll(): Promise<RaitRedirect[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitRedirect> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitRedirectDto): Promise<RaitRedirect> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitRedirectDto>,
  ): Promise<RaitRedirect> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
