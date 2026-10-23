import { randomUUID } from 'node:crypto';
import { loadConfig } from '../../domain/shared/api/src/config/configuration.js';
import { PgDatabase } from '../../domain/shared/api/src/database/database.js';

/**
 * Seed rows are shared read fixtures. Give state-changing E2E cases their own
 * resources so repeated runs (including coverage) cannot consume the seed.
 * Only the identity and initial workflow state differ from the canonical row.
 */
export async function createWorkflowFixture(
  kind: 'cdt' | 'renach',
): Promise<string> {
  const db = new PgDatabase(loadConfig().database);
  const id = `E2E-${randomUUID()}`;
  try {
    const result =
      kind === 'cdt'
        ? await db.query(
            `insert into cdt.infracao (
              numero_ait, cpf, situacao, valor_original, percentual_desconto,
              valor_com_desconto, boleto_disponivel, linha_digitavel,
              data_vencimento, origem, protocolo_sne, protocolo_renainf,
              reconhecida, payload
            ) select $1, cpf, 'DISPONIVEL', valor_original, percentual_desconto,
              valor_com_desconto, boleto_disponivel, linha_digitavel,
              data_vencimento, origem, protocolo_sne, protocolo_renainf, false,
              payload || jsonb_build_object('numeroAit', $1::text, 'situacao', 'DISPONIVEL')
            from cdt.infracao where numero_ait = $2`,
            [id, 'A0001001'],
          )
        : await db.query(
            `insert into renach.processo (
              numero_renach, cpf, tipo_processo, situacao, categoria_atual,
              categoria_pretendida, payload
            ) select $1, cpf, tipo_processo, 'AGUARDANDO_MEDICO', categoria_atual,
              categoria_pretendida,
              payload || jsonb_build_object('numeroRenach', $1::text, 'situacao', 'AGUARDANDO_MEDICO')
            from renach.processo where numero_renach = $2`,
            [id, 'RS123456789'],
          );
    if (result.rowCount !== 1) {
      throw new Error(`Missing canonical ${kind} seed for workflow fixture`);
    }
    return id;
  } finally {
    await db.close();
  }
}
