// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
