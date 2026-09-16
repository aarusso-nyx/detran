// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
import { Injectable } from '@nestjs/common';
import { InfractionViewRepository } from '../repositories/infraction-view.repository.js';
import type { InfractionView } from '../entities/infraction-view.entity.js';
import type { CreateInfractionViewDto } from '../dto/create-infraction-view.dto.js';

@Injectable()
export class InfractionViewService {
  constructor(private readonly repository: InfractionViewRepository) {}
  findAll(): Promise<InfractionView[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<InfractionView> {
    return this.repository.findOne(id);
  }
  create(dto: CreateInfractionViewDto): Promise<InfractionView> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateInfractionViewDto>,
  ): Promise<InfractionView> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
