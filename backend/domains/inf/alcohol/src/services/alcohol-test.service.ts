// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
import { Injectable } from '@nestjs/common';
import { AlcoholTestRepository } from '../repositories/alcohol-test.repository.js';
import type { AlcoholTest } from '../entities/alcohol-test.entity.js';
import type { CreateAlcoholTestDto } from '../dto/create-alcohol-test.dto.js';

@Injectable()
export class AlcoholTestService {
  constructor(private readonly repository: AlcoholTestRepository) {}
  findAll(): Promise<AlcoholTest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AlcoholTest> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlcoholTestDto): Promise<AlcoholTest> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAlcoholTestDto>): Promise<AlcoholTest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
