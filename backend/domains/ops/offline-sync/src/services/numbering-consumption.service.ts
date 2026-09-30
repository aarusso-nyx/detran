// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
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
