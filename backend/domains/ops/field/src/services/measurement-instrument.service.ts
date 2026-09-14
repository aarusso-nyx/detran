// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
