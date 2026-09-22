// R-0012 TASK-0005 (Inspector). Critérios C-2A-58…60 do contrato `CTG-0002a.md` §11 —
// verificações estáticas de `src/main.ts` (bootstrap, TASK-0006), do `package.json` da raiz
// (M2, já aplicado pelo maestro no checkpoint) e de `apps/rait/web/package.json` (M1, idem), e
// de `parameter-catalogue.md` §Namespaces i18n (as 14 linhas `rait.*`, TASK-0006/M5). Falha
// esperada nesta entrega: `src/main.ts` ainda é o placeholder do checkpoint (sem
// `provideDetranAuthenticatedApp`) e a tabela de namespaces ainda não tem as 14 linhas `rait.*`.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_SRC_ROOT, REPO_ROOT } from '../testing/kb';

describe('C-2A-58 — src/main.ts', () => {
  const text = readFileSync(join(APP_SRC_ROOT, 'main.ts'), 'utf8');

  it('dado main.ts quando lido então contém provideDetranAuthenticatedApp', () => {
    expect(text).toContain('provideDetranAuthenticatedApp');
  });

  it('dado main.ts quando lido então contém provideRouter(RAIT_ROUTES, withComponentInputBinding())', () => {
    expect(text).toContain(
      'provideRouter(RAIT_ROUTES, withComponentInputBinding())',
    );
  });

  it('dado main.ts quando lido então contém { provide: TitleStrategy, useClass: RaitTitleStrategy }', () => {
    expect(text.replace(/\s+/g, ' ')).toContain(
      '{ provide: TitleStrategy, useClass: RaitTitleStrategy }',
    );
  });

  it('dado main.ts quando lido então contém loginRedirectRoute: LOGIN_ROUTE', () => {
    expect(text).toContain('loginRedirectRoute: LOGIN_ROUTE');
  });

  it("dado main.ts quando lido então carrega o catálogo de './app/i18n/rait.pt-BR.json'", () => {
    expect(text).toContain('./app/i18n/rait.pt-BR.json');
  });

  it('dado main.ts quando lido então não contém "service-worker"', () => {
    expect(text).not.toContain('service-worker');
  });
});

describe('C-2A-59 — scripts de package.json (M1/M2)', () => {
  it('dado o package.json da raiz quando lida a linha check então termina com os três comandos do rait-web e ainda contém os do Portal', () => {
    const root = JSON.parse(
      readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };
    const check = root.scripts['check'];
    expect(
      check.endsWith(
        '&& pnpm --filter @detran/rait-web lint && pnpm --filter @detran/rait-web test && pnpm --filter @detran/rait-web build',
      ),
    ).toBe(true);
    expect(check).toContain('pnpm --filter @detran/portal-web lint');
    expect(check).toContain('pnpm --filter @detran/portal-web test');
    expect(check).toContain('pnpm --filter @detran/portal-web build');
  });

  it('dado apps/rait/web/package.json quando lido então scripts build|test|lint|typecheck iguais aos de M1 e sem @angular/service-worker', () => {
    const pkg = JSON.parse(
      readFileSync(join(REPO_ROOT, 'apps/rait/web/package.json'), 'utf8'),
    ) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.scripts['build']).toBe('ng build');
    expect(pkg.scripts['test']).toBe('vitest run --config vitest.config.ts');
    expect(pkg.scripts['lint']).toBe('eslint .');
    expect(pkg.scripts['typecheck']).toBe(
      'tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.spec.json --noEmit',
    );
    expect(pkg.dependencies['@angular/service-worker']).toBeUndefined();
    expect(pkg.devDependencies['@angular/service-worker']).toBeUndefined();
  });
});

describe('C-2A-60 — parameter-catalogue.md §Namespaces i18n (14 linhas rait.*)', () => {
  it('dado parameter-catalogue.md quando parseado então contém as 14 linhas rait.* com App/Catálogo/Decisão corretos e nenhuma rait.<camelCase> nem rait.timer', () => {
    // `parser.mjs` resolve caminhos com `new URL(relativo, import.meta.url)`: importado
    // diretamente dentro do Vite/Vitest, `import.meta.url` não é um `file:` URL de verdade e
    // essa resolução lança. Roda-se num processo `node` isolado (mesma técnica de
    // `tools/parameters/tests/*.test.mjs`), que preserva `import.meta.url` corretamente.
    const script = `
      import { parseCatalogue } from ${JSON.stringify(join(REPO_ROOT, 'tools/parameters/parser.mjs'))};
      const model = await parseCatalogue(${JSON.stringify(join(REPO_ROOT, 'docs/framework/arch/parameter-catalogue.md'))});
      process.stdout.write(JSON.stringify(model.i18nNamespaces));
    `;
    const stdout = execFileSync(
      process.execPath,
      ['--input-type=module', '-e', script],
      {
        encoding: 'utf8',
        cwd: REPO_ROOT,
      },
    );
    const namespaces = JSON.parse(stdout) as readonly {
      namespace: string;
      app: string;
      catalogue: string;
      decision_ref: string;
    }[];
    const raitNamespaces = namespaces.filter((entry) =>
      entry.namespace.startsWith('rait.'),
    );
    const expectedNamespaces = [
      'rait.action',
      'rait.common',
      'rait.errors',
      'rait.nav',
      'rait.role',
      'rait.instance',
      'rait.decision',
      'rait.channel',
      'rait.shell',
      'rait.states',
      'rait.screens',
      'rait.forms',
      'rait.legal',
      'rait.a11y',
    ];
    expect(raitNamespaces).toHaveLength(14);
    expect(raitNamespaces.map((entry) => entry.namespace).sort()).toEqual(
      [...expectedNamespaces].sort(),
    );
    for (const entry of raitNamespaces) {
      expect(entry.app).toBe('apps/rait/web');
      expect(entry.catalogue).toBe('src/app/i18n/rait.pt-BR.json');
      expect(entry.decision_ref).toBe('OD-P46');
    }
    expect(namespaces.some((entry) => entry.namespace === 'rait.timer')).toBe(
      false,
    );
    for (const entry of namespaces) {
      if (entry.namespace.startsWith('rait.')) {
        expect(entry.namespace).toMatch(/^rait\.[a-z][a-z0-9_]*$/);
      }
    }
  });
});
