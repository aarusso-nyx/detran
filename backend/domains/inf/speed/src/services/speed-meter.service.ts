// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
import { Injectable } from '@nestjs/common';
import { SpeedMeterRepository } from '../repositories/speed-meter.repository.js';
import type { SpeedMeter } from '../entities/speed-meter.entity.js';
import type { CreateSpeedMeterDto } from '../dto/create-speed-meter.dto.js';

@Injectable()
export class SpeedMeterService {
  constructor(private readonly repository: SpeedMeterRepository) {}
  findAll(): Promise<SpeedMeter[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SpeedMeter> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSpeedMeterDto): Promise<SpeedMeter> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateSpeedMeterDto>): Promise<SpeedMeter> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
