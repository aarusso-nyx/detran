import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Action, assertIfMatch, Audit, etagOf, Resource } from '@detran/shared';
import type { CreateRaitExportDto } from '../dto/create-rait-export.dto.js';
import type { CreateRaitJetonSheetDto } from '../dto/create-rait-jeton-sheet.dto.js';
import type { CreateRaitSuspensionActDto } from '../dto/create-rait-suspension-act.dto.js';
import { RaitExportService } from '../services/rait-export.service.js';
import { RaitJetonSheetService } from '../services/rait-jeton-sheet.service.js';
import { RaitSuspensionActService } from '../services/rait-suspension-act.service.js';

type Response = { setHeader(name: string, value: string): unknown };

@Controller('v1/inf/rait')
export class RaitOrgCommandsController {
  constructor(
    private readonly suspensionActs: RaitSuspensionActService,
    private readonly jetonSheets: RaitJetonSheetService,
    private readonly exports: RaitExportService,
    private readonly requestContext: RequestContext,
  ) {}
  private actorId(): string {
    const actorId = this.requestContext.snapshot().actorId;
    if (!actorId) throw new Error('Authenticated actor required');
    return actorId;
  }
  private respond<T>(response: Response, data: T) {
    response.setHeader('ETag', etagOf(1));
    return { data, events: [] };
  }

  @Post('suspension-acts')
  @HttpCode(201)
  @Resource('inf:rait-suspension-act')
  @Action('create')
  @Audit({
    action: 'INF_RAIT_SUSPENSION_ACT_CREATE',
    entity: 'inf.rait_suspension_act',
  })
  async createSuspensionAct(
    @Body() body: CreateRaitSuspensionActDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      await this.suspensionActs.create({ ...body, signed_by: this.actorId() }),
    );
  }

  @Post('jeton-sheets')
  @HttpCode(201)
  @Resource('inf:rait-jeton')
  @Action('generate')
  @Audit({ action: 'INF_RAIT_JETON_GENERATE', entity: 'inf.rait_jeton_sheet' })
  async createJetonSheet(
    @Body() body: CreateRaitJetonSheetDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      await this.jetonSheets.create({ ...body, generated_by: this.actorId() }),
    );
  }

  @Post('jeton-sheets/:id/approve')
  @HttpCode(200)
  @Resource('inf:rait-jeton')
  @Action('approve')
  @Audit({ action: 'INF_RAIT_JETON_APPROVE', entity: 'inf.rait_jeton_sheet' })
  async approveJetonSheet(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    assertIfMatch(match, 1, 'RAIT');
    return this.respond(
      response,
      await this.jetonSheets.update(id, {
        state: 'homologada',
        homologated_by: this.actorId(),
        homologated_at: new Date().toISOString(),
      }),
    );
  }

  @Post('exports')
  @HttpCode(201)
  @Resource('inf:rait-export')
  @Action('create')
  @Audit({ action: 'INF_RAIT_EXPORT_CREATE', entity: 'inf.rait_export' })
  async createExport(
    @Body() body: CreateRaitExportDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.respond(
      response,
      await this.exports.create({ ...body, requested_by: this.actorId() }),
    );
  }

  @Post('exports/:id/approve')
  @HttpCode(200)
  @Resource('inf:rait-export')
  @Action('approve')
  @Audit({ action: 'INF_RAIT_EXPORT_APPROVE', entity: 'inf.rait_export' })
  async approveExport(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    assertIfMatch(match, 1, 'RAIT');
    return this.respond(
      response,
      await this.exports.update(id, {
        status: 'approved',
        dpo_approved_by: this.actorId(),
        dpo_approved_at: new Date().toISOString(),
      }),
    );
  }
}
