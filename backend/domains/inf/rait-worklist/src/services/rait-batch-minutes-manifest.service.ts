// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
import { Injectable } from '@nestjs/common';
import { RaitBatchMinutesManifestRepository } from '../repositories/rait-batch-minutes-manifest.repository.js';
import type { RaitBatchMinutesManifest } from '../entities/rait-batch-minutes-manifest.entity.js';
import type { CreateRaitBatchMinutesManifestDto } from '../dto/create-rait-batch-minutes-manifest.dto.js';

@Injectable()
export class RaitBatchMinutesManifestService {
  constructor(
    private readonly repository: RaitBatchMinutesManifestRepository,
  ) {}
  findAll(): Promise<RaitBatchMinutesManifest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBatchMinutesManifest> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitBatchMinutesManifestDto,
  ): Promise<RaitBatchMinutesManifest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitBatchMinutesManifestDto>,
  ): Promise<RaitBatchMinutesManifest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
