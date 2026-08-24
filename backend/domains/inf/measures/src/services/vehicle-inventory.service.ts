// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
