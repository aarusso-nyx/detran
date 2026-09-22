// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Injectable } from '@nestjs/common';
import { ProvisioningPackageRepository } from '../repositories/provisioning-package.repository.js';
import type { ProvisioningPackage } from '../entities/provisioning-package.entity.js';
import type { CreateProvisioningPackageDto } from '../dto/create-provisioning-package.dto.js';

@Injectable()
export class ProvisioningPackageService {
  constructor(private readonly repository: ProvisioningPackageRepository) {}
  findAll(): Promise<ProvisioningPackage[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningPackage> {
    return this.repository.findOne(id);
  }
  create(dto: CreateProvisioningPackageDto): Promise<ProvisioningPackage> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningPackageDto>,
  ): Promise<ProvisioningPackage> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
