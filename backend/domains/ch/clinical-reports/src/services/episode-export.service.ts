// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
