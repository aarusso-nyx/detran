// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
