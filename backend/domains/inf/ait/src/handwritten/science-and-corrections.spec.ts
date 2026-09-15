import { describe, expect, it, vi } from 'vitest';

import { AitLifecycleService } from '../ait-lifecycle.service.js';

/**
 * CTG-0001 §4.3/§4.10/§4.11 (R-0008, TASK-0002) — C-0001-21..24: `science`
 * (RN-TEAT-005, recusa/impossibilidade nunca coexistem com assinatura),
 * `corrections` (RN-TEAT-006/119, fatos essenciais nunca são saneáveis) e
 * `corrections/{id}/approve` (correção de outro AIT). Ver nota de design em
 * `ait-state-transitions.matrix.spec.ts` sobre testar contra
 * `AitLifecycleService`.
 */

function stubService(
  overrides: {
    currentStatus?: string;
    correction?: { id: string; ait_id: string; justification: string };
  } = {},
) {
  const ait: Record<string, unknown> = {
    id: 'ait-1',
    current_status: overrides.currentStatus ?? 'RASCUNHO_OFFLINE',
    ait_number: '000001',
    series: 'F',
    version: 1,
  };
  const repositories = {
    ait: {
      transaction: vi.fn(async (work: (tx: unknown) => unknown) => work({})),
      findOne: vi.fn(async () => ({ ...ait })),
      update: vi.fn(async (_id: string, patch: Record<string, unknown>) => ({
        ...ait,
        ...patch,
      })),
    } as never,
    history: { create: vi.fn(async (dto: unknown) => dto) } as never,
    vehicles: {} as never,
    people: {} as never,
    corrections: {
      create: vi.fn(async (dto: unknown) => dto),
      findOne: vi.fn(
        async () =>
          overrides.correction ?? {
            id: 'correction-1',
            ait_id: ait.id,
            justification: 'saneamento aprovado',
          },
      ),
      update: vi.fn(async (_id: string, patch: unknown) => patch),
    } as never,
    signatures: { create: vi.fn(async (dto: unknown) => dto) } as never,
    printEvents: {} as never,
  };
  return new AitLifecycleService(repositories, { assertActive: vi.fn() });
}

describe('AIT — science: recusa/impossibilidade nunca coexistem com assinatura (C-0001-21/22, RN-TEAT-005)', () => {
  it('C-0001-21 — dado signature_type="refused" sem refusal_or_impossibility_reason então 400 TEAT.AIT_SIGNATURE_OUTCOME_INVALID com context.signatureType', async () => {
    const service = stubService();
    await expect(
      service.recordScience('ait-1', { signature_type: 'refused' } as never),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_SIGNATURE_OUTCOME_INVALID',
      status: 400,
      context: expect.objectContaining({ signatureType: 'refused' }),
    });
  });

  it('C-0001-22 — dado signature_type="signed" e refusal_or_impossibility_reason preenchido então 400 TEAT.AIT_SIGNATURE_OUTCOME_INVALID (o mesmo código)', async () => {
    const service = stubService();
    await expect(
      service.recordScience('ait-1', {
        signature_type: 'signed',
        refusal_or_impossibility_reason: 'não deveria estar preenchido',
      } as never),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_SIGNATURE_OUTCOME_INVALID',
      status: 400,
      context: expect.objectContaining({ signatureType: 'signed' }),
    });
  });
});

describe('AIT — corrections: fato essencial nunca é saneável (C-0001-23, RN-TEAT-006/119)', () => {
  it('C-0001-23 — dado changed_field="ait_number" então 422 TEAT.AIT_CORRECTION_FIELD_FORBIDDEN com context.field e context.allowed[]', async () => {
    const service = stubService({ currentStatus: 'PENDENTE_CORRECAO' });
    await expect(
      service.addCorrection('ait-1', {
        operator_user_ref: 'actor-1',
        correction_type: 'numero',
        changed_field: 'ait_number',
        justification: 'tentativa de alterar fato essencial',
      } as never),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CORRECTION_FIELD_FORBIDDEN',
      status: 422,
      context: expect.objectContaining({
        field: 'ait_number',
        allowed: expect.any(Array),
      }),
    });
  });
});

describe('AIT — corrections/{id}/approve: correção de outro AIT (C-0001-24)', () => {
  it('C-0001-24 — dado uma correção cujo ait_id difere do AIT informado então 404 TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT', async () => {
    const service = stubService({
      currentStatus: 'PENDENTE_CORRECAO',
      correction: {
        id: 'correction-other',
        ait_id: 'ait-other',
        justification: 'de outro AIT',
      },
    });
    await expect(
      service.approveCorrection('ait-1', 'correction-other', 'actor-1'),
    ).rejects.toMatchObject({
      code: 'TEAT.AIT_CORRECTION_NOT_FOUND_FOR_AIT',
      status: 404,
    });
  });
});
