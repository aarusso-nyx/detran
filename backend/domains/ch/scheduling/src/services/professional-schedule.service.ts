// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
import { Injectable } from '@nestjs/common';
import { ProfessionalScheduleRepository } from '../repositories/professional-schedule.repository.js';
import type { ProfessionalSchedule } from '../entities/professional-schedule.entity.js';
import type { CreateProfessionalScheduleDto } from '../dto/create-professional-schedule.dto.js';

@Injectable()
export class ProfessionalScheduleService {
  constructor(private readonly repository: ProfessionalScheduleRepository) {}
  findAll(): Promise<ProfessionalSchedule[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProfessionalSchedule> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProfessionalScheduleDto): Promise<ProfessionalSchedule> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProfessionalScheduleDto>,
  ): Promise<ProfessionalSchedule> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
