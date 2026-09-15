// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
