// TASK-0025: JW01-admissibility.md / ADR-0041. Public controller contracts, not SQL mocks.
import { describe, expect, it, vi } from 'vitest';
import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
} from '@detran/shared';
import { RaitCaseCommandService } from '../../src/handwritten/rait-case-command.service.js';
import { RaitCaseCommandsController } from '../../src/handwritten/rait-case-commands.controller.js';
import { RaitAdmissibilityCommandsController } from '../../src/handwritten/rait-admissibility-commands.controller.js';

const CASE = '00000000-0000-7000-8000-000010000002';
const TENANT = '00000000-0000-7000-8000-00000000a001';
const ACTOR = '00000000-0000-4000-8000-0000b0000005';
const PRINCIPAL = {
  id: ACTOR,
  roles: ['rait-secretary'],
  permissions: [],
  tenants: [TENANT],
};
describe('TASK25 F01/R01 mounted command boundary', () => {
  it('triage forwards strict command, case ETag and opaque key, returns data/events only', async () => {
    const data = { id: CASE, state: 'TRIAGEM_ADMISSIBILIDADE', version: 2 };
    const execute = vi
      .fn()
      .mockResolvedValue({ data, events: ['rait.case.changed'], etag: '"2"' });
    const controller = new RaitCaseCommandsController({ execute } as never);
    const setHeader = vi.fn();
    expect(
      await controller.triage(
        CASE,
        {},
        '"1"',
        'opaque-triage',
        { setHeader },
        { principal: PRINCIPAL },
      ),
    ).toEqual({ data, events: ['rait.case.changed'] });
    expect(execute).toHaveBeenCalledWith({
      command: 'triage',
      principal: PRINCIPAL,
      targetId: CASE,
      payload: {},
      headers: { 'If-Match': '"1"', 'Idempotency-Key': 'opaque-triage' },
    });
    expect(setHeader).toHaveBeenCalledWith('ETag', '"2"');
    expect(
      Reflect.getMetadata(DETRAN_ACTION_METADATA_KEY, controller.triage),
    ).toBe('triage');
  });
  it('R01 retains its canonical resource/create policy and envelope', async () => {
    const body = { case_id: CASE, criterion: 'assinatura', verdict: true };
    const data = { ...body, id: CASE };
    const execute = vi
      .fn()
      .mockResolvedValue({ data, events: ['rait.case.changed'], etag: '"3"' });
    const controller = new RaitAdmissibilityCommandsController({
      execute,
    } as never);
    const setHeader = vi.fn();
    expect(
      await controller.create(
        body,
        '"2"',
        'opaque-save',
        { setHeader },
        { principal: PRINCIPAL },
      ),
    ).toEqual({ data, events: ['rait.case.changed'] });
    expect(execute).toHaveBeenCalledWith({
      payload: body,
      principal: PRINCIPAL,
      headers: { 'If-Match': '"2"', 'Idempotency-Key': 'opaque-save' },
    });
    expect(setHeader).toHaveBeenCalledWith('ETag', '"3"');
    expect(
      Reflect.getMetadata(
        DETRAN_RESOURCE_METADATA_KEY,
        RaitAdmissibilityCommandsController,
      ),
    ).toBe('inf:rait-admissibility');
    expect(
      Reflect.getMetadata(DETRAN_ACTION_METADATA_KEY, controller.create),
    ).toBe('create');
  });
  it('does not turn service failures into successful command envelopes', async () => {
    const failure = new Error('rollback');
    const execute = vi.fn().mockRejectedValue(failure);
    const setHeader = vi.fn();
    const controller = new RaitAdmissibilityCommandsController({
      execute,
    } as never);
    await expect(
      controller.create(
        { case_id: CASE, criterion: 'assinatura', verdict: true },
        '"2"',
        'key',
        { setHeader },
        { principal: PRINCIPAL },
      ),
    ).rejects.toBe(failure);
    expect(setHeader).not.toHaveBeenCalled();
  });
});

// These are pre-transaction identity/policy checks, not a database substitute.
describe('delivery review: actual authenticated principal before replay or SQL', () => {
  for (const command of ['triage', 'save-admissibility']) {
    function arrange() {
      const boundary = new Error('approved database boundary');
      const database = { tx: vi.fn().mockRejectedValue(boundary) };
      const service = new RaitCaseCommandService(
        database as never,
        {
          hasActiveContext: () => true,
          snapshot: () => ({
            tenantId: TENANT,
            actorId: ACTOR,
            requestId: 'review-regression',
          }),
        } as never,
        {} as never,
        {} as never,
      );
      return { service, database, boundary };
    }
    const payload =
      command === 'triage'
        ? {}
        : { case_id: CASE, criterion: 'assinatura', verdict: true };
    for (const [label, principal] of [
      ['missing', undefined],
      ['wrong actor', { ...PRINCIPAL, id: CASE }],
      ['wrong tenant', { ...PRINCIPAL, tenants: [] }],
      ['no allowed grant', { ...PRINCIPAL, roles: ['rait-hr'] }],
    ] as const) {
      it(`${command}: ${label} is 403 before database/replay`, async () => {
        const { service, database } = arrange();
        await expect(
          service.execute({
            command,
            targetId: CASE,
            payload,
            headers: {
              'If-Match': '"1"',
              'Idempotency-Key': 'review-principal',
            },
            principal,
          }),
        ).rejects.toMatchObject({ code: 'RAIT.FORBIDDEN_ACTION', status: 403 });
        expect(database.tx).not.toHaveBeenCalled();
      });
    }
    for (const [label, principal] of [
      ['secretary', PRINCIPAL],
      ['existing admin', { ...PRINCIPAL, roles: ['ADMIN'] }],
      [
        'permission only no roles',
        {
          ...PRINCIPAL,
          roles: [],
          permissions: [
            command === 'triage'
              ? 'inf:rait-case:triage'
              : 'inf:rait-admissibility:create',
          ],
        },
      ],
      [
        'permission with unrelated actual role',
        {
          ...PRINCIPAL,
          roles: ['rait-hr'],
          permissions: [
            command === 'triage'
              ? 'inf:rait-case:triage'
              : 'inf:rait-admissibility:create',
          ],
        },
      ],
    ] as const) {
      it(`${command}: ${label} retains existing grant`, async () => {
        const { service, database, boundary } = arrange();
        await expect(
          service.execute({
            command,
            targetId: CASE,
            payload,
            headers: {
              'If-Match': '"1"',
              'Idempotency-Key': 'review-authorized',
            },
            principal,
          }),
        ).rejects.toBe(boundary);
        expect(database.tx).toHaveBeenCalledOnce();
      });
    }
  }
});
