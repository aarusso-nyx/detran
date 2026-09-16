// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
