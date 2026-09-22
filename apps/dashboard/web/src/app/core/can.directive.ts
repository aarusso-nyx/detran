// `*dashCan` (CTG-0002.md §4, alternativa pré-autorizada de OD-D16-015): renderiza o controle
// só quando `session.can(<chave literal de DASHBOARD_RULES>)` — mesma regra das guardas, sem
// tabela paralela. Substitui `*stynxHasPermission` porque a diretiva do kit (a) decide por
// `hasAllPermissions`, que não honra `'<recurso>:*'`, e (b) assina `StynxSessionService.active$`,
// ausente do ambiente de teste do Inspector. A decisão final continua sendo do servidor.
import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { DashboardSessionFacade } from './session.facade';

@Directive({ selector: '[dashCan]' })
export class DashCanDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly session = inject(DashboardSessionFacade);
  private rendered = false;

  readonly dashCan = input.required<string>();

  constructor() {
    effect(() => {
      const allowed = this.session.can(this.dashCan());
      if (allowed && !this.rendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.rendered = true;
        return;
      }
      if (!allowed && this.rendered) {
        this.viewContainer.clear();
        this.rendered = false;
      }
    });
  }
}
