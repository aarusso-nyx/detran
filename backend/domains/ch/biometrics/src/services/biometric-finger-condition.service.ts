// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
import { Injectable } from '@nestjs/common';
import { BiometricFingerConditionRepository } from '../repositories/biometric-finger-condition.repository.js';
import type { BiometricFingerCondition } from '../entities/biometric-finger-condition.entity.js';
import type { CreateBiometricFingerConditionDto } from '../dto/create-biometric-finger-condition.dto.js';

@Injectable()
export class BiometricFingerConditionService {
  constructor(
    private readonly repository: BiometricFingerConditionRepository,
  ) {}
  findAll(): Promise<BiometricFingerCondition[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricFingerCondition> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateBiometricFingerConditionDto,
  ): Promise<BiometricFingerCondition> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricFingerConditionDto>,
  ): Promise<BiometricFingerCondition> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
