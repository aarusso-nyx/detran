// Generated from BP-CH-SCHEDULING-001 v1.0.0 sha256:fdbac09747b1d01ea1aa90821a792d537064443364d6a193ca6df5575d591513
import { Injectable } from '@nestjs/common';
import { AppointmentAssignmentDrawRepository } from '../repositories/appointment-assignment-draw.repository.js';
import type { AppointmentAssignmentDraw } from '../entities/appointment-assignment-draw.entity.js';
import type { CreateAppointmentAssignmentDrawDto } from '../dto/create-appointment-assignment-draw.dto.js';

@Injectable()
export class AppointmentAssignmentDrawService {
  constructor(
    private readonly repository: AppointmentAssignmentDrawRepository,
  ) {}
  findAll(): Promise<AppointmentAssignmentDraw[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AppointmentAssignmentDraw> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateAppointmentAssignmentDrawDto,
  ): Promise<AppointmentAssignmentDraw> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAppointmentAssignmentDrawDto>,
  ): Promise<AppointmentAssignmentDraw> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
