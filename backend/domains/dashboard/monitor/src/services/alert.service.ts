// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { AlertRepository } from '../repositories/alert.repository.js';
import type { Alert } from '../entities/alert.entity.js';
import type { CreateAlertDto } from '../dto/create-alert.dto.js';

@Injectable()
export class AlertService {
  constructor(private readonly repository: AlertRepository) {}
  findAll(): Promise<Alert[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Alert> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlertDto): Promise<Alert> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAlertDto>): Promise<Alert> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
