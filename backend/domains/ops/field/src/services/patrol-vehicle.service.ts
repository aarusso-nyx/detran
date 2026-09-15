// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
import { Injectable } from '@nestjs/common';
import { PatrolVehicleRepository } from '../repositories/patrol-vehicle.repository.js';
import type { PatrolVehicle } from '../entities/patrol-vehicle.entity.js';
import type { CreatePatrolVehicleDto } from '../dto/create-patrol-vehicle.dto.js';

@Injectable()
export class PatrolVehicleService {
  constructor(private readonly repository: PatrolVehicleRepository) {}
  findAll(): Promise<PatrolVehicle[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<PatrolVehicle> {
    return this.repository.findOne(id);
  }
  create(dto: CreatePatrolVehicleDto): Promise<PatrolVehicle> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreatePatrolVehicleDto>,
  ): Promise<PatrolVehicle> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
