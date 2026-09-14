// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
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
