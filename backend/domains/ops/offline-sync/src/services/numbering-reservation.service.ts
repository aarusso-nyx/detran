// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
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
