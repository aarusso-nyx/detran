// LegalBasisTooltip (contrato CTG-0002b §5.22; spec §5.2 "transversal"; glossário §2.3; guia
// §3.3): `<button aria-describedby>` + `<span role="tooltip">` com o dispositivo legal (dado do
// contrato, não token) visível em hover/foco, oculto em Esc. Nunca embute o dispositivo no texto
// da mensagem; o texto do botão é `rait.common.legalBasis`.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';

const LABEL_KEY = 'rait.common.legalBasis';
let nextId = 0;

@Component({
  selector: 'rait-legal-basis-tooltip',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rait-legal-basis-tooltip',
    '[attr.data-legal-basis]': 'legalBasis()',
  },
  template: `
    <button
      type="button"
      class="rait-legal-basis-tooltip__trigger"
      [attr.aria-describedby]="tooltipId"
      (mouseenter)="show()"
      (mouseleave)="hide()"
      (focus)="show()"
      (blur)="hide()"
      (keydown.escape)="hide()"
    >
      <span class="rait-legal-basis-tooltip__icon" aria-hidden="true">§</span>
      <span class="rait-legal-basis-tooltip__label">{{
        labelKey | stynxTranslate
      }}</span>
    </button>
    <span
      role="tooltip"
      [id]="tooltipId"
      class="rait-legal-basis-tooltip__text"
      [class.hidden]="!visible()"
      >{{ legalBasis() }}</span
    >
  `,
  styles: `
    .rait-legal-basis-tooltip__text.hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,
})
export class LegalBasisTooltipComponent {
  /** Texto do contrato (ex.: "CTB art. 285 §6º"); é dado, não token. */
  readonly legalBasis = input.required<string>();
  readonly labelKey = LABEL_KEY;
  readonly tooltipId = `rait-legal-basis-${(nextId += 1)}`;
  private readonly visibleState = signal(false);
  readonly visible = computed(() => this.visibleState());

  show(): void {
    this.visibleState.set(true);
  }

  hide(): void {
    this.visibleState.set(false);
  }
}
