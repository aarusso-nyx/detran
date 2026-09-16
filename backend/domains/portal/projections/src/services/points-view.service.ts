// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
import { Injectable } from '@nestjs/common';
import { PointsViewRepository } from '../repositories/points-view.repository.js';
import type { PointsView } from '../entities/points-view.entity.js';
import type { CreatePointsViewDto } from '../dto/create-points-view.dto.js';

@Injectable()
export class PointsViewService {
  constructor(private readonly repository: PointsViewRepository) {}
  findAll(): Promise<PointsView[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PointsView> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePointsViewDto): Promise<PointsView> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreatePointsViewDto>): Promise<PointsView> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
