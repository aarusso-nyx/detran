// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
import { Injectable } from '@nestjs/common';
import { ManifestationExtensionRepository } from '../repositories/manifestation-extension.repository.js';
import type { ManifestationExtension } from '../entities/manifestation-extension.entity.js';
import type { CreateManifestationExtensionDto } from '../dto/create-manifestation-extension.dto.js';

@Injectable()
export class ManifestationExtensionService {
  constructor(private readonly repository: ManifestationExtensionRepository) {}
  findAll(): Promise<ManifestationExtension[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ManifestationExtension> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateManifestationExtensionDto,
  ): Promise<ManifestationExtension> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateManifestationExtensionDto>,
  ): Promise<ManifestationExtension> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
