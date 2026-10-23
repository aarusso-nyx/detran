// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { NationalReadCacheService } from '../services/national-read-cache.service.js';

@Controller('v1/portal/projections/national-read-cache')
@Resource('portal:national-read-cache')
export class NationalReadCacheController {
  constructor(private readonly service: NationalReadCacheService) {}
}
