// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
import { Injectable } from '@nestjs/common';
import { EpisodeExportRepository } from '../repositories/episode-export.repository.js';
import type { EpisodeExport } from '../entities/episode-export.entity.js';
import type { CreateEpisodeExportDto } from '../dto/create-episode-export.dto.js';

@Injectable()
export class EpisodeExportService {
  constructor(private readonly repository: EpisodeExportRepository) {}
  findAll(): Promise<EpisodeExport[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<EpisodeExport> {
    return this.repository.findOne(id);
  }
  create(dto: CreateEpisodeExportDto): Promise<EpisodeExport> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateEpisodeExportDto>,
  ): Promise<EpisodeExport> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
