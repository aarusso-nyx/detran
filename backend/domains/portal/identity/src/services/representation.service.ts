// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
import { Injectable } from '@nestjs/common';
import { RepresentationRepository } from '../repositories/representation.repository.js';
import type { Representation } from '../entities/representation.entity.js';
import type { CreateRepresentationDto } from '../dto/create-representation.dto.js';

@Injectable()
export class RepresentationService {
  constructor(private readonly repository: RepresentationRepository) {}
  findAll(): Promise<Representation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Representation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRepresentationDto): Promise<Representation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRepresentationDto>,
  ): Promise<Representation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
