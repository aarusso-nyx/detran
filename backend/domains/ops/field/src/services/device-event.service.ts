// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
