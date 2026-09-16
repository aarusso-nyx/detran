// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
