// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
import { Injectable } from '@nestjs/common';
import { ProbativePackageRepository } from '../repositories/probative-package.repository.js';
import type { ProbativePackage } from '../entities/probative-package.entity.js';
import type { CreateProbativePackageDto } from '../dto/create-probative-package.dto.js';

@Injectable()
export class ProbativePackageService {
  constructor(private readonly repository: ProbativePackageRepository) {}
  findAll(): Promise<ProbativePackage[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProbativePackage> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProbativePackageDto): Promise<ProbativePackage> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProbativePackageDto>,
  ): Promise<ProbativePackage> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
