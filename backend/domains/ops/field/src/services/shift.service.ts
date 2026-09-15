// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
