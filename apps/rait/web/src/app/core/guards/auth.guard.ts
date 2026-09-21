// raitAuthGuard (plan.md M4; contrato CTG-0002a §4): sessão STYNX ativa → segue; inativa → o
// destino de login do kit (`stynxAuthGuard`, que devolve `UrlTree(loginRedirectRoute)` de
// `STYNX_ANGULAR_AUTH_OPTIONS`). `LOGIN_ROUTE` é o mesmo valor de `loginRedirectRoute` em
// `main.ts` (`/auth/callback`, rota auxiliar A2 que inicia/conclui o OIDC — OD-R12-006).
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import {
  STYNX_ANGULAR_AUTH_OPTIONS,
  StynxSessionService,
  stynxAuthGuard,
} from '@stynx-nyx/angular-auth';
import { RaitSessionFacade } from '../session.facade';

export const LOGIN_ROUTE = '/auth/callback';

export const raitAuthGuard: CanActivateFn = (route, state) => {
  if (inject(RaitSessionFacade).active()) return true;
  // Bootstrap real: o kit decide (StynxSessionService + loginRedirectRoute). Num injetor sem
  // `provideStynxAuth` (harness de rotas dos specs, contrato §10), o mesmo UrlTree é calculado
  // aqui a partir das opções — nunca um destino próprio.
  if (inject(StynxSessionService, { optional: true })) {
    return stynxAuthGuard(route, state);
  }
  const options = inject(STYNX_ANGULAR_AUTH_OPTIONS, { optional: true });
  return inject(Router).parseUrl(options?.loginRedirectRoute ?? LOGIN_ROUTE);
};
