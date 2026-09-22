// R-0012 TASK-0011 (Inspector). `forms/parametro.schema.ts` (contrato CTG-0002c §4.15) — ainda
// não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-69…72 (§8). `key` e `valueType` vêm do
// `parameter-catalogue.md` (`rait.wip.limit`, tipo `int`); `today` = dia civil de
// `FIXED_NOW_ISO`; o dia anterior é literal fixo, nunca calculado.
import type { z } from 'zod';
import {
  PARAMETRO_GATE,
  PARAMETRO_MASKS,
  ParametroSchema,
} from './parametro.schema';
import { FIXED_NOW_ISO } from '../../testing/clock.stub';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const TODAY = FIXED_NOW_ISO.slice(0, 10); // '2026-09-14'
const YESTERDAY = '2026-09-13'; // literal fixo, anterior a TODAY

/** Corpo canônico do §8 C-2C-69 (`rait.wip.limit`, `int`, `parameter-catalogue.md`). */
const VALID_BODY = {
  key: 'rait.wip.limit',
  value: 50,
  reason: 'Ajuste de capacidade aprovado pelo coordenador.',
  effectiveFrom: TODAY,
  context: {
    today: TODAY,
    legalReadonly: false,
    sourcePending: false,
    valueType: 'int',
    allowed: null,
  },
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

/** Corpo com `valueType`/`allowed` e `value` do caso (R2). */
function withValue(
  valueType: string | null,
  value: unknown,
  allowed: readonly string[] | null = null,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    ...VALID_BODY,
    context: { ...VALID_BODY.context, valueType, allowed },
  };
  if (value === undefined) delete body['value'];
  else body['value'] = value;
  return body;
}

describe('ParametroSchema', () => {
  it('dado o corpo canônico (rait.wip.limit, valueType int, vigência hoje) quando safeParse então success; reason vazia então falha', () => {
    // C-2C-69
    expect(ParametroSchema.safeParse(VALID_BODY).success).toBe(true);

    const noReason = ParametroSchema.safeParse({ ...VALID_BODY, reason: '' });
    expect(issues(noReason)[0].path).toEqual(['reason']);
  });

  it('dado R1 legalReadonly true então falha em [key] key.legal_readonly', () => {
    // C-2C-70
    const readonlyParameter = ParametroSchema.safeParse({
      ...VALID_BODY,
      context: { ...VALID_BODY.context, legalReadonly: true },
    });
    expect(issues(readonlyParameter)).toContainEqual({
      path: ['key'],
      message: 'rait.forms.parametro.key.legal_readonly',
    });
  });

  it.each([
    [
      'int com 1.5',
      'int',
      1.5,
      null,
      'rait.forms.parametro.value.type_invalid',
    ],
    [
      'dias úteis com 0',
      'dias úteis',
      0,
      null,
      'rait.forms.parametro.value.type_invalid',
    ],
    [
      'F com "true" (string)',
      'F',
      'true',
      null,
      'rait.forms.parametro.value.type_invalid',
    ],
    [
      'enum fora de allowed',
      'enum',
      'x',
      ['pull', 'round_robin'],
      'rait.forms.parametro.value.type_invalid',
    ],
    [
      'json inválido',
      'json',
      '{',
      null,
      'rait.forms.parametro.value.json_invalid',
    ],
    [
      'sem valueType e sem value',
      null,
      undefined,
      null,
      'rait.forms.parametro.value.required',
    ],
  ] as const)(
    'dado R2 %s então falha em [value] com a chave da regra',
    (_name, valueType, value, allowed, message) => {
      // C-2C-71 (parte 1)
      const result = ParametroSchema.safeParse(
        withValue(valueType, value, allowed),
      );
      expect(issues(result)).toContainEqual({ path: ['value'], message });
    },
  );

  it.each([
    ['dias úteis com 15', 'dias úteis', 15, null],
    ['F com true', 'F', true, null],
    ['enum com pull', 'enum', 'pull', ['pull', 'round_robin']],
    ['json com {"a":1}', 'json', '{"a":1}', null],
    ['BRL com 12.5', 'BRL', 12.5, null],
  ] as const)(
    'dado R2 %s então success',
    (_name, valueType, value, allowed) => {
      // C-2C-71 (parte 2)
      expect(
        ParametroSchema.safeParse(withValue(valueType, value, allowed)).success,
      ).toBe(true);
    },
  );

  it('dado R3 effectiveFrom = dia anterior a today então [effectiveFrom] rait.forms.common.date_past; PARAMETRO_GATE toEqual fixture; PARAMETRO_MASKS { effectiveFrom: date }', () => {
    // C-2C-72
    expect(TODAY).toBe('2026-09-14'); // âncora da string fixa YESTERDAY
    const past = ParametroSchema.safeParse({
      ...VALID_BODY,
      effectiveFrom: YESTERDAY,
    });
    expect(issues(past)).toContainEqual({
      path: ['effectiveFrom'],
      message: 'rait.forms.common.date_past',
    });

    expect(PARAMETRO_GATE).toEqual(GATES_FIXTURE['PARAMETRO_GATE']);
    expect(PARAMETRO_MASKS).toEqual({ effectiveFrom: 'date' });
  });
});
