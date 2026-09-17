// `/v1/portal/documents/cnh`, `/v1/portal/vehicles[/{id}/clearance|/{id}/crlv-e]`
// — leituras nacionais cacheadas (work/rounds/R-0009/contracts/CTG-0002.md
// §2.5, §8; plan R-0009 M17, M20; ADR-0003, ADR-0018). Só por
// `packages/senatran-adapter`, pelas fatias do token `PORTAL_NATIONAL_READ_PORTS`
// (composto no app); nenhum `fetch` próprio. Leituras de dado pessoal levam
// `@Audit` em `@Get` (RN-PORTAL-118 4). Documentos assinados (CNH-e com bytes,
// CRLV-e) são `SERVICE_UNAVAILABLE documento_assinado_pendente_r0014`,
// verificados ANTES da leitura nacional; `clearance` não tem operação na porta
// (OD-P21): sem cache → 503.
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestContext } from '@stynx-nyx/core';
import { Database, type Transaction } from '@stynx-nyx/data';
import {
  Action,
  Audit,
  Resource,
  withTenantContext,
  type RequestLike,
} from '@detran/shared';
import {
  PortalCitizenGuard,
  PortalError,
  PortalIdentityService,
  portalIdentityOf,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import {
  PORTAL_NATIONAL_READ_PORTS,
  PortalNationalReadsService,
  type PortalNationalReadPorts,
} from './national-reads.service.js';
import { asArray, asObject } from './projection-contract.js';

type CitizenRequest = RequestLike & PortalIdentityRequest;

/** Token de `unavailableReason` dos documentos assinados (CTG-0002 §0; ADR-0018). */
export const SIGNED_DOCUMENT_PENDING_REASON =
  'documento_assinado_pendente_r0014';

export const DOCUMENT_ROUTES = {
  cnh: '/v1/portal/documents/cnh',
  crlv: '/v1/portal/vehicles/{id}/crlv-e',
} as const;

export interface CnhResponse {
  /** Registro bruto do adapter (`CitizenLicense.license`; mapeamento OD-P35). */
  license: unknown;
  qrVerification: null;
  documentBytes: null;
  /** RN-PORTAL-117: consulta informativa, não documento. */
  category: 'C';
  cachedAt: string;
}

export interface VehiclesResponse {
  items: unknown[];
  cachedAt: string;
}

export interface ClearanceResponse {
  items: unknown[];
  restrictions: unknown[];
  /** DT-027/UC-PORTAL-012 AC-2 — origem inf, OD-P21. */
  suspendedEnforceability: unknown[];
  canIssue: boolean;
  cachedAt: string;
}

const CATALOG_NOTE_SQL = `select alternative_channel_note
     from portal.service_catalog
    where service_key = $1
    limit 1`;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function signedDocumentPending(
  alternativeChannelNote: string | null,
): PortalError {
  return new PortalError('PORTAL.SERVICE_UNAVAILABLE', {
    status: 422,
    context: {
      unavailableReason: SIGNED_DOCUMENT_PENDING_REASON,
      alternativeChannelNote,
    },
  });
}

function assertUuid(value: string, field: string): void {
  if (!UUID_RE.test(value)) {
    throw new PortalError('PORTAL.VALIDATION_FAILED', {
      status: 400,
      context: { fields: [field] },
    });
  }
}

@Controller('v1/portal')
@UseGuards(PortalCitizenGuard)
export class PortalDocumentsController {
  constructor(
    private readonly reads: PortalNationalReadsService,
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
    @Inject(PORTAL_NATIONAL_READ_PORTS)
    private readonly ports: PortalNationalReadPorts,
  ) {}

  @Get('documents/cnh')
  @Resource('portal:document')
  @Action('read')
  @Audit({
    action: 'PORTAL_DOCUMENT_READ',
    entity: 'portal.national_read_cache',
  })
  cnh(
    @Req() request: CitizenRequest,
    @Query('documentBytes') documentBytes: string | undefined,
  ): Promise<CnhResponse> {
    const identity = portalIdentityOf(request);
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertActLevel(
        tx,
        identity,
        'consulta_cnh',
        DOCUMENT_ROUTES.cnh,
      );
      if (documentBytes === 'true') throw signedDocumentPending(null);
      const result = await this.reads.read(tx, subject, 'cnh', null, () =>
        this.ports.cdt.getCitizenLicense(identity.cpf),
      );
      return {
        license: asObject(result.payload).license ?? null,
        qrVerification: null,
        documentBytes: null,
        category: 'C',
        cachedAt: result.cachedAt,
      };
    });
  }

  @Get('vehicles')
  @Resource('portal:vehicle')
  @Action('read')
  @Audit({
    action: 'PORTAL_VEHICLE_READ',
    entity: 'portal.national_read_cache',
  })
  vehicles(@Req() request: CitizenRequest): Promise<VehiclesResponse> {
    const identity = portalIdentityOf(request);
    return this.withSubject(identity, async (tx, subject) => {
      const result = await this.reads.read(tx, subject, 'vehicles', null, () =>
        this.ports.cdt.listCitizenVehicles(identity.cpf),
      );
      return {
        items: asArray(asObject(result.payload).items),
        cachedAt: result.cachedAt,
      };
    });
  }

  @Get('vehicles/:id/clearance')
  @Resource('portal:vehicle')
  @Action('read')
  @Audit({
    action: 'PORTAL_VEHICLE_READ',
    entity: 'portal.national_read_cache',
  })
  clearance(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<ClearanceResponse> {
    const identity = portalIdentityOf(request);
    assertUuid(id, 'id');
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertEntitled(tx, subject.subjectId, 'vehicle', id);
      // M17/OD-P21: nenhuma operação de ports.ts devolve débitos/restrições do
      // RENAVAM — a fonte é "indisponível"; com cache (linha inserida por
      // teste/OD) responde 200 com cachedAt antigo, sem cache 503.
      const result = await this.reads.read(tx, subject, 'clearance', id, () =>
        Promise.reject(
          new PortalError('PORTAL.NATIONAL_READ_UNAVAILABLE', {
            status: 503,
            context: { cachedAt: null, retryAfter: null },
          }),
        ),
      );
      const payload = asObject(result.payload);
      return {
        items: asArray(payload.items),
        restrictions: asArray(payload.restrictions),
        suspendedEnforceability: asArray(payload.suspendedEnforceability),
        canIssue: payload.canIssue === true,
        cachedAt: result.cachedAt,
      };
    });
  }

  @Post('vehicles/:id/crlv-e')
  @HttpCode(200)
  @Resource('portal:vehicle')
  @Action('issue')
  @Audit({
    action: 'PORTAL_VEHICLE_ISSUE',
    entity: 'portal.national_read_cache',
  })
  issueCrlv(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<never> {
    const identity = portalIdentityOf(request);
    assertUuid(id, 'id');
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertEntitled(tx, subject.subjectId, 'vehicle', id);
      await this.identity.assertActLevel(
        tx,
        identity,
        'emissao_crlv',
        DOCUMENT_ROUTES.crlv,
      );
      const catalog = (
        await tx.query<{ alternative_channel_note: string | null }>(
          CATALOG_NOTE_SQL,
          ['emissao_crlv'],
        )
      ).rows[0];
      throw signedDocumentPending(catalog?.alternative_channel_note ?? null);
    });
  }

  /** Transação única de tenant por rota (§0) com o sujeito garantido. */
  private withSubject<T>(
    identity: PortalIdentityClaims,
    work: (
      tx: PortalSqlTransaction,
      subject: PortalSubjectRecord,
    ) => Promise<T>,
  ): Promise<T> {
    return withTenantContext(
      this.database,
      this.requestContext,
      async (tx: Transaction) =>
        work(tx, await this.identity.upsertSubject(tx, identity, null)),
    );
  }
}
