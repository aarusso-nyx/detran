// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
import { Injectable } from '@nestjs/common';
import { RaitBatchDrawSnapshotRepository } from '../repositories/rait-batch-draw-snapshot.repository.js';
import type { RaitBatchDrawSnapshot } from '../entities/rait-batch-draw-snapshot.entity.js';
import type { CreateRaitBatchDrawSnapshotDto } from '../dto/create-rait-batch-draw-snapshot.dto.js';

@Injectable()
export class RaitBatchDrawSnapshotService {
  constructor(private readonly repository: RaitBatchDrawSnapshotRepository) {}
  findAll(): Promise<RaitBatchDrawSnapshot[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<RaitBatchDrawSnapshot> {
    return this.repository.findOne(id);
  }
  create(dto: CreateRaitBatchDrawSnapshotDto): Promise<RaitBatchDrawSnapshot> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateRaitBatchDrawSnapshotDto>,
  ): Promise<RaitBatchDrawSnapshot> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
