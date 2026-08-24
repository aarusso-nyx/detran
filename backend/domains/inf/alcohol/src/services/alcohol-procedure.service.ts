// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
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
