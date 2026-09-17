// `/v1/portal/exams[/{id}]` — exames pela projeção `portal.exam_view`
// (work/rounds/R-0009/contracts/CTG-0002.md §2.5; plan R-0009 M10, M16, M20).
// Leitura de dado pessoal: `@Audit` em `@Get` (RN-PORTAL-118 4); rótulo legal,
// nunca `CONDICIONADO` (route contract §7); projetor real é do PEC (OD-P19) —
// nesta rodada só fixtures.
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

type CitizenRequest = RequestLike & PortalIdentityRequest;

export const EXAMS_ROUTE = '/v1/portal/exams';
export const EXAM_ACT = 'consulta_exame';

export interface ExamItem {
  examId: string;
  legalLabel: string;
  validUntil: string | null;
  boardDueOn: string | null;
}

const EXAM_COLUMNS = `exam_id, legal_label,
          to_char(valid_until, 'YYYY-MM-DD') as valid_until,
          to_char(board_due_on, 'YYYY-MM-DD') as board_due_on`;

const LIST_SQL = `select ${EXAM_COLUMNS}
     from portal.exam_view
    where subject_cpf_hash = $1
    order by updated_at desc nulls last, exam_id asc`;

const ONE_SQL = `select ${EXAM_COLUMNS}
     from portal.exam_view
    where exam_id = $1
    limit 1`;

interface ExamRow extends Record<string, unknown> {
  exam_id: string;
  legal_label: string;
  valid_until: string | null;
  board_due_on: string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function itemOf(row: ExamRow): ExamItem {
  return {
    examId: row.exam_id,
    legalLabel: row.legal_label,
    validUntil: row.valid_until,
    boardDueOn: row.board_due_on,
  };
}

@Controller('v1/portal/exams')
@UseGuards(PortalCitizenGuard)
@Resource('portal:exam')
export class PortalExamsController {
  constructor(
    private readonly identity: PortalIdentityService,
    private readonly database: Database,
    private readonly requestContext: RequestContext,
  ) {}

  @Get()
  @Action('read')
  @Audit({ action: 'PORTAL_EXAM_READ', entity: 'portal.exam_view' })
  list(@Req() request: CitizenRequest): Promise<{ items: ExamItem[] }> {
    const identity = portalIdentityOf(request);
    return this.withSubject(identity, async (tx) => {
      await this.identity.assertActLevel(tx, identity, EXAM_ACT, EXAMS_ROUTE);
      const rows = await tx.query<ExamRow>(LIST_SQL, [cpfHashOf(identity.cpf)]);
      return { items: rows.rows.map(itemOf) };
    });
  }

  @Get(':id')
  @Action('read')
  @Audit({ action: 'PORTAL_EXAM_READ', entity: 'portal.exam_view' })
  get(
    @Req() request: CitizenRequest,
    @Param('id') id: string,
  ): Promise<ExamItem> {
    const identity = portalIdentityOf(request);
    if (!UUID_RE.test(id)) {
      throw new PortalError('PORTAL.VALIDATION_FAILED', {
        status: 400,
        context: { fields: ['id'] },
      });
    }
    return this.withSubject(identity, async (tx, subject) => {
      await this.identity.assertActLevel(tx, identity, EXAM_ACT, EXAMS_ROUTE);
      await this.identity.assertEntitled(tx, subject.subjectId, 'exam', id);
      const row = (await tx.query<ExamRow>(ONE_SQL, [id])).rows[0];
      if (!row) {
        throw new PortalError('PORTAL.NOT_FOUND', {
          status: 404,
          context: { kind: 'exam' },
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
