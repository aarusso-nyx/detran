// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
import { Injectable } from '@nestjs/common';
import { HomologationRepository } from '../repositories/homologation.repository.js';
import type { Homologation } from '../entities/homologation.entity.js';
import type { CreateHomologationDto } from '../dto/create-homologation.dto.js';

@Injectable()
export class HomologationService {
  constructor(private readonly repository: HomologationRepository) {}
  findAll(): Promise<Homologation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Homologation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateHomologationDto): Promise<Homologation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateHomologationDto>,
  ): Promise<Homologation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
