// AlternativeChannelNote (contrato CTG-0003a §5.10; [RN-PORTAL-105]; spec §2 invariante 6): o
// canal presencial nunca desaparece — rótulo e link sempre renderizados (link sem `href` quando a
// marca está `unavailable`), `note` do catálogo de serviços e `serviceContact` da marca quando
// existem. Endereço e horário do atendimento presencial não têm fonte (OD-P57): nada é inventado.
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { StynxTranslatePipe } from '@detran/ui';
import { BrandService } from '../core/brand.service';

@Component({
  selector: 'portal-alternative-channel-note',
  imports: [StynxTranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-service-key]': 'serviceKey()' },
  template: `
    <p class="portal-alternative-channel">
      <strong>{{
        'portal.common.label.alternative_channel' | stynxTranslate
      }}</strong>
      <a [attr.href]="supportUrl()" rel="noopener">{{
        'portal.common.link.presencial' | stynxTranslate
      }}</a>
      @if (note(); as text) {
        <span data-note>{{ text }}</span>
      }
      @if (serviceContact(); as contact) {
        <span data-service-contact>{{ contact }}</span>
      }
    </p>
  `,
})
export class AlternativeChannelNoteComponent {
  private readonly brand = inject(BrandService);

  /** `service_catalog.alternativeChannelNote` (texto cidadão do servidor). */
  readonly note = input<string | null>(null);
  readonly serviceKey = input<string | null>(null);

  readonly supportUrl = computed<string | null>(() => {
    const state = this.brand.state();
    return state.status === 'available' ? (state.supportUrl ?? null) : null;
  });

  readonly serviceContact = computed<string | null>(() => {
    const state = this.brand.state();
    return state.status === 'available' ? (state.serviceContact ?? null) : null;
  });
}
