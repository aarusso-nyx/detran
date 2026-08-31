// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
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
