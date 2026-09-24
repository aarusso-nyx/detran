import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import {
  TEAT_WEB_ROLES,
  TEAT_WEB_ROUTE_FIXTURE,
} from '../testing/teat-web-contract.fixture';

const BOAT_WEB_PATHS = [
  '/ux/web/crashes-list',
  '/ux/web/crash-detail',
  '/ux/web/crash-complement',
  '/ux/web/renaest-integration',
  '/fiscalizacao/sinistros/titular',
] as const;

const CANONICAL_ROLES = [
  'field-agent',
  'field-supervisor',
  'processing-operator',
  'traffic-authority',
  'agency-admin',
  'technical-admin',
  'AUDITOR',
  'bi-analyst',
  'integration-operator',
] as const;

it('dado o contrato web quando enumerado então preserva 61 rotas, 56 fichas TEAT e cinco entradas BOAT/operacionais', () => {
  expect(TEAT_WEB_ROUTE_FIXTURE).toHaveLength(61);
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) =>
      route.sheet?.startsWith('IU-TEAT-'),
    ),
  ).toHaveLength(56);
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) => route.path.startsWith('/ux/web/')),
  ).toHaveLength(56);
});

it('dada a matriz BOAT web quando verificada então fixa mounts, papéis e W-05 sem fallback de outlet', () => {
  expect(
    TEAT_WEB_ROUTE_FIXTURE.filter((route) =>
      BOAT_WEB_PATHS.includes(route.path as (typeof BOAT_WEB_PATHS)[number]),
    ).map((route) => route.path),
  ).toEqual(BOAT_WEB_PATHS);
  for (const route of TEAT_WEB_ROUTE_FIXTURE.filter((entry) =>
    BOAT_WEB_PATHS.includes(entry.path as (typeof BOAT_WEB_PATHS)[number]),
  )) {
    expect(route.guards).toEqual([
      'authGuard',
      'tenantGuard',
      'roleGuard',
      ...([
        '/ux/web/crash-detail',
        '/ux/web/crash-complement',
        '/fiscalizacao/sinistros/titular',
      ].includes(route.path)
        ? ['contextGuard']
        : []),
    ]);
    expect(route.client).toMatch(/source_pending|@detran\/boat-mobile/);
  }
  const w05 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/fiscalizacao/sinistros/titular',
  );
  expect(w05).toMatchObject({
    sheet: 'IU-BOAT-W-05',
    uxCode: 'source_pending',
    module: 'sinistros',
    client: '@detran/boat-mobile',
  });
  expect(w05?.allowedRoles).toEqual(['processing-operator', 'AUDITOR']);
  expect(w05?.guards).toEqual([
    'authGuard',
    'tenantGuard',
    'roleGuard',
    'contextGuard',
  ]);
  expect(TEAT_WEB_ROLES).toHaveLength(9);
});

it('dado cada W-01..W-05 quando cruzado com os nove papéis então prova presença e ausência sem conjunto implícito', () => {
  expect(CANONICAL_ROLES).toEqual(TEAT_WEB_ROLES);
  const expectedRoles: Readonly<Record<string, readonly string[]>> = {
    '/ux/web/crashes-list': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/crash-detail': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/crash-complement': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/ux/web/renaest-integration': [
      'field-supervisor',
      'processing-operator',
      'traffic-authority',
      'agency-admin',
    ],
    '/fiscalizacao/sinistros/titular': ['processing-operator', 'AUDITOR'],
  };
  for (const route of TEAT_WEB_ROUTE_FIXTURE.filter((entry) =>
    BOAT_WEB_PATHS.includes(entry.path as (typeof BOAT_WEB_PATHS)[number]),
  )) {
    for (const role of CANONICAL_ROLES) {
      expect(route.allowedRoles.includes(role)).toBe(
        expectedRoles[route.path]?.includes(role),
      );
    }
  }
  const w03 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/ux/web/crash-complement',
  );
  const w04 = TEAT_WEB_ROUTE_FIXTURE.find(
    (route) => route.path === '/ux/web/renaest-integration',
  );
  expect(w03?.allowedRoles).toEqual([
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
  ]);
  expect(w04?.allowedRoles).toEqual([
    'field-supervisor',
    'processing-operator',
    'traffic-authority',
    'agency-admin',
  ]);
  expect(w03?.guards).toContain('roleGuard');
  expect(w04?.guards).toContain('roleGuard');
});

it('dado o catálogo BOAT mesclado quando carregado então é byte-idêntico em 114 chaves e bloqueia os treze marcadores', () => {
  const catalog = JSON.parse(
    readFileSync(
      resolve(
        process.cwd(),
        '../../../docs/framework/arch/i18n/boat.pt-BR.json',
      ),
      'utf8',
    ),
  ) as Record<string, string>;
  const entries = Object.entries(catalog);
  expect(entries).toHaveLength(114);
  expect(
    entries.filter(([, value]) => value === 'source_pending:OD-R15-004'),
  ).toHaveLength(13);
  expect(
    entries.every(([key, value]) => key.length > 0 && value.length > 0),
  ).toBe(true);
  expect(
    entries
      .filter(([, value]) => value === 'source_pending:OD-R15-004')
      .every(([, value]) => value !== 'rendered'),
  ).toBe(true);
});

it('dadas as cinco telas web quando montadas então a11y não aceita serious/critical e preserva o texto literal', () => {
  expect(BOAT_WEB_PATHS).toHaveLength(5);
  expect(BOAT_WEB_PATHS).toContain('/fiscalizacao/sinistros/titular');
  const source = readFileSync(
    resolve(process.cwd(), '../../../docs/framework/arch/boat-frontends.md'),
    'utf8',
  );
  expect(source).toMatch(/fotografar a cena, não o sofrimento/i);
  expect(source).toContain('sinistro');
});

it('dado W-03/W-04 quando as ações são autorizadas então validate e close mantêm suas restrições e o adapter', () => {
  const contract = readFileSync(
    resolve(
      process.cwd(),
      '../../../docs/framework/arch/boat-route-contract.md',
    ),
    'utf8',
  );
  expect(contract).toContain('validate');
  expect(contract).toContain('close');
  expect(contract).toContain('processing-operator, traffic-authority');
  expect(contract).toContain('field-supervisor, traffic-authority');
  expect(contract).toContain('outbox → `RenaestPort');
});
