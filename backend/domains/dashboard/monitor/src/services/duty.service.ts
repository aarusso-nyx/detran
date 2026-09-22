// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
