// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
