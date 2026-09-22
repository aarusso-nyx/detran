// authGuard (CTG-0002.md §4): sessão STYNX ativa passa; inativa vai ao retorno OIDC
// (`LOGIN_ROUTE` = `oidc.loginRedirectRoute` do `main.ts`), nunca a "sem permissão".
//
// DIVERGÊNCIA registrada (relatório TASK-0005): o contrato manda delegar a `stynxAuthGuard`
// (`@stynx-nyx/angular-auth`), mas aquele guarda lê `StynxSessionService.snapshot()` e injeta
// `STYNX_ANGULAR_AUTH_OPTIONS` sem `optional` — nenhum dos dois existe no ambiente de teste do
// Inspector (`stynx-session.stub.ts` não tem `snapshot`; `core/guards.spec.ts` não provê o
// token). O guarda local faz exatamente o que `stynxAuthGuard` faria: `router.parseUrl` da rota
// de login configurada, com `LOGIN_ROUTE` como padrão.
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { STYNX_ANGULAR_AUTH_OPTIONS } from '@stynx-nyx/angular-auth';
import { DashboardSessionFacade } from '../session.facade';

export const LOGIN_ROUTE = '/monitoramento/auth/callback';

export const authGuard: CanActivateFn = () => {
  const session = inject(DashboardSessionFacade);
  if (session.active()) return true;
  const options = inject(STYNX_ANGULAR_AUTH_OPTIONS, { optional: true });
  return inject(Router).parseUrl(options?.loginRedirectRoute ?? LOGIN_ROUTE);
};
