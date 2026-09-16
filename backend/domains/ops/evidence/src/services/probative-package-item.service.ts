// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
