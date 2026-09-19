// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
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
