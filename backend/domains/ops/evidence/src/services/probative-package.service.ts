// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
