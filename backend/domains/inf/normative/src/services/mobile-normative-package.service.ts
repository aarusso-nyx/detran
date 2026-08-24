// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:8f7f7c36486cc7f2062f87bdfda6722994b3aff5dc8e5b80183ffea196fad19f
import { Injectable } from '@nestjs/common';
import { MobileNormativePackageRepository } from '../repositories/mobile-normative-package.repository.js';
import type { MobileNormativePackage } from '../entities/mobile-normative-package.entity.js';
import type { CreateMobileNormativePackageDto } from '../dto/create-mobile-normative-package.dto.js';

@Injectable()
export class MobileNormativePackageService {
  constructor(private readonly repository: MobileNormativePackageRepository) {}
  findAll(): Promise<MobileNormativePackage[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<MobileNormativePackage> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateMobileNormativePackageDto,
  ): Promise<MobileNormativePackage> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateMobileNormativePackageDto>,
  ): Promise<MobileNormativePackage> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
