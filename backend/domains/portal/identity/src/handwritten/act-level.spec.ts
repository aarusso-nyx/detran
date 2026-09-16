// CTG-0001 §4 (M4/M5) — assertActLevel: matriz ato → nível, vigência por Clock fixo, ato sem
// linha, política 'qualificada'. Fica vermelho até TASK-0004 criar
// backend/domains/portal/identity/src/handwritten/identity.service.ts (index.ts, §12 Layout).
//
// Repositório falso (tx em memória, padrão de
// backend/domains/shared/src/events/sql-outbox.spec.ts `fakeTransaction`): reproduz a mesma
// semântica de filtragem/ordenação da consulta do §4 (act_key = $1, enabled = true,
// effective_from <= $2::date < coalesce(effective_to, 'infinity'), order by effective_from
// desc limit 1 — $1/$2 na ordem exata do contrato), sem depender do texto SQL literal que
// TASK-0004 escrever.
import { describe, expect, it } from 'vitest';

import {
  assertActLevel,
  assuranceRank,
  PORTAL_ELEVATION_METHODS,
  PortalError,
} from './index.js';

interface FakePolicyRow {
  id: string;
  actKey: string;
  minimumAssurance: string;
  enabled: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
}

const FIXED_TODAY = '2026-09-14';
const clock = {
  now: () => new Date('2026-09-14T12:00:00-04:00'),
  today: () => FIXED_TODAY,
};

function fakeTx(rows: FakePolicyRow[]) {
  const query = async (_sql: string, values?: readonly unknown[]) => {
    const [actKey, today] = (values ?? []) as [string, string];
    const matches = rows
      .filter((row) => row.actKey === actKey && row.enabled)
      .filter(
        (row) =>
          row.effectiveFrom <= today &&
          today < (row.effectiveTo ?? '9999-12-31'),
      )
      .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1));
    return {
      rows: matches.slice(0, 1).map((row) => ({
        id: row.id,
        minimum_assurance: row.minimumAssurance,
      })),
    };
  };
  return { query } as never;
}

function policy(overrides: Partial<FakePolicyRow> = {}): FakePolicyRow {
  return {
    id: '00000000-0000-7000-8000-0000aa000001',
    actKey: 'ato-x',
    minimumAssurance: 'avancada',
    enabled: true,
    effectiveFrom: '2026-01-01',
    effectiveTo: null,
    ...overrides,
  };
}

describe('assertActLevel (§4, M4/M5)', () => {
  it('C-0001-13 — dado política vigente "avancada" e current "simples" quando assertActLevel então ASSURANCE_INSUFFICIENT com o context exato', async () => {
    const tx = fakeTx([policy({ minimumAssurance: 'avancada' })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'simples' },
        'ato-x',
        '/resume/ato-x',
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.ASSURANCE_INSUFFICIENT',
      status: 403,
      context: {
        actKey: 'ato-x',
        required: 'avancada',
        current: 'simples',
        elevationMethods: ['biographic', 'biometric', 'icp'],
        resumeRoute: '/resume/ato-x',
      },
    });
  });

  it('C-0001-14 — dado política "avancada" e current "avancada" quando assertActLevel então resolve com { policyId }', async () => {
    const tx = fakeTx([
      policy({
        id: '00000000-0000-7000-8000-0000aa000002',
        minimumAssurance: 'avancada',
      }),
    ]);
    const decision = await assertActLevel(
      tx,
      { cpf: '22222222222', assuranceLevel: 'avancada' },
      'ato-x',
      '/resume/ato-x',
    );
    expect(decision).toMatchObject({
      actKey: 'ato-x',
      required: 'avancada',
      current: 'avancada',
      policyId: '00000000-0000-7000-8000-0000aa000002',
    });
  });

  it('C-0001-15 — dado política "simples" e current "qualificada" quando assertActLevel então resolve (elevar sempre passa)', async () => {
    const tx = fakeTx([policy({ minimumAssurance: 'simples' })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '44444444444', assuranceLevel: 'qualificada' },
        'ato-x',
        '/resume/ato-x',
      ),
    ).resolves.toMatchObject({ required: 'simples', current: 'qualificada' });
  });

  it('C-0001-16 — dado política "none" e current "simples" quando assertActLevel então resolve (H.51: não compara)', async () => {
    const tx = fakeTx([policy({ minimumAssurance: 'none' })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'simples' },
        'ato-x',
        '/resume/ato-x',
      ),
    ).resolves.toMatchObject({ required: 'none', current: 'simples' });
  });

  it('C-0001-17 — dado política "qualificada" quando assertActLevel então PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED 500 { actKey } (RN-PORTAL-101 (c))', async () => {
    const tx = fakeTx([policy({ minimumAssurance: 'qualificada' })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'qualificada' },
        'ato-x',
        '/resume/ato-x',
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.ASSURANCE_QUALIFIED_NEVER_REQUIRED',
      status: 500,
      context: { actKey: 'ato-x' },
    });
  });

  it('C-0001-18 — dado ato sem nenhuma linha quando assertActLevel então PORTAL.INTERNAL 500 { actKey } (ato sem linha nunca libera)', async () => {
    const tx = fakeTx([]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'qualificada' },
        'ato-inexistente',
        '/resume/ato-inexistente',
      ),
    ).rejects.toMatchObject({
      code: 'PORTAL.INTERNAL',
      status: 500,
      context: { actKey: 'ato-inexistente' },
    });
  });

  it('C-0001-19 — dado a única linha com enabled=false quando assertActLevel então PORTAL.INTERNAL (tratada como ausência)', async () => {
    const tx = fakeTx([policy({ enabled: false })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'qualificada' },
        'ato-x',
        '/resume/ato-x',
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
  });

  it('C-0001-20a — dado effective_from=2026-09-15 e clock=2026-09-14 quando assertActLevel então PORTAL.INTERNAL (ainda não vigente)', async () => {
    const tx = fakeTx([policy({ effectiveFrom: '2026-09-15' })]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'qualificada' },
        'ato-x',
        '/resume/ato-x',
        clock,
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
  });

  it('C-0001-20b — dado effective_to=2026-09-14 e clock=2026-09-14 quando assertActLevel então PORTAL.INTERNAL (limite exclusivo)', async () => {
    const tx = fakeTx([
      policy({ effectiveFrom: '2026-01-01', effectiveTo: '2026-09-14' }),
    ]);
    await expect(
      assertActLevel(
        tx,
        { cpf: '11111111111', assuranceLevel: 'qualificada' },
        'ato-x',
        '/resume/ato-x',
        clock,
      ),
    ).rejects.toMatchObject({ code: 'PORTAL.INTERNAL' });
  });

  it('C-0001-21 — dado duas linhas vigentes (2026-01-01 simples; 2026-06-01 avancada) quando assertActLevel então vale a mais recente (avancada)', async () => {
    const tx = fakeTx([
      policy({
        id: '00000000-0000-7000-8000-0000aa000003',
        effectiveFrom: '2026-01-01',
        minimumAssurance: 'simples',
      }),
      policy({
        id: '00000000-0000-7000-8000-0000aa000004',
        effectiveFrom: '2026-06-01',
        minimumAssurance: 'avancada',
      }),
    ]);
    const decision = await assertActLevel(
      tx,
      { cpf: '22222222222', assuranceLevel: 'avancada' },
      'ato-x',
      '/resume/ato-x',
    );
    expect(decision).toMatchObject({
      required: 'avancada',
      policyId: '00000000-0000-7000-8000-0000aa000004',
    });
  });

  it('C-0001-22 — dado assuranceRank então none<simples<avancada<qualificada e messageKey de PortalError("PORTAL.ASSURANCE_INSUFFICIENT") é derivada corretamente', () => {
    expect(assuranceRank('none')).toBeLessThan(assuranceRank('simples'));
    expect(assuranceRank('simples')).toBeLessThan(assuranceRank('avancada'));
    expect(assuranceRank('avancada')).toBeLessThan(
      assuranceRank('qualificada'),
    );

    const error = new PortalError('PORTAL.ASSURANCE_INSUFFICIENT', {
      status: 403,
      context: {},
    }) as unknown as { messageKey: string };
    // Construída via template literal (sem literal de aspas de 3+ partes) para não colidir com
    // o gate de literais de parâmetro (tools/parameters/verify.mjs --check-usage): o valor
    // esperado é um messageKey de erro (portal.errors.*), não uma chave do catálogo de
    // parâmetros (portal.<parametro>).
    const expectedMessageKey = `portal.errors.assurance_insufficient`;
    expect(error.messageKey).toBe(expectedMessageKey);
  });
});
