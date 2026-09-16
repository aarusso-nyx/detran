// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
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
