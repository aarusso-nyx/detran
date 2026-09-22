// R-0016 TASK-0004 (Inspector). CTG-0002.md §13 "app.scaffold.spec.ts" (C-02-80..83).
import { readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, listAppSourceFiles, REPO_ROOT } from '../testing/kb.js';

const MAIN_TS = join(APP_SRC_ROOT, 'main.ts');
const ROOT_PACKAGE_JSON = join(REPO_ROOT, 'package.json');
const APP_PACKAGE_JSON = join(REPO_ROOT, 'apps/dashboard/web/package.json');
const ANGULAR_JSON = join(REPO_ROOT, 'apps/dashboard/web/angular.json');
const README = join(REPO_ROOT, 'apps/dashboard/web/README.md');

describe('app.scaffold.spec.ts (C-02-80)', () => {
  it('dado src/main.ts quando lido então contém os providers/opções exatas de §1 e não contém service-worker', () => {
    const text = readFileSync(MAIN_TS, 'utf8');
    expect(text).toContain('provideDetranAuthenticatedApp');
    expect(text).toMatch(
      /provideHttpClient\(\s*withInterceptors\(\[\s*freshnessInterceptor/,
    );
    expect(text).toMatch(
      /provideRouter\(\s*DASHBOARD_ROUTES,\s*withComponentInputBinding\(\)\s*\)/,
    );
    expect(text).toMatch(
      /provide:\s*TitleStrategy,\s*useClass:\s*DashboardTitleStrategy/,
    );
    expect(text).toContain('loginRedirectRoute: LOGIN_ROUTE');
    expect(text).toContain('/monitoramento/auth/callback');
    expect(text).toContain("import('./app/i18n/dashboard.pt-BR.json')");
    expect(text).not.toContain('service-worker');
  });
});

describe('app.scaffold.spec.ts (C-02-81)', () => {
  it('dado o package.json da raiz quando lido então a linha check termina com a tripla do app e ainda contém a tripla do Portal antes', () => {
    const pkg = JSON.parse(readFileSync(ROOT_PACKAGE_JSON, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const check = pkg.scripts['check'];
    expect(check).toMatch(
      /&& pnpm --filter @detran\/dashboard-web lint && pnpm --filter @detran\/dashboard-web test && pnpm --filter @detran\/dashboard-web build$/,
    );
    expect(check).toContain('@detran/portal-web');
    const dashboardIndex = check.indexOf('@detran/dashboard-web');
    const portalIndex = check.indexOf('@detran/portal-web');
    expect(portalIndex).toBeLessThan(dashboardIndex);
  });

  it('dado apps/dashboard/web/package.json quando lido então name/scripts corretos, sem service worker nem biblioteca de gráficos', () => {
    const pkg = JSON.parse(readFileSync(APP_PACKAGE_JSON, 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.name).toBe('@detran/dashboard-web');
    expect(pkg.scripts['build']).toBe('ng build');
    expect(pkg.scripts['test']).toBe('vitest run --config vitest.config.ts');
    expect(pkg.scripts['lint']).toBe('eslint .');
    expect(pkg.scripts['typecheck']).toBe(
      'tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit',
    );
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).not.toHaveProperty('@angular/service-worker');
    for (const forbidden of ['echarts', 'd3', 'ngx-charts', 'chart.js']) {
      expect(allDeps).not.toHaveProperty(forbidden);
    }
  });

  it('dado angular.json quando lido então projeto dashboard-web, prefix dash, sem serviceWorker em production', () => {
    const angular = JSON.parse(readFileSync(ANGULAR_JSON, 'utf8')) as {
      projects: Record<
        string,
        {
          prefix: string;
          architect: {
            build: { configurations: { production: Record<string, unknown> } };
          };
        }
      >;
    };
    expect(angular.projects).toHaveProperty('dashboard-web');
    const project = angular.projects['dashboard-web'];
    expect(project.prefix).toBe('dash');
    expect(
      project.architect.build.configurations.production,
    ).not.toHaveProperty('serviceWorker');
  });
});

describe('app.scaffold.spec.ts (C-02-82)', () => {
  it('dado README.md quando lido então contém os 4 blocos, as 4 camadas e "sobe a L2 quando"', () => {
    const text = readFileSync(README, 'utf8');
    for (const block of [
      'Legal-ceiling',
      'Dever periódico',
      'SLA operacional',
      'Saúde técnica',
    ]) {
      expect(text, block).toContain(block);
    }
    for (const layer of ['N0', 'N1', 'N2', 'N3']) {
      expect(text, layer).toContain(layer);
    }
    expect(text).toContain('sobe a L2 quando');
  });
});

describe('app.scaffold.spec.ts (C-02-83)', () => {
  it('dado listAppSourceFiles() quando varridos então src/app/forms/** só importa zod e ./form-gate', () => {
    for (const file of listAppSourceFiles()) {
      if (!/[\\/]app[\\/]forms[\\/]/.test(file)) continue;
      if (file.endsWith('.spec.ts')) continue;
      const text = readFileSync(file, 'utf8');
      const imports = [...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(
        (m) => m[1],
      );
      for (const spec of imports) {
        expect(
          spec === 'zod' ||
            spec.startsWith('./form-gate') ||
            spec === './form-gate.js',
          `${file} importa ${spec}`,
        ).toBe(true);
      }
    }
  });

  it('dado listAppSourceFiles() quando varridos então nenhum de src/app/** importa ../testing ou src/testing (fora dos próprios specs)', () => {
    for (const file of listAppSourceFiles()) {
      if (file.endsWith('.spec.ts')) continue;
      if (file.includes(`${sep}testing${sep}`)) continue;
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from\s+['"][^'"]*testing\/(?!.*\.spec)/);
    }
  });

  it('dado listAppSourceFiles() quando varridos então nenhum importa zone.js nem NgZone', () => {
    for (const file of listAppSourceFiles()) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(/from\s+['"]zone\.js['"]/);
      expect(text, file).not.toMatch(/\bNgZone\b/);
    }
  });
});
