// CTG-0003 §4.4 (R-0008, TASK-0007) — `POST /v1/ops/evidence/{id}/links`.
//
// `uploaded` avança para `linked`; `validated` permanece `validated` — é
// estado mais forte (§4.4).
import {
  appendEvent,
  assertEntityApplied,
  findRow,
  findRowsWhere,
  insertRow,
  inTenantTransaction,
  nextCustodyVersion,
  patchRow,
  quarantined,
  scopeOf,
  stateTransitionFailed,
  stringOf,
  tenantMismatch,
  validationFailed,
  type EvidenceDeps,
} from './evidence-runtime.js';
import { evidenceLinkedEvent } from './events.js';

const LINKABLE_STATUSES = ['uploaded', 'validated'] as const;

export interface LinkEvidenceInput {
  entity_type: string;
  entity_id: string;
  role: string;
  mandatory?: boolean;
  user_ref?: string;
}

export interface LinkEvidenceResult {
  id: string;
  evidence_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  mandatory: boolean;
}

export class LinkEvidenceCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    evidenceId: string,
    input: LinkEvidenceInput,
  ): Promise<LinkEvidenceResult> {
    const entityType = stringOf(input?.entity_type ?? '').trim();
    const entityId = stringOf(input?.entity_id ?? '').trim();
    const role = stringOf(input?.role ?? '').trim();
    const fields = [
      ...(entityType ? [] : [{ path: 'entity_type', rule: 'required' }]),
      ...(entityId ? [] : [{ path: 'entity_id', rule: 'required' }]),
      ...(role ? [] : [{ path: 'role', rule: 'required' }]),
    ];
    if (fields.length > 0) throw validationFailed(fields);
    const mandatory = input.mandatory === true;
    const scope = scopeOf(this.deps);

    return inTenantTransaction(this.deps, async (tx) => {
      const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
      if (!evidence) throw tenantMismatch({ evidenceId });
      if (evidence.status === 'quarantined') throw quarantined(evidenceId);
      await assertEntityApplied(this.deps, tx, entityType, entityId);
      if (!(LINKABLE_STATUSES as readonly unknown[]).includes(evidence.status))
        throw stateTransitionFailed();

      const link = await insertRow(this.deps, tx, 'evidenceLinks', {
        evidence_id: evidenceId,
        entity_type: entityType,
        entity_id: entityId,
        role,
        mandatory,
      });
      if (evidence.status === 'uploaded')
        await patchRow(this.deps, tx, 'evidence', evidenceId, {
          status: 'linked',
        });

      const version = await nextCustodyVersion(this.deps, tx, evidenceId);
      await insertRow(this.deps, tx, 'custodyEvents', {
        evidence_id: evidenceId,
        event_type: 'linked',
        event_at: scope.occurredAt,
        user_ref: stringOf(input.user_ref ?? scope.actorId),
        system_name: 'detran-backend',
        details_json: { linkId: stringOf(link.id) },
      });

      const links = await findRowsWhere(
        this.deps,
        tx,
        'evidenceLinks',
        'evidence_id',
        evidenceId,
      );
      await appendEvent(
        this.deps,
        tx,
        evidenceLinkedEvent(
          scope,
          {
            evidenceId,
            linkId: stringOf(link.id),
            entityType,
            entityId,
            role,
            mandatory,
          },
          Math.max(links.length, version),
        ),
      );

      return {
        id: stringOf(link.id),
        evidence_id: evidenceId,
        entity_type: entityType,
        entity_id: entityId,
        role,
        mandatory,
      };
    });
  }
}
