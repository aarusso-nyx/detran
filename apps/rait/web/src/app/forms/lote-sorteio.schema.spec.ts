// R-0012 TASK-0011 (Inspector). `forms/lote-sorteio.schema.ts` (contrato CTG-0002c §4.7) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-40…42 (§8). Ids canônicos de
// `docs/framework/arch/fixtures/rait-fixtures.json` (`kb.ts` `FIXTURES_PATH`): pool da JARI e
// membros do pool; `weekStart` é a semana de referência dos lotes das fixtures (literal fixo).
import { readFileSync } from 'node:fs';
import type { z } from 'zod';
import {
  LOTE_SORTEIO_APPROVE_GATE,
  LOTE_SORTEIO_DRAW_GATE,
  LOTE_SORTEIO_GATE,
  LOTE_SORTEIO_MASKS,
  LoteSorteioSchema,
} from './lote-sorteio.schema';
import { FIXTURES_PATH } from '../../testing/kb';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { POOL_IDS } from '../../testing/http-fixtures';

interface PoolMemberFixture {
  readonly id: string;
  readonly pool: string;
}
const poolMembers = (
  JSON.parse(readFileSync(FIXTURES_PATH, 'utf8')) as {
    poolMembers: readonly PoolMemberFixture[];
  }
).poolMembers.filter((member) => member.pool === POOL_IDS.jari);
const [MEMBER_1, MEMBER_2] = poolMembers.map((member) => member.id);

/** Corpo canônico do §8 C-2C-40 (`weekStart` = semana do lote 1 das fixtures). */
const VALID_BODY = {
  poolId: POOL_IDS.jari,
  kind: 'semanal',
  weekStart: '2026-09-21',
};

function issues(result: z.ZodSafeParseResult<unknown>): {
  path: PropertyKey[];
  message: string;
}[] {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  return result.error.issues.map((issue) => ({
    path: [...issue.path],
    message: issue.message,
  }));
}

describe('LoteSorteioSchema', () => {
  it('dado o corpo canônico sem manualExclusions quando safeParse então success e data.manualExclusions deep-equal []; kind "mensal" então falha (enum); sem poolId/weekStart então falha no path', () => {
    // C-2C-40
    const result = LoteSorteioSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
    expect(result.data?.manualExclusions).toEqual([]);

    const badKind = LoteSorteioSchema.safeParse({
      ...VALID_BODY,
      kind: 'mensal',
    });
    expect(issues(badKind)[0].path).toEqual(['kind']);

    const { poolId: _pool, ...withoutPool } = VALID_BODY;
    expect(issues(LoteSorteioSchema.safeParse(withoutPool))[0].path).toEqual([
      'poolId',
    ]);
    const { weekStart: _week, ...withoutWeek } = VALID_BODY;
    expect(issues(LoteSorteioSchema.safeParse(withoutWeek))[0].path).toEqual([
      'weekStart',
    ]);
  });

  it('dado R1 exclusão com reason vazia então falha em [manualExclusions, 0, reason]; R2 dois itens com o mesmo memberId então falha em [manualExclusions, 1, memberId] manualExclusions.duplicate', () => {
    // C-2C-41
    const noReason = LoteSorteioSchema.safeParse({
      ...VALID_BODY,
      manualExclusions: [{ memberId: MEMBER_1, reason: '' }],
    });
    expect(issues(noReason)[0].path).toEqual(['manualExclusions', 0, 'reason']);

    const duplicate = LoteSorteioSchema.safeParse({
      ...VALID_BODY,
      manualExclusions: [
        { memberId: MEMBER_1, reason: 'Impedimento declarado.' },
        { memberId: MEMBER_1, reason: 'Repetido.' },
      ],
    });
    expect(issues(duplicate)).toContainEqual({
      path: ['manualExclusions', 1, 'memberId'],
      message: 'rait.forms.lote-sorteio.manualExclusions.duplicate',
    });

    const distinct = LoteSorteioSchema.safeParse({
      ...VALID_BODY,
      manualExclusions: [
        { memberId: MEMBER_1, reason: 'Impedimento declarado.' },
        { memberId: MEMBER_2, reason: 'Ausência programada.' },
      ],
    });
    expect(distinct.success).toBe(true);
  });

  it('dado LOTE_SORTEIO_GATE, LOTE_SORTEIO_DRAW_GATE e LOTE_SORTEIO_APPROVE_GATE então toEqual às fixtures; LOTE_SORTEIO_MASKS { weekStart: date }', () => {
    // C-2C-42
    expect(LOTE_SORTEIO_GATE).toEqual(GATES_FIXTURE['LOTE_SORTEIO_GATE']);
    expect(LOTE_SORTEIO_DRAW_GATE).toEqual(
      GATES_FIXTURE['LOTE_SORTEIO_DRAW_GATE'],
    );
    expect(LOTE_SORTEIO_APPROVE_GATE).toEqual(
      GATES_FIXTURE['LOTE_SORTEIO_APPROVE_GATE'],
    );
    expect(LOTE_SORTEIO_MASKS).toEqual({ weekStart: 'date' });
  });
});
