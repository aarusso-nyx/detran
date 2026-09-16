// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
