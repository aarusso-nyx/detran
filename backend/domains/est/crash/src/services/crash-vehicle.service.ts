// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
