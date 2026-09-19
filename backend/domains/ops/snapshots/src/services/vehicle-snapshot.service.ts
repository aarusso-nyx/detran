// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
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
