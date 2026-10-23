// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { ProvisioningGrantReservationBindingService } from '../services/provisioning-grant-reservation-binding.service.js';

@Controller('v1/ops/provisioning/grant-reservation-bindings')
@Resource('ops:grant-reservation-binding')
export class ProvisioningGrantReservationBindingController {
  constructor(
    private readonly service: ProvisioningGrantReservationBindingService,
  ) {}
}
