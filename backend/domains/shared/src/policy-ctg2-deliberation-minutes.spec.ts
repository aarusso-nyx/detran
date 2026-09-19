import { describe, expect, it } from 'vitest';

import { isDetranActionAllowed } from './policy.js';

type Grant = {
  readonly resource: string;
  readonly action: string;
  readonly allowed: readonly string[];
};

const DELIBERATION_MINUTES_GRANTS: readonly Grant[] = [
  {
    resource: 'inf:rait-vote',
    action: 'create',
    allowed: ['rait-chair', 'rait-rapporteur'],
  },
  {
    resource: 'inf:rait-agenda-item',
    action: 'proclaim',
    allowed: ['rait-chair'],
  },
  {
    resource: 'inf:rait-minutes',
    action: 'create',
    allowed: ['rait-secretary'],
  },
  {
    resource: 'inf:rait-minutes',
    action: 'sign',
    allowed: ['rait-chair', 'rait-rapporteur'],
  },
  {
    resource: 'inf:rait-minutes',
    action: 'publish',
    allowed: ['rait-secretary'],
  },
];

const principal = (roles: readonly string[]) => ({
  roles: [...roles],
  permissions: [],
});

describe('TASK-0049 — política nominal de deliberação e ata', () => {
  for (const grant of DELIBERATION_MINUTES_GRANTS) {
    it.each(grant.allowed)(
      `dado papel canônico %s quando a política avalia ${grant.resource}:${grant.action} então concede somente a chave nominal`,
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

    it.each([
      'rait-analyst',
      'agency-admin',
      'technical-admin',
      'rait-secretary',
      'rait-rapporteur',
      'rait-chair',
    ])(
      `dado papel sem concessão estatutária %s quando a política avalia ${grant.resource}:${grant.action} então nega`,
      (role) => {
        if (grant.allowed.includes(role)) return;
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
