// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
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
