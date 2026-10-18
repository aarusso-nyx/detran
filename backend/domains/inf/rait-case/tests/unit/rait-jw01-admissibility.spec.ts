// TASK-0025: JW01-admissibility.md / ADR-0041. Public controller contracts, not SQL mocks.
import { describe, expect, it, vi } from 'vitest';
import {
  DETRAN_ACTION_METADATA_KEY,
  DETRAN_RESOURCE_METADATA_KEY,
} from '@detran/shared';
import { RaitCaseCommandsController } from '../../src/handwritten/rait-case-commands.controller.js';
import { RaitAdmissibilityCommandsController } from '../../src/handwritten/rait-admissibility-commands.controller.js';

const CASE = '00000000-0000-7000-8000-000010000002';
describe('TASK25 F01/R01 mounted command boundary', () => {
  it('triage forwards strict command, case ETag and opaque key, returns data/events only', async () => {
    const data = { id: CASE, state: 'TRIAGEM_ADMISSIBILIDADE', version: 2 };
    const execute = vi
      .fn()
      .mockResolvedValue({ data, events: ['rait.case.changed'], etag: '"2"' });
    const controller = new RaitCaseCommandsController({ execute } as never);
    const setHeader = vi.fn();
    expect(
      await controller.triage(CASE, {}, '"1"', 'opaque-triage', { setHeader }),
    ).toEqual({ data, events: ['rait.case.changed'] });
    expect(execute).toHaveBeenCalledWith({
      command: 'triage',
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
      await controller.create(body, '"2"', 'opaque-save', { setHeader }),
    ).toEqual({ data, events: ['rait.case.changed'] });
    expect(execute).toHaveBeenCalledWith({
      payload: body,
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
      ),
    ).rejects.toBe(failure);
    expect(setHeader).not.toHaveBeenCalled();
  });
});
