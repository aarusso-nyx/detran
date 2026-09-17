// R-0014 TASK-0008 (Inspector). `forms/indicacao-condutor.schema.ts` (novo, contrato CTG-0003a
// §6.2) — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado
// esperado, §9 do contrato). CPF válido = 111.444.777-35, exemplo público de teste (dígitos
// verificadores calculados pelo algoritmo módulo 11 citado no contrato; não é dado de pessoa
// real).
import {
  IndicacaoCondutorSchema,
  INDICACAO_CONDUTOR_GATE,
} from './indicacao-condutor.schema';
import { INDICACAO_CONDUTOR_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  driver: {
    cpf: '11144477735',
    cnhNumber: '12345678900',
    cnhUf: 'AM',
    category: 'B',
    name: 'Condutor Indicado (fixture)',
  },
  signatures: { owner: 'govbr' as const, driver: 'govbr' as const },
  consequenceAck: {
    textVersion: 'v1',
    acceptedAt: '2026-09-14T12:00:00-04:00',
  },
};

describe('IndicacaoCondutorSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(IndicacaoCondutorSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['driver', 'signatures', 'consequenceAck'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(IndicacaoCondutorSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado signatures.owner inválido então falha (enum)', () => {
    const result = IndicacaoCondutorSchema.safeParse({
      ...VALID_BODY,
      signatures: { owner: 'invalido', driver: 'govbr' },
    });
    expect(result.success).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      IndicacaoCondutorSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it("dado cpf '123' então falha em driver.cpf; com dígitos verificadores inválidos então falha; com signatures.driver 'pending' então sucesso", () => {
    // C-3a-94
    const shortCpf = IndicacaoCondutorSchema.safeParse({
      ...VALID_BODY,
      driver: { ...VALID_BODY.driver, cpf: '123' },
    });
    expect(shortCpf.success).toBe(false);

    const badCheckDigits = IndicacaoCondutorSchema.safeParse({
      ...VALID_BODY,
      driver: { ...VALID_BODY.driver, cpf: '11144477736' },
    });
    expect(badCheckDigits.success).toBe(false);

    const pendingDriver = IndicacaoCondutorSchema.safeParse({
      ...VALID_BODY,
      signatures: { owner: 'govbr', driver: 'pending' },
    });
    expect(pendingDriver.success).toBe(true);
  });

  it('dado INDICACAO_CONDUTOR_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(INDICACAO_CONDUTOR_GATE).toEqual(INDICACAO_CONDUTOR_GATE_FIXTURE);
  });
});
