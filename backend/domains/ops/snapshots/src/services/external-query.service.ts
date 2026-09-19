// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
import { Injectable } from '@nestjs/common';
import { ExternalQueryRepository } from '../repositories/external-query.repository.js';
import type { ExternalQuery } from '../entities/external-query.entity.js';
import type { CreateExternalQueryDto } from '../dto/create-external-query.dto.js';

@Injectable()
export class ExternalQueryService {
  constructor(private readonly repository: ExternalQueryRepository) {}
  findAll(): Promise<ExternalQuery[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ExternalQuery> {
    return this.repository.findOne(id);
  }
  create(dto: CreateExternalQueryDto): Promise<ExternalQuery> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateExternalQueryDto>,
  ): Promise<ExternalQuery> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
