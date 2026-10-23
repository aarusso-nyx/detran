// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { PecDeadlinesService } from '../services/pec-deadlines.service.js';

@Controller('v1/dashboard/pec-deadlines')
@Resource('dashboard:pec-deadlines')
export class PecDeadlinesController {
  constructor(private readonly service: PecDeadlinesService) {}
}
