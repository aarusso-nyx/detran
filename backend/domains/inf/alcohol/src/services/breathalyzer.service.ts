// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
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
