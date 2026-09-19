// PointsSummary (contrato CTG-0003b §6 T-14; [RN-RAIT-131]; [JRN-PORTAL-004] 2; [UC-PORTAL-010]
// AC-3): a resposta direta ANTES da tabela — pontos definitivos e pontos em disputa (com a
// ressalva "ainda podem não se confirmar") e a data da consulta que o servidor informa
// (`cachedAt`). `byVehicle[]`/`last12Months[]` chegam como objetos livres e NÃO são renderizados
// até OD-P78. Nenhum cálculo: os números vêm prontos de `GET points-summary`.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StynxIntlDatePipe, StynxTranslatePipe } from '@detran/ui';
import type { PointsSummary } from '../../../data/portal-read.models';

@Component({
  selector: 'portal-points-summary',
  imports: [StynxTranslatePipe, StynxIntlDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-definitive-points]': 'summary().definitivePoints',
    '[attr.data-disputed-points]': 'summary().disputedPoints',
  },
  template: `
    <section class="portal-points-summary" [attr.aria-labelledby]="titleId">
      <h2 [id]="titleId">
        {{ 'portal.screens.t14.field.pontos_definitivos' | stynxTranslate }}
        <strong data-definitive-points>{{ summary().definitivePoints }}</strong>
      </h2>
      <p data-disputed-points>
        <strong>{{ summary().disputedPoints }}</strong>
        <span>{{
          'portal.screens.t14.field.pontos_disputa' | stynxTranslate
        }}</span>
      </p>
      @if (summary().cachedAt; as cachedAt) {
        <p data-cached-at>
          <time [attr.datetime]="cachedAt">{{
            'portal.documents.consulta.consultedAt'
              | stynxTranslate
                : { consultedAt: (cachedAt | stynxIntlDate: dateFormat) }
          }}</time>
        </p>
      }
    </section>
  `,
})
export class PointsSummaryComponent {
  readonly summary = input.required<PointsSummary>();

  readonly titleId = 'portal-points-summary-title';
  readonly dateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
  };
}
