// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
import { Injectable } from '@nestjs/common';
import { AlcoholRefusalRepository } from '../repositories/alcohol-refusal.repository.js';
import type { AlcoholRefusal } from '../entities/alcohol-refusal.entity.js';
import type { CreateAlcoholRefusalDto } from '../dto/create-alcohol-refusal.dto.js';

@Injectable()
export class AlcoholRefusalService {
  constructor(private readonly repository: AlcoholRefusalRepository) {}
  findAll(): Promise<AlcoholRefusal[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AlcoholRefusal> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlcoholRefusalDto): Promise<AlcoholRefusal> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAlcoholRefusalDto>,
  ): Promise<AlcoholRefusal> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
