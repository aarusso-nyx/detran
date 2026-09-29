// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
