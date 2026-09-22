// RAIT_ROUTES (plan.md M3; spec §4/§12; contrato CTG-0002a §3): árvore derivada de
// `RAIT_ROUTE_MANIFEST`. O módulo `core` (`/`, `/sem-permissao`, `/auth/callback`) é carregado no
// bootstrap; os 15 módulos de feature são lazy (`features/<modulo>/<modulo>.routes.ts`, caminhos
// completos dentro do chunk, `canMatch` pelo primeiro segmento — `ownsFirstSegment`). Guardas,
// `title` (`rait.screens.<slug>.title`) e `data` vêm da fábrica. `**` é a coringa técnica (fora
// do manifesto, padrão do Portal).
import type { Routes } from '@angular/router';
import { provideRaitI18nFallback } from './core/i18n-fallback';
import {
  FEATURE_SEGMENTS,
  NOT_FOUND_TITLE_KEY,
  moduleRoutes,
  ownsFirstSegment,
  type ManifestRouteOptions,
} from './core/manifest-routes';
import { AuthCallbackPageComponent } from './core/pages/auth-callback.page';
import { ForbiddenPageComponent } from './core/pages/forbidden.page';
import { NotFoundPageComponent } from './core/pages/not-found.page';
import { PlaceholderPageComponent } from './shared/placeholder-page.component';

/** Páginas do `core` por caminho do manifesto; `''` nunca renderiza (RoleHomeRedirect). */
const CORE_PAGES: Readonly<Record<string, ManifestRouteOptions>> = {
  '': { component: PlaceholderPageComponent },
  'sem-permissao': { component: ForbiddenPageComponent },
  'auth/callback': { component: AuthCallbackPageComponent },
};

/**
 * Montagens lazy dos 15 módulos de feature, na ordem de `FEATURE_SEGMENTS`: `path: ''` +
 * `canMatch` pelo primeiro segmento (o chunk só carrega quando a URL é dele). Ficam antes das
 * rotas do `core` porque `/` também tem `path: ''` e deve ser a última entrada desse caminho.
 */
export const FEATURE_MOUNTS: Routes = [
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.painel)],
    loadChildren: () =>
      import('./features/painel/painel.routes').then((m) => m.PAINEL_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.fila)],
    loadChildren: () =>
      import('./features/fila/fila.routes').then((m) => m.FILA_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.caso)],
    loadChildren: () =>
      import('./features/caso/caso.routes').then((m) => m.CASO_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.protocolo)],
    loadChildren: () =>
      import('./features/protocolo/protocolo.routes').then(
        (m) => m.PROTOCOLO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.assinatura)],
    loadChildren: () =>
      import('./features/assinatura/assinatura.routes').then(
        (m) => m.ASSINATURA_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.autoridade)],
    loadChildren: () =>
      import('./features/autoridade/autoridade.routes').then(
        (m) => m.AUTORIDADE_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.colegiado)],
    loadChildren: () =>
      import('./features/colegiado/colegiado.routes').then(
        (m) => m.COLEGIADO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.gestao)],
    loadChildren: () =>
      import('./features/gestao/gestao.routes').then((m) => m.GESTAO_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.organizacao)],
    loadChildren: () =>
      import('./features/organizacao/organizacao.routes').then(
        (m) => m.ORGANIZACAO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.integracoes)],
    loadChildren: () =>
      import('./features/integracoes/integracoes.routes').then(
        (m) => m.INTEGRACOES_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.financeiro)],
    loadChildren: () =>
      import('./features/financeiro/financeiro.routes').then(
        (m) => m.FINANCEIRO_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.arquivo)],
    loadChildren: () =>
      import('./features/arquivo/arquivo.routes').then((m) => m.ARQUIVO_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.auditoria)],
    loadChildren: () =>
      import('./features/auditoria/auditoria.routes').then(
        (m) => m.AUDITORIA_ROUTES,
      ),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.admin)],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    canMatch: [ownsFirstSegment(...FEATURE_SEGMENTS.conta)],
    loadChildren: () =>
      import('./features/conta/conta.routes').then((m) => m.CONTA_ROUTES),
  },
];

export const RAIT_ROUTES: Routes = [
  {
    path: '',
    providers: provideRaitI18nFallback(),
    children: [...FEATURE_MOUNTS, ...moduleRoutes('core', CORE_PAGES)],
  },
  {
    path: '**',
    providers: provideRaitI18nFallback(),
    title: NOT_FOUND_TITLE_KEY,
    component: NotFoundPageComponent,
    data: { screen: '' },
  },
];
