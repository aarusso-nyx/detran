// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
import { Injectable } from '@nestjs/common';
import { CrashVehicleRepository } from '../repositories/crash-vehicle.repository.js';
import type { CrashVehicle } from '../entities/crash-vehicle.entity.js';
import type { CreateCrashVehicleDto } from '../dto/create-crash-vehicle.dto.js';

@Injectable()
export class CrashVehicleService {
  constructor(private readonly repository: CrashVehicleRepository) {}
  findAll(): Promise<CrashVehicle[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<CrashVehicle> {
    return this.repository.findOne(id);
  }
  create(dto: CreateCrashVehicleDto): Promise<CrashVehicle> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateCrashVehicleDto>,
  ): Promise<CrashVehicle> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
