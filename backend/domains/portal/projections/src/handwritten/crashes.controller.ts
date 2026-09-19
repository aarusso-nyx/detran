// `/v1/portal/crashes[/{id}]` — sinistros pela projeção `portal.crash_view`
// (work/rounds/R-0009/contracts/CTG-0002.md §2.5; plan R-0009 M10, M16, M20).
// Leitura de dado pessoal: `@Audit` em `@Get` (RN-PORTAL-118 4); campo de
// terceiro suprimido, nunca a peça (RN-BOAT-126); projetor real é R-0010
// (OD-P19) — nesta rodada só fixtures.
import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
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
  cpfHashOf,
  portalIdentityOf,
  type PortalIdentityClaims,
  type PortalIdentityRequest,
  type PortalSqlTransaction,
  type PortalSubjectRecord,
} from '@detran/portal-identity';

import { asObject } from './projection-contract.js';

type CitizenRequest = RequestLike & PortalIdentityRequest;

export const CRASHES_ROUTE = '/v1/portal/crashes';
export const CRASH_ACT = 'consulta_bat';

export interface CrashItem {
  crashId: string;
  stateLabel: string;
  summary: Record<string, unknown>;
  thirdPartyFieldsSuppressed: boolean;
}

const CRASH_COLUMNS = `crash_id, state_label, summary_json, third_party_fields_suppressed`;

const LIST_SQL = `select ${CRASH_COLUMNS}
     from portal.crash_view
    where subject_cpf_hash = $1
    order by updated_at desc nulls last, crash_id asc`;

const ONE_SQL = `select ${CRASH_COLUMNS}
     from portal.crash_view
    where crash_id = $1
    limit 1`;

interface CrashRow extends Record<string, unknown> {
  crash_id: string;
  state_label: string;
  summary_json: unknown;
  third_party_fields_suppressed: boolean;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function itemOf(row: CrashRow): CrashItem {
  return {
    crashId: row.crash_id,
    stateLabel: row.state_label,
    summary: asObject(row.summary_json),
    thirdPartyFieldsSuppressed: row.third_party_fields_suppressed,
  };
}

@Controller('v1/portal/crashes')
@UseGuards(PortalCitizenGuard)
@Resource('portal:crash')
export class PortalCrashesController {
  constructor(
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get()
  @Action('read')
  @Audit({ action: 'PORTAL_CRASH_READ', entity: 'portal.crash_view' })
  list(@Req() request: CitizenRequest): Promise<{ items: CrashItem[] }> {
    const identity = portalIdentityOf(request);
    return this.withSubject(identity, async (tx) => {
      await this.identity.assertActLevel(
        tx,
        identity,
        CRASH_ACT,
        CRASHES_ROUTE,
      );
      const rows = await tx.query<CrashRow>(LIST_SQL, [
        cpfHashOf(identity.cpf),
      ]);
      return { items: rows.rows.map(itemOf) };
    });
  }

  @Get(':id')
  @Action('read')
  @Audit({ action: 'PORTAL_CRASH_READ', entity: 'portal.crash_view' })
  get(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<CrashItem> {
    const identity = portalIdentityOf(request);
    if (!UUID_RE.test(id)) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['id'] },
      });
    }
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertActLevel(
        tx,
        identity,
        CRASH_ACT,
        CRASHES_ROUTE,
      );
      await this.identity.assertEntitled(tx, subject.subjectId, 'crash', id);
      const row = (await tx.query<CrashRow>(ONE_SQL, [id])).rows[0];
      if (!row) {
        throw new PortalError('PORTAL.NOT_FOUND', {
          status: 404,
          context: { kind: 'crash' },
        });
      }
      return itemOf(row);
    });
  }

  /** Transação única de tenant por leitura (§0) com o sujeito garantido. */
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
