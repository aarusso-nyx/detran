// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { TeatMeasuresService } from '../services/teat-measures.service.js';

@Controller('v1/dashboard/teat-measures')
@Resource('dashboard:teat-measures')
export class TeatMeasuresController {
  constructor(private readonly service: TeatMeasuresService) {}
}
