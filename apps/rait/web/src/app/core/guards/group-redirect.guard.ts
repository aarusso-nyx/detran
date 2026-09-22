// groupRedirectGuard (plan.md M6; route-manifest.md tabela B rodapé; contrato CTG-0002a §3): a
// raiz de um grupo (`/gestao`, `/organizacao`, `/colegiado/:orgao`, …) redireciona ao primeiro
// filho da spec §4 — ordem do manifesto, mesmo módulo, `path` que começa por `<raiz>/`, `kind`
// `page`, sem parâmetro além dos do pai — cujo `roleGuard` aceita os papéis da sessão. Os
// parâmetros do pai (`:orgao`) são preservados; nenhum filho permitido → `/sem-permissao?de=`.
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import {
  manifestEntriesOf,
  type RaitRouteEntry,
} from '../../app.route-manifest';
import { RaitSessionFacade } from '../session.facade';
import { forbiddenUrlTree, requestedUrl, roleAccepts } from './role.guard';

const PARAM_PREFIX = ':';

function paramsOf(path: string): readonly string[] {
  return path.split('/').filter((segment) => segment.startsWith(PARAM_PREFIX));
}

/** Filhos diretos elegíveis de uma raiz de grupo, na ordem da §4. */
export function groupChildrenOf(
  entry: RaitRouteEntry,
): readonly RaitRouteEntry[] {
  const prefix = `${entry.path}/`;
  const parentParams = new Set(paramsOf(entry.path));
  return manifestEntriesOf(entry.module).filter(
    (candidate) =>
      candidate.kind === 'page' &&
      candidate.path.startsWith(prefix) &&
      paramsOf(candidate.path).every((param) => parentParams.has(param)),
  );
}

export function groupRedirectGuard(entry: RaitRouteEntry): CanActivateFn {
  const children = groupChildrenOf(entry);
  return (route, state) => {
    const session = inject(RaitSessionFacade);
    const router = inject(Router);
    const child = children.find((candidate) =>
      roleAccepts(candidate.roles, session),
    );
    if (!child) return forbiddenUrlTree(router, requestedUrl(router, state));
    const segments = child.path
      .split('/')
      .map((segment) =>
        segment.startsWith(PARAM_PREFIX)
          ? (route.paramMap.get(segment.slice(1)) ?? segment)
          : segment,
      );
    return router.createUrlTree([`/${segments.join('/')}`]);
  };
}
