// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
