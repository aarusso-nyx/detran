import { Body, Controller, Get, Post } from '@nestjs/common';
import { Audit, Action, Resource } from '@detran/shared';
import { EvidenceCustodyService } from './index.js';
/** Polymorphic entity_type/entity_id links preserve TEAT's custody model. */
@Controller('ops/evidence')
export class EvidenceCustodyController {
  constructor(private readonly service: EvidenceCustodyService) {}
  @Get() @Resource('ops:evidence') @Action('read') list() {
    return this.service.list('evidence');
  }
  @Post()
  @Resource('ops:evidence')
  @Action('initiate-upload')
  @Audit({ action: 'OPS_EVIDENCE_CAPTURE', entity: 'ops.evidence_evidence' })
  create(@Body() dto: Record<string, unknown>) {
    return this.service.create('evidence', dto);
  }
  @Post('links')
  @Resource('ops:evidence')
  @Action('link')
  @Audit({ action: 'OPS_EVIDENCE_LINK', entity: 'ops.evidence_link' })
  link(@Body() dto: Record<string, unknown>) {
    return this.service.create('links', dto);
  }
  @Post('custody-events')
  @Resource('ops:evidence')
  @Action('add-custody-event')
  @Audit({
    action: 'OPS_EVIDENCE_CUSTODY_EVENT',
    entity: 'ops.evidence_custody_event',
  })
  custody(@Body() dto: Record<string, unknown>) {
    return this.service.create('custody-events', dto);
  }
  @Post('probative-packages')
  @Resource('ops:probative-package')
  @Action('generate')
  @Audit({
    action: 'OPS_PROBATIVE_PACKAGE_GENERATE',
    entity: 'ops.evidence_probative_package',
  })
  package(@Body() dto: Record<string, unknown>) {
    return this.service.create('probative-packages', dto);
  }
}
