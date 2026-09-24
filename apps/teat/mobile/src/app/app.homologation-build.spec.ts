import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { loadMobileRuntime } from '../testing/runtime-module';
import { AppComponent } from './app.component';
import { TEAT_BODYCAM_STATE } from './core/bodycam-indicator.component';
import { TeatI18n } from './core/i18n.service';
import catalog from './i18n/teat.pt-BR.json';
import { TEAT_HOMOLOGATION_AIT } from './shared/homologation-ait.port';

const appRoot = process.cwd();

describe('ADR-0033 — composição explícita da build de homologação', () => {
  it('pnpm build seleciona main.homologation.ts e mantém main.ts comum sem fixture implícita', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(appRoot, 'package.json'), 'utf8'),
    ) as { scripts: { build: string } };
    const angular = JSON.parse(
      readFileSync(resolve(appRoot, 'angular.json'), 'utf8'),
    ) as {
      projects: {
        'teat-mobile': {
          architect: {
            build: {
              options: { browser: string };
              configurations: Record<string, { browser?: string }>;
              defaultConfiguration: string;
            };
          };
        };
      };
    };
    const build = angular.projects['teat-mobile'].architect.build;
    const selectedEntry =
      build.configurations[build.defaultConfiguration]?.browser ??
      build.options.browser;
    expect(packageJson.scripts.build).toBe('ng build');
    expect(selectedEntry).toBe('src/main.homologation.ts');

    const common = readFileSync(resolve(appRoot, 'src/main.ts'), 'utf8');
    const homologation = readFileSync(
      resolve(appRoot, 'src/main.homologation.ts'),
      'utf8',
    );
    expect(common).not.toContain('TEAT_HOMOLOGATION_AIT');
    expect(common).not.toContain('homologationHttpBlockInterceptor');
    expect(homologation).toMatch(/provide:\s*TEAT_HOMOLOGATION_AIT/);
    expect(homologation).toContain('homologationHttpBlockInterceptor');
    expect(homologation).toContain('withInterceptors');
  });

  it.each([
    '/v1/inf/ait/aits',
    '/api/ops/bootstrap',
    'https://example.test/assets/catalog.json',
    '//example.test/assets/catalog.json',
    '/assets/../v1/inf/ait/aits',
  ])(
    'bloqueia HTTP de backend/remoto em %s antes de alcançar o backend',
    async (url) => {
      const runtime = await loadMobileRuntime(
        'shared/homologation-http.interceptor',
      );
      const interceptor = runtime['homologationHttpBlockInterceptor'];
      expect(interceptor).toBeTypeOf('function');
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([interceptor as never])),
          provideHttpClientTesting(),
        ],
      });
      const request = firstValueFrom(TestBed.inject(HttpClient).get(url));
      await expect(request).rejects.toThrow('homologation-network-disabled');
      TestBed.inject(HttpTestingController).expectNone(url);
      TestBed.inject(HttpTestingController).verify();
    },
  );

  it.each(['/assets/demo.json', 'assets/catalog.json'])(
    'permite somente asset local %s',
    async (url) => {
      const runtime = await loadMobileRuntime(
        'shared/homologation-http.interceptor',
      );
      const interceptor = runtime['homologationHttpBlockInterceptor'];
      expect(interceptor).toBeTypeOf('function');
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withInterceptors([interceptor as never])),
          provideHttpClientTesting(),
        ],
      });
      const request = firstValueFrom(TestBed.inject(HttpClient).get(url));
      TestBed.inject(HttpTestingController)
        .expectOne(url)
        .flush({ synthetic: true });
      await expect(request).resolves.toEqual({ synthetic: true });
      TestBed.inject(HttpTestingController).verify();
    },
  );
});

describe('ADR-0033 — marcador do AppComponent', () => {
  it.each([false, true])(
    'renderiza marcador somente quando o port de homologação está presente (presente=%s)',
    (enabled) => {
      TestBed.configureTestingModule({
        imports: [AppComponent],
        providers: [
          provideRouter([]),
          {
            provide: TEAT_BODYCAM_STATE,
            useValue: { state: signal('failure') },
          },
          {
            provide: TeatI18n,
            useValue: {
              initialize: async () => undefined,
              translate: (key: string) =>
                key === 'teat.shell.homologation'
                  ? catalog['teat.shell.homologation']
                  : key,
            },
          },
          ...(enabled
            ? [
                {
                  provide: TEAT_HOMOLOGATION_AIT,
                  useValue: {
                    profile: 'homologation',
                    start: vi.fn(),
                    review: vi.fn(),
                  },
                },
              ]
            : []),
        ],
      });
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const marker = fixture.nativeElement.querySelector(
        '[data-profile="homologation"]',
      ) as HTMLElement | null;
      if (enabled) {
        expect(marker).not.toBeNull();
        expect(marker?.textContent).toContain('HOMOLOGAÇÃO — SIMULAÇÃO');
      } else {
        expect(TestBed.inject(TEAT_HOMOLOGATION_AIT, null)).toBeNull();
        expect(marker).toBeNull();
        expect(
          fixture.nativeElement.querySelector('[data-homologation-persona]'),
        ).toBeNull();
        expect(fixture.nativeElement.textContent).not.toContain(
          'HOMOLOGAÇÃO — SIMULAÇÃO',
        );
      }
    },
  );
});
