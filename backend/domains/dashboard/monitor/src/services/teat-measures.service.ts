// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { TeatMeasuresRepository } from '../repositories/teat-measures.repository.js';
import type { TeatMeasures } from '../entities/teat-measures.entity.js';
import type { CreateTeatMeasuresDto } from '../dto/create-teat-measures.dto.js';

@Injectable()
export class TeatMeasuresService {
  constructor(private readonly repository: TeatMeasuresRepository) {}
  findAll(): Promise<TeatMeasures[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<TeatMeasures> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTeatMeasuresDto): Promise<TeatMeasures> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateTeatMeasuresDto>,
  ): Promise<TeatMeasures> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
