// D-15 Frescor das fontes (IU-DASH-D-15; CTG-0002.md §9). L0 — sobe a L2 quando
// `catalogue.client.ts` (gerado de BP-DASH-MONITOR-001) existir. Aqui "indisponível" é
// conteúdo, não estado vazio: a tabela aparece com o selo (ficha §5).
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ScreenFrameComponent } from '../../../core/screen-frame.component';
import { FreshnessSealComponent } from '../../../shared/freshness-seal.component';
import { SourceStatusTableComponent } from '../../../shared/source-status-table.component';
import type { SourceStatusView } from '../../../shared/models';
import {
  mutableAccessor,
  UNAVAILABLE_IN_VERSION,
  type ScreenState,
} from '../../../shared/screen-state';

type FreshnessStatusState = Exclude<
  ScreenState<readonly SourceStatusView[]>,
  { kind: 'blocked_by_decision' }
>;

@Component({
  selector: 'dash-frescor-page',
  imports: [
    ScreenFrameComponent,
    FreshnessSealComponent,
    SourceStatusTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dash-screen-frame [slug]="'frescor'" [block]="'D'" [state]="state()">
      <dash-source-status-table [sources]="sources()" />
      @for (source of sources(); track source.source) {
        <dash-freshness-seal [freshness]="source.freshness" [block]="'D'">
          <code data-field="source">{{ source.source }}</code>
        </dash-freshness-seal>
      }
    </dash-screen-frame>
  `,
})
export class FreshnessStatusPageComponent {
  readonly state = mutableAccessor<FreshnessStatusState>(
    UNAVAILABLE_IN_VERSION,
  );

  protected readonly sources = computed<readonly SourceStatusView[]>(() => {
    const state = this.state();
    return state.kind === 'ready' ? state.data : [];
  });
}
