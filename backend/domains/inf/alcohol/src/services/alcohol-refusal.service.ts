// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
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
