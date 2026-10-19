// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
