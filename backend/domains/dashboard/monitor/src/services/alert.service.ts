// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
