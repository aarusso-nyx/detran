// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { AccessLogService } from '../services/access-log.service.js';

@Controller('v1/dashboard/access-logs')
@Resource('dashboard:access-log')
export class AccessLogController {
  constructor(private readonly service: AccessLogService) {}
}
