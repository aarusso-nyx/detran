// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
import { Injectable } from '@nestjs/common';
import { AlcoholProcedureRepository } from '../repositories/alcohol-procedure.repository.js';
import type { AlcoholProcedure } from '../entities/alcohol-procedure.entity.js';
import type { CreateAlcoholProcedureDto } from '../dto/create-alcohol-procedure.dto.js';

@Injectable()
export class AlcoholProcedureService {
  constructor(private readonly repository: AlcoholProcedureRepository) {}
  findAll(): Promise<AlcoholProcedure[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AlcoholProcedure> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAlcoholProcedureDto): Promise<AlcoholProcedure> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateAlcoholProcedureDto>,
  ): Promise<AlcoholProcedure> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
