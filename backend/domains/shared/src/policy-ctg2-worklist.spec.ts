import { describe, expect, it } from 'vitest';

import { isDetranActionAllowed } from './policy.js';

type CommandGrant = {
  readonly resource: string;
  readonly action: string;
  readonly allowed: readonly string[];
};

const WORKLIST_COMMAND_GRANTS: readonly CommandGrant[] = [
  {
    resource: 'inf:rait-schedule',
    action: 'create',
    allowed: ['rait-coordinator'],
  },
  {
    resource: 'inf:rait-schedule',
    action: 'publish',
    allowed: ['rait-coordinator'],
  },
  {
    resource: 'inf:rait-batch',
    action: 'create',
    allowed: ['rait-secretary'],
  },
  {
    resource: 'inf:rait-batch',
    action: 'approve',
    allowed: ['rait-chair'],
  },
  {
    resource: 'inf:rait-batch-item',
    action: 'accept',
    allowed: ['rait-rapporteur'],
  },
  {
    resource: 'inf:rait-batch-item',
    action: 'impediment',
    allowed: ['rait-rapporteur'],
  },
  {
    resource: 'inf:rait-assignment',
    action: 'reassign',
    allowed: ['rait-coordinator', 'rait-manager', 'rait-chair'],
  },
  {
    resource: 'inf:rait-batch',
    action: 'draw',
    allowed: ['rait-secretary'],
  },
];

const principal = (roles: readonly string[]) => ({
  roles: [...roles],
  permissions: [],
});

describe('CTG-0002 worklist policy keys', () => {
  for (const grant of WORKLIST_COMMAND_GRANTS) {
    it.each(grant.allowed)(
      `dado o papel canônico %s quando a política avalia ${grant.resource}:${grant.action} então concede somente a chave nominal`,
      (role) => {
        expect(
          isDetranActionAllowed(
            principal([role]),
            grant.resource,
            grant.action,
          ),
        ).toBe(true);
      },
    );

    it.each(['rait-analyst', 'agency-admin', 'technical-admin'])(
      `dado papel sem vínculo estatutário %s quando a política avalia ${grant.resource}:${grant.action} então nega`,
      (role) => {
        expect(
          isDetranActionAllowed(
            principal([role]),
            grant.resource,
            grant.action,
          ),
        ).toBe(false);
      },
    );
  }
});
