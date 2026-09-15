// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
