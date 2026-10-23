// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { CrashProjectionAppliedEventService } from '../services/crash-projection-applied-event.service.js';

@Controller('v1/dashboard/crashes/applied-events')
@Resource('dashboard:crash-projection-applied-event')
export class CrashProjectionAppliedEventController {
  constructor(private readonly service: CrashProjectionAppliedEventService) {}
}
