// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
