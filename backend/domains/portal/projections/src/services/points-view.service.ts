// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
