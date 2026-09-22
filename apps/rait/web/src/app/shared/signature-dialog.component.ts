// SignatureDialog (contrato CTG-0002b §5.12; steering A.8; spec §11 "PAdES+TSA pendente"; guia
// §3.3): `<stynx-confirm-dialog>` do kit (`StynxConfirmDialogComponent` importado de
// `@stynx-nyx/angular-ui` — não reexportado por `@detran/ui`, OD-R12-025) com a frase do efeito
// jurídico da ficha (`messageKey`) e `rait.action.sign`, mais `<p role="status">`
// `rait.common.signatureUnavailable`: o kernel de assinatura não está integrado (spec §11);
// nenhum `signature_ref` é simulado. `confirm` → `confirmed`; `dismissed` → `dismissed` + `open`
// false.
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { StynxConfirmDialogComponent } from '@stynx-nyx/angular-ui';

const SIGN_KEY = 'rait.action.sign';
const UNAVAILABLE_KEY = 'rait.common.signatureUnavailable';

@Component({
  selector: 'rait-signature-dialog',
  imports: [StynxTranslatePipe, StynxConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rait-signature-dialog', '[attr.data-open]': 'open()' },
  template: `
    <stynx-confirm-dialog
      [open]="open()"
      [title]="titleKey() | stynxTranslate"
      [message]="messageKey() | stynxTranslate"
      [confirmLabel]="signKey | stynxTranslate"
      (confirm)="onConfirm()"
      (dismissed)="onDismiss()"
    />
    @if (open()) {
      <p role="status" class="rait-signature-dialog__unavailable">
        {{ unavailableKey | stynxTranslate }}
      </p>
    }
  `,
})
export class SignatureDialogComponent {
  readonly open = model(false);
  readonly titleKey = input.required<string>();
  /** A frase do efeito jurídico da ficha. */
  readonly messageKey = input.required<string>();
  readonly confirmed = output<void>();
  readonly dismissed = output<void>();

  readonly signKey = SIGN_KEY;
  readonly unavailableKey = UNAVAILABLE_KEY;

  onConfirm(): void {
    this.confirmed.emit();
  }

  onDismiss(): void {
    this.open.set(false);
    this.dismissed.emit();
  }
}
