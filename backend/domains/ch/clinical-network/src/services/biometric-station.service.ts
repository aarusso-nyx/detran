// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
import { Injectable } from '@nestjs/common';
import { BiometricStationRepository } from '../repositories/biometric-station.repository.js';
import type { BiometricStation } from '../entities/biometric-station.entity.js';
import type { CreateBiometricStationDto } from '../dto/create-biometric-station.dto.js';

@Injectable()
export class BiometricStationService {
  constructor(private readonly repository: BiometricStationRepository) {}
  findAll(): Promise<BiometricStation[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<BiometricStation> {
    return this.repository.findOne(id);
  }
  create(dto: CreateBiometricStationDto): Promise<BiometricStation> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateBiometricStationDto>,
  ): Promise<BiometricStation> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
