// Parâmetros de rota do módulo `colegiado` (route-manifest.md: `:orgao`, `:loteId`, `:id` da
// sessão, `:caseId`), lidos pelas páginas via `routeParam` (ancestrais incluídos).
import type { ActivatedRoute } from '@angular/router';
import { routeParam } from '../route-params';

export { judgingBodyOf } from '../route-params';

export function batchIdOf(route: ActivatedRoute): string {
  return routeParam(route, 'loteId');
}

export function sessionIdOf(route: ActivatedRoute): string {
  return routeParam(route, 'id');
}

export function caseIdOf(route: ActivatedRoute): string {
  return routeParam(route, 'caseId');
}
