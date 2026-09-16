// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.0 sha256:adb8933e9c3c31077273c68bff12efa5e0bfefa8843cdc29798c6d43fa63a246
import { Injectable } from '@nestjs/common';
import { ManifestationRepository } from '../repositories/manifestation.repository.js';
import type { Manifestation } from '../entities/manifestation.entity.js';
import type { CreateManifestationDto } from '../dto/create-manifestation.dto.js';

@Injectable()
export class ManifestationService {
  constructor(private readonly repository: ManifestationRepository) {}
  findAll(): Promise<Manifestation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Manifestation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateManifestationDto): Promise<Manifestation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateManifestationDto>,
  ): Promise<Manifestation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
