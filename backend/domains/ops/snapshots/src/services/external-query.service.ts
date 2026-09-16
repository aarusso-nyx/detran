// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
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
