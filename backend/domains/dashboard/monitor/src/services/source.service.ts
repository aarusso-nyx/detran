// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
