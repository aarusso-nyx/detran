// R-0014 TASK-0008 (Inspector). `forms/preferencias.schema.ts` (novo, contrato CTG-0003a §6.2;
// espelha `PreferencesUpdateDto`) — ainda não existe (TASK-0009): a importação falha com
// "Cannot find module" (estado esperado, §9 do contrato).
import { PreferenciasSchema, PREFERENCIAS_GATE } from './preferencias.schema';
import { PREFERENCIAS_GATE_FIXTURE } from '../../testing/gate-fixtures';

const VALID_BODY = { channel: 'push' as const };

describe('PreferenciasSchema', () => {
  it('dado o corpo canônico (PreferencesUpdateDto) então safeParse.success', () => {
    // C-3a-93
    expect(PreferenciasSchema.safeParse(VALID_BODY).success).toBe(true);
  });

  it('dado sem channel então falha', () => {
    expect(PreferenciasSchema.safeParse({}).success).toBe(false);
  });

  it('dado channel inválido então falha (enum)', () => {
    expect(PreferenciasSchema.safeParse({ channel: 'invalido' }).success).toBe(
      false,
    );
  });

  it('dado pushSubscription completo então sucesso', () => {
    expect(
      PreferenciasSchema.safeParse({
        channel: 'push',
        pushSubscription: {
          endpoint: 'https://push.fixtures.invalid/x',
          keys: { p256dh: 'k1', auth: 'k2' },
        },
      }).success,
    ).toBe(true);
  });

  it('dado chave extra então falha (strict)', () => {
    expect(
      PreferenciasSchema.safeParse({ ...VALID_BODY, extra: 1 }).success,
    ).toBe(false);
  });

  it('dado PREFERENCIAS_GATE então deep-equal à linha correspondente da tabela §6.2', () => {
    // C-3a-97
    expect(PREFERENCIAS_GATE).toEqual(PREFERENCIAS_GATE_FIXTURE);
  });
});
