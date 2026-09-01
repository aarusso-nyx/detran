import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { PecCognitoAdminService } from './pec-cognito-admin.service.js';

function subject(send = vi.fn(), pool = 'pool-1') {
  return { service: new PecCognitoAdminService({ send } as never, pool), send };
}

describe('PecCognitoAdminService', () => {
  it('lists and maps Cognito users without exposing SDK response shapes', async () => {
    const { service, send } = subject(
      vi.fn().mockResolvedValue({
        Users: [
          {
            Username: 'user-1',
            UserStatus: 'CONFIRMED',
            Enabled: true,
            Attributes: [{ Name: 'email', Value: 'user@example.test' }],
          },
        ],
        PaginationToken: 'next-1',
      }),
    );
    await expect(service.list({ email: 'user@', limit: 20 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          username: 'user-1',
          status: 'CONFIRMED',
          enabled: true,
          email: 'user@example.test',
        }),
      ],
      nextToken: 'next-1',
    });
    expect(send.mock.calls[0]?.[0].constructor.name).toBe('ListUsersCommand');
  });

  it('supports group, block, unblock, attribute and reset operations', async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        Username: 'user-1',
        Enabled: true,
        UserStatus: 'CONFIRMED',
      });
    const { service } = subject(send);
    await service.addToGroup('user-1', 'AUDITOR');
    await service.removeFromGroup('user-1', 'AUDITOR');
    await service.disable('user-1');
    await service.enable('user-1');
    await service.resetPassword('user-1');
    await service.update('user-1', { email: 'new@example.test' });
    expect(
      send.mock.calls.map(([command]) => command.constructor.name),
    ).toEqual([
      'AdminAddUserToGroupCommand',
      'AdminRemoveUserFromGroupCommand',
      'AdminDisableUserCommand',
      'AdminEnableUserCommand',
      'AdminResetUserPasswordCommand',
      'AdminUpdateUserAttributesCommand',
      'AdminGetUserCommand',
    ]);
  });

  it('fails closed without a configured user pool and maps provider authority errors', async () => {
    await expect(
      subject(vi.fn(), '').service.get('user-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    const notFound = Object.assign(new Error('missing'), {
      name: 'UserNotFoundException',
    });
    await expect(
      subject(vi.fn().mockRejectedValue(notFound)).service.resetPassword(
        'missing',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    const denied = Object.assign(new Error('denied'), {
      name: 'AccessDeniedException',
    });
    await expect(
      subject(vi.fn().mockRejectedValue(denied)).service.resetPassword(
        'user-1',
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
