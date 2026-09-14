import { RequestContext } from '@stynx-nyx/core';
import { Database } from '@stynx-nyx/data';
import { OpsTenantRepository } from '@detran/ops-core';
import { EvidenceCustodyService } from './evidence-custody.service.js';

const surfaces = {
  evidence: 'ops.evidence_evidence',
  links: 'ops.evidence_link',
  'custody-events': 'ops.evidence_custody_event',
  'probative-packages': 'ops.evidence_probative_package',
} as const;

export const EVIDENCE_CUSTODY_PROVIDER = {
  provide: EvidenceCustodyService,
  inject: [Database, RequestContext],
  useFactory: (database: Database, requestContext: RequestContext) =>
    new EvidenceCustodyService(
      Object.fromEntries(
        Object.entries(surfaces).map(([name, table]) => [
          name,
          new OpsTenantRepository(database, requestContext, table),
        ]),
      ),
    ),
};
