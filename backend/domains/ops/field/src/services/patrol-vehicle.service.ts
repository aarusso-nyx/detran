// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
