// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Injectable } from '@nestjs/common';
import { SourceRepository } from '../repositories/source.repository.js';
import type { Source } from '../entities/source.entity.js';
import type { CreateSourceDto } from '../dto/create-source.dto.js';

@Injectable()
export class SourceService {
  constructor(private readonly repository: SourceRepository) {}
  findAll(): Promise<Source[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<Source> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSourceDto): Promise<Source> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateSourceDto>): Promise<Source> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
