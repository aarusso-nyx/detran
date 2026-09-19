// `/v1/portal/requests` — as doze rotas do ciclo comum de pedidos
// (work/rounds/R-0009/contracts/CTG-0002.md §2.3; plan R-0009 M7–M10, M20,
// adenda A4(a)). O controlador só extrai identidade, parâmetros, corpo e
// cabeçalhos, abre a transação de tenant (`withTenantContext`, ADR-0002) e
// delega a `PortalRequestsService`; as seis rotas M9 levam `@NoIdempotent()`
// (o handler assume a idempotência) e devolvem `Idempotency-Replayed: true`
// no replay; `ETag` em toda resposta com `version`. Os dois "commit e lança"
// do §3.1 (403 com AGUARDANDO_NIVEL_ASSINATURA persistido; 502 com protocolo
// mantido) saem da transação já commitada e só então são lançados.
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  NoIdempotent,
  Resource,
  etagOf,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  portalIdentityOf,
  type PortalIdentityRequest,
} from '@detran/portal-identity';

import {
  PortalRequestsService,
  isCommitThenThrow,
  type PortalCommandOutcome,
  type PortalHeaders,
  type PortalQuery,
} from './requests.service.js';

/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

const REPLAYED_HEADER = 'Idempotency-Replayed';

type CitizenRequest = RequestLike & PortalIdentityRequest;

@Controller('v1/portal/requests')
@UseGuards(PortalCitizenGuard)
@Resource('portal:request')
export class PortalRequestsController {
  constructor(
    private readonly requests: PortalRequestsService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Post()
  @Action('create')
  @NoIdempotent()
  @Audit({ action: 'PORTAL_REQUEST_CREATE', entity: 'portal.request' })
  create(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<object> {
    const identity = portalIdentityOf(request);
    return this.command(res, (tx) =>
      this.requests.create(tx, identity, body, headers),
    );
  }

  @Put(':id/draft')
  @Action('compose')
  @Audit({ action: 'PORTAL_REQUEST_COMPOSE', entity: 'portal.request_draft' })
  async updateDraft(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    const identity = portalIdentityOf(request);
    const result = await this.tx((tx) =>
      this.requests.updateDraft(tx, identity, id, body, headers),
    );
    res.setHeader('ETag', etagOf(result.version));
    return result;
  }

  @Post(':id/attachments')
  @Action('compose')
  @Audit({
    action: 'PORTAL_REQUEST_ATTACHMENT_CREATE',
    entity: 'portal.request_attachment',
  })
  intendAttachment(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ): Promise<never> {
    const identity = portalIdentityOf(request);
    return this.tx((tx) =>
      this.requests.intendAttachment(tx, identity, id, body),
    );
  }

  @Post(':id/attachments/:attachmentId/complete')
  @HttpCode(200)
  @Action('compose')
  @Audit({
    action: 'PORTAL_REQUEST_ATTACHMENT_COMPLETE',
    entity: 'portal.request_attachment',
  })
  completeAttachment(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
  ): Promise<never> {
    const identity = portalIdentityOf(request);
    return this.tx((tx) =>
      this.requests.completeAttachment(tx, identity, id, attachmentId),
    );
  }

  @Post(':id/submit')
  @Action('submit')
  @NoIdempotent()
  @Audit({ action: 'PORTAL_REQUEST_SUBMIT', entity: 'portal.protocol' })
  submit(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<object> {
    const identity = portalIdentityOf(request);
    return this.command(res, (tx) =>
      this.requests.submit(tx, identity, id, body, headers),
    );
  }

  @Post(':id/withdraw')
  @HttpCode(200)
  @Action('withdraw')
  @Audit({ action: 'PORTAL_REQUEST_WITHDRAW', entity: 'portal.request' })
  async withdraw(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    const identity = portalIdentityOf(request);
    const result = await this.tx((tx) =>
      this.requests.withdraw(tx, identity, id, body, headers),
    );
    res.setHeader('ETag', etagOf(result.version));
    return result;
  }

  @Get()
  @Action('read')
  list(@Req() request: CitizenRequest, @Query() query: PortalQuery) {
    const identity = portalIdentityOf(request);
    return this.tx((tx) => this.requests.list(tx, identity, query ?? {}));
  }

  @Get(':id')
  @Action('read')
  async get(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ) {
    const identity = portalIdentityOf(request);
    const result = await this.tx((tx) => this.requests.get(tx, identity, id));
    res.setHeader('ETag', etagOf(result.request.version));
    return result;
  }

  @Get(':id/receipt')
  @Action('read')
  receipt(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<never> {
    const identity = portalIdentityOf(request);
    return this.tx((tx) => this.requests.receipt(tx, identity, id));
  }

  @Get(':id/decision')
  @Action('read')
  decision(@Req() request: CitizenRequest, @Param('id') id: string) {
    const identity = portalIdentityOf(request);
    return this.tx((tx) => this.requests.decision(tx, identity, id));
  }

  @Post(':id/diligences/:did/responses')
  @Action('respond')
  @NoIdempotent()
  @Audit({ action: 'PORTAL_REQUEST_RESPOND', entity: 'portal.request' })
  respondDiligence(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Param('did') did: string,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<object> {
    const identity = portalIdentityOf(request);
    return this.command(res, (tx) =>
      this.requests.respondDiligence(tx, identity, id, did, body, headers),
    );
  }

  @Post(':id/evaluation')
  @Action('evaluate')
  @NoIdempotent()
  @Audit({ action: 'PORTAL_REQUEST_EVALUATE', entity: 'portal.evaluation' })
  evaluate(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<object> {
    const identity = portalIdentityOf(request);
    return this.command(res, (tx) =>
      this.requests.evaluate(tx, identity, id, body, headers),
    );
  }

  /** Transação única de tenant por comando/leitura (§0). */
  private tx<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }

  /**
   * Comando M9: o resultado carrega status/corpo (§4); um erro marcado
   * "commit e lança" (§3.1) sai da transação commitada e é lançado depois.
   */
  private async command<T extends object>(
    res: ResponseLike,
    work: (tx: Transaction) => Promise<PortalCommandOutcome<T>>,
  ): Promise<T> {
    const outcome = await this.tx(
      async (
        tx,
      ): Promise<{ ok: PortalCommandOutcome<T> } | { error: Error }> => {
        try {
          return { ok: await work(tx) };
        } catch (error) {
          if (isCommitThenThrow(error)) return { error };
          throw error;
        }
      },
    );
    if ('error' in outcome) throw outcome.error;
    const { status, body, replayed } = outcome.ok;
    res.status(status);
    if (replayed) res.setHeader(REPLAYED_HEADER, 'true');
    const version = (body as { version?: unknown }).version;
    if (typeof version === 'number') res.setHeader('ETag', etagOf(version));
    return body;
  }
}
