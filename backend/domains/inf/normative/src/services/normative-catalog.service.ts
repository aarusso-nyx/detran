// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:9312d2d0009dca8a9a345b86aa4cda330d2bed8e98072f5036909160f5017d1c
import { Injectable } from '@nestjs/common';
import { NormativeCatalogRepository } from '../repositories/normative-catalog.repository.js';
import type { NormativeCatalog } from '../entities/normative-catalog.entity.js';
import type { CreateNormativeCatalogDto } from '../dto/create-normative-catalog.dto.js';

@Injectable()
export class NormativeCatalogService {
  constructor(private readonly repository: NormativeCatalogRepository) {}
  findAll(): Promise<NormativeCatalog[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NormativeCatalog> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNormativeCatalogDto): Promise<NormativeCatalog> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNormativeCatalogDto>,
  ): Promise<NormativeCatalog> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
