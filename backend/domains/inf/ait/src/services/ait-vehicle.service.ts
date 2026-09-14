// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
import { Injectable } from '@nestjs/common';
import { AitVehicleRepository } from '../repositories/ait-vehicle.repository.js';
import type { AitVehicle } from '../entities/ait-vehicle.entity.js';
import type { CreateAitVehicleDto } from '../dto/create-ait-vehicle.dto.js';

@Injectable()
export class AitVehicleService {
  constructor(private readonly repository: AitVehicleRepository) {}
  findAll(): Promise<AitVehicle[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<AitVehicle> {
    return this.repository.findOne(id);
  }
  create(dto: CreateAitVehicleDto): Promise<AitVehicle> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateAitVehicleDto>): Promise<AitVehicle> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
