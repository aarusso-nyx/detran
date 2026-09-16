// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
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
