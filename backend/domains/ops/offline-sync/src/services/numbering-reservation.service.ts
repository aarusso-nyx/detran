// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
import { Injectable } from '@nestjs/common';
import { NumberingReservationRepository } from '../repositories/numbering-reservation.repository.js';
import type { NumberingReservation } from '../entities/numbering-reservation.entity.js';
import type { CreateNumberingReservationDto } from '../dto/create-numbering-reservation.dto.js';

@Injectable()
export class NumberingReservationService {
  constructor(private readonly repository: NumberingReservationRepository) {}
  findAll(): Promise<NumberingReservation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NumberingReservation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNumberingReservationDto): Promise<NumberingReservation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNumberingReservationDto>,
  ): Promise<NumberingReservation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
