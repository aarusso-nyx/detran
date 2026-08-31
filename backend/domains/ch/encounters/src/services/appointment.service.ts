// Generated from BP-CH-ENCOUNTERS-001 v1.0.0 sha256:a45f4d9aa68b80d085d4e052deb019f227158b561404fdd7e02b5260b8347912
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
