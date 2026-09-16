// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
