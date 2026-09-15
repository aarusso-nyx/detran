// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
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
