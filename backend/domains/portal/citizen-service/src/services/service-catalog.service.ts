// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
import { Injectable } from '@nestjs/common';
import { ServiceCatalogRepository } from '../repositories/service-catalog.repository.js';
import type { ServiceCatalog } from '../entities/service-catalog.entity.js';
import type { CreateServiceCatalogDto } from '../dto/create-service-catalog.dto.js';

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly repository: ServiceCatalogRepository) {}
  findAll(): Promise<ServiceCatalog[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ServiceCatalog> {
    return this.repository.findOne(id);
  }
  create(dto: CreateServiceCatalogDto): Promise<ServiceCatalog> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateServiceCatalogDto>,
  ): Promise<ServiceCatalog> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
