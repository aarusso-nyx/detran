// ConsequenceDialog (contrato CTG-0003a §5.7; spec §2 invariante 10; M9/A5): consequência ANTES
// do ato — texto jurídico versionado `portal.legal.<document>.v1` (e, para `efeitos_sne`, os
// quatro efeitos por nome), confirmação por escrito (checkbox obrigatório) e `confirmed` com
// `{ textVersion: 'v1', acceptedAt: PortalClock.now() }`. Diálogo acessível: `role="dialog"`,
// `aria-modal`, `aria-labelledby`, foco preso e devolvido a quem abriu, `Escape` cancela.
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { PortalClock } from '../core/clock';

export type LegalDocument =
  | 'consequencias_desistencia'
  | 'consequencias_indicacao'
  | 'efeitos_sne'
  | 'renuncia_40';

/** M9: `<versão>` = v1. */
export const LEGAL_TEXT_VERSION = 'v1';

/** Os quatro efeitos de [RN-PORTAL-123] (A5), por nome. */
export const SNE_EFFECTS = [
  'ciencia_ficta',
  'substituicao',
  'responsabilidade',
  'cancelamento',
] as const;

export interface ConsequenceAck {
  readonly textVersion: string;
  readonly acceptedAt: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'portal-consequence-dialog',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        #panel
        class="portal-consequence-dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId()"
        [attr.data-document]="document()"
        [attr.data-text-version]="textVersion"
        (keydown)="onKeydown($event)"
      >
        <h2 [id]="titleId()" tabindex="-1">
          {{ textKey() | stynxTranslate }}
        </h2>
        @if (document() === 'efeitos_sne') {
          <ol class="portal-consequence-effects">
            @for (effect of sneEffects; track effect) {
              <li [attr.data-effect]="effect">
                {{ effectKey(effect) | stynxTranslate }}
              </li>
            }
          </ol>
        }
        <label class="portal-consequence-ack">
          <input
            type="checkbox"
            [checked]="acknowledged()"
            (change)="toggle($event)"
          />
          {{ ackLabelKey() | stynxTranslate }}
        </label>
        <div class="portal-consequence-actions">
          <button type="button" data-cancel (click)="cancel()">
            {{ cancelLabelKey() | stynxTranslate }}
          </button>
          <button
            type="button"
            data-confirm
            [disabled]="!acknowledged()"
            (click)="confirm()"
          >
            {{ confirmLabelKey() | stynxTranslate }}
          </button>
        </div>
      </div>
    }
  `,
})
export class ConsequenceDialogComponent {
  private readonly clock = inject(PortalClock);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private opener: HTMLElement | null = null;
  private wasOpen = false;

  readonly document = input.required<LegalDocument>();
  readonly open = input(false);
  /** Ex.: `portal.forms.desistencia.confirmacao`, `portal.forms.adesao_sne.aceite`. */
  readonly ackLabelKey = input.required<string>();
  /** Ex.: `portal.screens.t08.cmd.confirm`. */
  readonly confirmLabelKey = input.required<string>();
  /** Ex.: `portal.screens.t08.cmd.cancel`. */
  readonly cancelLabelKey = input.required<string>();
  readonly confirmed = output<ConsequenceAck>();
  readonly cancelled = output<void>();

  readonly textVersion = LEGAL_TEXT_VERSION;
  readonly sneEffects = SNE_EFFECTS;
  readonly acknowledged = signal(false);

  readonly titleId = computed(
    () => `portal-consequence-${this.document()}-title`,
  );
  readonly textKey = computed(
    () => `portal.legal.${this.document()}.${LEGAL_TEXT_VERSION}`,
  );

  constructor() {
    afterRenderEffect(() => {
      const open = this.open();
      const panel = this.panel()?.nativeElement ?? null;
      untracked(() => this.syncFocus(open, panel));
    });
  }

  effectKey(effect: (typeof SNE_EFFECTS)[number]): string {
    return `portal.legal.efeitos_sne.${LEGAL_TEXT_VERSION}.${effect}`;
  }

  toggle(event: Event): void {
    this.acknowledged.set((event.target as HTMLInputElement).checked);
  }

  confirm(): void {
    if (!this.acknowledged()) return;
    this.confirmed.emit({
      textVersion: LEGAL_TEXT_VERSION,
      acceptedAt: this.clock.now().toISOString(),
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = this.focusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !this.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusable(): HTMLElement[] {
    const panel = this.panel()?.nativeElement;
    return panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      : [];
  }

  private contains(node: Element | null): boolean {
    const panel = this.panel()?.nativeElement;
    return Boolean(panel && node && panel.contains(node));
  }

  /** Abriu: guarda quem abriu e foca o título; fechou: devolve o foco a quem abriu (§8). */
  private syncFocus(open: boolean, panel: HTMLElement | null): void {
    if (open && panel) {
      if (!this.wasOpen) {
        this.opener =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        this.acknowledged.set(false);
      }
      this.wasOpen = true;
      if (!panel.contains(document.activeElement)) {
        (panel.querySelector<HTMLElement>('h2') ?? panel).focus();
      }
    } else if (!open && this.wasOpen) {
      this.wasOpen = false;
      this.opener?.focus();
      this.opener = null;
    }
  }
}
