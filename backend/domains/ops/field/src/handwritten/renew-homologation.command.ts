// CTG-0002 §5.7 (M13, parte `ops`) — `POST /v1/ops/field/homologations/{id}/
// renew`. Renovação quadrienal ([RN-TEAT-117]).
//
// `senatran_protocolado_em` é aceito no DTO e **ignorado**: `ops_homologation`
// não tem a coluna (§11.9), e o campo fica `source_pending`.
import { DetranError } from '@detran/shared';

import {
  dateOf,
  inTransaction,
  tenantMismatch,
  tenantScope,
  todayOf,
  validationFailed,
  type FieldDeps,
} from './field-runtime.js';

/** [RN-TEAT-117] — o laudo vale quatro anos a contar da emissão. */
const REPORT_VALIDITY_YEARS = 4;

export interface RenewHomologationInput {
  laudo_emitido_em: string;
  emissor_independente: string;
  descricao_publicada_em?: string;
  descricao_publicacao_local?: string;
  senatran_protocolado_em?: string;
  senatran_notificado_em?: string;
  document_uri?: string;
}

export function addYears(date: string, years: number): string {
  const [year, month, day] = date.split('-');
  return [String(Number(year) + years).padStart(4, '0'), month, day].join('-');
}

export class RenewHomologationCommand {
  constructor(private readonly deps: FieldDeps) {}

  async execute(
    id: string,
    input: RenewHomologationInput,
  ): Promise<Record<string, unknown>> {
    const { tenantId } = tenantScope(this.deps);
    const today = todayOf(this.deps);
    const issued = dateOf(input.laudo_emitido_em);
    if (!issued || !input.emissor_independente)
      throw validationFailed([
        { path: 'laudo_emitido_em', rule: 'required' },
        { path: 'emissor_independente', rule: 'required' },
      ]);
    if (issued > today)
      throw validationFailed([{ path: 'laudo_emitido_em', rule: 'past' }]);
    const validUntil = addYears(issued, REPORT_VALIDITY_YEARS);
    if (validUntil < today)
      throw new DetranError('TEAT.HOMOLOGATION_RENEWAL_DUE', {
        status: 422,
        context: { homologationId: id },
        message: 'Renovação apresentada com laudo já vencido.',
      });

    return inTransaction(this.deps, async (scope) => {
      const found = await scope.query<{ id: string; status: string }>(
        `select id, status from ops.ops_homologation
          where tenant_id = $1 and id = $2 for update`,
        [tenantId, id],
      );
      const homologation = found.rows[0];
      if (!homologation) throw tenantMismatch();
      if (String(homologation.status) !== 'active')
        throw new DetranError('TEAT.HOMOLOGATION_STATE_INVALID', {
          status: 409,
          context: {
            homologationId: id,
            currentState: homologation.status,
          },
          message: 'Homologação fora do estado que admite renovação.',
        });
      const updated = await scope.query<Record<string, unknown>>(
        `update ops.ops_homologation
            set laudo_emitido_em = $2, laudo_valido_ate = $3,
                emissor_independente = $4, descricao_publicada_em = $5,
                descricao_publicacao_local = $6, senatran_notificado_em = $7,
                document_uri = coalesce($8, document_uri), status = 'active',
                updated_at = now()
          where id = $1
        returning id, status, laudo_emitido_em, laudo_valido_ate`,
        [
          id,
          issued,
          validUntil,
          String(input.emissor_independente),
          input.descricao_publicada_em ?? null,
          input.descricao_publicacao_local ?? null,
          input.senatran_notificado_em ?? null,
          input.document_uri ?? null,
        ],
      );
      const row = updated.rows[0]!;
      return {
        id: String(row.id),
        status: String(row.status),
        laudo_emitido_em: dateOf(row.laudo_emitido_em),
        laudo_valido_ate: dateOf(row.laudo_valido_ate),
      };
    });
  }
}
