// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repositories/vehicle.repository.js';
import type { Vehicle } from '../entities/vehicle.entity.js';
import type { CreateVehicleDto } from '../dto/create-vehicle.dto.js';

@Injectable()
export class VehicleService {
  constructor(private readonly repository: VehicleRepository) {}
  findAll(): Promise<Vehicle[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Vehicle> {
    return this.repository.findOne(id);
  }
  create(dto: CreateVehicleDto): Promise<Vehicle> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateVehicleDto>): Promise<Vehicle> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
