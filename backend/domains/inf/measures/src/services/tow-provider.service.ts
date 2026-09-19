// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
import { Injectable } from '@nestjs/common';
import { TowProviderRepository } from '../repositories/tow-provider.repository.js';
import type { TowProvider } from '../entities/tow-provider.entity.js';
import type { CreateTowProviderDto } from '../dto/create-tow-provider.dto.js';

@Injectable()
export class TowProviderService {
  constructor(private readonly repository: TowProviderRepository) {}
  findAll(): Promise<TowProvider[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<TowProvider> {
    return this.repository.findOne(id);
  }
  create(dto: CreateTowProviderDto): Promise<TowProvider> {
    return this.repository.create(dto);
  }
  update(id: string, dto: Partial<CreateTowProviderDto>): Promise<TowProvider> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
