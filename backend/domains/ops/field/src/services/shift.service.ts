// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
