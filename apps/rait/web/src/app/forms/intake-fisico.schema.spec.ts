// R-0012 TASK-0011 (Inspector). `forms/intake-fisico.schema.ts` (contrato CTG-0002c §4.1) —
// ainda não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-10…16 (§8). `today` = dia civil de `FIXED_NOW_ISO`
// (`clock.stub.ts`); o "dia seguinte" é string fixa do spec, nunca calculada (§2.2).
import type { z } from 'zod';
import {
  INTAKE_FISICO_GATE,
  INTAKE_FISICO_MASKS,
  IntakeFisicoSchema,
} from './intake-fisico.schema';
import { FIXED_NOW_ISO } from '../../testing/clock.stub';
import { GATES_FIXTURE } from '../../testing/gates.fixture';

const TODAY = FIXED_NOW_ISO.slice(0, 10); // '2026-09-14'
const TOMORROW = '2026-09-15'; // dia civil seguinte a TODAY — literal fixo, não calculado

/** Corpo canônico do §8 C-2C-10 (literais do contrato). */
const VALID_BODY = {
  channel: 'balcao',
  markOn: TODAY,
  plate: 'ABC1D23',
  aitNumber: 'E123456789',
  applicant: {
    name: 'Requerente das fixtures',
    document: '111.444.777-35',
    address: 'Endereço das fixtures',
    legitimacyBasis: 'proprietario',
  },
  signaturePresent: true,
  documents: [
    {
      kind: 'requerimento',
      fileName: 'requerimento.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1024,
      digitisedFromPaper: true,
    },
  ],
  context: { today: TODAY },
};

type Body = typeof VALID_BODY;

function firstIssue(result: z.ZodSafeParseResult<unknown>): {
  path: PropertyKey[];
  message: string;
} {
  expect(result.success).toBe(false);
  if (result.success) throw new Error('unreachable');
  const [issue] = result.error.issues;
  return { path: [...issue.path], message: issue.message };
}

/** Remove o campo `path` (uma ou duas partes) do corpo canônico. */
function without(body: Body, path: string): Record<string, unknown> {
  const [head, tail] = path.split('.');
  if (tail === undefined) {
    const { [head as keyof Body]: _omit, ...rest } = body;
    return rest;
  }
  const nested = { ...(body[head as keyof Body] as Record<string, unknown>) };
  delete nested[tail];
  return { ...body, [head]: nested };
}

describe('IntakeFisicoSchema', () => {
  it('dado o corpo canônico quando safeParse então success e data.applicant.document === "11144477735"', () => {
    // C-2C-10
    const result = IntakeFisicoSchema.safeParse(VALID_BODY);
    expect(result.success).toBe(true);
    expect(result.data?.applicant.document).toBe('11144477735');
  });

  it.each([
    'channel',
    'markOn',
    'plate',
    'aitNumber',
    'applicant.name',
    'applicant.document',
    'applicant.address',
    'signaturePresent',
    'documents',
    'context',
  ])(
    'dado o corpo sem %s quando safeParse então falha no path do campo [negativo]',
    (field) => {
      // C-2C-11
      const result = IntakeFisicoSchema.safeParse(without(VALID_BODY, field));
      expect(firstIssue(result).path).toEqual(field.split('.'));
    },
  );

  it('dado R1 aitNumber "E1 E2" quando safeParse então falha em [aitNumber] com rait.forms.common.ait_single', () => {
    // C-2C-12
    const result = IntakeFisicoSchema.safeParse({
      ...VALID_BODY,
      aitNumber: 'E1 E2',
    });
    expect(firstIssue(result)).toEqual({
      path: ['aitNumber'],
      message: 'rait.forms.common.ait_single',
    });
  });

  it('dado R2 document "111.444.777-36" quando safeParse então falha em [applicant, document] com rait.forms.common.document_invalid', () => {
    // C-2C-13
    const result = IntakeFisicoSchema.safeParse({
      ...VALID_BODY,
      applicant: { ...VALID_BODY.applicant, document: '111.444.777-36' },
    });
    expect(firstIssue(result)).toEqual({
      path: ['applicant', 'document'],
      message: 'rait.forms.common.document_invalid',
    });
  });

  it('dado R3 markOn = dia seguinte a today quando safeParse então falha em [markOn] com rait.forms.common.date_future; markOn = today então success', () => {
    // C-2C-14
    expect(TODAY).toBe('2026-09-14'); // âncora da string fixa TOMORROW
    const future = IntakeFisicoSchema.safeParse({
      ...VALID_BODY,
      markOn: TOMORROW,
    });
    expect(firstIssue(future)).toEqual({
      path: ['markOn'],
      message: 'rait.forms.common.date_future',
    });
    expect(
      IntakeFisicoSchema.safeParse({ ...VALID_BODY, markOn: TODAY }).success,
    ).toBe(true);
  });

  it('dado R4 documents [] quando safeParse então falha em [documents]; contentType text/plain então falha em [documents, 0, contentType]; chave extra então falha (strict) [negativo]', () => {
    // C-2C-15
    const empty = IntakeFisicoSchema.safeParse({
      ...VALID_BODY,
      documents: [],
    });
    expect(firstIssue(empty).path).toEqual(['documents']);

    const wrongType = IntakeFisicoSchema.safeParse({
      ...VALID_BODY,
      documents: [{ ...VALID_BODY.documents[0], contentType: 'text/plain' }],
    });
    expect(firstIssue(wrongType).path).toEqual(['documents', 0, 'contentType']);

    expect(
      IntakeFisicoSchema.safeParse({ ...VALID_BODY, extra: true }).success,
    ).toBe(false);
  });

  it('dado INTAKE_FISICO_GATE então toEqual(GATES_FIXTURE.INTAKE_FISICO_GATE); INTAKE_FISICO_MASKS deep-equal { markOn: date, plate: placa, aitNumber: ait, applicant.document: cpf }', () => {
    // C-2C-16
    expect(INTAKE_FISICO_GATE).toEqual(GATES_FIXTURE['INTAKE_FISICO_GATE']);
    expect(INTAKE_FISICO_MASKS).toEqual({
      markOn: 'date',
      plate: 'placa',
      aitNumber: 'ait',
      'applicant.document': 'cpf',
    });
  });
});
