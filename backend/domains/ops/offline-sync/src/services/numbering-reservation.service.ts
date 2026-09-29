// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
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
