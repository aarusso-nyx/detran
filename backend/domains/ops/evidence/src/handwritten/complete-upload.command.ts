// CTG-0003 §4.2 (M11, R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/complete-upload`.
//
// Uma transação: `evidence` passa a `uploaded`, a intenção fecha, a cadeia de
// custódia ganha `uploaded` e o vínculo com a entidade nasce. Precedência das
// guardas: forma do DTO (400, §14.1) → quarentena → coerência com a intenção
// gravada (§14.1) → intenção vencida → hash → estado (§4.2, C-0003-06…08).
import { DetranError } from '@detran/shared';

import {
  appendEvent,
  findRow,
  insertRow,
  inTenantTransaction,
  isoOf,
  patchRow,
  quarantined,
  scopeOf,
  stateTransitionFailed,
  stringOf,
  tenantMismatch,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';
import { evidenceCapturedEvent, evidenceLinkedEvent } from './events.js';

export interface CompleteUploadInput {
  storage_intent_id: string;
  idempotency_key: string;
  entity_type: string;
  entity_id: string;
  accepted_hash: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/i;
/** `entity_type` da §4.2: a única entidade aplicável nesta rodada. */
const SUPPORTED_ENTITY_TYPE = 'ait';

export interface CompleteUploadResult {
  id: string;
  status: 'uploaded';
  storage_uri: string;
  link_id: string;
  custody_event_id: string;
}

export class CompleteUploadCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    evidenceId: string,
    input: CompleteUploadInput,
  ): Promise<CompleteUploadResult> {
    const scope = scopeOf(this.deps);
    // §14.1: o DTO inteiro é validado **antes** da transação.
    const parsed = parse(input);
    const { acceptedHash, storageIntentId } = parsed;

    return inTenantTransaction(this.deps, async (tx) => {
      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
      if (!evidence) throw tenantMismatch({ evidenceId });
      if (evidence.status === 'quarantined') throw quarantined(evidenceId);

      const intent = await findRow(
        this.deps,
        tx,
        'storageIntents',
        storageIntentId,
      );
      if (!intent) throw tenantMismatch({ storageIntentId });
      assertMatchesIntent(evidenceId, evidence, intent, parsed);

      const expiresAt = isoOf(intent.expires_at);
      if (new Date(expiresAt).getTime() < new Date(scope.occurredAt).getTime())
        throw new DetranError('TEAT.EVIDENCE_INTENT_EXPIRED', {
          status: 410,
          context: { storageIntentId, expiresAt },
          message: 'Intenção de upload vencida; renove mantendo o mesmo id.',
        });

      const declaredHash = stringOf(evidence.hash_value);
      if (declaredHash !== acceptedHash)
        throw new DetranError('TEAT.EVIDENCE_HASH_MISMATCH', {
          status: 422,
          context: { declaredHash, acceptedHash },
          message: 'O hash aceito não confere com o declarado na intenção.',
        });

      if (evidence.status !== 'pending_upload') throw stateTransitionFailed();

      const objectKey = stringOf(intent.object_key || evidence.storage_uri);
      await patchRow(this.deps, tx, 'evidence', evidenceId, {
        status: 'uploaded',
        storage_uri: objectKey,
      });
      await patchRow(this.deps, tx, 'storageIntents', storageIntentId, {
        status: 'completed',
        accepted_hash: acceptedHash,
      });

      const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: 'uploaded',
        event_at: scope.occurredAt,
        user_ref: scope.actorId,
        system_name: 'detran-backend',
        details_json: { storageIntentId, acceptedHash },
      });

      const role = stringOf(evidence.evidence_type);
      const link = await insertRow(this.deps, tx, 'evidenceLinks', {
        evidence_id: evidenceId,
        entity_type: parsed.entityType,
        entity_id: parsed.entityId,
        role,
        mandatory: false,
      });

      await appendEvent(
        this.deps,
        tx,
        evidenceCapturedEvent(scope, {
          evidenceId,
          entityType: parsed.entityType,
          entityId: parsed.entityId,
          evidenceType: role,
          hashValue: declaredHash,
          capturedAt: evidence.captured_at ? isoOf(evidence.captured_at) : null,
          uploadedAt: scope.occurredAt,
        }),
      );
      await appendEvent(
        this.deps,
        tx,
        evidenceLinkedEvent(
          scope,
          {
            evidenceId,
            linkId: stringOf(link.id),
            entityType: parsed.entityType,
            entityId: parsed.entityId,
            role,
          },
          // Segundo fato do mesmo agregado nesta transação: versão 2, senão o
          // envelope colide com `EVIDENCIA_CAPTURADA` na chave da outbox.
          2,
        ),
      );

      return {
        id: evidenceId,
        status: 'uploaded',
        storage_uri: objectKey,
        link_id: stringOf(link.id),
        custody_event_id: stringOf(custodyEvent.id),
      };
    });
  }
}

interface ParsedCompleteUpload {
  storageIntentId: string;
  idempotencyKey: string;
  entityType: string;
  entityId: string;
  acceptedHash: string;
}

/** §14.1 — forma do DTO; qualquer desvio é 400 `TEAT.VALIDATION_FAILED`. */
function parse(input: CompleteUploadInput): ParsedCompleteUpload {
  const storageIntentId = stringOf(input?.storage_intent_id ?? '').trim();
  const idempotencyKey = stringOf(input?.idempotency_key ?? '').trim();
  const entityType = stringOf(input?.entity_type ?? '').trim();
  const entityId = stringOf(input?.entity_id ?? '').trim();
  const acceptedHash = stringOf(input?.accepted_hash ?? '').trim();

  const fields: { path: string; rule: string }[] = [];
  if (!storageIntentId)
    fields.push({ path: 'storage_intent_id', rule: 'required' });
  else if (!UUID_PATTERN.test(storageIntentId))
    fields.push({ path: 'storage_intent_id', rule: 'uuid' });
  if (!idempotencyKey || idempotencyKey.length > 160)
    fields.push({ path: 'idempotency_key', rule: 'required' });
  if (!entityType) fields.push({ path: 'entity_type', rule: 'required' });
  else if (entityType !== SUPPORTED_ENTITY_TYPE)
    fields.push({ path: 'entity_type', rule: 'enum' });
  if (!entityId) fields.push({ path: 'entity_id', rule: 'required' });
  else if (!UUID_PATTERN.test(entityId))
    fields.push({ path: 'entity_id', rule: 'uuid' });
  if (!acceptedHash) fields.push({ path: 'accepted_hash', rule: 'required' });
  else if (!HASH_PATTERN.test(acceptedHash))
    fields.push({ path: 'accepted_hash', rule: 'pattern' });

  if (fields.length > 0) throw validationFailed(fields, 400);
  return {
    storageIntentId,
    idempotencyKey,
    entityType,
    entityId,
    acceptedHash,
  };
}

/**
 * §14.1 — a conclusão tem de ser da mesma intenção que a abriu.
 *
 * A DDL 17 não tem coluna de entidade em `ops.storage_intent` nem em
 * `ops.evidence_evidence`: o par `entity_type`/`entity_id` declarado na
 * intenção é gravado por `initiate-upload` em `evidence.metadata_json` (mesma
 * coluna de `filename`/`upload_request_hash`, OD-T55 ratificada na adenda
 * §13; nomes conforme a proposta do Inspector). Quando a linha não registra o
 * par — evidência semeada por fixture, anterior a esta regra — não há termo
 * de comparação e a guarda não corre.
 */
function assertMatchesIntent(
  evidenceId: string,
  evidence: Record<string, unknown>,
  intent: Record<string, unknown>,
  parsed: ParsedCompleteUpload,
): void {
  const metadata =
    evidence.metadata_json && typeof evidence.metadata_json === 'object'
      ? (evidence.metadata_json as Record<string, unknown>)
      : {};
  const recordedEntityType = stringOf(
    metadata.entity_type ?? metadata.upload_entity_type ?? '',
  );
  const recordedEntityId = stringOf(
    metadata.entity_id ?? metadata.upload_entity_id ?? '',
  );
  if (
    (recordedEntityType && recordedEntityType !== parsed.entityType) ||
    (recordedEntityId && recordedEntityId !== parsed.entityId)
  )
    throw new DetranError('TEAT.EVIDENCE_ENTITY_NOT_APPLIED', {
      status: 409,
      context: {
        evidenceId,
        entityType: parsed.entityType,
        entityId: parsed.entityId,
      },
      message: 'A entidade informada não é a da intenção de upload.',
    });

  const recordedKey = stringOf(intent.idempotency_key ?? '');
  if (recordedKey && recordedKey !== parsed.idempotencyKey)
    throw new DetranError('TEAT.IDEMPOTENCY_REPLAY', {
      status: 409,
      context: { idempotencyKey: parsed.idempotencyKey },
      message: 'Chave de idempotência diferente da intenção de upload.',
    });
}
