// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Injectable } from '@nestjs/common';
import { ProvisioningGrantReservationBindingRepository } from '../repositories/provisioning-grant-reservation-binding.repository.js';
import type { ProvisioningGrantReservationBinding } from '../entities/provisioning-grant-reservation-binding.entity.js';
import type { CreateProvisioningGrantReservationBindingDto } from '../dto/create-provisioning-grant-reservation-binding.dto.js';

@Injectable()
export class ProvisioningGrantReservationBindingService {
  constructor(
    private readonly repository: ProvisioningGrantReservationBindingRepository,
  ) {}
  findAll(): Promise<ProvisioningGrantReservationBinding[]> {
    return this.repository.findAll();
  }
  findOne(id: string): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.findOne(id);
  }
  create(
    dto: CreateProvisioningGrantReservationBindingDto,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.create(dto);
  }
  update(
    id: string,
    dto: Partial<CreateProvisioningGrantReservationBindingDto>,
  ): Promise<ProvisioningGrantReservationBinding> {
    return this.repository.update(id, dto);
  }
  remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}
