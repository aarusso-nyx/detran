// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
import { Injectable } from '@nestjs/common';
import { ShiftRepository } from '../repositories/shift.repository.js';
import type { Shift } from '../entities/shift.entity.js';
import type { CreateShiftDto } from '../dto/create-shift.dto.js';

@Injectable()
export class ShiftService {
  constructor(private readonly repository: ShiftRepository) {}
  findAll(): Promise<Shift[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Shift> {
    return this.repository.findOne(id);
  }
  create(dto: CreateShiftDto): Promise<Shift> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateShiftDto>): Promise<Shift> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
