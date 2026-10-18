// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
import { Injectable } from '@nestjs/common';
import { SyncConflictRepository } from '../repositories/sync-conflict.repository.js';
import type { SyncConflict } from '../entities/sync-conflict.entity.js';
import type { CreateSyncConflictDto } from '../dto/create-sync-conflict.dto.js';

@Injectable()
export class SyncConflictService {
  constructor(private readonly repository: SyncConflictRepository) {}
  findAll(): Promise<SyncConflict[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<SyncConflict> {
    return this.repository.findOne(id);
  }
  create(dto: CreateSyncConflictDto): Promise<SyncConflict> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateSyncConflictDto>,
  ): Promise<SyncConflict> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
