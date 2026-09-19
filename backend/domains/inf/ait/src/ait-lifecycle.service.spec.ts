import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  AitLifecycleService,
  contentHashForAit,
} from './ait-lifecycle.service.js';

const lifecycleVocabularyDdl = readFileSync(
  new URL(
    '../../../../database/ddl/14-inf-lifecycle-vocabulary.sql',
    import.meta.url,
  ),
  'utf8',
);
const aitBlueprint = JSON.parse(
  readFileSync(
    new URL(
      '../../../../../docs/framework/blueprints/BP-INF-AIT-001.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  database: {
    entities: Array<{
      table: string;
      fields?: Array<{ name: string; default?: string }>;
      checks?: Array<{ name: string; expression: string }>;
    }>;
  };
};

describe('AitLifecycleService', () => {
  it('dado um AIT em RASCUNHO_OFFLINE quando finalizado então transita para FINALIZADO_LOCAL', async () => {
    const ait = {
      id: 'ait-canonico',
      current_status: 'RASCUNHO_OFFLINE',
      ait_number: '123',
      series: 'A',
    };
    const service = new AitLifecycleService(
      {
        ait: {
          transaction: vi.fn(async (work) => work({})),
          findOne: vi.fn(async () => ait),
          update: vi.fn(async (_id, patch) => ({ ...ait, ...patch })),
        } as never,
        history: { create: vi.fn(async (dto) => dto) } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );

    await expect(service.finalize(ait.id, 'actor-1')).resolves.toMatchObject({
      current_status: 'FINALIZADO_LOCAL',
    });
  });

  it('produces a stable legal-content hash independent of mutable delivery fields', () => {
    const baseline = {
      id: 'ait-1',
      ait_number: '123',
      series: 'A',
      current_status: 'draft',
      updated_at: 'one',
      receipt_protocol: null,
    };
    const changed = {
      ...baseline,
      updated_at: 'two',
      receipt_protocol: 'external',
    };
    expect(contentHashForAit(baseline as never)).toMatch(/^[a-f0-9]{64}$/u);
    expect(contentHashForAit(changed as never)).toBe(
      contentHashForAit(baseline as never),
    );
  });

  it('dado um AIT em RASCUNHO_OFFLINE quando finalizado então preserva hash assinatura e histórico', async () => {
    const draft = {
      id: 'ait-1',
      current_status: 'RASCUNHO_OFFLINE',
      ait_number: '123',
      series: 'A',
    };
    const update = vi.fn(async (_id, patch: Record<string, unknown>) => ({
      ...draft,
      ...patch,
    }));
    const history = vi.fn(async (dto) => dto);
    const transaction = vi.fn(async (work) => work({}));
    const service = new AitLifecycleService(
      {
        ait: {
          transaction,
          findOne: vi.fn(async () => draft),
          update,
        } as never,
        history: { create: history } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );
    const result = await service.finalize('ait-1', 'actor-1');
    expect(result.current_status).toBe('FINALIZADO_LOCAL');
    expect(result.content_hash).toMatch(/^[a-f0-9]{64}$/u);
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'FINALIZADO_LOCAL' }),
      expect.anything(),
    );
    expect(transaction).toHaveBeenCalledOnce();
  });

  it('dado AIT pós-final quando rejeitado com flag legada de cancelamento então produz somente REJEITADO', async () => {
    const ait = {
      id: 'ait-pos-final',
      current_status: 'VALIDANDO',
      ait_number: '456',
      series: 'B',
    };
    const update = vi.fn(async (_id, patch: Record<string, unknown>) => ({
      ...ait,
      ...patch,
    }));
    const history = vi.fn(async (dto) => dto);
    const service = new AitLifecycleService(
      {
        ait: {
          transaction: vi.fn(async (work) => work({})),
          findOne: vi.fn(async () => ait),
          update,
        } as never,
        history: { create: history } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );

    await expect(
      service.reject(ait.id, 'inconsistência', true, 'actor-1'),
    ).resolves.toMatchObject({ current_status: 'REJEITADO' });
    expect(update).toHaveBeenCalledWith(
      ait.id,
      { current_status: 'REJEITADO' },
      expect.anything(),
    );
    expect(history).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REJEITADO' }),
      expect.anything(),
    );
  });

  /**
   * CTG-0001 §8 (R-0008, TASK-0002) — C-0001-09/10. O serviço ainda lança
   * `BadRequestException` sem `code`/`status`/`context` e não incrementa
   * `version` nas transições (TASK-0003 substitui por `DetranError` com os
   * códigos do §4 do contrato e passa a gravar `version`); os dois testes
   * abaixo ficam vermelhos até lá pelo motivo certo — comportamento ausente,
   * não erro de escrita.
   */
  it('C-0001-09 — dado o AIT …f8000010 (RASCUNHO_OFFLINE, fixture 25-fixtures-teat.sql) quando finalize então FINALIZADO_LOCAL, content_hash não nulo e version +1', async () => {
    const ait = {
      id: '00000000-0000-7000-8000-0000f8000010',
      current_status: 'RASCUNHO_OFFLINE',
      ait_number: 'TEAT-010',
      series: 'F',
      version: 1,
    };
    const service = new AitLifecycleService(
      {
        ait: {
          transaction: vi.fn(async (work) => work({})),
          findOne: vi.fn(async () => ait),
          update: vi.fn(async (_id, patch) => ({ ...ait, ...patch })),
        } as never,
        history: { create: vi.fn(async (dto) => dto) } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );

    const result = await service.finalize(ait.id, 'actor-1');
    expect(result.current_status).toBe('FINALIZADO_LOCAL');
    expect(result.content_hash).toBeTruthy();
    expect(result.version).toBe(2);
  });

  it('C-0001-10 — dado o AIT …f8000130 (INTEGRADO) quando finalize então 409 TEAT.AIT_STATE_INVALID com context.allowed=["RASCUNHO_OFFLINE"] e context.command="finalize"', async () => {
    const ait = {
      id: '00000000-0000-7000-8000-0000f8000130',
      current_status: 'INTEGRADO',
      ait_number: 'TEAT-130',
      series: 'F',
      version: 1,
    };
    const service = new AitLifecycleService(
      {
        ait: {
          transaction: vi.fn(async (work) => work({})),
          findOne: vi.fn(async () => ait),
          update: vi.fn(async (_id, patch) => ({ ...ait, ...patch })),
        } as never,
        history: { create: vi.fn(async (dto) => dto) } as never,
        vehicles: {} as never,
        people: {} as never,
        corrections: {} as never,
        signatures: {} as never,
        printEvents: {} as never,
      },
      { assertActive: vi.fn() },
    );

    try {
      await service.finalize(ait.id, 'actor-1');
      expect.unreachable('finalize deveria lançar TEAT.AIT_STATE_INVALID');
    } catch (error) {
      const detranError = error as {
        code?: string;
        status?: number;
        context?: { allowed?: string[]; command?: string };
      };
      expect(detranError.code).toBe('TEAT.AIT_STATE_INVALID');
      expect(detranError.status).toBe(409);
      expect(detranError.context?.allowed).toEqual(['RASCUNHO_OFFLINE']);
      expect(detranError.context?.command).toBe('finalize');
    }
  });

  it('dado contrato CTG-0002 quando inspecionado então REJEITADO não é terminal e pedido de cancelamento tem estados fechados', () => {
    expect(lifecycleVocabularyDdl).toMatch(/\('REJEITADO',\s*100,\s*false,/u);
    const cancelRequest = aitBlueprint.database.entities.find(
      (entity) => entity.table === 'ait_cancel_request',
    );
    const status = cancelRequest?.fields?.find(
      (field) => field.name === 'status',
    );
    expect(status?.default).toBe("'requested'");
    expect(cancelRequest?.checks).toEqual(
      expect.arrayContaining([
        {
          name: 'ck_inf_ait_cancel_request_status',
          expression:
            "status in ('requested', 'under_review', 'approved', 'denied')",
        },
      ]),
    );
  });
});
