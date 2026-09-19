// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
import { Injectable } from '@nestjs/common';
import { RaitSessionMinutesManifestRepository } from '../repositories/rait-session-minutes-manifest.repository.js';
import type { RaitSessionMinutesManifest } from '../entities/rait-session-minutes-manifest.entity.js';
import type { CreateRaitSessionMinutesManifestDto } from '../dto/create-rait-session-minutes-manifest.dto.js';

@Injectable()
export class RaitSessionMinutesManifestService {
  constructor(
    private readonly repository: RaitSessionMinutesManifestRepository,
  ) {}
  findAll(): Promise<RaitSessionMinutesManifest[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitSessionMinutesManifest> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateRaitSessionMinutesManifestDto,
  ): Promise<RaitSessionMinutesManifest> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitSessionMinutesManifestDto>,
  ): Promise<RaitSessionMinutesManifest> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
