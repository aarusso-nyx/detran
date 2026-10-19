// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitClockAlertRepository } from '../repositories/rait-clock-alert.repository.js';
import type { RaitClockAlert } from '../entities/rait-clock-alert.entity.js';
import type { CreateRaitClockAlertDto } from '../dto/create-rait-clock-alert.dto.js';

@Injectable()
export class RaitClockAlertService {
  constructor(private readonly repository: RaitClockAlertRepository) {}
  findAll(): Promise<RaitClockAlert[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitClockAlert> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitClockAlertDto): Promise<RaitClockAlert> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitClockAlertDto>,
  ): Promise<RaitClockAlert> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
