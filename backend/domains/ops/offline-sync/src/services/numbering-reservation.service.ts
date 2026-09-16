// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
