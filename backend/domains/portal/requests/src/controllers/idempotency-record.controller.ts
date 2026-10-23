// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
import { Controller } from '@nestjs/common';
import { Resource } from '@detran/shared';
import { IdempotencyRecordService } from '../services/idempotency-record.service.js';

@Controller('v1/portal/requests/idempotency-records')
@Resource('portal:idempotency-record')
export class IdempotencyRecordController {
  constructor(private readonly service: IdempotencyRecordService) {}
}
