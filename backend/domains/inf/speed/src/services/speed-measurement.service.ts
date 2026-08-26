// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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
