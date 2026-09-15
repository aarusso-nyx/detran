// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
