// R-0014 TASK-0008 (Inspector). `forms/manifestacao.schema.ts` (novo, contrato CTG-0003a §6.2)
// — ainda não existe (TASK-0009): a importação falha com "Cannot find module" (estado esperado,
// §9 do contrato).
import { ManifestacaoSchema, MANIFESTACAO_GATE } from './manifestacao.schema';
import { MANIFESTACAO_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  kind: 'reclamacao' as const,
  text: 'Relato do cidadão.',
  attachmentIds: [] as string[],
};

describe('ManifestacaoSchema', () => {
  it('dado o corpo canônico então safeParse.success', () => {
    // C-3a-93
    expect(ManifestacaoSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['kind', 'text', 'attachmentIds'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(ManifestacaoSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado kind inválido então falha (enum)', () => {
    expect(
      ManifestacaoSchema.safeParse({ ...VALID_BODY, kind: 'invalido' }).success,
    ).toBe(false);
  });

  it('dado confidential e anonymous opcionais então sucesso', () => {
    expect(
      ManifestacaoSchema.safeParse({
        ...VALID_BODY,
        confidential: true,
        anonymous: true,
      }).success,
    ).toBe(true);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      ManifestacaoSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado MANIFESTACAO_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(MANIFESTACAO_GATE).toEqual(MANIFESTACAO_GATE_FIXTURE);
  });
});
