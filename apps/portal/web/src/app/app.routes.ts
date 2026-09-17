// PORTAL_ROUTES (plan.md M7/M8; portal-frontends.md §4): árvore derivada de
// `PORTAL_ROUTE_MANIFEST`. O módulo `core` é carregado no bootstrap; os 13 módulos de feature
// são lazy (`features/<module>/<module>.routes.ts`, caminhos completos dentro do chunk,
// `canMatch` pelo primeiro segmento). Guardas por rota vêm da fábrica (auth → assurance →
// availability → entitlement). Títulos: `portal.shell.title.<slug>` no `core`;
// `portal.states.unavailable_in_version` nas placeholder (títulos reais: TASK-0006).
import type { Routes } from '@angular/router';
import { providePortalI18nFallback } from './core/i18n-fallback';
import {
  moduleRoutes,
  ownsFirstSegment,
  type ManifestRouteOptions,
} from './core/manifest-routes';
import { AuthCallbackPageComponent } from './core/pages/auth-callback.page';
import { EntitlementMissingPageComponent } from './core/pages/entitlement-missing.page';
import { HomePageComponent } from './core/pages/home.page';
import { NotFoundPageComponent } from './core/pages/not-found.page';
import { ServiceUnavailablePageComponent } from './core/pages/service-unavailable.page';

/** Páginas do `core` por caminho do manifesto; as demais rotas do `core` são placeholder. */
const CORE_PAGES: Readonly<Record<string, ManifestRouteOptions>> = {
  '': { component: HomePageComponent, title: 'portal.shell.title.home' },
  acessibilidade: { title: 'portal.shell.title.acessibilidade' },
  'auth/callback': {
    component: AuthCallbackPageComponent,
    title: 'portal.shell.title.auth_callback',
  },
  inicio: { title: 'portal.shell.title.inicio' },
  conta: { title: 'portal.shell.title.conta' },
  'vinculo/por-que-nao-vejo': {
    component: EntitlementMissingPageComponent,
    title: 'portal.shell.title.vinculo',
  },
  'servico-indisponivel/:serviceKey': {
    component: ServiceUnavailablePageComponent,
    title: 'portal.shell.title.servico_indisponivel',
  },
};

/**
 * Montagens lazy dos 13 módulos de feature: `path: ''` + `canMatch` pelo primeiro segmento
 * (o chunk só carrega quando a URL é dele). Ficam antes das rotas do `core` porque a home
 * também tem `path: ''` e deve ser a última entrada desse caminho na árvore.
 */
const FEATURE_MOUNTS: Routes = [
  {
    path: '',
    canMatch: [ownsFirstSegment('carta-servicos', 'pontuacao')],
    loadChildren: () =>
      import('./features/catalogo/catalogo.routes').then(
        (m) => m.CATALOGO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('autos', 'processos')],
    loadChildren: () =>
      import('./features/defesa/defesa.routes').then((m) => m.DEFESA_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('autos')],
    loadChildren: () =>
      import('./features/indicacao/indicacao.routes').then(
        (m) => m.INDICACAO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('autos')],
    loadChildren: () =>
      import('./features/pagamento/pagamento.routes').then(
        (m) => m.PAGAMENTO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('autos')],
    loadChildren: () =>
      import('./features/autos/autos.routes').then((m) => m.AUTOS_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('processos')],
    loadChildren: () =>
      import('./features/processos/processos.routes').then(
        (m) => m.PROCESSOS_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('notificacoes', 'sne')],
    loadChildren: () =>
      import('./features/notificacoes/notificacoes.routes').then(
        (m) => m.NOTIFICACOES_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('documentos', 'veiculos')],
    loadChildren: () =>
      import('./features/documentos/documentos.routes').then(
        (m) => m.DOCUMENTOS_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('sinistros')],
    loadChildren: () =>
      import('./features/sinistros/sinistros.routes').then(
        (m) => m.SINISTROS_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('exames')],
    loadChildren: () =>
      import('./features/exames/exames.routes').then((m) => m.EXAMES_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('ouvidoria', 'avaliacao')],
    loadChildren: () =>
      import('./features/atendimento/atendimento.routes').then(
        (m) => m.ATENDIMENTO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('privacidade')],
    loadChildren: () =>
      import('./features/privacidade/privacidade.routes').then(
        (m) => m.PRIVACIDADE_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment('assinatura')],
    loadChildren: () =>
      import('./features/assinatura/assinatura.routes').then(
        (m) => m.ASSINATURA_ROUTES,
      ),
  },
];

export const PORTAL_ROUTES: Routes = [
  {
    path: '',
    providers: providePortalI18nFallback(),
    children: [...FEATURE_MOUNTS, ...moduleRoutes('core', CORE_PAGES)],
  },
  {
    path: '**',
    providers: providePortalI18nFallback(),
    title: 'portal.states.not_found',
    component: NotFoundPageComponent,
    data: { screen: '' },
  },
];
