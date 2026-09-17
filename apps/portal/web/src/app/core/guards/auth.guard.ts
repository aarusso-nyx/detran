// portalAuthGuard (plan.md M8; portal-frontends.md §3): sessão inativa → home pública com
// `retomar=<url>` (a entrada gov.br devolve o cidadão à rota pedida). Nunca "acesso negado"
// seco (invariante 8).
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { SessionFacade } from '../session.facade';

export const RESUME_QUERY_PARAM = 'retomar';

export const portalAuthGuard: CanActivateFn = (_route, state) => {
  const session = inject(SessionFacade);
  if (session.active()) return true;
  return inject(Router).createUrlTree(['/'], {
    queryParams: { [RESUME_QUERY_PARAM]: state.url },
  });
};
