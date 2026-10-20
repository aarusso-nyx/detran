// Generated from BP-CH-ENCOUNTERS-001 v1.2.1 sha256:b72b0b7aad32b908d777d9b44b885244d74a7a214c442fecc03551811f18b2fd
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
