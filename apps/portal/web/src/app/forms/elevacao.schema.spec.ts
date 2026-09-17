// R-0014 TASK-0008 (Inspector). `forms/elevacao.schema.ts` (novo, contrato CTG-0003a §6.2;
// espelha `AssuranceElevationCreateDto`) — ainda não existe (TASK-0009): a importação falha com
// "Cannot find module" (estado esperado, §9 do contrato).
import { ElevacaoSchema, ELEVACAO_GATE } from './elevacao.schema';
import { ELEVACAO_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = {
  targetLevel: 'avancada' as const,
  method: 'biographic' as const,
  resumeRoute: '/autos/x/defesa/nova',
};

describe('ElevacaoSchema', () => {
  it('dado o corpo canônico (AssuranceElevationCreateDto) então safeParse.success', () => {
    // C-3a-93
    expect(ElevacaoSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it.each(['targetLevel', 'method', 'resumeRoute'] as const)(
    'dado o corpo sem %s então falha',
    (field) => {
      const { [field]: _omit, ...rest } = VALID_BODY;
      expect(ElevacaoSchema.safeParse(rest).success).toBe(false);
    },
  );

  it('dado method inválido então falha (enum)', () => {
    expect(
      ElevacaoSchema.safeParse({ ...VALID_BODY, method: 'invalido' }).success,
    ).toBe(false);
  });

  it('dado targetLevel diferente de avancada então falha (literal)', () => {
    expect(
      ElevacaoSchema.safeParse({ ...VALID_BODY, targetLevel: 'qualificada' })
        .success,
    ).toBe(false);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(ElevacaoSchema.safeParse({ ...VALID_BODY, extra: 1 }).success).toBe(
      false,
    );
  });

  it('dado ELEVACAO_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(ELEVACAO_GATE).toEqual(ELEVACAO_GATE_FIXTURE);
  });
});
