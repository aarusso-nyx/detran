// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
import { Injectable } from '@nestjs/common';
import { OperationalDeviceRepository } from '../repositories/operational-device.repository.js';
import type { OperationalDevice } from '../entities/operational-device.entity.js';
import type { CreateOperationalDeviceDto } from '../dto/create-operational-device.dto.js';

@Injectable()
export class OperationalDeviceService {
  constructor(private readonly repository: OperationalDeviceRepository) {}
  findAll(): Promise<OperationalDevice[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<OperationalDevice> {
    return this.repository.findOne(id);
  }
  create(dto: CreateOperationalDeviceDto): Promise<OperationalDevice> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateOperationalDeviceDto>,
  ): Promise<OperationalDevice> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
