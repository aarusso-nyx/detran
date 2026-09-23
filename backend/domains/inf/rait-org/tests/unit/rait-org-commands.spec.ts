import { describe, expect, it, vi } from 'vitest';
import { RaitOrgCommandsController } from '../../src/handwritten/index.js';

const response = () => ({ setHeader: vi.fn() });
const context = {
  snapshot: () => ({ actorId: '10000000-0000-4000-8000-000000000001' }),
};

describe('CTG-0004 — comandos de organização', () => {
  it('dado ato de suspensão quando criado então o signatário vem do contexto', async () => {
    const create = vi
      .fn()
      .mockImplementation(async (value) => ({ id: 'act-1', ...value }));
    const controller = new RaitOrgCommandsController(
      { create } as never,
      {} as never,
      {} as never,
      context as never,
    );
    const result = await controller.createSuspensionAct(
      {
        reason: 'força maior',
        starts_on: '2026-09-22',
        ends_on: '2026-09-23',
        evidence_document_id: 'doc-1',
        signed_by: 'forged',
      },
      response(),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        signed_by: '10000000-0000-4000-8000-000000000001',
      }),
    );
    expect(result.data).toMatchObject({ id: 'act-1' });
  });

  it('dada aprovação sem If-Match quando solicitada então falha 428 sem atualização', async () => {
    const update = vi.fn();
    const controller = new RaitOrgCommandsController(
      {} as never,
      { update } as never,
      {} as never,
      context as never,
    );
    await expect(
      controller.approveJetonSheet('sheet-1', undefined, response()),
    ).rejects.toMatchObject({
      code: 'RAIT.IF_MATCH_REQUIRED',
      status: 428,
    });
    expect(update).not.toHaveBeenCalled();
  });
});
