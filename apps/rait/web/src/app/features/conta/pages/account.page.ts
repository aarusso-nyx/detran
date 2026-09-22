// T-13 Conta (ficha IU-RAIT-018; contrato CTG-0002b §6.1 linha 63; nome OD-R12-028): sessão
// (`RaitSessionFacade`: papéis como `rait.role.<code>`, papéis canônicos, permissões) — sem HTTP
// (§3.4); tema: botão `field.theme` → `setDetranTheme` + `localStorage['rait.theme']` (mesma
// regra do shell, CTG-0002a §5; `THEME_STORAGE_KEY` de `core/rait-shell.component.ts`).
// Nenhuma ação de servidor.
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  StynxTranslatePipe,
  setDetranTheme,
  type DetranTheme,
} from '@detran/ui';
import { provideRaitI18nFallback } from '../../../core/i18n-fallback';
import { THEME_STORAGE_KEY } from '../../../core/rait-shell.component';
import { RaitSessionFacade } from '../../../core/session.facade';
import { screenOf } from '../../../shared/route-screen';

const TITLE_KEY = 'rait.screens.conta.title';
const INTRO_KEY = 'rait.screens.conta.intro';
const FIELD_THEME_KEY = 'rait.screens.conta.field.theme';
const ROLE_KEY_PREFIX = 'rait.role.';
const THEMES: readonly DetranTheme[] = ['light', 'dark'];

function readTheme(value: string | null | undefined): DetranTheme | null {
  return THEMES.find((theme) => theme === value) ?? null;
}

@Component({
  selector: 'rait-account-page',
  imports: [StynxTranslatePipe],
  providers: provideRaitI18nFallback(),
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-screen]': 'screen',
    '[attr.data-theme]': 'theme()',
  },
  template: `
    <h1 #heading tabindex="-1">{{ titleKey | stynxTranslate }}</h1>
    <p>{{ introKey | stynxTranslate }}</p>

    <ul class="rait-account__roles" data-roles>
      @for (role of session.roles(); track role) {
        <li [attr.data-role]="role">
          {{ roleKeyPrefix + role | stynxTranslate }}
        </li>
      }
    </ul>

    <p class="rait-account__theme">
      <span>{{ fieldThemeKey | stynxTranslate }}</span>
      <button
        type="button"
        data-field="theme"
        [attr.aria-pressed]="theme() === 'dark'"
        (click)="toggleTheme()"
      >
        {{ fieldThemeKey | stynxTranslate }}
      </button>
    </p>
  `,
})
export class AccountPageComponent {
  readonly session = inject(RaitSessionFacade);
  private readonly document = inject(DOCUMENT);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');
  private focused = false;

  readonly screen = screenOf(inject(ActivatedRoute));
  readonly titleKey = TITLE_KEY;
  readonly introKey = INTRO_KEY;
  readonly fieldThemeKey = FIELD_THEME_KEY;
  readonly roleKeyPrefix = ROLE_KEY_PREFIX;
  readonly theme = signal<DetranTheme>(
    readTheme(this.storage()?.getItem(THEME_STORAGE_KEY)) ??
      readTheme(this.document.documentElement.dataset['detranTheme']) ??
      'light',
  );

  constructor() {
    afterRenderEffect(() => {
      const heading = this.heading()?.nativeElement;
      untracked(() => {
        if (!this.focused) {
          this.focused = true;
          heading?.focus();
        }
      });
    });
  }

  /** Spec §10.7: tema light/dark via `setDetranTheme`, preferência no `localStorage`. */
  toggleTheme(): void {
    const next: DetranTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    setDetranTheme(next, this.document);
    this.storage()?.setItem(THEME_STORAGE_KEY, next);
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
