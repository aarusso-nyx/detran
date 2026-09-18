// Fluxo de entrada/retorno OIDC (portal-frontends.md §4: `/` entrada gov.br; `/auth/callback`
// retorno OIDC). Separado de `SessionFacade` (modelo de leitura, M8) porque conclui e inicia a
// sessão STYNX. O `StynxSessionService` é opcional só para que as páginas `/` e `/auth/callback`
// rendam fora de `provideDetranAuthenticatedApp` (harness de rotas dos specs); sob o bootstrap
// real ele sempre existe.
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StynxSessionService } from '@stynx-nyx/angular-auth';
import { ResumeService } from './resume.service';

export const DEFAULT_LANDING_ROUTE = '/inicio';

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private readonly stynx = inject(StynxSessionService, { optional: true });
  private readonly resume = inject(ResumeService);
  private readonly router = inject(Router);

  /** Há um provedor OIDC configurado neste injetor. */
  get available(): boolean {
    return this.stynx !== null;
  }

  /** Guarda a rota a retomar e redireciona ao gov.br (Cognito federado). */
  login(retomar?: string | null): void {
    if (retomar) this.resume.save({ route: retomar, draft: null });
    this.stynx?.login();
  }

  /**
   * Conclui a sessão STYNX a partir da URL de retorno e navega à rota retomada (ou a
   * `/inicio`). Devolve `false` quando não há sessão a concluir. Lê o ponto com `peek()`
   * ([DIVERGE-4], A6(a)): o rascunho é consumido pelo `ServiceWizard.resumeFrom`, não aqui.
   */
  async completeLogin(url: string): Promise<boolean> {
    if (!this.stynx) return false;
    const state = await this.stynx.completeLogin(url);
    if (!state.active) return false;
    const target = this.resume.peek()?.route ?? DEFAULT_LANDING_ROUTE;
    await this.router.navigateByUrl(target);
    return true;
  }
}
