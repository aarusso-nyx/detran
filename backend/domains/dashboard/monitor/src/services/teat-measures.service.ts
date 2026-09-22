// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
