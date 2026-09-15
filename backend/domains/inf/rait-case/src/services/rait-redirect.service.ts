// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
