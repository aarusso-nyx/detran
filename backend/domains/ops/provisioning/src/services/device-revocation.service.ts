// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Injectable } from '@nestjs/common';
import { DeviceRevocationRepository } from '../repositories/device-revocation.repository.js';
import type { DeviceRevocation } from '../entities/device-revocation.entity.js';
import type { CreateDeviceRevocationDto } from '../dto/create-device-revocation.dto.js';

@Injectable()
export class DeviceRevocationService {
  constructor(private readonly repository: DeviceRevocationRepository) {}
  findAll(): Promise<DeviceRevocation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DeviceRevocation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDeviceRevocationDto): Promise<DeviceRevocation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateDeviceRevocationDto>,
  ): Promise<DeviceRevocation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
