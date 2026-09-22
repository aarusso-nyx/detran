// EvidenceAttach (CTG-0002.md §8 item 10; OD-D16-011): protocolo, captura OU hash — ao menos
// um. A validação aqui só orienta (o servidor decide: `DASH.DUTY_EVIDENCE_REQUIRED`,
// `DASH.DUTY_EVIDENCE_HASH_INVALID`); nunca importa `forms/` (fronteira TASK-0005 × 0006) e
// nunca confere o hash com a captura.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { StynxTranslatePipe } from '@detran/ui';
import type { DutyEvidence } from './models';

const PROTOCOL_KEY = 'dashboard.forms.avancar_ciclo.protocol';
const CAPTURE_KEY = 'dashboard.forms.avancar_ciclo.capture_uri';
const HASH_KEY = 'dashboard.forms.avancar_ciclo.hash';
const SUBMIT_KEY = 'dashboard.forms.avancar_ciclo.submit';
const REQUIRED_KEY = 'dashboard.errors.duty_evidence_required';
const HASH_INVALID_KEY = 'dashboard.errors.duty_evidence_hash_invalid';
/** sha-256 em hexadecimal (64 dígitos). */
const SHA256_HEX = /^[0-9a-fA-F]{64}$/;
const HASH_ERROR_ID = 'dash-evidence-hash-error';

@Component({
  selector: 'dash-evidence-attach',
  imports: [ReactiveFormsModule, StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <p>
        <label for="dash-evidence-protocol">{{
          PROTOCOL_KEY | stynxTranslate
        }}</label>
        <input
          id="dash-evidence-protocol"
          name="protocol"
          type="text"
          formControlName="protocol"
        />
      </p>
      <p>
        <label for="dash-evidence-capture">{{
          CAPTURE_KEY | stynxTranslate
        }}</label>
        <input
          id="dash-evidence-capture"
          name="captureUri"
          type="text"
          formControlName="captureUri"
        />
      </p>
      <p>
        <label for="dash-evidence-hash">{{ HASH_KEY | stynxTranslate }}</label>
        <input
          id="dash-evidence-hash"
          name="hash"
          type="text"
          formControlName="hash"
          [attr.aria-describedby]="hashInvalid() ? HASH_ERROR_ID : null"
        />
      </p>
      @if (hashInvalid()) {
        <p [attr.id]="HASH_ERROR_ID">{{ HASH_INVALID_KEY | stynxTranslate }}</p>
      }
      @if (empty()) {
        <p>{{ REQUIRED_KEY | stynxTranslate }}</p>
      }
      <button type="submit" [disabled]="disabled() || blocked()">
        {{ SUBMIT_KEY | stynxTranslate }}
      </button>
    </form>
  `,
})
export class EvidenceAttachComponent {
  readonly disabled = input(false);
  readonly evidence = output<DutyEvidence>();

  protected readonly PROTOCOL_KEY = PROTOCOL_KEY;
  protected readonly CAPTURE_KEY = CAPTURE_KEY;
  protected readonly HASH_KEY = HASH_KEY;
  protected readonly SUBMIT_KEY = SUBMIT_KEY;
  protected readonly REQUIRED_KEY = REQUIRED_KEY;
  protected readonly HASH_INVALID_KEY = HASH_INVALID_KEY;
  protected readonly HASH_ERROR_ID = HASH_ERROR_ID;

  protected readonly form = new FormGroup({
    protocol: new FormControl('', { nonNullable: true }),
    captureUri: new FormControl('', { nonNullable: true }),
    hash: new FormControl('', { nonNullable: true }),
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly empty = computed(() => {
    const value = this.value();
    return !(value.protocol || value.captureUri || value.hash);
  });

  protected readonly hashInvalid = computed(() => {
    const hash = this.value().hash ?? '';
    return hash.length > 0 && !SHA256_HEX.test(hash);
  });

  protected readonly blocked = computed(
    () => this.empty() || this.hashInvalid(),
  );

  protected submit(): void {
    if (this.blocked() || this.disabled()) return;
    const value = this.form.getRawValue();
    const evidence: DutyEvidence = {
      ...(value.protocol ? { protocol: value.protocol } : {}),
      ...(value.captureUri ? { captureUri: value.captureUri } : {}),
      ...(value.hash ? { hash: value.hash } : {}),
    };
    this.evidence.emit(evidence);
  }
}
