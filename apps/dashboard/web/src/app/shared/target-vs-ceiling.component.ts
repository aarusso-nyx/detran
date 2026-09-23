// Meta operacional × teto legal (CTG-0002.md §8 item 7; [WF-RAIT-002] §4.5): DOIS componentes
// distintos, nunca a meta e o teto no mesmo elemento (`DASH.INDICATOR_TARGET_AND_CEILING_MIXED`).
// Nenhum "% da meta" é calculado no browser: cada valor chega pronto e selado.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StynxIntlNumberPipe, StynxTranslatePipe } from '@detran/ui';
import { FreshnessSealComponent } from './freshness-seal.component';
import { LegalBasisTagComponent } from './legal-basis-tag.component';
import type { LegalCeilingView, OperationalTargetView } from './models';

const BLOCK_C_KEY = 'dashboard.blocks.c';
const BLOCK_A_KEY = 'dashboard.blocks.a';

@Component({
  selector: 'dash-operational-target',
  imports: [FreshnessSealComponent, StynxTranslatePipe, StynxIntlNumberPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-kind': 'target' },
  template: `
    <h3>{{ BLOCK_C_KEY | stynxTranslate }}</h3>
    <dash-freshness-seal [freshness]="target().freshness" block="C">
      <span data-field="value">{{ target().value | stynxIntlNumber }}</span>
    </dash-freshness-seal>
    <span data-field="target">{{ target().target | stynxIntlNumber }}</span>
  `,
})
export class OperationalTargetComponent {
  readonly target = input.required<OperationalTargetView>();
  protected readonly BLOCK_C_KEY = BLOCK_C_KEY;
}

@Component({
  selector: 'dash-legal-ceiling',
  imports: [
    FreshnessSealComponent,
    LegalBasisTagComponent,
    StynxTranslatePipe,
    StynxIntlNumberPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-kind': 'ceiling' },
  template: `
    <h3>{{ BLOCK_A_KEY | stynxTranslate }}</h3>
    <dash-freshness-seal [freshness]="ceiling().freshness" block="A">
      <span data-field="value">{{ ceiling().value | stynxIntlNumber }}</span>
    </dash-freshness-seal>
    <span data-field="ceiling">{{ ceiling().ceiling | stynxIntlNumber }}</span>
    <dash-legal-basis-tag [legalBasis]="ceiling().legalBasis" />
  `,
})
export class LegalCeilingComponent {
  readonly ceiling = input.required<LegalCeilingView>();
  protected readonly BLOCK_A_KEY = BLOCK_A_KEY;
}

/** Contêiner de layout: exatamente dois filhos distintos, sem estado nem valor próprio. */
@Component({
  selector: 'dash-target-vs-ceiling',
  imports: [OperationalTargetComponent, LegalCeilingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (target(); as target) {
      <dash-operational-target [target]="target" />
    }
    @if (ceiling(); as ceiling) {
      <dash-legal-ceiling [ceiling]="ceiling" />
    }
  `,
})
export class TargetVsCeilingComponent {
  readonly target = input.required<OperationalTargetView | null>();
  readonly ceiling = input.required<LegalCeilingView | null>();
}
