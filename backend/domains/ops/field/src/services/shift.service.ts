// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
