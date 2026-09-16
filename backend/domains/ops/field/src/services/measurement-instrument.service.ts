// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
import { Injectable } from '@nestjs/common';
import { MeasurementInstrumentRepository } from '../repositories/measurement-instrument.repository.js';
import type { MeasurementInstrument } from '../entities/measurement-instrument.entity.js';
import type { CreateMeasurementInstrumentDto } from '../dto/create-measurement-instrument.dto.js';

@Injectable()
export class MeasurementInstrumentService {
  constructor(private readonly repository: MeasurementInstrumentRepository) {}
  findAll(): Promise<MeasurementInstrument[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MeasurementInstrument> {
    return this.repository.findOne(id);
  }
  create(dto: CreateMeasurementInstrumentDto): Promise<MeasurementInstrument> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMeasurementInstrumentDto>,
  ): Promise<MeasurementInstrument> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
