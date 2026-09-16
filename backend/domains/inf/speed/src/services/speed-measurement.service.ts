// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
import { Injectable } from '@nestjs/common';
import { SpeedMeasurementRepository } from '../repositories/speed-measurement.repository.js';
import type { SpeedMeasurement } from '../entities/speed-measurement.entity.js';
import type { CreateSpeedMeasurementDto } from '../dto/create-speed-measurement.dto.js';

@Injectable()
export class SpeedMeasurementService {
  constructor(private readonly repository: SpeedMeasurementRepository) {}
  findAll(): Promise<SpeedMeasurement[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SpeedMeasurement> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSpeedMeasurementDto): Promise<SpeedMeasurement> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSpeedMeasurementDto>,
  ): Promise<SpeedMeasurement> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
