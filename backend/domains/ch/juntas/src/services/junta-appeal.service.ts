// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
import { Injectable } from '@nestjs/common';
import { JuntaAppealRepository } from '../repositories/junta-appeal.repository.js';
import type { JuntaAppeal } from '../entities/junta-appeal.entity.js';
import type { CreateJuntaAppealDto } from '../dto/create-junta-appeal.dto.js';

@Injectable()
export class JuntaAppealService {
  constructor(private readonly repository: JuntaAppealRepository) {}
  findAll(): Promise<JuntaAppeal[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<JuntaAppeal> {
    return this.repository.findOne(id);
  }
  create(dto: CreateJuntaAppealDto): Promise<JuntaAppeal> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateJuntaAppealDto>): Promise<JuntaAppeal> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
