// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { AlertTrailRepository } from '../repositories/alert-trail.repository.js';
import type { AlertTrail } from '../entities/alert-trail.entity.js';
import type { CreateAlertTrailDto } from '../dto/create-alert-trail.dto.js';

@Injectable()
export class AlertTrailService {
  constructor(private readonly repository: AlertTrailRepository) {}
  findAll(): Promise<AlertTrail[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AlertTrail> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlertTrailDto): Promise<AlertTrail> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAlertTrailDto>): Promise<AlertTrail> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
