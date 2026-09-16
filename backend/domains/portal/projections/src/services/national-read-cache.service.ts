// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
import { Injectable } from '@nestjs/common';
import { NationalReadCacheRepository } from '../repositories/national-read-cache.repository.js';
import type { NationalReadCache } from '../entities/national-read-cache.entity.js';
import type { CreateNationalReadCacheDto } from '../dto/create-national-read-cache.dto.js';

@Injectable()
export class NationalReadCacheService {
  constructor(private readonly repository: NationalReadCacheRepository) {}
  findAll(): Promise<NationalReadCache[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<NationalReadCache> {
    return this.repository.findOne(id);
  }
  create(dto: CreateNationalReadCacheDto): Promise<NationalReadCache> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateNationalReadCacheDto>,
  ): Promise<NationalReadCache> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
