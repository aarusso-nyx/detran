// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
