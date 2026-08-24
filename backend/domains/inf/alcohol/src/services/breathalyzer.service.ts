// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
import { Injectable } from '@nestjs/common';
import { BreathalyzerRepository } from '../repositories/breathalyzer.repository.js';
import type { Breathalyzer } from '../entities/breathalyzer.entity.js';
import type { CreateBreathalyzerDto } from '../dto/create-breathalyzer.dto.js';

@Injectable()
export class BreathalyzerService {
  constructor(private readonly repository: BreathalyzerRepository) {}
  findAll(): Promise<Breathalyzer[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Breathalyzer> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBreathalyzerDto): Promise<Breathalyzer> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBreathalyzerDto>,
  ): Promise<Breathalyzer> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
