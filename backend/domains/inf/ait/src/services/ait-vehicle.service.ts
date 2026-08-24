// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
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
