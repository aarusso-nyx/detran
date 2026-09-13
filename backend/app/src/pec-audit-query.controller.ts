import { Controller, Get, Header, Query } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  PecAuditQueryService,
  type PecAuditQuery,
} from './pec-audit-query.service.js';

@Controller('v1/audit/events')
@Resource('platform:audit')
export class PecAuditQueryController {
  constructor(private readonly service: PecAuditQueryService) {}

  @Get()
  @Action('read')
  @Audit({ action: 'AUDIT_EVENT_READ', entity: 'audit.events' })
  list(@Query() query: PecAuditQuery) {
    return this.service.list(query);
  }

  @Get('export')
  @Action('export')
  @Audit({ action: 'AUDIT_EVENT_EXPORT', entity: 'audit.events' })
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header(
    'Content-Disposition',
    'attachment; filename="detran-audit-events.csv"',
  )
  export(@Query() query: PecAuditQuery) {
    return this.service.exportCsv(query);
  }
}
