// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:0eae9fa8ccfb086eba21de22f3a9d379e0256092be9e903b2c7feea4c664ec92
import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository.js';
import type { Appointment } from '../entities/appointment.entity.js';
import type { CreateAppointmentDto } from '../dto/create-appointment.dto.js';

@Injectable()
export class AppointmentService {
  constructor(private readonly repository: AppointmentRepository) {}
  findAll(): Promise<Appointment[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Appointment> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAppointmentDto): Promise<Appointment> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAppointmentDto>): Promise<Appointment> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
