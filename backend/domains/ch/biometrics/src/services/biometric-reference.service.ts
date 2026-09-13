// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Injectable } from '@nestjs/common';
import { BiometricReferenceRepository } from '../repositories/biometric-reference.repository.js';
import type { BiometricReference } from '../entities/biometric-reference.entity.js';
import type { CreateBiometricReferenceDto } from '../dto/create-biometric-reference.dto.js';

@Injectable()
export class BiometricReferenceService {
  constructor(private readonly repository: BiometricReferenceRepository) {}
  findAll(): Promise<BiometricReference[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricReference> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiometricReferenceDto): Promise<BiometricReference> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricReferenceDto>,
  ): Promise<BiometricReference> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
