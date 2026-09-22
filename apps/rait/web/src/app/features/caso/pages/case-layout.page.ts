// T-04 Layout do caso (ficha IU-RAIT-006; contrato CTG-0002b §6.1 linha 6; guia §3.2 "detalhe com
// abas: CaseHeader fixo + router-outlet"): `CaseFacade.loadCaseBundle(id)` → `caso`, `partes`,
// `relogios`, `prazos`; `<rait-case-header>` com `actions = []` (as "próximas ações permitidas"
// são as abas: `<nav aria-label="rait.nav.casos">` com 11 `<a routerLink>` de
// `rait.screens.casos-id.tab.*`, cada uma guardada pela própria rota); `sse.connect({ caseId })`;
// atalhos `triage` (→ `/casos/:id/triagem`) e `inquiry` (→ `/casos/:id/diligencias`). Sem
// `data-screen` no host (A7 d: a tela ativa é a da aba); a aba inicial por papel é da rota
// (`caseInitialTabRoutes`, C-2A-22). O `<h1>` é da aba.
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { ShortcutService } from '../../../core/shortcut.service';
import { SseService } from '../../../core/sse.service';
import { CaseFacade } from '../../../data/facades/case.facade';
import { CaseHeaderComponent } from '../../../shared/case-header.component';
import { PageStateComponent } from '../../../shared/page-state.component';
import { EMPTY_KEY, LOADING_KEY, errorsOnly } from '../../page-support';
import { CASE_TABS, caseIdOf } from '../case-route';

const NAV_KEY = 'rait.nav.casos';
const TRIAGE_TAB = 'triagem';
const INQUIRIES_TAB = 'diligencias';

@Component({
  selector: 'rait-case-layout-page',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    StynxTranslatePipe,
    CaseHeaderComponent,
    PageStateComponent,
  ],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-case-layout',
    '[attr.data-case-id]': 'caseId',
    '[attr.data-status]': 'facade.caso.status()',
  },
  template: `
    <rait-page-state
      [status]="headerStatus()"
      [error]="facade.caso.error()"
      [loadingLabelKey]="loadingKey"
      [emptyLabelKey]="emptyKey"
      (retry)="reload()"
    />
    @if (facade.caso.value(); as kase) {
      <rait-case-header
        [case]="kase"
        [parties]="facade.partes.items()"
        [clocks]="facade.relogios.items()"
      />
    }
    <nav [attr.aria-label]="navKey | stynxTranslate">
      <ul>
        @for (tab of tabs; track tab.path) {
          <li>
            <a
              [routerLink]="tab.path"
              routerLinkActive="rait-case-layout__tab--active"
              ariaCurrentWhenActive="page"
              [attr.data-tab]="tab.path"
              >{{ tab.labelKey | stynxTranslate }}</a
            >
          </li>
        }
      </ul>
    </nav>
    <router-outlet />
  `,
})
export class CaseLayoutPageComponent {
  readonly facade = inject(CaseFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sse = inject(SseService);
  private readonly shortcuts = inject(ShortcutService);

  readonly caseId = caseIdOf(this.route);
  readonly tabs = CASE_TABS;
  readonly navKey = NAV_KEY;
  readonly loadingKey = LOADING_KEY;
  readonly emptyKey = EMPTY_KEY;
  /** `loading`/`empty` do caso são apresentados pela aba; o layout mostra só erros. */
  readonly headerStatus = computed(() => errorsOnly(this.facade.caso.status()));

  constructor() {
    this.sse.connect({ caseId: this.caseId });
    void this.facade.loadCaseBundle(this.caseId);
    const destroyRef = inject(DestroyRef);
    const unregister = [
      this.shortcuts.register('triage', () => this.goTo(TRIAGE_TAB)),
      this.shortcuts.register('inquiry', () => this.goTo(INQUIRIES_TAB)),
    ];
    destroyRef.onDestroy(() => unregister.forEach((fn) => fn()));
  }

  reload(): void {
    void this.facade.loadCaseBundle(this.caseId);
  }

  private goTo(tab: string): void {
    void this.router.navigate([tab], { relativeTo: this.route });
  }
}
