// CTG-0003 §4.6 (R-0008, TASK-0007) — `POST
// /v1/ops/evidence/probative-packages/generate`.
//
// Os itens saem na ordem `captured_at asc, id asc`; o `manifest_hash` cobre
// os `item_hash`; toda evidência incluída passa a `packaged` com o evento de
// custódia correspondente.
import { DetranError } from '@detran/shared';

import {
  appendEvent,
  findRow,
  findRowsWhere,
  insertRow,
  inTenantTransaction,
  isoOf,
  newId,
  nextCustodyVersion,
  patchRow,
  quarantined,
  scopeOf,
  stringOf,
  validationFailed,
  type EvidenceDeps,
  type EvidenceRow,
} from './evidence-runtime.js';
import { probativePackageGeneratedEvent } from './events.js';
import { manifestHashOf, probativeManifest } from './manifest.js';

const PACKAGEABLE_STATUSES = ['validated', 'linked'] as const;

export interface GenerateProbativePackageInput {
  traffic_agency_id: string;
  entity_type: string;
  entity_id: string;
  generated_by_user_ref: string;
  purpose: string;
}

export interface ProbativePackageItemView {
  sequence: number;
  evidence_id: string;
  item_hash: string;
}

export interface GenerateProbativePackageResult {
  id: string;
  manifest_hash: string;
  package_uri: string;
  items: ProbativePackageItemView[];
}

export class GenerateProbativePackageCommand {
  constructor(private readonly deps: EvidenceDeps) {}

  async execute(
    input: GenerateProbativePackageInput,
  ): Promise<GenerateProbativePackageResult> {
    const entityType = stringOf(input?.entity_type ?? '').trim();
    const entityId = stringOf(input?.entity_id ?? '').trim();
    const purpose = stringOf(input?.purpose ?? '').trim();
    const trafficAgencyId = stringOf(input?.traffic_agency_id ?? '').trim();
    const fields = [
      ...(entityType ? [] : [{ path: 'entity_type', rule: 'required' }]),
      ...(entityId ? [] : [{ path: 'entity_id', rule: 'required' }]),
      ...(purpose ? [] : [{ path: 'purpose', rule: 'required' }]),
      ...(trafficAgencyId
        ? []
        : [{ path: 'traffic_agency_id', rule: 'required' }]),
    ];
    if (fields.length > 0) throw validationFailed(fields);
    const scope = scopeOf(this.deps);

    return inTenantTransaction(this.deps, async (tx) => {
      const links = (
        await findRowsWhere(
          this.deps,
          tx,
          'evidenceLinks',
          'entity_id',
          entityId,
        )
      ).filter((link) => stringOf(link.entity_type) === entityType);

      const linked: EvidenceRow[] = [];
      for (const evidenceId of new Set(
        links.map((link) => stringOf(link.evidence_id)),
      )) {
        const evidence = await findRow(this.deps, tx, 'evidence', evidenceId);
        if (evidence) linked.push(evidence);
      }

      const inQuarantine = linked.find(
        (evidence) => evidence.status === 'quarantined',
      );
      if (inQuarantine) throw quarantined(stringOf(inQuarantine.id));

      const eligible = linked
        .filter((evidence) =>
          (PACKAGEABLE_STATUSES as readonly unknown[]).includes(
            evidence.status,
          ),
        )
        .sort(byCapturedAtThenId);

      if (eligible.length === 0)
        throw new DetranError('TEAT.PROBATIVE_PACKAGE_INCOMPLETE', {
          status: 422,
          context: { entityType, entityId, found: 0 },
          message: 'Nenhuma evidência validada ou vinculada para a entidade.',
        });

      const packageId = newId();
      const packageUri = `/v1/ops/evidence/probative-packages/${packageId}`;
      const items = eligible.map((evidence, index) => ({
        sequence: index + 1,
        evidenceId: stringOf(evidence.id),
        itemType: stringOf(evidence.evidence_type),
        itemHash: stringOf(evidence.hash_value),
      }));
      const manifestHash = manifestHashOf(
        probativeManifest({ entityType, entityId, purpose, items }),
      );

      await insertRow(this.deps, tx, 'probativePackages', {
        id: packageId,
        traffic_agency_id: trafficAgencyId,
        entity_type: entityType,
        entity_id: entityId,
        generated_by_user_ref: stringOf(
          input.generated_by_user_ref || scope.actorId,
        ),
        generated_at: scope.occurredAt,
        purpose,
        manifest_hash: manifestHash,
        package_uri: packageUri,
      });

      for (const item of items) {
        await insertRow(this.deps, tx, 'probativePackageItems', {
          package_id: packageId,
          item_type: item.itemType,
          evidence_id: item.evidenceId,
          entity_type: entityType,
          entity_id: entityId,
          item_hash: item.itemHash,
          sequence: item.sequence,
        });
        await patchRow(this.deps, tx, 'evidence', item.evidenceId, {
          status: 'packaged',
        });
        const version = await nextCustodyVersion(
          this.deps,
          tx,
          item.evidenceId,
        );
        await insertRow(this.deps, tx, 'custodyEvents', {
          evidence_id: item.evidenceId,
          event_type: 'packaged',
          event_at: scope.occurredAt,
          user_ref: scope.actorId,
          system_name: 'detran-backend',
          details_json: { packageId, sequence: item.sequence, version },
        });
      }

      await appendEvent(
        this.deps,
        tx,
        probativePackageGeneratedEvent(scope, {
          packageId,
          entityType,
          entityId,
          purpose,
          manifestHash,
          itemCount: items.length,
        }),
      );

      return {
        id: packageId,
        manifest_hash: manifestHash,
        package_uri: packageUri,
        items: items.map((item) => ({
          sequence: item.sequence,
          evidence_id: item.evidenceId,
          item_hash: item.itemHash,
        })),
      };
    });
  }
}

function byCapturedAtThenId(left: EvidenceRow, right: EvidenceRow): number {
  const leftAt = isoOf(left.captured_at);
  const rightAt = isoOf(right.captured_at);
  if (leftAt !== rightAt) return leftAt < rightAt ? -1 : 1;
  return stringOf(left.id) < stringOf(right.id) ? -1 : 1;
}
