// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
