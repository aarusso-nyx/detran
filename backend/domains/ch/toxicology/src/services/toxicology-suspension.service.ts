// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
import { Injectable } from '@nestjs/common';
import { ToxicologySuspensionRepository } from '../repositories/toxicology-suspension.repository.js';
import type { ToxicologySuspension } from '../entities/toxicology-suspension.entity.js';
import type { CreateToxicologySuspensionDto } from '../dto/create-toxicology-suspension.dto.js';

@Injectable()
export class ToxicologySuspensionService {
  constructor(private readonly repository: ToxicologySuspensionRepository) {}
  findAll(): Promise<ToxicologySuspension[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ToxicologySuspension> {
    return this.repository.findOne(id);
  }
  create(dto: CreateToxicologySuspensionDto): Promise<ToxicologySuspension> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateToxicologySuspensionDto>,
  ): Promise<ToxicologySuspension> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
