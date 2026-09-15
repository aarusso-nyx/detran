// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
import { Injectable } from '@nestjs/common';
import { VehicleInventoryRepository } from '../repositories/vehicle-inventory.repository.js';
import type { VehicleInventory } from '../entities/vehicle-inventory.entity.js';
import type { CreateVehicleInventoryDto } from '../dto/create-vehicle-inventory.dto.js';

@Injectable()
export class VehicleInventoryService {
  constructor(private readonly repository: VehicleInventoryRepository) {}
  findAll(): Promise<VehicleInventory[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<VehicleInventory> {
    return this.repository.findOne(id);
  }
  create(dto: CreateVehicleInventoryDto): Promise<VehicleInventory> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateVehicleInventoryDto>,
  ): Promise<VehicleInventory> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
