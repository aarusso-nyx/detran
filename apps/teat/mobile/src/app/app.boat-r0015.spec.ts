import { BOAT_PT_BR_CATALOG } from '@detran/boat-mobile';
import { expect, it, vi } from 'vitest';
import {
  BOAT_ROUTE_PATHS,
  TEAT_ROUTE_FIXTURE,
} from '../testing/route-contract.fixture';

const EXPECTED_BOAT_PATHS = [
  'crash-start',
  'crash-location',
  'crash-conditions',
  'crash-vehicles',
  'crash-people',
  'crash-victims',
  'crash-dynamics',
  'crash-sketch',
  'crash-evidence',
  'crash-ait-links',
  'crash-damages',
  'crash-review',
] as const;

const bootstrapCapture = vi.hoisted(() => ({
  authenticatedConfig: undefined as
    | {
        i18n?: {
          loadCatalog?: (
            locale: string,
          ) => Promise<Readonly<Record<string, string>>>;
        };
      }
    | undefined,
  bootstrapApplication: vi.fn(async () => ({})),
}));

vi.mock('@angular/platform-browser', () => ({
  bootstrapApplication: bootstrapCapture.bootstrapApplication,
}));

vi.mock('@detran/ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@detran/ui')>();
  return {
    ...actual,
    provideDetranAuthenticatedApp: (
      config: Parameters<typeof actual.provideDetranAuthenticatedApp>[0],
    ) => {
      bootstrapCapture.authenticatedConfig = config;
      return actual.provideDetranAuthenticatedApp(config);
    },
  };
});

it('dado o contrato BOAT mobile quando enumerado então fixa as doze telas na ordem S-01..S-12/S-11', () => {
  expect(BOAT_ROUTE_PATHS).toEqual(EXPECTED_BOAT_PATHS);
  expect(TEAT_ROUTE_FIXTURE).toHaveLength(71);
  expect(
    TEAT_ROUTE_FIXTURE.filter((route) => !route.guards.includes('BOAT')),
  ).toHaveLength(59);
  expect(
    TEAT_ROUTE_FIXTURE.find((route) => route.path === 'crash-damages'),
  ).toMatchObject({
    uxCode: 'source_pending',
    sourceSheet: 'IU-BOAT-S-12.md',
    guards: 'B+S, BOAT',
  });
});

it('dado o bootstrap mobile real quando carrega pt-BR então mescla o catálogo BOAT byte a byte', async () => {
  window.__DETRAN_RUNTIME_CONFIG__ = {
    tenantId: 'tenant-001',
    oidcAuthority: 'https://idp.example.test',
    clientId: 'teat-mobile-test',
  };
  await import('../main.js');
  expect(bootstrapCapture.bootstrapApplication).toHaveBeenCalledOnce();
  const loadCatalog = bootstrapCapture.authenticatedConfig?.i18n?.loadCatalog;
  expect(loadCatalog).toBeTypeOf('function');
  const catalog = await loadCatalog?.('pt-BR');
  for (const [key, value] of Object.entries(BOAT_PT_BR_CATALOG)) {
    expect.soft(catalog?.[key], key).toBe(value);
  }
});
