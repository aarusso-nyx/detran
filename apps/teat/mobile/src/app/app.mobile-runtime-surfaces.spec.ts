import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { readMobileProductionSource } from '../testing/mobile-source';
import { loadMobileRuntime } from '../testing/runtime-module';

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

for (const modulePath of LAZY_FEATURE_MODULES) {
  it(`dado ${modulePath} quando o carregamento lazy ocorre então expõe rotas de feature`, async () => {
    const runtime = await loadMobileRuntime(modulePath);
    expect(Object.values(runtime).some((value) => Array.isArray(value))).toBe(
      true,
    );
  });
}

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
  ['data/local/normative-package.service', 'NormativePackageService'],
  ['shared/bodycam-indicator.component', 'BodycamIndicatorComponent'],
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
