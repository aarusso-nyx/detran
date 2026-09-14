// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
import { Injectable } from '@nestjs/common';
import { NumberingConsumptionRepository } from '../repositories/numbering-consumption.repository.js';
import type { NumberingConsumption } from '../entities/numbering-consumption.entity.js';
import type { CreateNumberingConsumptionDto } from '../dto/create-numbering-consumption.dto.js';

@Injectable()
export class NumberingConsumptionService {
  constructor(private readonly repository: NumberingConsumptionRepository) {}
  findAll(): Promise<NumberingConsumption[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NumberingConsumption> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNumberingConsumptionDto): Promise<NumberingConsumption> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNumberingConsumptionDto>,
  ): Promise<NumberingConsumption> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
