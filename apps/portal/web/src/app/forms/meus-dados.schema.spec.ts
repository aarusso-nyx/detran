// R-0014 TASK-0008 (Inspector). `forms/meus-dados.schema.ts` (novo, contrato CTG-0003a §6.2;
// espelha o título `lgpd_declaracao` do schema JSON §5.1) — ainda não existe (TASK-0009): a
// importação falha com "Cannot find module" (estado esperado, §9 do contrato).
import { MeusDadosSchema, MEUS_DADOS_GATE } from './meus-dados.schema';
import { MEUS_DADOS_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = { scope: 'confirmacao' as const };

describe('MeusDadosSchema', () => {
  it('dado o corpo canônico (schema JSON §5.1, título lgpd_declaracao) então safeParse.success', () => {
    // C-3a-93
    expect(MeusDadosSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it('dado sem scope então falha', () => {
    expect(MeusDadosSchema.safeParse({}).success).toBe(false);
  });

  it('dado scope inválido então falha (enum)', () => {
    expect(MeusDadosSchema.safeParse({ scope: 'invalido' }).success).toBe(
      false,
    );
  });

  it('dado fields opcional então sucesso', () => {
    expect(
      MeusDadosSchema.safeParse({
        scope: 'correcao',
        fields: ['nome'],
      }).success,
    ).toBe(true);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(MeusDadosSchema.safeParse({ ...VALID_BODY, extra: 1 }).success).toBe(
      false,
    );
  });

  it('dado MEUS_DADOS_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(MEUS_DADOS_GATE).toEqual(MEUS_DADOS_GATE_FIXTURE);
  });
});
