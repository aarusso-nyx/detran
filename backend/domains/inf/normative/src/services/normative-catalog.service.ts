// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
