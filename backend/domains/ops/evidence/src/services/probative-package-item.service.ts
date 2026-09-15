// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
