// CTG-0003 §4.8 (RN-TEAT-142, R-0008, TASK-0007) — projeção de leitura de
// bodycam. O critério é "entrega registrada", nunca papel: `AUDITOR`,
// `technical-admin` e `field-agent` recebem a mesma restrição.
import type { EvidenceRow } from './evidence-runtime.js';

export const BODYCAM_EVIDENCE_TYPE = 'bodycam';

/** Campos suprimidos enquanto não houver entrega de mídia registrada. */
export const BODYCAM_RESTRICTED_FIELDS = [
  'storage_uri',
  'location_json',
] as const;

export function projectEvidenceForRole(
  evidence: EvidenceRow,
  hasDeliveredAccess: boolean,
): EvidenceRow {
  const projected: EvidenceRow = { ...evidence };
  if (evidence.evidence_type !== BODYCAM_EVIDENCE_TYPE || hasDeliveredAccess)
    return projected;
  for (const field of BODYCAM_RESTRICTED_FIELDS) projected[field] = null;
  return projected;
}

/**
 * `ops.evidence_access_request` não guarda o id do principal requerente — só
 * `requester_name`/`requester_role` e `decided_by_user_ref` (DDL 17). Nesta
 * rodada a entrega registrada da própria evidência é o que libera o conteúdo;
 * a amarração "entrega **sua**" da §4.8 depende de coluna que não existe
 * (registrado no relatório de TASK-0007).
 */
export function hasDeliveredAccess(
  accessRequests: readonly EvidenceRow[],
  evidenceId: string,
): boolean {
  return accessRequests.some(
    (request) =>
      request.evidence_id === evidenceId && request.status === 'delivered',
  );
}
