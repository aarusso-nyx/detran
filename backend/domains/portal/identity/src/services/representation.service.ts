// Generated from BP-PORTAL-IDENTITY-001 v1.0.1 sha256:1a840b3372310d8bdecab94f05cd0978fdb1f53e677cc55361bf6d6f479c723c
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
