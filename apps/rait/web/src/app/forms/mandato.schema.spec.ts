// R-0012 TASK-0011 (Inspector). `forms/mandato.schema.ts` (contrato CTG-0002c §4.12) — ainda
// não existe (TASK-0012): a importação falha com "Cannot find module" (estado esperado,
// contrato §1). Critérios C-2C-60…62 (§8). Ids canônicos de `http-fixtures.ts`; dupla
// composição e sobreposição são fatos do servidor espelhados em `context` (§2.4).
import type { z } from 'zod';
import { MANDATO_GATE, MANDATO_MASKS, MandatoSchema } from './mandato.schema';
import { FIXED_NOW_ISO } from '../../testing/clock.stub';
import { GATES_FIXTURE } from '../../testing/gates.fixture';
import { POOL_IDS, USER_IDS } from '../../testing/http-fixtures';

const MANDATE_STARTS_ON = FIXED_NOW_ISO.slice(0, 10); // '2026-09-14'
const EARLIER_DAY = '2026-09-13'; // literal fixo, anterior ao início; nunca calculado

/** Corpo canônico do §8 C-2C-60. */
const VALID_BODY = {
  poolId: POOL_IDS.jari,
  personId: USER_IDS['rait-rapporteur'],
  memberRole: 'relator',
  appointmentActRef: 'Portaria 1/2026',
  representationBlock: null,
  isSubstitute: false,
  mandateStartsOn: MANDATE_STARTS_ON,
  mandateEndsOn: null,
  context: {
    judgingBody: 'jari',
    otherBodyActiveMandate: false,
    overlapsExisting: false,
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

function withContext(patch: Record<string, unknown>): Record<string, unknown> {
  return { ...VALID_BODY, context: { ...VALID_BODY.context, ...patch } };
}

describe('MandatoSchema', () => {
  it('dado o corpo canônico (JARI, relator, ato de nomeação) quando safeParse então success; appointmentActRef vazio então falha em [appointmentActRef]', () => {
    // C-2C-60
    expect(MandatoSchema.safeParse(VALID_BODY).success).toBe(true);

    const noAct = MandatoSchema.safeParse({
      ...VALID_BODY,
      appointmentActRef: '',
    });
    expect(issues(noAct)[0].path).toEqual(['appointmentActRef']);
  });

  it('dado R1 otherBodyActiveMandate true então falha em [personId] personId.dual_body; R2 overlapsExisting true então [mandateStartsOn] mandateStartsOn.overlap', () => {
    // C-2C-61
    expect(
      issues(
        MandatoSchema.safeParse(withContext({ otherBodyActiveMandate: true })),
      ),
    ).toContainEqual({
      path: ['personId'],
      message: 'rait.forms.mandato.personId.dual_body',
    });

    expect(
      issues(MandatoSchema.safeParse(withContext({ overlapsExisting: true }))),
    ).toContainEqual({
      path: ['mandateStartsOn'],
      message: 'rait.forms.mandato.mandateStartsOn.overlap',
    });
  });

  it('dado R3 judgingBody cetran com representationBlock null então [representationBlock] representationBlock.required; com sociedade_civil então success; R4 mandateEndsOn anterior ao início então period_invalid; MANDATO_GATE e MANDATO_MASKS conforme §4.12', () => {
    // C-2C-62
    const cetranWithoutBlock = MandatoSchema.safeParse({
      ...withContext({ judgingBody: 'cetran' }),
      poolId: POOL_IDS.cetran,
    });
    expect(issues(cetranWithoutBlock)).toContainEqual({
      path: ['representationBlock'],
      message: 'rait.forms.mandato.representationBlock.required',
    });

    const cetranWithBlock = MandatoSchema.safeParse({
      ...withContext({ judgingBody: 'cetran' }),
      poolId: POOL_IDS.cetran,
      representationBlock: 'sociedade_civil',
    });
    expect(cetranWithBlock.success).toBe(true);

    const invalidPeriod = MandatoSchema.safeParse({
      ...VALID_BODY,
      mandateEndsOn: EARLIER_DAY,
    });
    expect(issues(invalidPeriod)).toContainEqual({
      path: ['mandateEndsOn'],
      message: 'rait.forms.common.period_invalid',
    });

    expect(MANDATO_GATE).toEqual(GATES_FIXTURE['MANDATO_GATE']);
    expect(MANDATO_MASKS).toEqual({
      mandateStartsOn: 'date',
      mandateEndsOn: 'date',
    });
  });
});
