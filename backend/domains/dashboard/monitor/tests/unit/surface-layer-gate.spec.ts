// CTG-0002 §5.1 (teto por papel — `dashboardLayerFor`/`dashboardLayerAllows`
// de `@detran/shared`, `policy.ts` 1883–1925), §5.3 (`domainScopeOf(roles)`)
// e §5.4 (`DASHBOARD_PURPOSES_N2_H54`, fallback de `dashboard.purposes_n2`,
// OD-D30) — C-0002-83, C-0002-84 e C-0002-85 na camada `unit` (TASK-0014).
// Contrato de §14.2: `surface/layer-gate.ts` exporta `DashboardLayerGate`,
// `domainScopeOf` e `DASHBOARD_PURPOSES_N2_H54`. `DashboardLayerGate.open`
// (assinatura §5.4.4) é provado no e2e com o app real (`dashboard-layers`);
// aqui ficam as funções puras. Nenhuma conexão. Fica vermelho (Cannot find
// module) até TASK-0013 criar `src/handwritten/surface/layer-gate.ts`.
import { describe, expect, it } from 'vitest';
import {
  DETRAN_ROLES,
  dashboardLayerAllows,
  dashboardLayerFor,
} from '@detran/shared';

import {
  DASHBOARD_PURPOSES_N2_H54,
  domainScopeOf,
} from '../../src/handwritten/surface/layer-gate.js';

/** §5.3, transcrito. */
const SCOPE_BY_ROLE: Array<[string, 'all' | string[]]> = [
  ['rait-manager', ['rait']],
  ['rait-coordinator', ['rait']],
  ['rait-chair', ['rait']],
  ['traffic-authority', ['teat']],
  ['GESTOR', ['pec']],
  ['agency-admin', 'all'],
  ['GESTOR_DETRAN', 'all'],
  ['AUDITOR', 'all'],
  ['DPO', 'all'],
];
const SCOPED_ROLES = new Set(SCOPE_BY_ROLE.map(([role]) => role));

/** Normaliza o escopo (`'all'` | conjunto/lista de apps) para comparação. */
function normalize(scope: unknown): 'all' | string[] {
  if (scope === 'all') return 'all';
  if (scope instanceof Set) return [...scope].map(String).sort();
  if (Array.isArray(scope)) return scope.map(String).sort();
  throw new Error(`escopo em forma inesperada: ${JSON.stringify(scope)}`);
}

describe('CTG-0002 §5.4 — DASHBOARD_PURPOSES_N2_H54 (C-0002-83 [unit])', () => {
  it('C-0002-83 — dado a constante declarada então exatamente os seis tokens de H.54/OD-D08, minúsculos e sem acento', () => {
    expect([...DASHBOARD_PURPOSES_N2_H54]).toEqual([
      'supervisao',
      'auditoria',
      'apuracao',
      'resposta-ao-titular',
      'estatistica',
      'suporte',
    ]);
    for (const token of DASHBOARD_PURPOSES_N2_H54)
      expect(token).toMatch(/^[a-z-]+$/);
  });
});

describe('CTG-0002 §5.3 — domainScopeOf(roles) (C-0002-84 [unit])', () => {
  for (const [role, expected] of SCOPE_BY_ROLE) {
    it(`C-0002-84 — dado o papel ${role} então escopo ${JSON.stringify(expected)}`, () => {
      expect(normalize(domainScopeOf([role]))).toEqual(expected);
    });
  }

  it('C-0002-84 — dado cada papel de DETRAN_ROLES fora da tabela de §5.3 então escopo vazio (nunca chega a N2)', () => {
    for (const role of DETRAN_ROLES) {
      if (SCOPED_ROLES.has(role)) continue;
      expect(normalize(domainScopeOf([role])), role).toEqual([]);
    }
  });

  it('C-0002-84 — dado papéis acumulados (semântica de união, ADR-0005) rait-manager + GESTOR então a união dos escopos {rait, pec}; com AUDITOR (transversal) então all', () => {
    expect(normalize(domainScopeOf(['rait-manager', 'GESTOR']))).toEqual([
      'pec',
      'rait',
    ]);
    expect(normalize(domainScopeOf(['rait-manager', 'AUDITOR']))).toBe('all');
  });

  it('C-0002-84 — dado o alias minúsculo auditor então canonicaliza para AUDITOR (all); papel desconhecido é ignorado', () => {
    expect(normalize(domainScopeOf(['auditor']))).toBe('all');
    expect(normalize(domainScopeOf(['papel-inexistente']))).toEqual([]);
    expect(normalize(domainScopeOf([]))).toEqual([]);
  });
});

describe('CTG-0002 §5.1 — teto por papel de @detran/shared (C-0002-85 [unit])', () => {
  const N2 = [
    'agency-admin',
    'GESTOR_DETRAN',
    'AUDITOR',
    'DPO',
    'rait-manager',
    'rait-coordinator',
    'rait-chair',
    'traffic-authority',
    'GESTOR',
  ];
  const N1 = [
    'dash-operator',
    'dash-duty-owner',
    'technical-admin',
    'integration-operator',
    'bi-analyst',
  ];

  it('C-0002-85 — dado cada papel de DETRAN_ROLES então o teto é N2, N1 ou N0 exatamente como §5.1 e N3 nunca é permitido', () => {
    for (const role of DETRAN_ROLES) {
      const expected = N2.includes(role)
        ? 'N2'
        : N1.includes(role)
          ? 'N1'
          : 'N0';
      expect(dashboardLayerFor([role]), role).toBe(expected);
      expect(dashboardLayerAllows([role], 'N3'), role).toBe(false);
    }
    expect(
      dashboardLayerAllows(['agency-admin', 'AUDITOR', 'GESTOR_DETRAN'], 'N3'),
    ).toBe(false);
  });

  it('C-0002-85 — dado união de papéis então o teto é o máximo (dash-operator + AUDITOR = N2)', () => {
    expect(dashboardLayerFor(['dash-operator', 'AUDITOR'])).toBe('N2');
    expect(dashboardLayerAllows(['dash-operator'], 'N2')).toBe(false);
    expect(dashboardLayerAllows(['dash-operator'], 'N1')).toBe(true);
    expect(dashboardLayerAllows(['MEDICO'], 'N1')).toBe(false);
  });
});
