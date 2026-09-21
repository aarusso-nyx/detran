// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
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
