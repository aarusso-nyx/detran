// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
