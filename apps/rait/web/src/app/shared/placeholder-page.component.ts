// Placeholders de rota (plan.md M13; spec §11 "rota registrada, indisponível nesta versão, sem
// mock silencioso"; contrato CTG-0002a §3): `DetranErrorStateComponent` com
// `rait.states.unavailable_in_version` e `data-screen` = tela (`T-nn`) lida do `data` da rota
// (`''` quando a rota não tem tela). `PlaceholderLayoutComponent` é o layout de `/casos/:id`
// (abas em `router-outlet`) até o CTG-0002b trazer o `CaseHeader` real; a tela ativa é a da aba
// (o layout não carrega `data-screen` — `screenElement` do harness lê o filho).
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DetranErrorStateComponent, StynxTranslatePipe } from '@detran/ui';
import { provideRaitI18nFallback } from '../core/i18n-fallback';

export const UNAVAILABLE_IN_VERSION_KEY = 'rait.states.unavailable_in_version';

function screenOf(route: ActivatedRoute): string {
  const screen: unknown = route.snapshot?.data?.['screen'];
  return typeof screen === 'string' ? screen : '';
}

@Component({
  selector: 'rait-placeholder-page',
  imports: [DetranErrorStateComponent, StynxTranslatePipe],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-screen]': 'screen' },
  template: `
    <detran-error-state
      [title]="titleKey | stynxTranslate"
      [message]="titleKey | stynxTranslate"
    />
  `,
})
export class PlaceholderPageComponent {
  readonly titleKey = UNAVAILABLE_IN_VERSION_KEY;
  readonly screen = screenOf(inject(ActivatedRoute));
}

@Component({
  selector: 'rait-placeholder-layout',
  imports: [DetranErrorStateComponent, RouterOutlet, StynxTranslatePipe],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <detran-error-state
      [title]="titleKey | stynxTranslate"
      [message]="titleKey | stynxTranslate"
    />
    <router-outlet />
  `,
})
export class PlaceholderLayoutComponent {
  readonly titleKey = UNAVAILABLE_IN_VERSION_KEY;
}
