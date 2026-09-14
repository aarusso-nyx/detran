// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
import { Injectable } from '@nestjs/common';
import { DeviceEventRepository } from '../repositories/device-event.repository.js';
import type { DeviceEvent } from '../entities/device-event.entity.js';
import type { CreateDeviceEventDto } from '../dto/create-device-event.dto.js';

@Injectable()
export class DeviceEventService {
  constructor(private readonly repository: DeviceEventRepository) {}
  findAll(): Promise<DeviceEvent[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<DeviceEvent> {
    return this.repository.findOne(id);
  }
  create(dto: CreateDeviceEventDto): Promise<DeviceEvent> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateDeviceEventDto>): Promise<DeviceEvent> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
