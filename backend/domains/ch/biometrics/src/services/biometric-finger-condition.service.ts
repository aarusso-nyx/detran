// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
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
