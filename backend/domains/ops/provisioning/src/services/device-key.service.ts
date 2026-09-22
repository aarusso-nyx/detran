// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Injectable } from '@nestjs/common';
import { DeviceKeyRepository } from '../repositories/device-key.repository.js';
import type { DeviceKey } from '../entities/device-key.entity.js';
import type { CreateDeviceKeyDto } from '../dto/create-device-key.dto.js';

@Injectable()
export class DeviceKeyService {
  constructor(private readonly repository: DeviceKeyRepository) {}
  findAll(): Promise<DeviceKey[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DeviceKey> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDeviceKeyDto): Promise<DeviceKey> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDeviceKeyDto>): Promise<DeviceKey> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
