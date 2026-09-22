// R-0012 TASK-0005 (Inspector). Critérios C-2A-01…04 do contrato `CTG-0002a.md` §11, sobre
// `app.route-manifest.ts` (produção, TASK-0006) × `route-manifest.fixture.ts` (transcrição
// independente desta tarefa). Falha esperada nesta entrega: `app.route-manifest.ts` não existe
// ainda (Cannot find module).
import { describe, expect, it } from 'vitest';
import {
  RAIT_ROUTE_MANIFEST,
  RAIT_SCREEN_SLUGS,
  screenSlugOf,
  manifestEntriesOf,
  manifestEntryOf,
  type RaitModule,
} from './app.route-manifest';
import {
  RAIT_ROUTE_MANIFEST_FIXTURE,
  RAIT_SCREEN_SLUGS_FIXTURE,
  RAIT_ALL_ROLES,
} from '../testing/route-manifest.fixture';

const FIELDS = [
  'path',
  'kind',
  'screen',
  'sheet',
  'module',
  'roles',
  'resolver',
  'uc',
  'journeys',
  'level',
] as const;

describe('C-2A-01 — RAIT_ROUTE_MANIFEST × fixture, 74 entradas iguais uma a uma', () => {
  it('dado RAIT_ROUTE_MANIFEST e RAIT_ROUTE_MANIFEST_FIXTURE quando comparados então mesmo comprimento (74)', () => {
    expect(RAIT_ROUTE_MANIFEST).toHaveLength(74);
    expect(RAIT_ROUTE_MANIFEST_FIXTURE).toHaveLength(74);
  });

  RAIT_ROUTE_MANIFEST_FIXTURE.forEach((expected, index) => {
    it(`dado a linha ${index + 1} (${expected.path || '/'}) quando comparada então os 10 campos são iguais, na mesma posição`, () => {
      const actual = RAIT_ROUTE_MANIFEST[index];
      expect(actual).toBeDefined();
      for (const field of FIELDS) {
        expect(actual[field]).toEqual(expected[field]);
      }
    });
  });
});

describe('C-2A-02 — invariantes de route-manifest.md sobre RAIT_ROUTE_MANIFEST', () => {
  it('dado o manifesto quando contadas as kinds então 9 redirect, 1 layout, 64 page', () => {
    const countOf = (kind: string) =>
      RAIT_ROUTE_MANIFEST.filter((e) => e.kind === kind).length;
    expect(countOf('redirect')).toBe(9);
    expect(countOf('layout')).toBe(1);
    expect(countOf('page')).toBe(64);
  });

  it('dado o manifesto quando lidos os sheets então IU-RAIT-002…064 contíguos por lote (A→B→C), não na ordem global de #', () => {
    // A7(a): a contiguidade é por lote de módulos (route-manifest.md linhas 25-28), não na ordem
    // física do manifesto — `conta` é #72 (perto do fim) mas seus sheets (IU-RAIT-002…018)
    // pertencem ao lote A, junto de painel/fila/caso.
    const LOTE_A_MODULES = ['painel', 'fila', 'caso', 'conta'] as const;
    const LOTE_B_MODULES = [
      'protocolo',
      'assinatura',
      'autoridade',
      'colegiado',
    ] as const;
    const LOTE_C_MODULES = [
      'gestao',
      'organizacao',
      'integracoes',
      'financeiro',
      'arquivo',
      'auditoria',
      'admin',
    ] as const;

    const sheetNumbersFor = (modules: readonly string[]) =>
      RAIT_ROUTE_MANIFEST.filter(
        (e) => modules.includes(e.module) && e.sheet !== null,
      ).map((e) => Number((e.sheet as string).split('-').pop()));

    expect(sheetNumbersFor(LOTE_A_MODULES)).toEqual(
      [...Array(17)].map((_, i) => i + 2),
    );
    expect(sheetNumbersFor(LOTE_B_MODULES)).toEqual(
      [...Array(20)].map((_, i) => i + 19),
    );
    expect(sheetNumbersFor(LOTE_C_MODULES)).toEqual(
      [...Array(26)].map((_, i) => i + 39),
    );

    const sheets = RAIT_ROUTE_MANIFEST.map((e) => e.sheet).filter(
      (sheet): sheet is string => sheet !== null,
    );
    expect(sheets).toHaveLength(63);
  });

  it('dado o manifesto quando lidos os screens então os 17 T-01…T-17 estão todos presentes', () => {
    const screens = new Set(
      RAIT_ROUTE_MANIFEST.map((e) => e.screen).filter(
        (screen): screen is string => screen !== null,
      ),
    );
    const expected = [...Array(17)].map(
      (_, i) => `T-${String(i + 1).padStart(2, '0')}`,
    );
    expect([...screens].sort()).toEqual(expected);
  });

  it('dado cada entrada quando lida então roles ⊆ RAIT_ALL_ROLES ou "all"', () => {
    for (const entry of RAIT_ROUTE_MANIFEST) {
      if (entry.roles === 'all') continue;
      for (const role of entry.roles) {
        expect(RAIT_ALL_ROLES).toContain(role);
      }
    }
  });

  it('dado o manifesto quando filtrado por module "core" então só "", "sem-permissao", "auth/callback"', () => {
    const corePaths = RAIT_ROUTE_MANIFEST.filter(
      (e) => e.module === 'core',
    ).map((e) => e.path);
    expect(corePaths.sort()).toEqual(
      ['', 'auth/callback', 'sem-permissao'].sort(),
    );
  });

  it('dado cada entrada quando lida então level é null sse kind ∈ {redirect, layout}', () => {
    for (const entry of RAIT_ROUTE_MANIFEST) {
      const shouldBeNull = entry.kind === 'redirect' || entry.kind === 'layout';
      expect(entry.level === null).toBe(shouldBeNull);
    }
  });

  it('dado o manifesto quando filtrado por level então 13 L0 e 6 L1, exatamente as de M13', () => {
    const l0 = RAIT_ROUTE_MANIFEST.filter((e) => e.level === 'L0').map(
      (e) => e.path,
    );
    const l1 = RAIT_ROUTE_MANIFEST.filter((e) => e.level === 'L1').map(
      (e) => e.path,
    );
    expect(l0.sort()).toEqual(
      [
        'organizacao/escala',
        'organizacao/jeton',
        'integracoes/renainf',
        'integracoes/renach',
        'integracoes/falhas',
        'financeiro/arrecadacao',
        'financeiro/restituicoes',
        'financeiro/cobranca',
        'financeiro/conciliacao',
        'admin/parametros',
        'admin/calendario',
        'admin/atos/suspensao',
        'auditoria/exportacoes',
      ].sort(),
    );
    expect(l1.sort()).toEqual(
      [
        'gestao/producao',
        'gestao/capacidade',
        'gestao/turmas',
        'gestao/qualidade',
        'organizacao/membros',
        'organizacao/pools',
      ].sort(),
    );
  });
});

describe('C-2A-03 — screenSlugOf × RAIT_SCREEN_SLUGS × RAIT_SCREEN_SLUGS_FIXTURE', () => {
  it('dado o path "" quando screenSlugOf então "home"', () => {
    expect(screenSlugOf('')).toBe('home');
  });

  it('dado "colegiado/:orgao/relatoria/:caseId/voto" quando screenSlugOf então "colegiado-orgao-relatoria-caseId-voto"', () => {
    expect(screenSlugOf('colegiado/:orgao/relatoria/:caseId/voto')).toBe(
      'colegiado-orgao-relatoria-caseId-voto',
    );
  });

  Object.entries(RAIT_SCREEN_SLUGS_FIXTURE).forEach(([path, slug]) => {
    it(`dado o path "${path || '/'}" quando screenSlugOf então "${slug}", igual a RAIT_SCREEN_SLUGS e à fixture`, () => {
      expect(screenSlugOf(path)).toBe(slug);
      expect(RAIT_SCREEN_SLUGS[path]).toBe(slug);
    });
  });

  it('dado RAIT_SCREEN_SLUGS quando contadas as chaves então 74', () => {
    expect(Object.keys(RAIT_SCREEN_SLUGS)).toHaveLength(74);
  });
});

describe('C-2A-04 — manifestEntriesOf / manifestEntryOf', () => {
  const modules: readonly RaitModule[] = [
    'core',
    'painel',
    'fila',
    'caso',
    'protocolo',
    'assinatura',
    'autoridade',
    'colegiado',
    'gestao',
    'organizacao',
    'integracoes',
    'financeiro',
    'arquivo',
    'auditoria',
    'admin',
    'conta',
  ];

  it('dado os 16 módulos quando somadas as entradas de manifestEntriesOf então união = 74', () => {
    const total = modules.reduce(
      (sum, module) => sum + manifestEntriesOf(module).length,
      0,
    );
    expect(total).toBe(74);
  });

  it('dado manifestEntriesOf("core") quando lida então 3 entradas, ordem do manifesto', () => {
    const core = manifestEntriesOf('core');
    expect(core.map((e) => e.path)).toEqual([
      '',
      'sem-permissao',
      'auth/callback',
    ]);
  });

  modules.forEach((module) => {
    it(`dado manifestEntriesOf("${module}") quando lida então cada entrada tem module === "${module}", ordem do manifesto`, () => {
      const entries = manifestEntriesOf(module);
      const expectedOrder = RAIT_ROUTE_MANIFEST.filter(
        (e) => e.module === module,
      ).map((e) => e.path);
      expect(entries.map((e) => e.module)).toEqual(entries.map(() => module));
      expect(entries.map((e) => e.path)).toEqual(expectedOrder);
    });
  });

  it('dado manifestEntryOf("inexistente") quando chamado então lança', () => {
    expect(() => manifestEntryOf('inexistente')).toThrow();
  });

  it('dado manifestEntryOf("painel") quando chamado então devolve a entrada de "painel" (nunca undefined)', () => {
    const entry = manifestEntryOf('painel');
    expect(entry.path).toBe('painel');
  });
});
