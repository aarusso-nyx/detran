// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
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
