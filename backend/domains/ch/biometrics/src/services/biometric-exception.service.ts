// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Injectable } from '@nestjs/common';
import { BiometricExceptionRepository } from '../repositories/biometric-exception.repository.js';
import type { BiometricException } from '../entities/biometric-exception.entity.js';
import type { CreateBiometricExceptionDto } from '../dto/create-biometric-exception.dto.js';

@Injectable()
export class BiometricExceptionService {
  constructor(private readonly repository: BiometricExceptionRepository) {}
  findAll(): Promise<BiometricException[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricException> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiometricExceptionDto): Promise<BiometricException> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricExceptionDto>,
  ): Promise<BiometricException> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
