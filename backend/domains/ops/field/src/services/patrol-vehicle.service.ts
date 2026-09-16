// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
