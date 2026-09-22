import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { readMobileProductionSource } from '../testing/mobile-source';
import { loadMobileRuntime } from '../testing/runtime-module';
import {
  D05_ROUTE_PATH,
  TEAT_ROUTE_FIXTURE,
} from '../testing/route-contract.fixture';
import { TEAT_ROUTES } from './app.routes';

const LAZY_FEATURE_MODULES = [
  'features/turno/turno.routes',
  'features/consultas/consultas.routes',
  'features/ait/ait.routes',
  'features/medidas/medidas.routes',
  'features/alcoolemia/alcoolemia.routes',
  'features/sinistro/sinistro.routes',
  'features/sincronizacao/sincronizacao.routes',
  'features/complementares/complementares.routes',
] as const;

const DATA_CLIENT_MODULES = [
  'data/api/mobile-bootstrap.client',
  'data/api/ops-snapshots.client',
  'data/api/offline-sync.client',
  'data/api/ait.client',
  'data/api/measures.client',
  'data/api/alcohol.client',
  'data/api/normative.client',
  'data/api/provisioning.client',
] as const;

const FEATURE_BY_MODULE = {
  'features/turno/turno.routes': 'turno',
  'features/consultas/consultas.routes': 'consultas',
  'features/ait/ait.routes': 'ait',
  'features/medidas/medidas.routes': 'medidas',
  'features/alcoolemia/alcoolemia.routes': 'alcoolemia',
  'features/sinistro/sinistro.routes': 'sinistro',
  'features/sincronizacao/sincronizacao.routes': 'sincronizacao',
  'features/complementares/complementares.routes': 'complementares',
} as const;

for (const modulePath of LAZY_FEATURE_MODULES) {
  it(`dado ${modulePath} quando o carregamento lazy ocorre então contém exatamente os paths contratados, não um array vazio`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    const routes = Object.values(runtime).find(Array.isArray) as
      readonly { path?: string }[] | undefined;
    const feature = FEATURE_BY_MODULE[modulePath];
    const expected = TEAT_ROUTE_FIXTURE.filter((route) =>
      route.component.startsWith(`features/${feature}/`),
    ).map((route) => route.path);
    expect(routes).toBeDefined();
    expect(routes).toHaveLength(expected.length);
    expect(routes?.map((route) => route.path)).toEqual(expected);
  });
}

it('dadas as 69 rotas habilitadas quando seus loaders resolvem então cada uma entrega uma classe de página distinta, não alias/placeholder', async () => {
  const enabled = TEAT_ROUTE_FIXTURE.filter(
    (route) => route.path !== D05_ROUTE_PATH,
  );
  expect(enabled).toHaveLength(69);
  const resolved = await Promise.all(
    enabled.map(async (expected) => {
      const route = TEAT_ROUTES.find(
        (candidate) => candidate.path === expected.path,
      );
      expect(route?.loadComponent).toBeTypeOf('function');
      return route?.loadComponent?.();
    }),
  );
  expect(resolved.every((component) => typeof component === 'function')).toBe(
    true,
  );
  expect(new Set(resolved).size).toBe(69);
  expect(
    resolved.map((component) => (component as { name: string }).name),
  ).not.toContain('MobilePageComponent');
});

it('dado TeatI18n carregado quando traduz chave permitida e desconhecida então renderiza a primeira e rejeita namespace/chave fora do catálogo', async () => {
  const runtime = await loadMobileRuntime('core/i18n.service');
  const I18n = runtime['TeatI18n'] as
    | (new () => {
        translate: (
          key: string,
          params?: Record<string, string | number>,
        ) => string;
      })
    | undefined;
  expect(I18n).toBeTypeOf('function');
  const i18n = new (
    I18n as new () => {
      translate: (
        key: string,
        params?: Record<string, string | number>,
      ) => string;
    }
  )();
  expect(i18n.translate('teat.errors.internal')).toEqual(expect.any(String));
  expect(() => i18n.translate('outside.namespace')).toThrow();
  expect(() => i18n.translate('teat.unknown.key')).toThrow();
});

for (const modulePath of DATA_CLIENT_MODULES) {
  it(`dado ${modulePath} quando o cliente de dados é carregado então expõe uma superfície tipada`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    expect(
      Object.values(runtime).some((value) => typeof value === 'function'),
    ).toBe(true);
  });
}

for (const [modulePath, exportName] of [
  ['data/local/local-act.store', 'LocalActStore'],
  ['data/sync/sync.worker', 'SyncWorker'],
  ['data/normative/normative-package.service', 'NormativePackageService'],
  ['core/bodycam-indicator.component', 'BodycamIndicator'],
  ['shared/mobile-printer.port', 'MobilePrinterPort'],
] as const) {
  it(`dado ${modulePath} quando o runtime é carregado então expõe ${exportName}`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    expect(runtime[exportName]).toBeDefined();
  });
}

it('dado o catálogo i18n canônico quando o runtime é carregado então preserva todas as chaves TEAT', async () => {
  const runtime = await loadMobileRuntime('core/i18n-catalog');
  const canonicalPath = resolve(
    process.cwd(),
    '../../../docs/framework/arch/i18n/teat.pt-BR.json',
  );
  const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8'));
  expect(runtime['TEAT_I18N']).toEqual(canonical);
});

it('dado FieldShell quando ErrorBoundary existe então apenas classifica erros e não calcula prazo, mérito ou SENATRAN direto', async () => {
  await loadMobileRuntime('core/field-shell.component');
  const source = readMobileProductionSource('core/field-shell.component.ts');
  expect(source).toContain('MOBILE_ERROR_KEYS');
  expect(source).not.toMatch(/Date\.now|deadline|prazo|merito|mérito/i);
  expect(source).not.toMatch(/senatran|http:\/\/|https:\/\//i);
});
