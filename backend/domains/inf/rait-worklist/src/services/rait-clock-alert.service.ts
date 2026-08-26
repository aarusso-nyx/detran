// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
