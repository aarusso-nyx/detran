import { Body, Controller, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import {
  type CreateReportInput,
  type RequestAddendumInput,
  ReportLifecycleService,
} from './report-lifecycle.service.js';

@Controller('v1/ch/reports')
@Resource('ch:report')
export class ReportCommandsController {
  constructor(private readonly lifecycle: ReportLifecycleService) {}

  @Post()
  @Action('create')
  @Audit({ action: 'CH_REPORT_SIGN', entity: 'ch.report' })
  create(@Body() input: CreateReportInput) {
    return this.lifecycle.create(input);
  }

  @Post(':id/addenda')
  @Action('addendum-request')
  @Audit({ action: 'CH_REPORT_ADDENDUM_REQUEST', entity: 'ch.report_addendum' })
  requestAddendum(
    @Param('id') reportId: string,
    @Body() input: RequestAddendumInput,
  ) {
    return this.lifecycle.requestAddendum(reportId, input);
  }

  @Post('addenda/:id/approvals/supervisor')
  @Action('addendum-approve-supervisor')
  @Audit({ action: 'CH_REPORT_ADDENDUM_APPROVE', entity: 'ch.report_addendum' })
  approveAsSupervisor(@Param('id') id: string) {
    return this.lifecycle.approveAddendum(id, 'SUPERVISOR');
  }

  @Post('addenda/:id/approvals/clinic-admin')
  @Action('addendum-approve-clinic-admin')
  @Audit({ action: 'CH_REPORT_ADDENDUM_APPROVE', entity: 'ch.report_addendum' })
  approveAsClinicAdmin(@Param('id') id: string) {
    return this.lifecycle.approveAddendum(id, 'ADMIN_CLINICA');
  }

  @Post('addenda/:id/sign')
  @Action('addendum-sign')
  @Audit({ action: 'CH_REPORT_ADDENDUM_SIGN', entity: 'ch.report_addendum' })
  signAddendum(@Param('id') id: string) {
    return this.lifecycle.signAddendum(id);
  }
}
