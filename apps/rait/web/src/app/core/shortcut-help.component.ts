// Diálogo de ajuda dos atalhos (spec §10.4 `?`; contrato CTG-0002a §7): `role="dialog"` com
// `aria-labelledby` no título `rait.shell.shortcuts_title` e uma `<dl>` com as 10 entradas
// `rait.shell.shortcut_<key>`; só "fechar" (`rait.a11y.close`, botão e tecla Escape).
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  output,
  viewChild,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { RAIT_SHORTCUT_BINDINGS } from './shortcut.service';

const TITLE_KEY = 'rait.shell.shortcuts_title';
const CLOSE_KEY = 'rait.a11y.close';
const TITLE_ID = 'rait-shortcut-help-title';

@Component({
  selector: 'rait-shortcut-help',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'closed.emit()',
  },
  template: `
    <div
      class="rait-shortcut-help"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
    >
      <h2 [id]="titleId">{{ titleKey | stynxTranslate }}</h2>
      <dl>
        @for (binding of bindings; track binding.key) {
          <dt>
            @for (key of binding.keys; track $index) {
              <kbd>{{ key }}</kbd>
            }
          </dt>
          <dd>{{ binding.labelKey | stynxTranslate }}</dd>
        }
      </dl>
      <button #closeButton type="button" (click)="closed.emit()">
        {{ closeKey | stynxTranslate }}
      </button>
    </div>
  `,
  styles: `
    .rait-shortcut-help {
      position: fixed;
      inset: auto 1rem 1rem auto;
      max-width: 24rem;
      padding: 1rem 1.25rem;
      border: 1px solid var(--detran-border-color, #cbd5e1);
      border-radius: var(--stynx-radius, 0.5rem);
      background: var(--detran-color-surface, #fff);
      color: var(--detran-color-text, #172b3a);
      z-index: 20;
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.25rem 1rem;
      margin: 0 0 1rem;
    }
    dd {
      margin: 0;
    }
  `,
})
export class ShortcutHelpComponent {
  private readonly closeButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');

  readonly closed = output<void>();
  readonly titleKey = TITLE_KEY;
  readonly closeKey = CLOSE_KEY;
  readonly titleId = TITLE_ID;
  readonly bindings = RAIT_SHORTCUT_BINDINGS;

  constructor() {
    // Ao abrir, o foco vai ao único controle do diálogo (WCAG 2.1 AA, foco visível).
    afterNextRender(() => this.closeButton().nativeElement.focus());
  }
}
