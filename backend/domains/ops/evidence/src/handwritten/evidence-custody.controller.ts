// CTG-0003 §4.1…§4.8 (R-0008, TASK-0007) — rotas de comando de evidência e
// custódia sob `v1/ops/evidence` (prefixo corrigido em CTG-0002 §1). Os
// métodos só extraem parâmetros e chamam o comando (CODESTYLE §Backend).
import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Action, Audit, Resource } from '@detran/shared';

import type { AddCustodyEventInput } from './add-custody-event.command.js';
import type { CompleteUploadInput } from './complete-upload.command.js';
import { EvidenceCommandsService } from './evidence-commands.service.js';
import type { GenerateProbativePackageInput } from './generate-probative-package.command.js';
import type { InitiateUploadInput } from './initiate-upload.command.js';
import type { LinkEvidenceInput } from './link-evidence.command.js';
import type { PurgeUnverifiedInput } from './purge-unverified.command.js';
import type { ValidateEvidenceInput } from './validate-evidence.command.js';

@Controller('v1/ops/evidence')
export class EvidenceCustodyController {
  constructor(private readonly commands: EvidenceCommandsService) {}

  /**
   * §4.8 — a leitura de evidência passa pela projeção de bodycam. As duas
   * rotas ficam sob `evidence/…` porque é onde o CRUD gerado de
   * `BP-OPS-EVIDENCE-001` monta (`v1/ops/evidence/evidence`): o controlador
   * manuscrito é registrado antes (adenda CTG-0003 §12 item 1) e é ele quem
   * responde.
   */
  @Get('evidence') @Resource('ops:evidence') @Action('read') list() {
    return this.commands.list();
  }

  @Post('upload-intents')
  @HttpCode(200)
  @Resource('ops:evidence')
  @Action('initiate-upload')
  @Audit({
    action: 'OPS_EVIDENCE_INITIATE_UPLOAD',
    entity: 'ops.storage_intent',
  })
  initiateUpload(@Body() body: InitiateUploadInput) {
    return this.commands.initiate(body);
  }

  @Post('probative-packages/generate')
  @Resource('ops:probative-package')
  @Action('generate')
  @Audit({
    action: 'OPS_PROBATIVE_PACKAGE_GENERATE',
    entity: 'ops.evidence_probative_package',
  })
  generateProbativePackage(@Body() body: GenerateProbativePackageInput) {
    return this.commands.probativePackage(body);
  }

  @Post('maintenance/purge-expired-unverified')
  @HttpCode(200)
  @Resource('ops:evidence')
  @Action('purge-unverified')
  @Audit({
    action: 'OPS_EVIDENCE_PURGE_UNVERIFIED',
    entity: 'ops.evidence_evidence',
  })
  purgeExpiredUnverified(@Body() body: PurgeUnverifiedInput) {
    return this.commands.purge(body ?? {});
  }

  @Post(':id/complete-upload')
  @HttpCode(200)
  @Resource('ops:evidence')
  @Action('complete-upload')
  @Audit({
    action: 'OPS_EVIDENCE_COMPLETE_UPLOAD',
    entity: 'ops.evidence_evidence',
  })
  completeUpload(@Param('id') id: string, @Body() body: CompleteUploadInput) {
    return this.commands.complete(id, body);
  }

  @Post(':id/validate')
  @HttpCode(200)
  @Resource('ops:evidence')
  @Action('validate')
  @Audit({ action: 'OPS_EVIDENCE_VALIDATE', entity: 'ops.evidence_evidence' })
  validate(@Param('id') id: string, @Body() body: ValidateEvidenceInput) {
    return this.commands.validate(id, body ?? {});
  }

  @Post(':id/links')
  @Resource('ops:evidence')
  @Action('link')
  @Audit({ action: 'OPS_EVIDENCE_LINK', entity: 'ops.evidence_link' })
  link(@Param('id') id: string, @Body() body: LinkEvidenceInput) {
    return this.commands.link(id, body);
  }

  @Post(':id/custody-events')
  @Resource('ops:evidence')
  @Action('add-custody-event')
  @Audit({
    action: 'OPS_EVIDENCE_CUSTODY_EVENT',
    entity: 'ops.evidence_custody_event',
  })
  custodyEvent(@Param('id') id: string, @Body() body: AddCustodyEventInput) {
    return this.commands.custodyEvent(id, body);
  }

  @Get('evidence/:id') @Resource('ops:evidence') @Action('read') get(
    @Param('id') id: string,
  ) {
    return this.commands.get(id);
  }
}
