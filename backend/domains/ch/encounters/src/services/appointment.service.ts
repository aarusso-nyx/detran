// Generated from BP-CH-ENCOUNTERS-001 v1.1.0 sha256:7931238eb7e2720ab74ab9e327a65f946e9feb0fd555a8658cbf413e7db8b48b
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
