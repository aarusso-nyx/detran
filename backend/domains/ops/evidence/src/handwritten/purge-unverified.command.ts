// CTG-0003 §4.7 (M11, R-0008, TASK-0007) — `POST
// /v1/ops/evidence/maintenance/purge-expired-unverified`.
//
// Bodycam **nunca** é purgada: a retenção é `teat.bodycam.retention_days`,
// `source_pending` no `parameter-catalogue.md` §TEAT (DT-049). Sem valor não
// há prazo, e sem prazo não há eliminação (M11).
import {
  appendEvent,
  findRowsWhere,
  insertRow,
  inTenantTransaction,
  isoOf,
  listRows,
  nextCustodyVersion,
  patchRow,
  scopeOf,
  stringOf,
  validationFailed,
  type EvidenceDeps,
  type EvidenceRow,
} from './evidence-runtime.js';
import { BODYCAM_EVIDENCE_TYPE } from './bodycam-projection.js';
import { custodyRecordedEvent } from './events.js';

const DEFAULT_BATCH_SIZE = 200;
const MAX_BATCH_SIZE = 1000;

export interface PurgeUnverifiedInput {
  limit?: number;
}

export interface PurgeUnverifiedResult {
  purged: number;
  skippedBodycam: number;
  examined: number;
}

export class PurgeUnverifiedCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    input: PurgeUnverifiedInput = {},
  ): Promise<PurgeUnverifiedResult> {
    const limit = limitOf(input);
    const scope = scopeOf(this.deps);
    const now = new Date(scope.occurredAt).getTime();

    return inTenantTransaction(this.deps, async (tx) => {
      const pending = (
        await findRowsWhere(
          this.deps,
          tx,
          'evidence',
          'status',
          'pending_upload',
        )
      ).slice(0, limit);
      const intents = await listRows(this.deps, tx, 'storageIntents');

      let purged = 0;
      let skippedBodycam = 0;
      let examined = 0;

      for (const evidence of pending) {
        const intent = expiredIntentOf(intents, stringOf(evidence.id), now);
        if (!intent) continue;
        examined += 1;
        if (evidence.evidence_type === BODYCAM_EVIDENCE_TYPE) {
          skippedBodycam += 1;
          continue;
        }

        const evidenceId = stringOf(evidence.id);
        const storageIntentId = stringOf(intent.id);
        const expiresAt = isoOf(intent.expires_at);
        await patchRow(this.deps, tx, 'evidence', evidenceId, {
          status: 'rejected',
        });
        await patchRow(this.deps, tx, 'storageIntents', storageIntentId, {
          status: 'expired',
        });
        const version = await nextCustodyVersion(this.deps, tx, evidenceId);
        const custodyEvent = await insertRow(this.deps, tx, 'custodyEvents', {
          evidence_id: evidenceId,
          event_type: 'purged_unverified',
          event_at: scope.occurredAt,
          user_ref: scope.actorId,
          system_name: 'detran-backend',
          details_json: { storageIntentId, expiresAt },
        });
        await appendEvent(
          this.deps,
          tx,
          custodyRecordedEvent(
            scope,
            {
              evidenceId,
              custodyEventId: stringOf(custodyEvent.id),
              eventType: 'purged_unverified',
              eventAt: scope.occurredAt,
            },
            version,
          ),
        );
        purged += 1;
      }

      return { purged, skippedBodycam, examined };
    });
  }
}

function expiredIntentOf(
  intents: readonly EvidenceRow[],
  evidenceId: string,
  now: number,
): EvidenceRow | undefined {
  return intents.find(
    (intent) =>
      stringOf(intent.evidence_id) === evidenceId &&
      intent.status === 'pending' &&
      new Date(isoOf(intent.expires_at)).getTime() < now,
  );
}

function limitOf(input: PurgeUnverifiedInput): number {
  if (input?.limit === undefined || input.limit === null)
    return DEFAULT_BATCH_SIZE;
  const limit = Number(input.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_BATCH_SIZE)
    throw validationFailed([{ path: 'limit', rule: 'range' }]);
  return limit;
}
