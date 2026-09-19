// R-0014 TASK-0015 (Inspector). CTG-0003b §8 "features/**/pages — roteamento e host binding" —
// um spec parametrizado sobre os cinco módulos do par (C-3b-52…56). Vive em `features/autos/`
// por ser cross-módulo (o glob de fronteira do prompt TASK-0015 é
// `features/{autos,defesa,indicacao,pagamento,processos}/**/*.spec.ts`; `autos` foi a âncora
// escolhida — registrado no relatório). Não edita `i18n/i18n-keys.spec.ts` (fora da fronteira de
// escrita desta tarefa, que lista specs "novos"): a checagem "nenhum literal de token de estado
// fora de data-*/chave i18n" (C-3b-56, segunda parte) fica aqui; a primeira parte (chaves ⊆
// catálogo) já é coberta pelo scanner genérico existente, que varre todo `src/**/*.ts` exceto
// specs e `src/testing`.
import { TestBed } from '@angular/core/testing';
import type { Routes } from '@angular/router';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StynxI18nModule, StynxI18nService } from '@stynx-nyx/angular-i18n';
import portalCatalog from '../../i18n/portal.pt-BR.json';
import { PORTAL_ROUTES } from '../../app.routes';
import {
  PORTAL_ROUTE_MANIFEST,
  type PortalModule,
} from '../../app.route-manifest';
import { PLACEHOLDER_TITLE_KEY } from '../../core/manifest-routes';
import { PlaceholderPageComponent } from '../../shared/placeholder-page.component';
import { SessionFacade } from '../../core/session.facade';
import { EntitlementFacade } from '../../core/entitlement.facade';
import { ServiceCatalogFacade } from '../../core/service-catalog.facade';
import { SESSION_FACADE_PRESETS } from '../../../testing/session-facade.stub';
import { createEntitlementFacadeStub } from '../../../testing/entitlement-facade.stub';
import {
  createServiceCatalogFacadeStub,
  DELEGACAO_INDISPONIVEL_R0007,
} from '../../../testing/service-catalog-facade.stub';
import {
  createPortalRouterHarness,
  screenElement,
  substituteRouteParams,
} from '../../../testing/router-harness';
import { AUTOS_ROUTES } from './autos.routes';
import { DEFESA_ROUTES } from '../defesa/defesa.routes';
import { INDICACAO_ROUTES } from '../indicacao/indicacao.routes';
import { PAGAMENTO_ROUTES } from '../pagamento/pagamento.routes';
import { PROCESSOS_ROUTES } from '../processos/processos.routes';

const catalog = portalCatalog as Record<string, string>;

const MODULE_ROUTES: Record<
  Extract<
    PortalModule,
    'autos' | 'defesa' | 'indicacao' | 'pagamento' | 'processos'
  >,
  Routes
> = {
  autos: AUTOS_ROUTES,
  defesa: DEFESA_ROUTES,
  indicacao: INDICACAO_ROUTES,
  pagamento: PAGAMENTO_ROUTES,
  processos: PROCESSOS_ROUTES,
};

const APPEAL_MODULES = [
  'autos',
  'defesa',
  'indicacao',
  'pagamento',
  'processos',
] as const;

describe('rotas dos 5 módulos do par 2 — cobertura completa do manifesto (§1 a)', () => {
  for (const module of APPEAL_MODULES) {
    const entries = PORTAL_ROUTE_MANIFEST.filter(
      (entry) => entry.module === module,
    );
    const routes = MODULE_ROUTES[module];

    it(`dado ${module}.routes.ts então cobre todas as ${entries.length} entradas do manifesto, nenhuma com PlaceholderPageComponent/PLACEHOLDER_TITLE_KEY, title === portal.screens.t<nn>.title`, () => {
      // C-3b-52
      expect(routes).toHaveLength(entries.length);
      for (const entry of entries) {
        const route = routes.find((candidate) => candidate.path === entry.path);
        expect(route, `rota ausente: ${module}/${entry.path}`).toBeTruthy();
        expect(
          route?.component,
          `${module}/${entry.path} ainda usa PlaceholderPageComponent`,
        ).not.toBe(PlaceholderPageComponent);
        expect(
          route?.title,
          `${module}/${entry.path} ainda usa PLACEHOLDER_TITLE_KEY`,
        ).not.toBe(PLACEHOLDER_TITLE_KEY);
        if (entry.screen) {
          const nn = entry.screen.slice(2).toLowerCase();
          expect(route?.title).toBe(`portal.screens.t${nn}.title`);
        }
      }
    });
  }
});

/** As 13 telas do par (C-3b-53…55). */
const APPEAL_SCREEN_ENTRIES = PORTAL_ROUTE_MANIFEST.filter(
  (entry) =>
    (APPEAL_MODULES as readonly string[]).includes(entry.module) &&
    entry.screen !== null,
);

function providersFor(
  options: {
    entitlementOk?: boolean;
    availability?: 'available' | 'partially_available' | 'unavailable';
  } = {},
) {
  return [
    { provide: SessionFacade, useValue: SESSION_FACADE_PRESETS.avancada() },
    {
      provide: EntitlementFacade,
      useValue: createEntitlementFacadeStub(options.entitlementOk ?? true),
    },
    {
      provide: ServiceCatalogFacade,
      useValue: createServiceCatalogFacadeStub(
        options.availability && options.availability !== 'available'
          ? {
              status: options.availability,
              reason:
                options.availability === 'unavailable'
                  ? DELEGACAO_INDISPONIVEL_R0007
                  : undefined,
            }
          : { status: 'available' },
      ),
    },
    StynxI18nModule.forRoot({
      defaultLocale: 'pt-BR',
      loadCatalog: async () => catalog,
    }),
  ];
}

describe('as 13 páginas do par montadas pelo router-harness (§1 b; matriz de guardas CTG-0001)', () => {
  it('dado o manifesto então exatamente 13 telas com screen nos 5 módulos do par (T-14,T-01,T-02,T-05,T-13,T-23,T-06,T-07,T-11,T-08,T-10,T-03,T-04)', () => {
    expect(APPEAL_SCREEN_ENTRIES.length).toBe(13);
  });

  for (const entry of APPEAL_SCREEN_ENTRIES) {
    const url = `/${substituteRouteParams(entry.path)}`;
    const nn = (entry.screen as string).slice(2).toLowerCase();

    it(`dado ${entry.screen} (${entry.path}) com os stubs permitindo então [data-screen]="${entry.screen}" e <h1> com portal.screens.t${nn}.title`, async () => {
      // C-3b-53
      const { harness } = await createPortalRouterHarness(
        PORTAL_ROUTES,
        providersFor(),
      );
      await TestBed.inject(StynxI18nService).initialize();
      await harness.navigateByUrl(url);
      const screen = screenElement(harness);
      expect(screen?.getAttribute('data-screen')).toBe(entry.screen);
      const h1 = harness.routeNativeElement?.querySelector('h1');
      // `?? ''` evita `.toContain(undefined)` (mensagem críptica do chai) quando a rota ainda é
      // `PlaceholderPageComponent` (§9, sem <h1>) — a asserção falha de forma legível até
      // TASK-0016 trocar o componente.
      expect(h1?.textContent ?? '').toContain(
        catalog[`portal.screens.t${nn}.title`],
      );
    });
  }

  // C-3b-54: um `it` por rota com entitlement (não um `for` dentro de um único `it` — o TestBed
  // não aceita `configureTestingModule` de novo sem `resetTestingModule` entre chamadas, e o
  // `afterEach` global já o faz entre `it`s, como C-3b-53 acima).
  for (const entry of APPEAL_SCREEN_ENTRIES) {
    if (!entry.entitlement) continue;
    const url = `/${substituteRouteParams(entry.path)}`;
    it(`dado EntitlementFacade.check → false em ${entry.path} então a página NÃO é renderizada (UrlTree /vinculo/por-que-nao-vejo) [negativo]`, async () => {
      // C-3b-54
      const { harness, currentUrl } = await createPortalRouterHarness(
        PORTAL_ROUTES,
        providersFor({ entitlementOk: false }),
      );
      await TestBed.inject(StynxI18nService).initialize();
      await harness.navigateByUrl(url);
      expect(currentUrl()).toContain('/vinculo/por-que-nao-vejo');
    });
  }

  const UNAVAILABLE_TARGETS = [
    { path: 'autos/:aitId/defesa/nova', serviceKey: 'defesa_previa' },
    { path: 'processos/:requestId/jari/nova', serviceKey: 'recurso_jari' },
    { path: 'processos/:requestId/cetran/nova', serviceKey: 'recurso_cetran' },
    { path: 'autos/:aitId/condutor/nova', serviceKey: 'indicacao_condutor' },
  ];
  for (const target of UNAVAILABLE_TARGETS) {
    const url = `/${substituteRouteParams(target.path)}`;
    it(`dado ServiceCatalogFacade.availability(${target.serviceKey}) unavailable (delegacao_indisponivel_r0007) então redireciona a /servico-indisponivel/${target.serviceKey} (M15) [negativo]`, async () => {
      // C-3b-55
      const { harness, currentUrl } = await createPortalRouterHarness(
        PORTAL_ROUTES,
        providersFor({ availability: 'unavailable' }),
      );
      await TestBed.inject(StynxI18nService).initialize();
      await harness.navigateByUrl(url);
      expect(currentUrl()).toBe(`/servico-indisponivel/${target.serviceKey}`);
    });
  }
});

describe('nenhum token de estado cru fora de data-*/chave i18n (C-3b-56, segunda parte)', () => {
  const RAW_STATE_TOKENS = [
    'EM_ANDAMENTO_NO_ORGAO',
    'aguardando_defesa',
    'PEDIDO_EM_COMPOSICAO',
    'PROTOCOLADO',
    'DESISTIDO',
  ];

  async function collect(dir: string): Promise<string[]> {
    const out: string[] = [];
    let entries: import('node:fs').Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await collect(full)));
      } else if (
        entry.name.endsWith('.ts') &&
        !entry.name.endsWith('.spec.ts')
      ) {
        out.push(full);
      }
    }
    return out;
  }

  it('dado os arquivos de features/{autos,defesa,indicacao,pagamento,processos}/** então nenhum token de estado cru aparece como texto de template fora de data-*/chave i18n', async () => {
    // C-3b-56 (segunda parte; a primeira — chaves ⊆ catálogo — já é coberta pelo scanner
    // genérico de i18n-keys.spec.ts, fora da minha fronteira de escrita nesta tarefa). Heurística:
    // remove do template todo valor de atributo `data-*="…"` e toda string entre aspas que
    // contenha `portal.` (chave i18n); o que sobrar não deve conter o token como palavra inteira.
    // `dirname(fileURLToPath(...))` (não `new URL('../', import.meta.url)`): mesma técnica de
    // `i18n/i18n-keys.spec.ts` — evita o URL intermediário, que neste ambiente de teste às vezes
    // não preserva o esquema `file:`.
    const featuresDir = join(dirname(fileURLToPath(import.meta.url)), '..');
    const files = await collect(featuresDir);
    for (const file of files) {
      const text = await readFile(file, 'utf8');
      const templateMatch = text.match(/template:\s*`([\s\S]*?)`\s*,?\s*\}\)/);
      if (!templateMatch) continue;
      let template = templateMatch[1];
      template = template.replace(/data-[a-z-]+="[^"]*"/gi, '');
      template = template.replace(/'portal\.[a-z0-9_.]*'/gi, '');
      template = template.replace(/"portal\.[a-z0-9_.]*"/gi, '');
      for (const token of RAW_STATE_TOKENS) {
        const wordBoundary = new RegExp(`\\b${token}\\b`);
        expect(
          wordBoundary.test(template),
          `${file} expõe o token cru ${token} fora de data-*/chave i18n`,
        ).toBe(false);
      }
    }
  });
});
