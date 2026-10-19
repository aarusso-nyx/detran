// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
