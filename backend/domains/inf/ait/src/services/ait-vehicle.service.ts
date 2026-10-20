// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
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
