// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
import { Injectable } from '@nestjs/common';
import { DutyRepository } from '../repositories/duty.repository.js';
import type { Duty } from '../entities/duty.entity.js';
import type { CreateDutyDto } from '../dto/create-duty.dto.js';

@Injectable()
export class DutyService {
  constructor(private readonly repository: DutyRepository) {}
  findAll(): Promise<Duty[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Duty> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDutyDto): Promise<Duty> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDutyDto>): Promise<Duty> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
