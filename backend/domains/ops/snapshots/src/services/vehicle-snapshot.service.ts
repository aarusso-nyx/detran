// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
import { Injectable } from '@nestjs/common';
import { VehicleSnapshotRepository } from '../repositories/vehicle-snapshot.repository.js';
import type { VehicleSnapshot } from '../entities/vehicle-snapshot.entity.js';
import type { CreateVehicleSnapshotDto } from '../dto/create-vehicle-snapshot.dto.js';

@Injectable()
export class VehicleSnapshotService {
  constructor(private readonly repository: VehicleSnapshotRepository) {}
  findAll(): Promise<VehicleSnapshot[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<VehicleSnapshot> {
    return this.repository.findOne(id);
  }
  create(dto: CreateVehicleSnapshotDto): Promise<VehicleSnapshot> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateVehicleSnapshotDto>,
  ): Promise<VehicleSnapshot> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
