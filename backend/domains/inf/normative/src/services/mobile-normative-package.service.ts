// Generated from BP-INF-NORMATIVE-001 v1.1.0 sha256:79161caba1463941727a4a6ad952f010c399cca7df3febfa1cf881ac14c7ca52
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
