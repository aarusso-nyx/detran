// `/v1/portal/manifestations` — manifestação da Lei 13.460 (work/rounds/
// R-0009/contracts/CTG-0002.md §2.6, §2.8; plan R-0009 M13, M19, M20, adenda
// A4(b)). `POST` é público com identidade OPORTUNISTA (H.51 "anônimo para
// manifestar"): o guard de autenticação do app tenta autenticar quando há
// `Authorization` e prossegue anônimo se falhar; aqui, principal presente com
// claims válidas e papel CIDADAO → sujeito identificado, senão anônimo —
// nunca 401/403. As três rotas autenticadas levam `@UseGuards(PortalCitizenGuard)`
// por método (a classe não pode, porque `POST` é público).
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
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
  Public,
  Resource,
  canonicalRoles,
  etagOf,
  getPrincipalFromRequest,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  portalIdentityClaims,
  portalIdentityOf,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalPagedResponse,
} from '@detran/portal-identity';

import {
  PortalManifestationService,
  isReplayedResponse,
  type ManifestationAcknowledgeResponse,
  type ManifestationCreateResponse,
  type ManifestationDetailResponse,
  type ManifestationListItem,
  type PortalHeaders,
  type PortalQuery,
} from './manifestation.service.js';

/** Forma mínima da resposta para status e cabeçalhos (padrão de `inf/ait`). */
interface ResponseLike {
  setHeader(name: string, value: string): unknown;
  status(code: number): unknown;
}

type CitizenRequest = RequestLike & PortalIdentityRequest;

const REPLAYED_HEADER = 'Idempotency-Replayed';

/**
 * Identidade oportunista (§2.8): principal autenticado com claims válidas,
 * papel CIDADAO e pertencente ao tenant efetivo da requisição → identificado;
 * qualquer outra situação (inclusive tenant ausente) → anônimo. A checagem de
 * tenant é defesa em profundidade (hotfix 2026-09-29): um principal de outro
 * tenant nunca identifica sujeito no tenant semeado pelo cabeçalho.
 */
export function opportunisticIdentityOf(
  request: RequestLike,
  tenantId: string | undefined,
): PortalIdentityClaims | null {
  if (!tenantId) return null;
  const principal = getPrincipalFromRequest(request);
  if (!principal) return null;
  if (!(principal.tenants ?? []).includes(tenantId)) return null;
  const claims = portalIdentityClaims(principal);
  if (!claims) return null;
  return canonicalRoles(principal.roles ?? []).includes('CIDADAO')
    ? claims
    : null;
}

@Controller('v1/portal/manifestations')
@Resource('portal:manifestation')
export class PortalManifestationsController {
  constructor(
    private readonly manifestations: PortalManifestationService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Post()
  @Public()
  @Action('manifest')
  @NoIdempotent()
  @Audit({
    action: 'PORTAL_MANIFESTATION_MANIFEST',
    entity: 'portal.manifestation',
  })
  async manifest(
    @Req() request: CitizenRequest,
    @Body() body: unknown,
    @Headers() headers: PortalHeaders,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<ManifestationCreateResponse> {
    const identity = opportunisticIdentityOf(request, this.effectiveTenantId());
    const response = await this.tx((tx) =>
      this.manifestations.manifest(tx, identity, body, headers),
    );
    res.status(201);
    if (isReplayedResponse(response)) res.setHeader(REPLAYED_HEADER, 'true');
    return response;
  }

  @Get()
  @UseGuards(PortalCitizenGuard)
  @Action('read')
  list(
    @Req() request: CitizenRequest,
    @Query() query: PortalQuery,
  ): Promise<PortalPagedResponse<ManifestationListItem>> {
    const identity = portalIdentityOf(request);
    return this.tx((tx) => this.manifestations.list(tx, identity, query ?? {}));
  }

  @Get(':id')
  @UseGuards(PortalCitizenGuard)
  @Action('read')
  get(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<ManifestationDetailResponse> {
    const identity = portalIdentityOf(request);
    return this.tx((tx) => this.manifestations.get(tx, identity, id));
  }

  @Post(':id/acknowledge')
  @HttpCode(200)
  @UseGuards(PortalCitizenGuard)
  @Action('acknowledge')
  @Audit({
    action: 'PORTAL_MANIFESTATION_ACKNOWLEDGE',
    entity: 'portal.manifestation',
  })
  async acknowledge(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: ResponseLike,
  ): Promise<ManifestationAcknowledgeResponse> {
    const identity = portalIdentityOf(request);
    const result = await this.tx((tx) =>
      this.manifestations.acknowledge(tx, identity, id),
    );
    res.setHeader('ETag', etagOf(result.version));
    return result;
  }

  /** Tenant efetivo da requisição = o do `RequestContext` (o da transação). */
  private effectiveTenantId(): string | undefined {
    return this.requestContext.hasActiveContext()
      ? this.requestContext.snapshot().tenantId
      : undefined;
  }

  /** Transação única de tenant por comando/leitura (§0). */
  private tx<T>(work: (tx: Transaction) => Promise<T>): Promise<T> {
    return withTenantContext(this.database, this.requestContext, work);
  }
}
