// R-0012 TASK-0011 (Inspector). `forms/form-gate.ts` (contrato CTG-0002c §2: tipos comuns,
// máscaras e helpers zod) — ainda não existe (TASK-0012): a importação falha com "Cannot find
// module" (estado esperado, contrato §1). Critérios C-2C-01…09 (§8). Datas civis fixas
// (literais do próprio §8); nunca `Date`.
import { z } from 'zod';
import {
  DOCUMENT_ACCEPT,
  FIELD_MASK_PATTERNS,
  aitNumber,
  businessDaysPositiveInt,
  cpfOrCnpj,
  dateNotAfterToday,
  dateNotBeforeToday,
  documentMaskFor,
  issueMessageKey,
  periodValid,
  plateBr,
} from './form-gate';

/** Primeira issue do resultado (o contrato §8 afirma `issues[0]`). */
function firstIssue(result: z.ZodSafeParseResult<unknown>): {
  code: string;
  message: string;
} {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  const [issue] = result.error.issues;
  return { code: issue.code, message: issue.message };
}

describe('form-gate — cpfOrCnpj (C-2C-01, C-2C-02)', () => {
  it('dado "111.444.777-35" quando cpfOrCnpj.safeParse então success e data "11144477735"; dado "111.444.777-36" então falha com rait.forms.common.document_invalid; dado "11111111111" então falha [negativo]', () => {
    // C-2C-01
    const valid = cpfOrCnpj.safeParse('111.444.777-35');
    expect(valid.success).toBe(true);
    expect(valid.data).toBe('11144477735');

    expect(firstIssue(cpfOrCnpj.safeParse('111.444.777-36')).message).toBe(
      'rait.forms.common.document_invalid',
    );
    expect(cpfOrCnpj.safeParse('11111111111').success).toBe(false);
  });

  it('dado "11.222.333/0001-81" quando cpfOrCnpj.safeParse então success e data "11222333000181"; dado "11.222.333/0001-82" então falha; dado 10 ou 13 dígitos então falha [negativo]', () => {
    // C-2C-02
    const valid = cpfOrCnpj.safeParse('11.222.333/0001-81');
    expect(valid.success).toBe(true);
    expect(valid.data).toBe('11222333000181');

    expect(cpfOrCnpj.safeParse('11.222.333/0001-82').success).toBe(false);
    expect(cpfOrCnpj.safeParse('1114447773').success).toBe(false); // 10 dígitos
    expect(cpfOrCnpj.safeParse('1122233300018').success).toBe(false); // 13 dígitos
  });
});

describe('form-gate — plateBr (C-2C-03)', () => {
  it('dado "abc1d23", "ABC-1234", " abc1234 " quando plateBr.safeParse então success e data "ABC1D23" / "ABC1234"; dado "AB12345" ou "ABCD123" então falha com rait.forms.common.plate_invalid [negativo]', () => {
    // C-2C-03
    const mercosul = plateBr.safeParse('abc1d23');
    expect(mercosul.success).toBe(true);
    expect(mercosul.data).toBe('ABC1D23');

    const hyphen = plateBr.safeParse('ABC-1234');
    expect(hyphen.success).toBe(true);
    expect(hyphen.data).toBe('ABC1234');

    const spaced = plateBr.safeParse(' abc1234 ');
    expect(spaced.success).toBe(true);
    expect(spaced.data).toBe('ABC1234');

    expect(firstIssue(plateBr.safeParse('AB12345')).message).toBe(
      'rait.forms.common.plate_invalid',
    );
    expect(firstIssue(plateBr.safeParse('ABCD123')).message).toBe(
      'rait.forms.common.plate_invalid',
    );
  });
});

describe('form-gate — aitNumber (C-2C-04)', () => {
  it('dado "E123456789" quando aitNumber.safeParse então success; dado "E1 E2", "E1,E2", "E1;E2", "E1/E2" então falha com rait.forms.common.ait_single; dado "" então falha (too_small) [negativo]', () => {
    // C-2C-04
    expect(aitNumber.safeParse('E123456789').success).toBe(true);
    for (const multiple of ['E1 E2', 'E1,E2', 'E1;E2', 'E1/E2']) {
      expect(firstIssue(aitNumber.safeParse(multiple)).message).toBe(
        'rait.forms.common.ait_single',
      );
    }
    expect(firstIssue(aitNumber.safeParse('')).code).toBe('too_small');
  });
});

describe('form-gate — dateNotAfterToday / dateNotBeforeToday (C-2C-05)', () => {
  it('dado dateNotAfterToday("2026-09-22") quando safeParse("2026-09-22") e ("2026-01-01") então success; ("2026-09-23") falha com rait.forms.common.date_future; dateNotBeforeToday espelhado com rait.forms.common.date_past; "2026-9-1" falha (formato)', () => {
    // C-2C-05 — `today` injetado como string fixa (contrato §2.2), nunca calculado
    const notAfter = dateNotAfterToday('2026-09-22');
    expect(notAfter.safeParse('2026-09-22').success).toBe(true);
    expect(notAfter.safeParse('2026-01-01').success).toBe(true);
    expect(firstIssue(notAfter.safeParse('2026-09-23')).message).toBe(
      'rait.forms.common.date_future',
    );

    const notBefore = dateNotBeforeToday('2026-09-22');
    expect(notBefore.safeParse('2026-09-22').success).toBe(true);
    expect(notBefore.safeParse('2026-09-23').success).toBe(true);
    expect(firstIssue(notBefore.safeParse('2026-01-01')).message).toBe(
      'rait.forms.common.date_past',
    );

    expect(firstIssue(notAfter.safeParse('2026-9-1')).code).toBe(
      'invalid_format',
    );
    expect(firstIssue(notBefore.safeParse('2026-9-1')).code).toBe(
      'invalid_format',
    );
  });
});

describe('form-gate — businessDaysPositiveInt (C-2C-06)', () => {
  it('dado businessDaysPositiveInt quando safeParse(15) então success; (0), (-1), (1.5), ("15") falham [negativo]', () => {
    // C-2C-06
    expect(businessDaysPositiveInt.safeParse(15).success).toBe(true);
    expect(businessDaysPositiveInt.safeParse(0).success).toBe(false);
    expect(businessDaysPositiveInt.safeParse(-1).success).toBe(false);
    expect(businessDaysPositiveInt.safeParse(1.5).success).toBe(false);
    expect(businessDaysPositiveInt.safeParse('15').success).toBe(false);
  });
});

describe('form-gate — issueMessageKey (C-2C-07)', () => {
  function issueOf(result: z.ZodSafeParseResult<unknown>): z.core.$ZodIssue {
    expect(result.success).toBe(false);
    if (result.success) throw new Error('unreachable');
    return result.error.issues[0];
  }

  it('dado issueMessageKey então: custom com message rait.forms.x.y → ela mesma; too_small e invalid_type → rait.forms.common.required; invalid_format → format_invalid; invalid_value → enum_invalid; unrecognized_keys → unknown_field; too_big → too_long', () => {
    // C-2C-07
    const custom = issueOf(
      z
        .string()
        .refine(() => false, { message: 'rait.forms.x.y' })
        .safeParse('v'),
    );
    expect(custom.code).toBe('custom');
    expect(issueMessageKey(custom)).toBe('rait.forms.x.y');

    const tooSmall = issueOf(z.string().min(1).safeParse(''));
    expect(tooSmall.code).toBe('too_small');
    expect(issueMessageKey(tooSmall)).toBe('rait.forms.common.required');

    const invalidType = issueOf(z.string().safeParse(undefined));
    expect(invalidType.code).toBe('invalid_type');
    expect(issueMessageKey(invalidType)).toBe('rait.forms.common.required');

    const invalidFormat = issueOf(z.iso.date().safeParse('2026-9-1'));
    expect(invalidFormat.code).toBe('invalid_format');
    expect(issueMessageKey(invalidFormat)).toBe(
      'rait.forms.common.format_invalid',
    );

    const invalidValue = issueOf(z.enum(['a', 'b']).safeParse('c'));
    expect(invalidValue.code).toBe('invalid_value');
    expect(issueMessageKey(invalidValue)).toBe(
      'rait.forms.common.enum_invalid',
    );

    const unrecognized = issueOf(z.strictObject({}).safeParse({ extra: 1 }));
    expect(unrecognized.code).toBe('unrecognized_keys');
    expect(issueMessageKey(unrecognized)).toBe(
      'rait.forms.common.unknown_field',
    );

    const tooBig = issueOf(z.string().max(1).safeParse('ab'));
    expect(tooBig.code).toBe('too_big');
    expect(issueMessageKey(tooBig)).toBe('rait.forms.common.too_long');
  });
});

describe('form-gate — documentMaskFor, FIELD_MASK_PATTERNS, DOCUMENT_ACCEPT (C-2C-08)', () => {
  it('dado documentMaskFor então "123" e "11144477735" → cpf; "111444777355" → cnpj; FIELD_MASK_PATTERNS tem exatamente as 6 chaves de FieldMask; DOCUMENT_ACCEPT deep-equal [application/pdf, image/jpeg, image/png]', () => {
    // C-2C-08
    expect(documentMaskFor('123')).toBe('cpf');
    expect(documentMaskFor('11144477735')).toBe('cpf');
    expect(documentMaskFor('111444777355')).toBe('cnpj');

    expect(Object.keys(FIELD_MASK_PATTERNS).sort()).toEqual(
      ['ait', 'cnpj', 'cpf', 'date', 'placa', 'protocol'].sort(),
    );
    expect([...DOCUMENT_ACCEPT]).toEqual([
      'application/pdf',
      'image/jpeg',
      'image/png',
    ]);
  });
});

describe('form-gate — periodValid (C-2C-09)', () => {
  it('dado periodValid então ("2026-09-01","2026-09-01") true, ("2026-09-01","2026-09-30") true, ("2026-09-30","2026-09-01") false', () => {
    // C-2C-09
    expect(periodValid('2026-09-01', '2026-09-01')).toBe(true);
    expect(periodValid('2026-09-01', '2026-09-30')).toBe(true);
    expect(periodValid('2026-09-30', '2026-09-01')).toBe(false);
  });
});
