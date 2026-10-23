// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RepresentationService } from '../services/representation.service.js';

@Controller('v1/portal/identity/representations')
@Resource('portal:representation')
export class RepresentationController {
  constructor(private readonly service: RepresentationService) {}
}
