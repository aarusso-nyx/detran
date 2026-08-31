// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Injectable } from '@nestjs/common';
import { BiometricCheckRepository } from '../repositories/biometric-check.repository.js';
import type { BiometricCheck } from '../entities/biometric-check.entity.js';
import type { CreateBiometricCheckDto } from '../dto/create-biometric-check.dto.js';

@Injectable()
export class BiometricCheckService {
  constructor(private readonly repository: BiometricCheckRepository) {}
  findAll(): Promise<BiometricCheck[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricCheck> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiometricCheckDto): Promise<BiometricCheck> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricCheckDto>,
  ): Promise<BiometricCheck> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
