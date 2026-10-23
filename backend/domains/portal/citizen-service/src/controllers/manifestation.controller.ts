// Generated from BP-PORTAL-CITIZEN-SERVICE-001 v1.0.1 sha256:81c05ec48ec8ab36465ae1b250c4a59f59931b99835bfd1ef52f3b10520f9029
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { ManifestationService } from '../services/manifestation.service.js';

@Controller('v1/portal/citizen-service/manifestations')
@Resource('portal:manifestation')
export class ManifestationController {
  constructor(private readonly service: ManifestationService) {}
}
