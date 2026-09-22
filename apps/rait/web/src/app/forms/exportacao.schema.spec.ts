// R-0012 TASK-0011 (Inspector). `forms/exportacao.schema.ts` (contrato CTG-0002c §4.16) — ainda
// não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-73…75 (§8). O limiar do DPO e a contagem estimada vêm do
// servidor (`rait.export.dpo_threshold_rows`) — o cliente só espelha.
import type { z } from 'zod';
import {
  EXPORTACAO_GATE,
  EXPORTACAO_MASKS,
  ExportacaoSchema,
} from './exportacao.schema';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const PERIOD_START = '2026-09-01';
const PERIOD_END = '2026-09-14';

/** Corpo canônico do §8 C-2C-73. */
const VALID_BODY = {
  purpose: 'Relatório trimestral do órgão.',
  scope: {
    periodStart: PERIOD_START,
    periodEnd: PERIOD_END,
    nominal: false,
  },
  dpoApprovalRequested: false,
  context: { estimatedRowCount: 10, dpoThresholdRows: 100 },
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

describe('ExportacaoSchema', () => {
  it('dado o corpo canônico (recorte não nominal, abaixo do limiar) quando safeParse então success; purpose vazio então falha em [purpose]', () => {
    // C-2C-73
    expect(ExportacaoSchema.safeParse(VALID_BODY).success).toBe(true);

    const noPurpose = ExportacaoSchema.safeParse({
      ...VALID_BODY,
      purpose: '',
    });
    expect(issues(noPurpose)[0].path).toEqual(['purpose']);
  });

  it('dado R1 nominal true com 100 linhas e limiar 100 sem aprovação então falha em [dpoApprovalRequested] required; com aprovação então success; contagem ou limiar null então success; nominal false com 1000 linhas então success', () => {
    // C-2C-74
    const massive = {
      ...VALID_BODY,
      scope: { ...VALID_BODY.scope, nominal: true },
      context: { estimatedRowCount: 100, dpoThresholdRows: 100 },
    };
    expect(issues(ExportacaoSchema.safeParse(massive))).toContainEqual({
      path: ['dpoApprovalRequested'],
      message: 'rait.forms.exportacao.dpoApprovalRequested.required',
    });

    expect(
      ExportacaoSchema.safeParse({ ...massive, dpoApprovalRequested: true })
        .success,
    ).toBe(true);
    expect(
      ExportacaoSchema.safeParse({
        ...massive,
        context: { estimatedRowCount: null, dpoThresholdRows: 100 },
      }).success,
    ).toBe(true);
    expect(
      ExportacaoSchema.safeParse({
        ...massive,
        context: { estimatedRowCount: 100, dpoThresholdRows: null },
      }).success,
    ).toBe(true);
    expect(
      ExportacaoSchema.safeParse({
        ...VALID_BODY,
        context: { estimatedRowCount: 1000, dpoThresholdRows: 100 },
      }).success,
    ).toBe(true);
  });

  it('dado R2 periodEnd anterior a periodStart então [scope, periodEnd] rait.forms.common.period_invalid; EXPORTACAO_GATE toEqual fixture; EXPORTACAO_MASKS conforme §4.16', () => {
    // C-2C-75
    const inverted = ExportacaoSchema.safeParse({
      ...VALID_BODY,
      scope: {
        ...VALID_BODY.scope,
        periodStart: PERIOD_END,
        periodEnd: PERIOD_START,
      },
    });
    expect(issues(inverted)).toContainEqual({
      path: ['scope', 'periodEnd'],
      message: 'rait.forms.common.period_invalid',
    });

    expect(EXPORTACAO_GATE).toEqual(GATES_FIXTURE['EXPORTACAO_GATE']);
    expect(EXPORTACAO_MASKS).toEqual({
      'scope.periodStart': 'date',
      'scope.periodEnd': 'date',
    });
  });
});
