// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
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
