// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { RaitScheduleService } from '../services/rait-schedule.service.js';

@Controller('v1/inf/rait/schedules')
@Resource('inf:rait-schedule')
export class RaitScheduleController {
  constructor(private readonly service: RaitScheduleService) {}
}
