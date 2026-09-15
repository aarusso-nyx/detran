// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
import { Injectable } from '@nestjs/common';
import { ProbativePackageItemRepository } from '../repositories/probative-package-item.repository.js';
import type { ProbativePackageItem } from '../entities/probative-package-item.entity.js';
import type { CreateProbativePackageItemDto } from '../dto/create-probative-package-item.dto.js';

@Injectable()
export class ProbativePackageItemService {
  constructor(private readonly repository: ProbativePackageItemRepository) {}
  findAll(): Promise<ProbativePackageItem[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProbativePackageItem> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProbativePackageItemDto): Promise<ProbativePackageItem> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProbativePackageItemDto>,
  ): Promise<ProbativePackageItem> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
