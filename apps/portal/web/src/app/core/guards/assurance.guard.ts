// assuranceGuard(level) (plan.md M8; [UC-PORTAL-019]): nível da sessão abaixo do exigido →
// `/assinatura/elevacao?retomar=<url>` (T-27 explica qual nível falta e retoma o ato). Ordem
// `simples < avancada < qualificada`; nenhuma rota exige `qualificada` ([RN-PORTAL-101]) — o
// tipo do parâmetro impede.
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ASSURANCE_ORDER, SessionFacade } from '../session.facade';
import { RESUME_QUERY_PARAM } from './auth.guard';

export const ELEVATION_ROUTE = '/assinatura/elevacao';

export function assuranceGuard(level: 'simples' | 'avancada'): CanActivateFn {
  return (_route, state) => {
    const current = inject(SessionFacade).assuranceLevel();
    if (
      current !== null &&
      ASSURANCE_ORDER[current] >= ASSURANCE_ORDER[level]
    ) {
      return true;
    }
    return inject(Router).createUrlTree([ELEVATION_ROUTE], {
      queryParams: { [RESUME_QUERY_PARAM]: state.url },
    });
  };
}
