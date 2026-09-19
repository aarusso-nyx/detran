import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Action, Audit, DetranError, Resource, etagOf } from '@detran/shared';

import { BoatCrashCommandsService } from './boat-commands.service.js';

interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  end(body?: Buffer): unknown;
  status(code: number): ResponseLike;
  json(body: unknown): unknown;
}

function requireMatch(header: string | undefined, version: number): void {
  const match = /^(?:W\/)?"?(\d+)"?$/u.exec(header?.trim() ?? '');
  if (!match) throw new DetranError('BOAT.IF_MATCH_REQUIRED', { status: 428 });
  if (Number(match[1]) !== version)
    throw new DetranError('BOAT.VERSION_CONFLICT', {
      status: 412,
      context: { expected: version },
    });
}

@Controller('v1/est/crash')
@Resource('est:crash-record')
export class BoatCrashCommandsController {
  constructor(private readonly commands: BoatCrashCommandsService) {}

  private async command(
    id: string,
    ifMatch: string | undefined,
    res: ResponseLike,
    from: readonly string[],
    to: string,
    event: string,
  ) {
    const current = await this.commands.current(id);
    requireMatch(ifMatch, current.version);
    const result = await this.commands.transition(id, from, to, event);
    res.setHeader('ETag', etagOf(result.version));
    return result;
  }

  @Post('records/:id/start')
  @HttpCode(200)
  @Action('start')
  @Audit({ action: 'EST_CRASH_START', entity: 'est.crash_record' })
  async start(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res() res: ResponseLike,
  ) {
    const result = await this.command(
      id,
      match,
      res,
      ['RASCUNHO'],
      'EM_ATENDIMENTO',
      'SINISTRO_INICIADO',
    );
    return res.status(200).json(result);
  }
  @Post('records/:id/record')
  @Action('record')
  @Audit({ action: 'EST_CRASH_RECORD', entity: 'est.crash_record' })
  record(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Body() body: { pending?: boolean },
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['EM_ATENDIMENTO'],
      body.pending ? 'PENDENTE_COMPLEMENTO' : 'REGISTRADO',
      'SINISTRO_REGISTRADO',
    );
  }
  @Post('records/:id/complement')
  @Action('complement')
  @Audit({ action: 'EST_CRASH_COMPLEMENT', entity: 'est.crash_record' })
  complement(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['PENDENTE_COMPLEMENTO'],
      'REGISTRADO',
      'SINISTRO_COMPLEMENTADO',
    );
  }
  @Post('records/:id/validate')
  @Action('validate')
  @Audit({ action: 'EST_CRASH_VALIDATE', entity: 'est.crash_record' })
  validate(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['REGISTRADO', 'PENDENTE_COMPLEMENTO'],
      'VALIDADO',
      'SINISTRO_VALIDADO',
    );
  }
  @Post('records/:id/close')
  @Action('close')
  @Audit({ action: 'EST_CRASH_CLOSE', entity: 'est.crash_record' })
  close(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['EM_ATENDIMENTO', 'REGISTRADO', 'VALIDADO'],
      'FECHADO',
      'SINISTRO_FECHADO',
    );
  }
  @Post('records/:id/cancel')
  @Action('cancel')
  @Audit({ action: 'EST_CRASH_CANCEL', entity: 'est.crash_record' })
  cancel(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['RASCUNHO'],
      'CANCELADO',
      'SINISTRO_CANCELADO',
    );
  }
  @Post('records/:id/archive')
  @Action('archive')
  @Audit({ action: 'EST_CRASH_ARCHIVE', entity: 'est.crash_record' })
  archive(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    return this.command(
      id,
      match,
      res,
      ['INTEGRADO'],
      'ARQUIVADO',
      'SINISTRO_ARQUIVADO',
    );
  }
  @Post('records/:id/transmit')
  @Action('transmit')
  @Audit({ action: 'EST_CRASH_TRANSMIT', entity: 'est.crash_record' })
  async transmit(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
  ) {
    const current = await this.commands.current(id);
    requireMatch(match, current.version);
    return this.commands.transmit(id);
  }
  @Post('records/:id/renaest/:kind')
  @Action('rectify')
  @Audit({ action: 'EST_CRASH_RECTIFY', entity: 'est.crash_record' })
  async rectify(
    @Param('id') id: string,
    @Param('kind') kind: 'complement' | 'correct',
    @Headers('if-match') match: string | undefined,
    @Body() body: { reason?: string },
  ) {
    const current = await this.commands.current(id);
    requireMatch(match, current.version);
    return this.commands.rectify(
      id,
      kind === 'correct' ? 'correction' : 'complement',
      body.reason,
    );
  }
  @Get('records/:id/renaest')
  @Action('read')
  mirror(@Param('id') id: string) {
    return this.commands.mirror(id);
  }
  @Post('records/:id/scene-duties')
  @Action('record-duty')
  @Audit({ action: 'EST_CRASH_DUTY_RECORD', entity: 'est.crash_scene_duty' })
  async duty(
    @Param('id') id: string,
    @Headers('if-match') match: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const current = await this.commands.current(id);
    requireMatch(match, current.version);
    return this.commands.recordDuty(id, body);
  }
  @Post('records/:id/:kind')
  @Action('add-vehicle')
  @Audit({ action: 'EST_CRASH_SATELLITE_ADD', entity: 'est.crash_record' })
  async add(
    @Param('id') id: string,
    @Param('kind')
    kind:
      | 'vehicles'
      | 'persons'
      | 'victims'
      | 'damages'
      | 'witnesses'
      | 'sketches'
      | 'links',
    @Headers('if-match') match: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const current = await this.commands.current(id);
    requireMatch(match, current.version);
    const table = (
      {
        vehicles: 'vehicle',
        persons: 'person',
        victims: 'victim',
        damages: 'damage',
        witnesses: 'witness',
        sketches: 'sketch',
        links: 'link',
      } as const
    )[kind];
    return this.commands.add(id, table, body);
  }

  @Get('records/:id/report')
  @Action('read')
  report(
    @Param('id') _id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    // The concrete ADR-0018 façade is pending its owning scope. This keeps the
    // legacy route response shape for now, but is not a PDF/A implementation.
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="bat-preliminar.pdf"',
    );
    return res.end(Buffer.from('%PDF-1.4\n% pdfaid:part 2\n%%EOF\n'));
  }
}
