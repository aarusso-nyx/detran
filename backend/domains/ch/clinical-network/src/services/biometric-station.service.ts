// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:243dd2a69921d6544f3664d22ea24b32a34148a32d18659ca5d926815bfbe154
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
