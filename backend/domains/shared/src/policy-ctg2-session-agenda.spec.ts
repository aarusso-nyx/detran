import { describe, expect, it } from 'vitest';

import { isDetranActionAllowed } from './policy.js';

type Grant = {
  readonly resource: string;
  readonly action: string;
  readonly allowed: readonly string[];
};

const SESSION_AGENDA_GRANTS: readonly Grant[] = [
  {
    resource: 'inf:rait-session',
    action: 'close-agenda',
    allowed: ['rait-chair'],
  },
  {
    resource: 'inf:rait-session',
    action: 'open',
    allowed: ['rait-chair'],
  },
  {
    resource: 'inf:rait-session',
    action: 'adjourn',
    allowed: ['rait-chair', 'rait-secretary'],
  },
  {
    resource: 'inf:rait-session',
    action: 'convene-extraordinary',
    allowed: ['rait-chair'],
  },
  {
    resource: 'inf:rait-agenda-item',
    action: 'read',
    allowed: ['rait-rapporteur'],
  },
  {
    resource: 'inf:rait-agenda-item',
    action: 'view',
    allowed: ['rait-rapporteur'],
  },
  {
    resource: 'inf:rait-agenda-item',
    action: 'withdraw',
    allowed: ['rait-chair'],
  },
];

const principal = (roles: readonly string[]) => ({
  roles: [...roles],
  permissions: [],
});

describe('TASK-0047 — política nominal de sessão e pauta', () => {
  for (const grant of SESSION_AGENDA_GRANTS) {
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

    it.each([
      'rait-analyst',
      'agency-admin',
      'technical-admin',
      'rait-secretary',
      'rait-rapporteur',
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
