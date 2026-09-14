// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
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
