import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  EmptyStateComponent,
  StynxBannerComponent,
  StynxLoadingSpinnerComponent,
} from '@stynx-nyx/angular-ui';

/** Thin Portuguese-first wrappers for the shared STYNX empty, loading and error patterns. */
@Component({
  selector: 'detran-empty-state',
  standalone: true,
  imports: [EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<stynx-empty-state [title]="title" [description]="message" />',
})
export class DetranEmptyStateComponent {
  @Input() title = 'Nenhum registro';
  @Input() message = 'Nenhum registro encontrado.';
}

@Component({
  selector: 'detran-loading-state',
  standalone: true,
  imports: [StynxLoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<stynx-loading-spinner [label]="label" />',
})
export class DetranLoadingStateComponent {
  @Input() label = 'Carregando…';
}

@Component({
  selector: 'detran-error-state',
  standalone: true,
  imports: [StynxBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<stynx-banner tone="error" [title]="title" [message]="message" />',
})
export class DetranErrorStateComponent {
  @Input() title = 'Não foi possível concluir a operação';
  @Input() message =
    'Tente novamente. Se o problema persistir, contate o suporte.';
}
